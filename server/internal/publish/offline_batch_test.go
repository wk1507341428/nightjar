package publish

import (
	"context"
	"os"
	"reflect"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
)

func TestOfflineBatchItemIDsDeduplicatesChannelRequests(t *testing.T) {
	tasks := []model.PublishTask{{XianyuItemID: "first"}, {XianyuItemID: "second"}, {XianyuItemID: "first"}, {XianyuItemID: "second"}}
	if got := offlineBatchItemIDs(tasks); !reflect.DeepEqual(got, []string{"first", "second"}) {
		t.Fatalf("channel request IDs = %v", got)
	}
}

// TestOfflineBatchDuplicateTasksAllFinish 回归真实缺陷：一个渠道结果必须结束所有关联任务。
func TestOfflineBatchDuplicateTasksAllFinish(t *testing.T) {
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("SIDEJOB_TEST_MONGO_URI is required for the isolated database test")
	}
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(ctx) })
	database := client.Database("sidejob_offline_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = database.Drop(ctx) })
	repo := repository.NewPublishTaskRepository(database)
	service := Service{repository: repo}
	results := offlineBatchResults{
		succeeded: map[string]struct{}{"first": {}, "second": {}},
		failed:    map[string]struct{}{"failed": {}},
		errors:    map[string]string{"failed": "channel rejected"},
	}
	tasks := createOfflineBatchTestTasks(t, ctx, repo)
	service.finishOfflineBatchTasks(ctx, tasks, results)
	for _, task := range tasks {
		actual, err := repo.Get(ctx, task.ID)
		if err != nil {
			t.Fatal(err)
		}
		wantStatus, wantMessage := model.PublishTaskSucceeded, ""
		if task.XianyuItemID == "failed" {
			wantStatus, wantMessage = model.PublishTaskFailed, "channel rejected"
		}
		if task.XianyuItemID == "unknown" {
			wantStatus, wantMessage = model.PublishTaskFailed, "闲鱼未返回下架结果"
		}
		if actual.Status != wantStatus || actual.ErrorMessage != wantMessage {
			t.Fatalf("task %s (%s) = %s/%q, want %s/%q", task.ID, task.XianyuItemID, actual.Status, actual.ErrorMessage, wantStatus, wantMessage)
		}
	}
}

func createOfflineBatchTestTasks(t *testing.T, ctx context.Context, repo *repository.PublishTaskRepository) []model.PublishTask {
	t.Helper()
	tasks := make([]model.PublishTask, 0, 7)
	for _, itemID := range []string{"first", "second", "first", "second", "failed", "failed", "unknown"} {
		task := model.PublishTask{ID: primitive.NewObjectID().Hex(), AccountID: "test", Action: model.PublishActionOffline, XianyuItemID: itemID, Status: model.PublishTaskPublishing}
		if err := repo.Create(ctx, task); err != nil {
			t.Fatal(err)
		}
		tasks = append(tasks, task)
	}
	return tasks
}
