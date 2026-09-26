package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"sidejob-server/internal/model"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// TestRetryClaimAtomic 使用独立临时库验证并发领取及已成功、已取消任务保护。
func TestRetryClaimAtomic(t *testing.T) {
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("integration database not configured")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Disconnect(ctx)
	database := client.Database("sidejob_retry_test_" + primitive.NewObjectID().Hex())
	defer database.Drop(ctx)
	repo := NewPublishTaskRepository(database)
	for _, task := range []model.PublishTask{{ID: "failed", Status: model.PublishTaskFailed}, {ID: "success", Status: model.PublishTaskSucceeded}, {ID: "cancelled", Status: model.PublishTaskFailed}} {
		if err := repo.Create(ctx, task); err != nil {
			t.Fatal(err)
		}
	}
	_, err = database.Collection("publish_tasks").UpdateOne(ctx, bson.M{"_id": "cancelled"}, bson.M{"$set": bson.M{"cancelledAt": time.Now()}})
	if err != nil {
		t.Fatal(err)
	}
	var winners atomic.Int32
	var group sync.WaitGroup
	for i := 0; i < 8; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			ok, err := repo.ClaimRetry(ctx, "failed")
			if err != nil {
				t.Error(err)
			}
			if ok {
				winners.Add(1)
			}
		}()
	}
	group.Wait()
	if winners.Load() != 1 {
		t.Fatalf("duplicate queue claims: %d", winners.Load())
	}
	for _, id := range []string{"success", "cancelled"} {
		ok, err := repo.ClaimRetry(ctx, id)
		if err != nil || ok {
			t.Fatalf("protected task claimed: %s, %v", id, err)
		}
	}
}
