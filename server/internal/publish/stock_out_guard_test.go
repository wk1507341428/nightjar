package publish

import (
	"context"
	"fmt"
	"os"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
)

func TestStockOutBatchChecksFirstExecutionAndPreservesManualIntent(t *testing.T) {
	service := newStockOutTestService(t)
	tasks := []model.PublishTask{
		{ID: "recovered", StockOutOffline: true},
		{ID: "missing", StockOutOffline: true},
		{ID: "manual"},
	}
	for index := range tasks {
		tasks[index].Action = model.PublishActionOffline
		tasks[index].Status = model.PublishTaskPublishing
		if err := service.repository.Create(context.Background(), tasks[index]); err != nil {
			t.Fatal(err)
		}
	}
	called := false
	service.PrepareOfflineBatch = func(_ context.Context, _ []model.PublishTask) map[string]error {
		called = true
		return map[string]error{"recovered": fmt.Errorf("库存已恢复"), "manual": fmt.Errorf("人工下架不使用此结果")}
	}
	eligible := service.prepareOfflineBatchRetries(context.Background(), tasks)
	if !called || len(eligible) != 2 || eligible[0].ID != "missing" || eligible[1].ID != "manual" {
		t.Fatalf("first execution bypassed stock-out guard or changed manual intent: %#v", eligible)
	}
	saved, err := service.repository.Get(context.Background(), "recovered")
	if err != nil || saved.Status != model.PublishTaskFailed {
		t.Fatalf("recovered listing must be stopped before remote write: %#v %v", saved, err)
	}
}

func TestStockOutBatchWithoutVerifierFailsClosed(t *testing.T) {
	service := newStockOutTestService(t)
	task := model.PublishTask{ID: "automatic", Action: model.PublishActionOffline, StockOutOffline: true, Status: model.PublishTaskPublishing}
	if err := service.repository.Create(context.Background(), task); err != nil {
		t.Fatal(err)
	}
	if tasks := service.prepareOfflineBatchRetries(context.Background(), []model.PublishTask{task}); len(tasks) != 0 {
		t.Fatalf("missing verifier authorized remote offline: %#v", tasks)
	}
}

// 首次执行的旧筛选下架没有 StockOutOffline 标记，也必须进入保护复核。
func TestLegacyFilteredOfflineFirstExecutionRequiresVerifier(t *testing.T) {
	service := newStockOutTestService(t)
	task := model.PublishTask{ID: "legacy-filter", Action: model.PublishActionOffline, Status: model.PublishTaskPublishing, SourceSyncVersion: "old-head", BrandProfileID: "coach", ReconcileMode: model.PublishPresetFull}
	if err := service.repository.Create(context.Background(), task); err != nil {
		t.Fatal(err)
	}
	called := false
	service.PrepareOfflineBatch = func(_ context.Context, tasks []model.PublishTask) map[string]error {
		called = true
		return map[string]error{task.ID: fmt.Errorf("仅全部地区无货允许自动下架")}
	}
	if got := service.prepareOfflineBatchRetries(context.Background(), []model.PublishTask{task}); !called || len(got) != 0 {
		t.Fatalf("legacy first-run task bypassed guard: %v %#v", called, got)
	}
	saved, err := service.repository.Get(context.Background(), task.ID)
	if err != nil || saved.Status != model.PublishTaskFailed {
		t.Fatalf("unsafe task not stopped: %#v %v", saved, err)
	}
}

func TestAutomaticSourceOfflineIncludesLegacyPreviewTasks(t *testing.T) {
	for _, task := range []model.PublishTask{{StockOutOffline: true}, {SourceSyncVersion: "old-head"}, {BrandProfileID: "coach", ReconcileMode: model.PublishPresetFull}} {
		if !automaticSourceOffline(task) {
			t.Fatalf("automatic source task unguarded: %#v", task)
		}
	}
	if automaticSourceOffline(model.PublishTask{BrandProfileID: "coach"}) {
		t.Fatal("explicit manual offline was changed")
	}
}

func newStockOutTestService(t *testing.T) *Service {
	t.Helper()
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("requires an isolated MongoDB test database")
	}
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(ctx) })
	db := client.Database("sidejob_stock_out_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = db.Drop(ctx) })
	return &Service{repository: repository.NewPublishTaskRepository(db)}
}
