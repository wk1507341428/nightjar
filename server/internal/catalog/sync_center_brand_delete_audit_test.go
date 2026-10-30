package catalog

import (
	"context"
	"errors"
	"os"
	"reflect"
	"sync"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func TestBrandDeleteAuditAllGenerationsLegacySKUsAndAccountIsolation(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	first := brandDeleteAuditSync(t, ctx, center)
	second := brandDeleteAuditSync(t, ctx, center)
	if first.ID == second.ID {
		t.Fatal("fixture did not retain multiple complete generations")
	}
	listed, err := center.ListBrands(ctx)
	if err != nil || len(listed) != 1 || listed[0].ProfileID != "brand" || listed[0].LatestRun == nil || listed[0].LatestRun.ID != second.ID {
		t.Fatalf("repeat synchronization created extra brand rows or lost newest run: %#v %v", listed, err)
	}
	brandDeleteAuditSeedIsolation(t, ctx, center, first.ID)
	db := center.heads.Database()
	immutable := brandDeleteAuditCollections(t, ctx, db, []string{"catalog_brand_profiles", "catalog_brand_profile_members", "marketplace_listings"})
	if _, err := center.DeleteBrand(ctx, "brand"); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(immutable, brandDeleteAuditCollections(t, ctx, db, []string{"catalog_brand_profiles", "catalog_brand_profile_members", "marketplace_listings"})) {
		t.Fatal("deleting local source changed brand configuration or marketplace listings")
	}
	brandDeleteAuditCheckIsolation(t, ctx, center)
	listed, err = center.ListBrands(ctx)
	if err != nil {
		t.Fatal(err)
	}
	for _, row := range listed {
		if row.ProfileID == "brand" {
			t.Fatal("deleted brand remains in synchronized rows")
		}
	}
	if _, err := center.ReadProfile(ctx, "brand"); err == nil {
		t.Fatal("deleted snapshot became successful empty source")
	}
	if _, err := center.ReadArticle(ctx, "brand", "ONE"); err == nil {
		t.Fatal("deleted article became a stock-out assertion")
	}
	if _, err := center.ReadCategories(ctx, "brand", "", ""); err == nil {
		t.Fatal("deleted metadata became successful empty")
	}
	if _, _, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand"); err != nil {
		t.Fatalf("configuration cannot be selected for re-adding: %v", err)
	}
	brandDeleteAuditSync(t, ctx, center)
}

func TestBrandDeleteAuditRejectsRunningWithoutPartialWrites(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	brandDeleteAuditSync(t, ctx, center)
	if _, err := center.runs.InsertOne(ctx, SyncCenterRun{ID: "running-blocker", ProfileID: "brand", Status: SyncCenterRunning}); err != nil {
		t.Fatal(err)
	}
	names := []string{"source_sync_heads", "source_sync_products", "source_sync_skus", "source_sync_brands", "source_sync_stores", "source_sync_categories", "source_sync_runs", "source_sync_registry"}
	before := brandDeleteAuditCollections(t, ctx, center.heads.Database(), names)
	if _, err := center.DeleteBrand(ctx, "brand"); !errors.Is(err, ErrSyncCenterBusy) {
		t.Fatalf("running deletion must return typed conflict: %v", err)
	}
	if !reflect.DeepEqual(before, brandDeleteAuditCollections(t, ctx, center.heads.Database(), names)) {
		t.Fatal("rejected running deletion partially changed local source")
	}
}

func TestBrandDeleteAuditStartCannotRacePastDeletingRegistry(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	brandDeleteAuditSync(t, ctx, center)
	paused, resume := make(chan struct{}), make(chan struct{})
	var once sync.Once
	monitor := &event.CommandMonitor{Started: func(_ context.Context, e *event.CommandStartedEvent) {
		if e.CommandName != "delete" {
			return
		}
		collection, ok := e.Command.Lookup("delete").StringValueOK()
		if !ok || collection != "source_sync_heads" {
			return
		}
		once.Do(func() {
			close(paused)
			select {
			case <-resume:
			case <-ctx.Done():
			}
		})
	}}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("SIDEJOB_TEST_MONGO_URI")).SetMonitor(monitor))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(context.Background()) })
	deleter := NewSyncCenter(client.Database(center.heads.Database().Name()), center.source)
	deleted := make(chan error, 1)
	go func() { _, err := deleter.DeleteBrand(ctx, "brand"); deleted <- err }()
	select {
	case <-paused:
	case err := <-deleted:
		t.Fatalf("delete ended before race barrier: %v", err)
	case <-ctx.Done():
		t.Fatal("delete did not reach barrier")
	}
	// Different service instance mimics another process; an in-memory mutex alone cannot protect it.
	starter := NewSyncCenter(center.heads.Database(), center.source)
	attemptCtx, cancel := context.WithTimeout(ctx, time.Second)
	_, startErr := starter.Start(attemptCtx, "brand")
	cancel()
	close(resume)
	if startErr == nil {
		t.Fatal("a new sync started during deletion and may resurrect deleted data")
	}
	select {
	case err := <-deleted:
		if err != nil {
			t.Fatal(err)
		}
	case <-ctx.Done():
		t.Fatal("delete did not finish")
	}
	if _, err := center.ReadProfile(ctx, "brand"); err == nil {
		t.Fatal("racing start resurrected the deleted head")
	}
}

func brandDeleteAuditSync(t *testing.T, ctx context.Context, center *SyncCenter) SyncCenterRun {
	t.Helper()
	run, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	completed := waitSyncTestRun(t, ctx, center, run.ID)
	if completed.Status != SyncCenterComplete {
		t.Fatalf("fixture sync failed: %#v", completed)
	}
	return completed
}

func brandDeleteAuditCollections(t *testing.T, ctx context.Context, db *mongo.Database, names []string) map[string][]bson.M {
	t.Helper()
	result := map[string][]bson.M{}
	for _, name := range names {
		cursor, err := db.Collection(name).Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
		if err != nil {
			t.Fatal(err)
		}
		rows := []bson.M{}
		if err = cursor.All(ctx, &rows); err != nil {
			t.Fatal(err)
		}
		result[name] = rows
	}
	return result
}

func TestBrandDeleteAuditStartupMigrationCannotResurrectDeletedBrand(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	brandDeleteAuditSync(t, ctx, center)
	paused, resume := make(chan struct{}), make(chan struct{})
	monitor := brandDeleteAuditMigrationBarrier(ctx, paused, resume)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("SIDEJOB_TEST_MONGO_URI")).SetMonitor(monitor))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(context.Background()) })
	migrator := NewSyncCenter(client.Database(center.heads.Database().Name()), center.source)
	migrated := make(chan error, 1)
	go func() { migrated <- migrator.InitializeRegistry(ctx) }()
	select {
	case <-paused:
	case err := <-migrated:
		t.Fatalf("migration ended before stale-head barrier: %v", err)
	case <-ctx.Done():
		t.Fatal("migration did not reach barrier")
	}
	_, deleteErr := center.DeleteBrand(ctx, "brand")
	close(resume)
	if deleteErr != nil {
		t.Fatal(deleteErr)
	}
	select {
	case err := <-migrated:
		if err != nil {
			t.Fatal(err)
		}
	case <-ctx.Done():
		t.Fatal("migration did not finish")
	}
	// Repeated real startup migration must leave the internal deletion tombstone hidden.
	if err = center.InitializeRegistry(ctx); err != nil {
		t.Fatal(err)
	}
	listed, err := center.ListBrands(ctx)
	if err != nil || len(listed) != 0 {
		t.Fatalf("old startup view resurrected deleted brand: %#v %v", listed, err)
	}
	if _, err = center.ReadProfile(ctx, "brand"); err == nil {
		t.Fatal("migration resurrected source data")
	}
	brandDeleteAuditSync(t, ctx, center)
	listed, err = center.ListBrands(ctx)
	if err != nil || len(listed) != 1 || listed[0].ProfileID != "brand" {
		t.Fatalf("explicit re-add did not reactivate brand row: %#v %v", listed, err)
	}
}

func brandDeleteAuditSeedIsolation(t *testing.T, ctx context.Context, center *SyncCenter, firstGeneration string) {
	t.Helper()
	var firstProduct SyncCenterProduct
	if err := center.products.FindOne(ctx, bson.M{"generation": firstGeneration}).Decode(&firstProduct); err != nil {
		t.Fatal(err)
	}
	fixtures := []SyncCenterSKU{
		{ID: "legacy-by-product", ProductID: firstProduct.ID},
		{ID: "legacy-by-generation", Generation: firstGeneration},
		{ID: "other-brand-sku", ProfileID: "other-brand", Generation: firstGeneration, ProductID: firstProduct.ID},
	}
	for _, sku := range fixtures {
		if _, err := center.skus.InsertOne(ctx, sku); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := center.products.InsertOne(ctx, SyncCenterProduct{ID: "other-product", ProfileID: "other-brand", Generation: "other-generation", ItemID: "other"}); err != nil {
		t.Fatal(err)
	}
	if _, err := center.heads.InsertOne(ctx, SyncCenterSnapshot{ProfileID: "other-brand", Generation: "other-generation"}); err != nil {
		t.Fatal(err)
	}
	db := center.heads.Database()
	for _, name := range []string{"source_sync_brands", "source_sync_stores", "source_sync_categories", "source_sync_runs"} {
		if _, err := db.Collection(name).InsertOne(ctx, bson.M{"_id": "other-" + name, "profileId": "other-brand", "generation": "other-generation"}); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := db.Collection("marketplace_listings").InsertMany(ctx, []any{bson.M{"_id": "owned", "accountId": "default", "brandProfileId": "brand", "platformItemId": "link"}, bson.M{"_id": "other-account", "accountId": "other", "brandProfileId": "brand"}}); err != nil {
		t.Fatal(err)
	}
}

func brandDeleteAuditCheckIsolation(t *testing.T, ctx context.Context, center *SyncCenter) {
	t.Helper()
	db := center.heads.Database()
	for _, name := range []string{"source_sync_products", "source_sync_skus", "source_sync_brands", "source_sync_stores", "source_sync_categories", "source_sync_runs"} {
		count, err := db.Collection(name).CountDocuments(ctx, bson.M{"profileId": "brand"})
		if err != nil || count != 0 {
			t.Fatalf("%s retains deleted brand rows: %d %v", name, count, err)
		}
	}
	for _, id := range []string{"legacy-by-product", "legacy-by-generation"} {
		count, err := center.skus.CountDocuments(ctx, bson.M{"_id": id})
		if err != nil || count != 0 {
			t.Fatalf("legacy SKU survived: %s %d %v", id, count, err)
		}
	}
	for _, name := range []string{"source_sync_products", "source_sync_skus", "source_sync_brands", "source_sync_stores", "source_sync_categories", "source_sync_runs"} {
		count, err := db.Collection(name).CountDocuments(ctx, bson.M{"profileId": "other-brand"})
		if err != nil || count != 1 {
			t.Fatalf("%s changed another brand: %d %v", name, count, err)
		}
	}
}

func brandDeleteAuditMigrationBarrier(ctx context.Context, paused chan struct{}, resume <-chan struct{}) *event.CommandMonitor {
	var once sync.Once
	return &event.CommandMonitor{Started: func(_ context.Context, e *event.CommandStartedEvent) {
		if e.CommandName != "update" {
			return
		}
		collection, ok := e.Command.Lookup("update").StringValueOK()
		if !ok || collection != "source_sync_registry" {
			return
		}
		var command struct {
			Updates []struct {
				Query  bson.M `bson:"q"`
				Update bson.M `bson:"u"`
			} `bson:"updates"`
		}
		if err := bson.Unmarshal(e.Command, &command); err != nil {
			return
		}
		for _, update := range command.Updates {
			if update.Query["_id"] != "brand" || update.Update["$setOnInsert"] == nil {
				continue
			}
			once.Do(func() {
				close(paused)
				select {
				case <-resume:
				case <-ctx.Done():
				}
			})
		}
	}}
}
