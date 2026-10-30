package catalog

import (
	"context"
	"fmt"
	"os"
	"sync/atomic"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func TestBulkCategoryBindingsBoundedWritesPreserveHistory(t *testing.T) {
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("isolated MongoDB required")
	}
	ctx := context.Background()
	var writes atomic.Int32
	monitor := &event.CommandMonitor{Started: func(_ context.Context, e *event.CommandStartedEvent) {
		if e.CommandName == "update" {
			writes.Add(1)
		}
	}}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri).SetMonitor(monitor))
	if err != nil {
		t.Fatal(err)
	}
	db := client.Database("sidejob_binding_bulk_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = db.Drop(context.Background()); _ = client.Disconnect(context.Background()) })
	repo := NewInventoryRepository(db)
	first := time.Now().UTC().Truncate(time.Millisecond).Add(-24 * time.Hour)
	base := SKUCategoryBinding{ItemNo: " aa-001 ", BrandProfileID: "brand", BrandStoreID: "store", RegionID: "3", DistributorID: "183", SourceItemID: "item-0", CategoryID: "shoe", SourcePriceCents: 100, LastSeenAt: first}
	if err = repo.UpsertSKUCategoryBinding(ctx, base); err != nil {
		t.Fatal(err)
	}
	bulk := make([]SKUCategoryBinding, 1001)
	for i := range bulk {
		bulk[i] = base
		bulk[i].SourceItemID = fmt.Sprintf("item-%d", i)
		bulk[i].SourcePriceCents = 200
		bulk[i].LastSeenAt = first.Add(time.Hour)
	}
	writes.Store(0)
	if err = repo.BulkUpsertSKUCategoryBindings(ctx, bulk); err != nil {
		t.Fatal(err)
	}
	if writes.Load() != 3 {
		t.Fatalf("expected 3 bounded writes, got %d", writes.Load())
	}
	if err = repo.BulkUpsertSKUCategoryBindings(ctx, bulk); err != nil {
		t.Fatal(err)
	}
	var original SKUCategoryBinding
	if err = repo.skuCategoryBindings.FindOne(ctx, bson.M{"sourceItemId": "item-0"}).Decode(&original); err != nil {
		t.Fatal(err)
	}
	if original.ItemNo != "AA-001" || original.SourcePriceCents != 200 || !original.FirstSeenAt.Equal(first) {
		t.Fatalf("history/idempotency changed: %#v", original)
	}
	count, err := repo.skuCategoryBindings.CountDocuments(ctx, bson.M{})
	if err != nil || count != 1001 {
		t.Fatalf("duplicate rows: %d %v", count, err)
	}
	writes.Store(0)
	if err = repo.BulkUpsertSKUCategoryBindings(ctx, []SKUCategoryBinding{{}}); err != nil || writes.Load() != 0 {
		t.Fatal("invalid empty binding written")
	}
}
