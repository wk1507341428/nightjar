package catalog

import (
	"context"
	"os"
	"reflect"
	"strings"
	"sync"
	"testing"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// The performance contract is a command-level boundary, not a timing assertion:
// no metadata/category read may scan products or SKU documents, even in a tiny fixture.
func TestMetadataAuditReadsNeverTouchProductOrSKUCollections(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	started, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if run := waitSyncTestRun(t, ctx, center, started.ID); run.Status != SyncCenterComplete {
		t.Fatalf("fixture sync failed: %#v", run)
	}
	before := metadataAuditSourceRows(t, ctx, center)
	if _, err = center.BackfillMetadata(ctx); err != nil {
		t.Fatal(err)
	}
	after := metadataAuditSourceRows(t, ctx, center)
	if !reflect.DeepEqual(before, after) {
		t.Fatal("metadata backfill mutated product/SKU/head source observations")
	}

	var mutex sync.Mutex
	touched := []string{}
	monitor := &event.CommandMonitor{Started: func(_ context.Context, e *event.CommandStartedEvent) {
		for _, key := range []string{"find", "aggregate", "count", "distinct", "insert", "update", "delete", "findAndModify"} {
			value := e.Command.Lookup(key)
			if value.Type == 0 {
				continue
			}
			collection, ok := value.StringValueOK()
			if !ok {
				continue
			}
			if collection == "source_sync_products" || collection == "source_sync_skus" {
				mutex.Lock()
				touched = append(touched, e.CommandName+":"+collection)
				mutex.Unlock()
			}
		}
	}}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("SIDEJOB_TEST_MONGO_URI")).SetMonitor(monitor))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(context.Background()) })
	reader := NewSyncCenter(client.Database(center.heads.Database().Name()), center.source)
	for _, store := range []struct{ region, distributor string }{{"", ""}, {"4", "store"}} {
		if _, err = reader.ReadCategories(ctx, "brand", store.region, store.distributor); err != nil {
			t.Fatal(err)
		}
	}
	if _, _, err = reader.ReadDirectory(ctx, "brand"); err != nil {
		t.Fatal(err)
	}
	if _, err = reader.ReadMetadata(ctx, "brand"); err != nil {
		t.Fatal(err)
	}
	mutex.Lock()
	defer mutex.Unlock()
	if len(touched) > 0 {
		t.Fatalf("local metadata reads reached full source collections: %v", touched)
	}
}

func TestMetadataAuditMissingHeadAndChangedMembersNeverSucceedAsEmpty(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	if _, err := center.ReadCategories(ctx, "brand", "", ""); err == nil {
		t.Fatal("unsynced brand returned successful empty categories")
	}
	started, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if run := waitSyncTestRun(t, ctx, center, started.ID); run.Status != SyncCenterComplete {
		t.Fatal(run.Error)
	}
	if _, err = center.BackfillMetadata(ctx); err != nil {
		t.Fatal(err)
	}
	profile, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	members = append(members, BrandProfileMember{ID: "new-member", RegionID: "other", DistributorID: "new-store"})
	if err = center.source.inventoryRepository.SaveBrandProfile(ctx, profile, members); err != nil {
		t.Fatal(err)
	}
	if _, err = center.ReadCategories(ctx, "brand", "", ""); err == nil {
		t.Fatal("changed member configuration returned categories from old head")
	}
	if _, err = center.ReadMetadata(ctx, "brand"); err == nil {
		t.Fatal("changed member configuration returned stale metadata")
	}
}

// Canonical decoded BSON avoids irrelevant wire-order differences while checking all fields.
func metadataAuditSourceRows(t *testing.T, ctx context.Context, center *SyncCenter) map[string][]bson.M {
	t.Helper()
	result := map[string][]bson.M{}
	for _, collection := range []*mongo.Collection{center.heads, center.products, center.skus} {
		cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
		if err != nil {
			t.Fatal(err)
		}
		rows := []bson.M{}
		if err = cursor.All(ctx, &rows); err != nil {
			t.Fatal(err)
		}
		result[strings.TrimPrefix(collection.Name(), "source_sync_")] = rows
	}
	return result
}

func TestMetadataAuditRetainsSameNameDistinctIDsAndImages(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	started, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if run := waitSyncTestRun(t, ctx, center, started.ID); run.Status != SyncCenterComplete {
		t.Fatal(run.Error)
	}
	for _, tc := range []struct{ itemNo, id, image string }{{"ONE", "27", "https://fixture.invalid/main.png"}, {"TWO", "1417", "https://fixture.invalid/region.png"}} {
		category := bson.M{"category_id": tc.id, "category_name": "运动鞋靴", "category_level": "2", "image_url": tc.image}
		_, err = center.products.UpdateOne(ctx, bson.M{"generation": started.ID, "itemNo": tc.itemNo}, bson.M{"$set": bson.M{"data.item_category_main": category}})
		if err != nil {
			t.Fatal(err)
		}
	}
	if _, err = center.BackfillMetadata(ctx); err != nil {
		t.Fatal(err)
	}
	rows, err := center.ReadCategories(ctx, "brand", "", "")
	if err != nil {
		t.Fatal(err)
	}
	images := map[string]string{}
	for _, row := range rows {
		images[row.ID] = row.ImageURL
	}
	if len(rows) != 2 || images["27"] != "https://fixture.invalid/main.png" || images["1417"] != "https://fixture.invalid/region.png" {
		t.Fatalf("same-name IDs/image identity were collapsed: %#v", rows)
	}
}

func TestMetadataAuditMissingPublicationMarkerAndPartialStoreRowsFailClosed(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	started, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if run := waitSyncTestRun(t, ctx, center, started.ID); run.Status != SyncCenterComplete {
		t.Fatal(run.Error)
	}
	if _, err = center.BackfillMetadata(ctx); err != nil {
		t.Fatal(err)
	}
	brands := center.heads.Database().Collection("source_sync_brands")
	var brand bson.M
	if err = brands.FindOne(ctx, bson.M{"profileId": "brand", "generation": started.ID}).Decode(&brand); err != nil {
		t.Fatal(err)
	}
	if _, err = brands.DeleteMany(ctx, bson.M{"profileId": "brand"}); err != nil {
		t.Fatal(err)
	}
	if _, err = center.ReadCategories(ctx, "brand", "", ""); err == nil {
		t.Fatal("missing brand publication marker returned successful empty categories")
	}
	if _, err = brands.InsertOne(ctx, brand); err != nil {
		t.Fatal(err)
	}
	if _, err = center.heads.Database().Collection("source_sync_stores").DeleteMany(ctx, bson.M{"profileId": "brand", "generation": started.ID}); err != nil {
		t.Fatal(err)
	}
	if _, err = center.ReadMetadata(ctx, "brand"); err == nil {
		t.Fatal("partial store metadata returned success")
	}
	if _, err = center.ReadCategories(ctx, "brand", "4", "store"); err == nil {
		t.Fatal("partial store metadata returned successful empty categories")
	}
}

func TestMetadataAuditCompleteEmptyGenerationIsDistinctFromMissingMetadata(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	head := SyncCenterSnapshot{ProfileID: "brand", Generation: "empty-but-complete", Members: members, Products: []SyncCenterProduct{}}
	if _, err = center.heads.InsertOne(ctx, head); err != nil {
		t.Fatal(err)
	}
	// A legacy complete head is registered once at API startup before explicit backfill.
	if err = center.InitializeRegistry(ctx); err != nil {
		t.Fatal(err)
	}
	if _, err = center.BackfillMetadata(ctx); err != nil {
		t.Fatal(err)
	}
	rows, err := center.ReadCategories(ctx, "brand", "4", "store")
	if err != nil || len(rows) != 0 {
		t.Fatalf("genuinely complete zero-product store was treated as missing: %#v %v", rows, err)
	}
	if _, err = center.ReadCategories(ctx, "brand", "wrong-region", "store"); err == nil {
		t.Fatal("unrelated store was accepted as successful empty")
	}
}
