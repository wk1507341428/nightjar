package repository

import (
	"context"
	"errors"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

func identityTestDatabase(t *testing.T) (context.Context, *mongo.Database) {
	t.Helper()
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("integration database not configured")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		cancel()
		t.Fatal(err)
	}
	db := client.Database("sidejob_identity_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() {
		cleanup, stop := context.WithTimeout(context.Background(), 10*time.Second)
		defer stop()
		_ = db.Drop(cleanup)
		_ = client.Disconnect(cleanup)
		cancel()
	})
	return ctx, db
}

func TestConcurrentPublishAndRelistAliasesShareAtomicAccountIdentity(t *testing.T) {
	ctx, db := identityTestDatabase(t)
	repo := NewPublishTaskRepository(db)
	if err := repo.EnsureIndexes(ctx); err != nil {
		t.Fatal(err)
	}
	var winners atomic.Int32
	var group sync.WaitGroup
	for i := 0; i < 24; i++ {
		i := i
		group.Add(1)
		go func() {
			defer group.Done()
			task := model.PublishTask{ID: primitive.NewObjectID().Hex(), AccountID: "a", ItemNo: "31012802", Status: model.PublishTaskQueued}
			if i%2 == 0 {
				task.ItemNo = "310128 02"
				task.Action = model.PublishActionRelist
			}
			err := repo.Create(ctx, task)
			if err == nil {
				winners.Add(1)
			} else if !errors.Is(err, ErrActivePublishTaskExists) {
				t.Error(err)
			}
		}()
	}
	group.Wait()
	if winners.Load() != 1 {
		t.Fatalf("same product acquired %d activation slots", winners.Load())
	}
	for _, task := range []model.PublishTask{
		{ID: "other-account", AccountID: "b", ItemNo: "31012802", Status: model.PublishTaskQueued},
		{ID: "other-color", AccountID: "a", ItemNo: "31012803", Status: model.PublishTaskQueued},
		{ID: "update-one", AccountID: "a", ItemNo: "31012802", Action: model.PublishActionUpdate, Status: model.PublishTaskQueued},
		{ID: "update-two", AccountID: "a", ItemNo: "31012802", Action: model.PublishActionUpdate, Status: model.PublishTaskQueued},
		{ID: "offline", AccountID: "a", ItemNo: "31012802", Action: model.PublishActionOffline, Status: model.PublishTaskQueued},
	} {
		if err := repo.Create(ctx, task); err != nil {
			t.Fatalf("legitimate task blocked: %s: %v", task.ID, err)
		}
	}
	failed := model.PublishTask{ID: "retry", AccountID: "a", ItemNo: "310128 02", Status: model.PublishTaskFailed}
	if err := repo.Create(ctx, failed); err != nil {
		t.Fatal(err)
	}
	if claimed, err := repo.ClaimRetry(ctx, failed.ID); claimed || !errors.Is(err, ErrActivePublishTaskExists) {
		t.Fatalf("retry bypassed another live activation: %v %v", claimed, err)
	}
	busy, err := repo.ExistingItemNos(ctx, "a", []string{"310128 02"})
	if err != nil || len(busy) != 1 {
		t.Fatalf("active query did not find canonical identity: %v %v", busy, err)
	}
}

func TestLegacyArticleKeysBackfillAndIndexedOnSaleHistoryQueries(t *testing.T) {
	ctx, db := identityTestDatabase(t)
	_, err := db.Collection("marketplace_listings").InsertMany(ctx, []any{
		bson.M{"_id": "sale", "accountId": "a", "platform": model.XianyuPlatform, "platformItemId": "one", "itemNo": "CFP04  IMXAQ", "saleStatus": "onsale"},
		bson.M{"_id": "history", "accountId": "a", "platform": model.XianyuPlatform, "platformItemId": "two", "itemNo": "CFP04 IMXAQ", "saleStatus": "off_shelf"},
		bson.M{"_id": "other", "accountId": "b", "platform": model.XianyuPlatform, "platformItemId": "three", "itemNo": "CFP04 IMXAQ", "saleStatus": "onsale"},
	})
	if err != nil {
		t.Fatal(err)
	}
	repo := NewMarketplaceListingRepository(db)
	if err := repo.EnsureIndexes(ctx); err != nil {
		t.Fatal(err)
	}
	listings, err := repo.ListByItemNos(ctx, "a", model.XianyuPlatform, []string{"cfp04 imxaq"})
	if err != nil || len(listings) != 1 || listings[0].PlatformItemID != "one" {
		t.Fatalf("on-sale aliases/account boundaries incorrect: %#v %v", listings, err)
	}
	history, err := repo.ListOffShelfByItemNos(ctx, "a", []string{"CFP04  IMXAQ"})
	if err != nil || len(history) != 1 || history[0].PlatformItemID != "two" {
		t.Fatalf("old links were not found for canonical article: %#v %v", history, err)
	}
	if listings[0].ItemNo != "CFP04  IMXAQ" {
		t.Fatal("key backfill changed original display article number")
	}
	if err := repo.EnsureIndexes(ctx); err != nil {
		t.Fatalf("idempotent migration failed: %v", err)
	}
}
