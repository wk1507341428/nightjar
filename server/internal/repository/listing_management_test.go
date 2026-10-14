package repository

import (
	"context"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
)

// TestListingManagementRequiresOriginalPublish 校验真实发布证明、账号隔离与同步后仍生效的独立维护边界。
func TestListingManagementRequiresOriginalPublish(t *testing.T) {
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
	database := client.Database("sidejob_management_test_" + primitive.NewObjectID().Hex())
	defer database.Drop(ctx)
	repo := NewMarketplaceListingRepository(database)
	documents := []any{
		bson.M{"accountId": "a", "xianyuItemId": "owned", "action": "publish", "status": model.PublishTaskSucceeded},
		bson.M{"accountId": "a", "xianyuItemId": "legacy", "status": model.PublishTaskSucceeded},
		bson.M{"accountId": "a", "xianyuItemId": "updated-manual", "action": "update", "status": model.PublishTaskSucceeded},
		bson.M{"accountId": "a", "xianyuItemId": "relisted-manual", "action": "relist", "status": model.PublishTaskSucceeded},
		bson.M{"accountId": "a", "xianyuItemId": "failed", "action": "publish", "status": model.PublishTaskFailed},
		bson.M{"accountId": "b", "xianyuItemId": "other-account", "action": "publish", "status": model.PublishTaskSucceeded},
	}
	if _, err := database.Collection("publish_tasks").InsertMany(ctx, documents); err != nil {
		t.Fatal(err)
	}
	ids := []string{"owned", "legacy", "updated-manual", "relisted-manual", "failed", "other-account", "title-matched-manual"}
	managed, err := repo.ManagedItemIDs(ctx, "a", ids)
	if err != nil {
		t.Fatal(err)
	}
	if len(managed) != 2 || !managed["owned"] || !managed["legacy"] {
		t.Fatalf("unauthorized items managed: %v", managed)
	}
	if err := repo.SetManualManagement(ctx, "a", "owned"); err != nil {
		t.Fatal(err)
	}
	if err := repo.RequireManagedItems(ctx, "a", []string{"owned"}); err == nil {
		t.Fatal("manual item accepted by executor")
	}
	if err := repo.ReplacePlatformSnapshot(ctx, "a", model.XianyuPlatform, []model.MarketplaceListing{{ID: "a:xianyu:owned", PlatformItemID: "owned", ItemNo: "SKU-1", BrandProfileID: "profile", LastSyncedAt: time.Now()}}); err != nil {
		t.Fatal(err)
	}
	if err := repo.RequireManagedItems(ctx, "a", []string{"owned"}); err == nil {
		t.Fatal("sync erased manual protection")
	}
	filtered, err := repo.FilterManagedListings(ctx, "a", []model.MarketplaceListing{{PlatformItemID: "owned", ItemNo: "SKU-1"}, {PlatformItemID: "title-matched-manual", ItemNo: "SKU-1"}, {PlatformItemID: "legacy"}})
	if err != nil || len(filtered) != 1 || filtered[0].PlatformItemID != "legacy" {
		t.Fatalf("wrong preview permissions: %#v %v", filtered, err)
	}
}
