package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"sidejob-server/internal/model"
	"testing"
	"time"
)

func TestVerifiedSnapshotPreservesNewerWritesAndUnknownGuard(t *testing.T) {
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("isolated Mongo required")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Disconnect(context.Background())
	db := client.Database("sidejob_observation_test_" + primitive.NewObjectID().Hex())
	defer db.Drop(context.Background())
	repo := NewMarketplaceListingRepository(db)
	if err := repo.EnsureIndexes(ctx); err != nil {
		t.Fatal(err)
	}
	started := time.Now().Add(-time.Minute)
	current := model.MarketplaceListing{ID: "legacy-owned-id", AccountID: "a", Platform: "xianyu", PlatformItemID: "one", ItemNo: "SKU", PriceCents: 200, SaleStatus: "onsale", LastSyncedAt: time.Now()}
	if err := repo.Upsert(ctx, current); err != nil {
		t.Fatal(err)
	}
	stale := current
	stale.ID = "different-incoming-id"
	stale.PriceCents = 100
	stale.SaleStatus = "off_shelf"
	stale.RemoteStatus = "-2"
	stale.LastSyncedAt = time.Now()
	if err := repo.ReplaceVerifiedPlatformSnapshot(ctx, "a", "xianyu", nil, []model.MarketplaceListing{stale}, started); err != nil {
		t.Fatal(err)
	}
	var saved model.MarketplaceListing
	if err := db.Collection("marketplace_listings").FindOne(ctx, bson.M{"platformItemId": "one"}).Decode(&saved); err != nil {
		t.Fatal(err)
	}
	if saved.PriceCents != 200 || saved.SaleStatus != "onsale" || saved.ID != "legacy-owned-id" {
		t.Fatalf("newer write overwritten: %#v", saved)
	}
	started = time.Now().Add(time.Second)
	stale.SaleStatus = model.MarketplaceStatusUnknown
	stale.RemoteStatus = "-9"
	if err := repo.ReplaceVerifiedPlatformSnapshot(ctx, "a", "xianyu", nil, []model.MarketplaceListing{stale}, started); err != nil {
		t.Fatal(err)
	}
	guard, err := repo.ListActivationConflictsByItemNos(ctx, "a", "xianyu", []string{"SKU"})
	if err != nil || len(guard) != 1 || guard[0].SaleStatus != model.MarketplaceStatusUnknown {
		t.Fatalf("unknown not included in activation guard: %#v %v", guard, err)
	}
	candidates, err := repo.ListOffShelfByItemNos(ctx, "a", []string{"SKU"})
	if err != nil || len(candidates) != 0 {
		t.Fatal("unknown incorrectly eligible for automatic restoration")
	}
	normal, err := repo.ListByItemNos(ctx, "a", "xianyu", []string{"SKU"})
	if err != nil || len(normal) != 0 {
		t.Fatal("unknown leaked into ordinary on-sale queries")
	}
	if err := repo.ReplacePlatformSnapshot(ctx, "a", "xianyu", nil); err != nil {
		t.Fatal(err)
	}
	guard, err = repo.ListActivationConflictsByItemNos(ctx, "a", "xianyu", []string{"SKU"})
	if err != nil || len(guard) != 1 || guard[0].SaleStatus != model.MarketplaceStatusUnknown {
		t.Fatal("list absence downgraded unknown")
	}
}
