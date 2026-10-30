package publish

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/xianyu"
)

func limitStopFixture(t *testing.T) (*Service, *mongo.Database) {
	t.Helper()
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("isolated MongoDB required")
	}
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	db := client.Database("sidejob_capacity_stop_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = db.Drop(context.Background()); _ = client.Disconnect(context.Background()) })
	service := &Service{repository: repository.NewPublishTaskRepository(db), accountRepository: repository.NewXianyuAccountRepository(db)}
	for _, id := range []string{"default", "other"} {
		if err := service.accountRepository.Create(ctx, model.XianyuAccount{ID: id, Name: id, Status: model.XianyuAccountActive}); err != nil {
			t.Fatal(err)
		}
	}
	return service, db
}

func TestPublishLimitStopsAccountAndRemainingQueueAcrossRestart(t *testing.T) {
	service, db := limitStopFixture(t)
	ctx := context.Background()
	batches := repository.NewPublishBatchRepository(db)
	for _, id := range []string{"default", "other"} {
		if err := batches.Create(ctx, model.PublishBatch{ID: id, AccountID: id, Status: model.PublishBatchRunning}); err != nil {
			t.Fatal(err)
		}
	}
	tasks := []model.PublishTask{{ID: "trigger", AccountID: "default", BatchID: "default", Status: model.PublishTaskPublishing}, {ID: "pending", AccountID: "default", BatchID: "default", Status: model.PublishTaskQueued}, {ID: "preparing", AccountID: "default", BatchID: "default", Status: model.PublishTaskPreparing}, {ID: "done", AccountID: "default", BatchID: "default", Status: model.PublishTaskSucceeded}, {ID: "foreign", AccountID: "other", BatchID: "other", Status: model.PublishTaskQueued}}
	for _, task := range tasks {
		if err := service.repository.Create(ctx, task); err != nil {
			t.Fatal(err)
		}
	}
	err := fmt.Errorf("闲鱼发布接口失败: %w", &xianyu.APIError{Code: xianyu.PublishCountLimitErrorCode, Message: "用户发布商品数已达到上限"})
	if !service.stopOnPublishCountLimit(tasks[0], err) {
		t.Fatal("limit not detected")
	}
	account, _ := service.accountRepository.Get(ctx, "default")
	if account.Status != model.XianyuAccountPaused || account.QueueStoppedAt == nil || !strings.Contains(account.QueueStopReason, xianyu.PublishCountLimitErrorCode) {
		t.Fatalf("stop not persisted: %#v", account)
	}
	for _, id := range []string{"pending", "preparing"} {
		task, _ := service.repository.Get(ctx, id)
		if task.Status != model.PublishTaskFailed || !strings.Contains(task.ErrorMessage, "未执行") {
			t.Fatalf("remaining work not aborted: %#v", task)
		}
		if ok, _ := service.repository.MarkPreparingIfExecutable(ctx, id); ok {
			t.Fatal("cached queued task can still execute")
		}
		if ok, _ := service.repository.ClaimRetry(ctx, id); ok {
			t.Fatal("cancelled remaining task retried automatically")
		}
	}
	done, _ := service.repository.Get(ctx, "done")
	foreign, _ := service.repository.Get(ctx, "foreign")
	if done.Status != model.PublishTaskSucceeded || foreign.Status != model.PublishTaskQueued {
		t.Fatal("successful or other account task modified")
	}
	other, _ := service.accountRepository.Get(ctx, "other")
	if other.Status != model.XianyuAccountActive {
		t.Fatal("other account paused")
	}
	batch, _ := batches.Get(ctx, "default")
	if batch.Status != model.PublishBatchCancelled || !strings.Contains(batch.ErrorMessage, "自动中止") {
		t.Fatal("batch not stopped")
	}
	if err := batches.CompletePreparation(ctx, "default", []string{}, []model.PublishBatchSkip{}); err == nil {
		t.Fatal("async preparation reopened aborted batch")
	}
	// Work materialized by an already-running preparer is cancelled with the actual stop reason.
	if err := service.repository.Create(ctx, model.PublishTask{ID: "late", AccountID: "default", BatchID: "default", Status: model.PublishTaskQueued}); err != nil {
		t.Fatal(err)
	}
	if _, err := service.repository.CancelByBatchID(ctx, "default"); err != nil {
		t.Fatal(err)
	}
	late, _ := service.repository.Get(ctx, "late")
	if late.Status != model.PublishTaskFailed || !strings.Contains(late.ErrorMessage, "自动中止") {
		t.Fatalf("late preparation lost stop cause: %#v", late)
	}

	restarted := &Service{repository: service.repository, accountRepository: service.accountRepository}
	waitCtx, cancel := context.WithTimeout(ctx, 40*time.Millisecond)
	defer cancel()
	if restarted.waitForAccount(waitCtx, "default") {
		t.Fatal("restart automatically resumed account")
	}
	// Only an explicit resume clears the persistent reason and in-process stop gate.
	if err := service.accountRepository.Update(ctx, "default", "", model.XianyuAccountActive); err != nil {
		t.Fatal(err)
	}
	service.ClearAutomaticStop("default")
	resumed, _ := service.accountRepository.Get(ctx, "default")
	if resumed.QueueStopReason != "" || resumed.QueueStoppedAt != nil {
		t.Fatal("manual resume left stale stop reason")
	}
	if !service.waitForAccount(ctx, "default") {
		t.Fatal("explicit resume failed")
	}
}

func TestPublishLimitOrdinaryErrorsDoNotStopOrCancel(t *testing.T) {
	service, _ := limitStopFixture(t)
	ctx := context.Background()
	if service.stopOnPublishCountLimit(model.PublishTask{AccountID: "default"}, &xianyu.APIError{Code: "OTHER", Message: "图片存在安全问题"}) {
		t.Fatal("ordinary error stopped account")
	}
	account, _ := service.accountRepository.Get(ctx, "default")
	if account.Status != model.XianyuAccountActive {
		t.Fatal("ordinary error changed account")
	}
}

func TestPublishLimitRuntimeGateFailsClosedWithoutPausePersistence(t *testing.T) {
	service, db := limitStopFixture(t)
	ctx := context.Background()
	if _, err := db.Collection("xianyu_managed_accounts").DeleteOne(ctx, bson.M{"_id": "default"}); err != nil {
		t.Fatal(err)
	}
	task := model.PublishTask{ID: "trigger", AccountID: "default", Status: model.PublishTaskPublishing}
	if err := service.repository.Create(ctx, task); err != nil {
		t.Fatal(err)
	}
	service.stopOnPublishCountLimit(task, &xianyu.APIError{Code: xianyu.PublishCountLimitErrorCode, Message: "用户发布商品数已达到上限"})
	waitCtx, cancel := context.WithTimeout(ctx, 40*time.Millisecond)
	defer cancel()
	if service.waitForAccount(waitCtx, "default") {
		t.Fatal("failed persistent pause allowed further requests")
	}
}

func TestPublishLimitDoesNotReactivateDisabledAccount(t *testing.T) {
	service, _ := limitStopFixture(t)
	ctx := context.Background()
	if err := service.accountRepository.Update(ctx, "default", "", model.XianyuAccountDisabled); err != nil {
		t.Fatal(err)
	}
	task := model.PublishTask{ID: "trigger", AccountID: "default", Status: model.PublishTaskPublishing}
	if err := service.repository.Create(ctx, task); err != nil {
		t.Fatal(err)
	}
	service.stopOnPublishCountLimit(task, &xianyu.APIError{Code: xianyu.PublishCountLimitErrorCode, Message: "用户发布商品数已达到上限"})
	account, _ := service.accountRepository.Get(ctx, "default")
	if account.Status != model.XianyuAccountDisabled {
		t.Fatal("automatic stop weakened disabled account")
	}
}
