package catalog

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/config"
	"sidejob-server/internal/repository"
)

func TestSyncCenterGenerationFailurePreservesPreviousAndResumes(t *testing.T) {
	ctx, center, fail, listChanges, firstDetails := newSyncCenterIntegrationFixture(t)
	begin, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	complete := waitSyncTestRun(t, ctx, center, begin.ID)
	if complete.Status != SyncCenterComplete || complete.ProductCount != 2 || complete.SKUCount != 2 {
		t.Fatalf("first sync: %#v", complete)
	}
	initial, err := center.ReadProfile(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	fail.Store(true)
	begin, err = center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	failed := waitSyncTestRun(t, ctx, center, begin.ID)
	if failed.Status != SyncCenterFailed {
		t.Fatalf("expected failed run: %#v", failed)
	}
	preserved, err := center.ReadProfile(ctx, "brand")
	if err != nil || preserved.Generation != initial.Generation {
		t.Fatalf("failure replaced good generation: %#v %v", preserved, err)
	}
	orphanID := hashID(failed.ID, "4", "store", "two")
	if _, err = center.skus.InsertOne(ctx, SyncCenterSKU{ID: "orphan", Generation: failed.ID, ProductID: orphanID, SourceSKUID: "old-orphan"}); err != nil {
		t.Fatal(err)
	}
	before := firstDetails.Load()
	fail.Store(false)
	resumed, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if resumed.ID != failed.ID {
		t.Fatal("failed generation checkpoint not resumed")
	}
	complete = waitSyncTestRun(t, ctx, center, resumed.ID)
	if complete.Status != SyncCenterComplete || complete.ProductCount != 2 || firstDetails.Load() != before {
		t.Fatalf("resume queried successful source again: %#v", complete)
	}
	finalSKUs, err := center.skus.CountDocuments(ctx, bson.M{"generation": resumed.ID})
	if err != nil || finalSKUs != 2 {
		t.Fatalf("partial staging SKU survived: %d %v", finalSKUs, err)
	}
	final, err := center.ReadProfile(ctx, "brand")
	if err != nil || final.Generation != resumed.ID {
		t.Fatalf("complete version not activated: %v", err)
	}
	assertPublishedSyncRecovery(t, ctx, center, resumed.ID, listChanges)
	specs, ok := final.Products[0].Data["spec_items"].([]any)
	if !ok || len(specs) != 1 {
		t.Fatal("BSON source specs lost")
	}
}

func waitSyncTestRun(t *testing.T, ctx context.Context, center *SyncCenter, id string) SyncCenterRun {
	t.Helper()
	for ctx.Err() == nil {
		run, err := center.GetRun(ctx, id)
		if err != nil {
			t.Fatal(err)
		}
		if run.Status != SyncCenterRunning {
			return run
		}
		time.Sleep(30 * time.Millisecond)
	}
	t.Fatal("sync timed out")
	return SyncCenterRun{}
}

func newSyncCenterIntegrationFixture(t *testing.T) (context.Context, *SyncCenter, *atomic.Bool, *atomic.Bool, *atomic.Int32) {
	t.Helper()
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("requires isolated test mongo URI")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	t.Cleanup(cancel)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(context.Background()) })
	db := client.Database("sidejob_sync_center_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = db.Drop(context.Background()) })
	var fail atomic.Bool
	var listChanges atomic.Bool
	var firstDetails atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/distributor/get_all_distributor" {
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"list": []any{map[string]any{"distributor_id": "store", "name": "Brand", "logo": "https://fixture.invalid/logo.png"}}}})
			return
		}
		if r.URL.Path == "/goods/items" {
			products := []any{map[string]any{"item_id": "one", "item_no": "ONE"}, map[string]any{"item_id": "two", "item_no": "TWO"}}
			if listChanges.Load() {
				products = append(products, map[string]any{"item_id": "three", "item_no": "THREE"})
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"total_count": len(products), "list": products}})
			return
		}
		id := strings.TrimPrefix(r.URL.Path, "/goods/items/")
		if id == "one" {
			firstDetails.Add(1)
		}
		if id == "two" && fail.Load() {
			w.WriteHeader(422)
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"item_id": id, "item_no": strings.ToUpper(id), "item_category_main": map[string]any{"category_id": "root", "category_name": "root", "children": []any{map[string]any{"category_id": "shoes", "category_name": "Shoes", "image_url": "https://fixture.invalid/shoes.png", "category_level": "2"}}}, "spec_items": []any{map[string]any{"item_id": id + "-sku", "store": 2, "price": 1000, "approve_status": "onsale"}}}})
	}))
	t.Cleanup(upstream.Close)
	repo := NewInventoryRepository(db)
	if err = repo.SaveBrandProfile(ctx, BrandProfile{ID: "brand", Name: "Brand"}, []BrandProfileMember{{ID: "member", RegionID: "4", DistributorID: "store"}}); err != nil {
		t.Fatal(err)
	}
	source := &Service{config: config.CatalogConfig{APIBase: upstream.URL}, httpClient: upstream.Client(), inventoryRepository: repo, liveOfferSemaphore: make(chan struct{}, 2), detailSemaphore: make(chan struct{}, 4)}
	center := NewSyncCenter(db, source)
	if err = center.EnsureIndexes(ctx); err != nil {
		t.Fatal(err)
	}

	return ctx, center, &fail, &listChanges, &firstDetails
}

func assertPublishedSyncRecovery(t *testing.T, ctx context.Context, center *SyncCenter, publishedID string, listChanges *atomic.Bool) {
	t.Helper()
	// Simulate a crash after head activation but before recording run completion.
	if _, err := center.runs.UpdateOne(ctx, bson.M{"_id": publishedID}, bson.M{"$set": bson.M{"status": SyncCenterInterrupted}}); err != nil {
		t.Fatal(err)
	}
	listChanges.Store(true)
	fresh, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if fresh.ID == publishedID {
		t.Fatal("published generation reused as mutable staging")
	}
	freshComplete := waitSyncTestRun(t, ctx, center, fresh.ID)
	if freshComplete.Status != SyncCenterComplete || freshComplete.ProductCount != 3 {
		t.Fatalf("fresh generation failed: %#v", freshComplete)
	}
	preservedCount, err := center.products.CountDocuments(ctx, bson.M{"generation": publishedID})
	if err != nil || preservedCount != 2 {
		t.Fatalf("old published generation was cleared: %d %v", preservedCount, err)
	}
	repaired, err := center.GetRun(ctx, publishedID)
	if err != nil || repaired.Status != SyncCenterComplete {
		t.Fatalf("published run not repaired: %#v %v", repaired, err)
	}
}

func TestSyncCenterCanonicalArticleBackfillAcrossRegions(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	members := []BrandProfileMember{{ID: "m1", RegionID: "4", DistributorID: "a"}, {ID: "m2", RegionID: "2", DistributorID: "b"}}
	if err := center.source.inventoryRepository.SaveBrandProfile(ctx, BrandProfile{ID: "brand", Name: "Brand"}, members); err != nil {
		t.Fatal(err)
	}
	head := SyncCenterSnapshot{ProfileID: "brand", Generation: "active", Members: members, ProductCount: 2, SKUCount: 2, SyncedAt: time.Now()}
	if _, err := center.heads.InsertOne(ctx, head); err != nil {
		t.Fatal(err)
	}
	docs := []any{
		bson.M{"_id": "a", "profileId": "brand", "generation": "active", "regionId": "4", "distributorId": "a", "itemId": "one", "itemNo": "mt 51205", "stock": 2, "data": bson.M{"item_no": "mt 51205", "store": 2}},
		bson.M{"_id": "b", "profileId": "brand", "generation": "active", "regionId": "2", "distributorId": "b", "itemId": "two", "itemNo": "MT\t51205", "stock": 3, "data": bson.M{"item_no": "MT\t51205", "store": 3}},
		bson.M{"_id": "staging", "profileId": "brand", "generation": "uncommitted", "regionId": "4", "itemId": "other", "itemNo": "MT51205"},
	}
	if _, err := center.products.InsertMany(ctx, docs); err != nil {
		t.Fatal(err)
	}
	if err := center.EnsureIndexes(ctx); err != nil {
		t.Fatal(err)
	}
	snapshot, err := center.ReadArticle(ctx, "brand", " mT 51205 ")
	if err != nil || len(snapshot.Products) != 2 {
		t.Fatalf("canonical lookup lost regional sources: %#v %v", snapshot, err)
	}
	preserved := map[string]int64{}
	for _, product := range snapshot.Products {
		preserved[product.ItemNo] = product.Stock
		if product.ItemNoKey != "MT51205" || product.Generation != "active" {
			t.Fatalf("backfill changed generation: %#v", product)
		}
	}
	if preserved["mt 51205"] != 2 || preserved["MT\t51205"] != 3 {
		t.Fatalf("backfill changed raw spelling/stock: %#v", preserved)
	}
}

func TestSyncCenterXianyuLastSortsBeforePaginationByAccount(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	db := center.products.Database()
	center.source.listingRepository = repository.NewMarketplaceListingRepository(db)
	if _, err := center.heads.InsertOne(ctx, SyncCenterSnapshot{ProfileID: "brand", Generation: "active"}); err != nil {
		t.Fatal(err)
	}
	products := []any{}
	for _, id := range []string{"A1", "B1", "C1", "D1", "E1"} {
		products = append(products, SyncCenterProduct{ID: id, ProfileID: "brand", Generation: "active", ItemNo: id, ItemNoKey: id, ItemID: id, Data: map[string]any{"item_no": id}})
	}
	if _, err := center.products.InsertMany(ctx, products); err != nil {
		t.Fatal(err)
	}
	listings := []any{
		bson.M{"_id": "first-a", "accountId": "first", "platform": "xianyu", "itemNo": "a 1", "saleStatus": "onsale"},
		bson.M{"_id": "first-c", "accountId": "first", "platform": "xianyu", "itemNo": "C1", "saleStatus": "onsale"},
		bson.M{"_id": "first-e", "accountId": "first", "platform": "xianyu", "itemNo": "E1", "saleStatus": "onsale"},
		bson.M{"_id": "second-b", "accountId": "second", "platform": "xianyu", "itemNo": "b 1", "saleStatus": "onsale"},
		bson.M{"_id": "second-d", "accountId": "second", "platform": "xianyu", "itemNo": "D1", "saleStatus": "onsale"},
	}
	if _, err := db.Collection("marketplace_listings").InsertMany(ctx, listings); err != nil {
		t.Fatal(err)
	}
	assertXianyuLocalPages(t, ctx, center, "first", []string{"B1", "D1", "A1", "C1", "E1"}, map[string]bool{"A1": true, "C1": true, "E1": true})
	assertXianyuLocalPages(t, ctx, center, "second", []string{"A1", "C1", "E1", "B1", "D1"}, map[string]bool{"B1": true, "D1": true})
}

func assertXianyuLocalPages(t *testing.T, ctx context.Context, center *SyncCenter, accountID string, expected []string, listed map[string]bool) {
	t.Helper()
	actual := []string{}
	for page := 1; page <= 3; page++ {
		result, err := center.SearchProducts(ctx, SyncCenterProductSearch{ProfileID: "brand", AccountID: accountID, Sort: "xianyuLast", Page: page, PageSize: 2})
		if err != nil {
			t.Fatal(err)
		}
		if result.Total != 5 {
			t.Fatalf("wrong total: %d", result.Total)
		}
		for _, product := range result.List {
			actual = append(actual, product.ItemNo)
			if product.Data["xianyu_listed"] != listed[product.ItemNo] {
				t.Fatalf("wrong account-specific listing flag: %#v", product)
			}
		}
	}
	if strings.Join(actual, ",") != strings.Join(expected, ",") {
		t.Fatalf("account %s sort crossed page boundary incorrectly: %v", accountID, actual)
	}
}

func TestSyncCenterFailFastPreservesOriginalErrorAndSuccessfulCheckpoints(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	run := SyncCenterRun{ID: "fail-fast", ProfileID: "brand", Status: SyncCenterRunning, Stage: SyncCenterStageDetails, Total: 500, StartedAt: time.Now()}
	if _, err := center.runs.InsertOne(ctx, run); err != nil {
		t.Fatal(err)
	}
	var calls atomic.Int32
	checkpointCompleted := make(chan struct{})
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		id := strings.TrimPrefix(r.URL.Path, "/goods/items/")
		if id == "0" {
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"item_id": "0", "item_no": "0", "spec_items": []any{map[string]any{"item_id": "zero-sku", "store": 2, "price": 1000}}}})
			return
		}
		if id == "4" {
			close(checkpointCompleted)
		}
		if id == "bad" {
			select {
			case <-checkpointCompleted:
			case <-r.Context().Done():
				return
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"item_id": "bad", "item_no": "bad", "spec_items": []any{map[string]any{"item_id": "bad-sku", "store": "unknown"}}}})
			return
		}
		<-r.Context().Done()
	}))
	defer upstream.Close()
	center.source.httpClient = upstream.Client()
	center.source.config.APIBase = upstream.URL
	work := make([]syncCenterWork, 500)
	for i := range work {
		work[i] = syncCenterWork{member: BrandProfileMember{RegionID: "4", DistributorID: "store"}, product: map[string]any{"item_id": fmt.Sprint(i), "item_no": fmt.Sprint(i)}}
	}
	work[1].product = map[string]any{"item_id": "bad", "item_no": "bad"}
	err := center.readDetails(ctx, &run, work)
	if err == nil || !strings.Contains(err.Error(), "非有效非负整数") {
		t.Fatalf("original source failure replaced by cancellation: %v", err)
	}
	if calls.Load() > 5 {
		t.Fatalf("failure continued massive source traversal: %d", calls.Load())
	}
	saved, getErr := center.GetRun(ctx, run.ID)
	if getErr != nil || !strings.Contains(saved.Error, "非有效非负整数") || saved.ProductCount != 1 || saved.SKUCount != 1 {
		t.Fatalf("failure/checkpoint progress not flushed: %#v %v", saved, getErr)
	}
	count, countErr := center.products.CountDocuments(ctx, bson.M{"generation": run.ID})
	if countErr != nil || count != 1 {
		t.Fatalf("successful checkpoint lost: %d %v", count, countErr)
	}
}

func TestSyncCenterResumeIntersectsFreshIdentitiesWithoutDiscardingPriceObservations(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	run := SyncCenterRun{ID: "resume-current-list", ProfileID: "brand", ProfileName: "Brand", Status: SyncCenterFailed, Members: members, StartedAt: time.Now(), UpdatedAt: time.Now(), WorkFingerprint: "legacy-full-map-hash"}
	if _, err = center.runs.InsertOne(ctx, run); err != nil {
		t.Fatal(err)
	}
	observed := time.Now().Add(-10 * time.Minute).Truncate(time.Millisecond)
	seedSyncCheckpoint(t, ctx, center, run, syncCheckpointSeed{"keep", "KEEP", 1, observed, false})
	seedSyncCheckpoint(t, ctx, center, run, syncCheckpointSeed{"gone", "GONE", 1, observed, false})
	seedSyncCheckpoint(t, ctx, center, run, syncCheckpointSeed{"same", "OLD", 1, observed, false})
	seedSyncCheckpoint(t, ctx, center, run, syncCheckpointSeed{"partial", "PARTIAL", 2, observed, true})
	previous := SyncCenterSnapshot{ProfileID: "brand", Generation: "previous-active", Members: members, ProductCount: 1, SyncedAt: observed}
	if _, err = center.heads.InsertOne(ctx, previous); err != nil {
		t.Fatal(err)
	}
	if _, err = center.products.InsertOne(ctx, SyncCenterProduct{ID: "old-active", ProfileID: "brand", Generation: previous.Generation, Stock: 77}); err != nil {
		t.Fatal(err)
	}
	var keepCalls atomic.Int32
	var rechecked atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if serveSyncMetadataDirectory(w, r) {
			return
		}
		if r.URL.Path == "/goods/items" {
			rows := []any{map[string]any{"item_id": "fresh", "item_no": "FRESH"}, map[string]any{"item_id": "same", "item_no": "NEW"}, map[string]any{"item_id": "keep", "item_no": " k e e p ", "store": 99, "price": 8888}, map[string]any{"item_id": "partial", "item_no": "PARTIAL"}}
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"total_count": len(rows), "list": rows}})
			return
		}
		id := strings.TrimPrefix(r.URL.Path, "/goods/items/")
		if id == "keep" {
			keepCalls.Add(1)
		} else {
			rechecked.Add(1)
		}
		article := strings.ToUpper(id)
		if id == "same" {
			article = "NEW"
		}
		skus := []any{map[string]any{"item_id": id + "-0", "store": 5, "price": 3000}}
		if id == "partial" {
			skus = append(skus, map[string]any{"item_id": id + "-1", "store": 6, "price": 3000})
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"item_id": id, "item_no": article, "item_category_main": syncTestMetadataCategory(), "spec_items": skus}})
	}))
	defer upstream.Close()
	center.source.httpClient = upstream.Client()
	center.source.config.APIBase = upstream.URL
	resumed, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if resumed.ID != run.ID {
		t.Fatal("resume created a different run")
	}
	complete := waitSyncTestRun(t, ctx, center, resumed.ID)
	if complete.Status != SyncCenterComplete || complete.ProductCount != 4 || complete.SKUCount != 5 || keepCalls.Load() != 0 || rechecked.Load() != 3 {
		t.Fatalf("resume did not intersect complete checkpoints: %#v keep=%d rechecked=%d", complete, keepCalls.Load(), rechecked.Load())
	}
	assertSyncRetainedObservation(t, ctx, center, run, observed)
	if count, err := center.products.CountDocuments(ctx, bson.M{"generation": run.ID, "itemId": "gone"}); err != nil || count != 0 {
		t.Fatalf("removed source checkpoint retained: %d %v", count, err)
	}
	if count, err := center.skus.CountDocuments(ctx, bson.M{"generation": run.ID, "productId": hashID(run.ID, "4", "store", "gone")}); err != nil || count != 0 {
		t.Fatalf("removed source SKU retained: %d %v", count, err)
	}
	if count, err := center.products.CountDocuments(ctx, bson.M{"generation": previous.Generation, "stock": 77}); err != nil || count != 1 {
		t.Fatalf("previous active data modified: %d %v", count, err)
	}
	// The now-published same run may never be reconciled again as staging.
	if err = center.reconcileStagingIdentities(ctx, run, nil); err == nil {
		t.Fatal("active generation reconciliation was allowed")
	}
}

type syncCheckpointSeed struct {
	id, article string
	skuCount    int
	observed    time.Time
	partial     bool
}

func seedSyncCheckpoint(t *testing.T, ctx context.Context, center *SyncCenter, run SyncCenterRun, seed syncCheckpointSeed) {
	id, article, skuCount, observed, partial := seed.id, seed.article, seed.skuCount, seed.observed, seed.partial
	t.Helper()
	source := map[string]any{"item_id": id, "item_no": article}
	specs := []any{}
	for i := 0; i < skuCount; i++ {
		specs = append(specs, map[string]any{"item_id": fmt.Sprintf("%s-%d", id, i), "store": 2, "price": 1000})
	}
	detail := map[string]any{"item_id": id, "item_no": article, "item_category_main": syncTestMetadataCategory(), "spec_items": specs}
	product, skus, err := buildSyncCenterRows(run, syncCenterWork{member: BrandProfileMember{RegionID: "4", DistributorID: "store"}, product: source}, detail)
	if err != nil {
		t.Fatal(err)
	}
	product.SyncedAt = observed
	if _, err = center.products.InsertOne(ctx, product); err != nil {
		t.Fatal(err)
	}
	if partial {
		skus = skus[:1]
	}
	for _, sku := range skus {
		sku.ObservedAt = observed
		sku.SyncedAt = observed
		if _, err = center.skus.InsertOne(ctx, sku); err != nil {
			t.Fatal(err)
		}
	}
}

func assertSyncRetainedObservation(t *testing.T, ctx context.Context, center *SyncCenter, run SyncCenterRun, observed time.Time) {
	t.Helper()
	var product SyncCenterProduct
	if err := center.products.FindOne(ctx, bson.M{"generation": run.ID, "itemId": "keep"}).Decode(&product); err != nil {
		t.Fatal(err)
	}
	if !product.SyncedAt.Equal(observed) || product.PriceCents != 1000 || product.Stock != 2 {
		t.Fatalf("list volatility replaced historical complete detail: %#v", product)
	}
	var sku SyncCenterSKU
	if err := center.skus.FindOne(ctx, bson.M{"generation": run.ID, "productId": product.ID}).Decode(&sku); err != nil {
		t.Fatal(err)
	}
	if !sku.ObservedAt.Equal(observed) || sku.PriceCents != 1000 || sku.Stock != 2 {
		t.Fatalf("SKU observation time/value changed: %#v", sku)
	}
}

func TestSyncCenterCategoryRepairPreservesActiveSnapshotObservations(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	observed := time.Now().Add(-15 * time.Minute).Truncate(time.Millisecond)
	detail := map[string]any{"item_no": "B75806", "store": 12, "price": 1000, "item_category_main": []any{map[string]any{"category_id": "1", "path": "1", "children": []any{map[string]any{"category_id": "27", "path": "1,27", "children": []any{map[string]any{"category_id": "28", "path": "1,27,28"}}}}}}, "item_category_info": []any{map[string]any{"category_id": "1419", "path": "1416,1417,1419"}}}
	product := SyncCenterProduct{ID: "repair-product", ProfileID: "brand", Generation: "active", ItemNo: "B75806", ItemNoKey: "B75806", Stock: 12, PriceCents: 1000, DiscountRate: 50, CategoryIDs: []string{"1", "1419"}, SyncedAt: observed, Data: detail}
	if _, err := center.products.InsertOne(ctx, product); err != nil {
		t.Fatal(err)
	}
	for _, id := range []string{"sku-a", "sku-b"} {
		if _, err := center.skus.InsertOne(ctx, SyncCenterSKU{ID: id, ProfileID: "brand", Generation: "active", ProductID: product.ID, Stock: 6, AvailableStock: 6, PriceCents: 1000, ObservedAt: observed, SyncedAt: observed, CategoryIDs: []string{"1"}, Raw: map[string]any{"store": 6, "price": 1000}}); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := center.heads.InsertOne(ctx, SyncCenterSnapshot{ProfileID: "brand", Generation: "active", SyncedAt: observed, ProductCount: 1, SKUCount: 2}); err != nil {
		t.Fatal(err)
	}
	beforeProduct := readSyncRepairDocument(t, ctx, center.products, bson.M{"_id": product.ID})
	beforeSKU := readSyncRepairDocument(t, ctx, center.skus, bson.M{"_id": "sku-a"})
	beforeHead := readSyncRepairDocument(t, ctx, center.heads, bson.M{"_id": "brand"})
	result, err := center.RepairCategoryProjections(ctx)
	if err != nil || result.Products != 1 || result.SKUs != 2 {
		t.Fatalf("unexpected repair results: %#v %v", result, err)
	}
	afterProduct := readSyncRepairDocument(t, ctx, center.products, bson.M{"_id": product.ID})
	afterSKU := readSyncRepairDocument(t, ctx, center.skus, bson.M{"_id": "sku-a"})
	delete(beforeProduct, "categoryIds")
	delete(afterProduct, "categoryIds")
	delete(beforeSKU, "categoryIds")
	delete(afterSKU, "categoryIds")
	if !reflect.DeepEqual(beforeProduct, afterProduct) || !reflect.DeepEqual(beforeSKU, afterSKU) || !reflect.DeepEqual(beforeHead, readSyncRepairDocument(t, ctx, center.heads, bson.M{"_id": "brand"})) {
		t.Fatal("category repair changed raw/stock/price/time/generation/head")
	}
	products, err := center.SearchProducts(ctx, SyncCenterProductSearch{ProfileID: "brand", CategoryIDs: []string{"27"}})
	if err != nil || products.Total != 1 {
		t.Fatalf("public shoe category still cannot match product: %#v %v", products, err)
	}
	skus, err := center.SearchSKUs(ctx, SyncCenterProductSearch{ProfileID: "brand", CategoryIDs: []string{"27"}})
	if err != nil || skus.Total != 2 {
		t.Fatalf("public shoe category still cannot match SKUs: %#v %v", skus, err)
	}
	again, err := center.RepairCategoryProjections(ctx)
	if err != nil || again.Products != 0 || again.SKUs != 0 {
		t.Fatalf("repair not idempotent: %#v %v", again, err)
	}
}

func readSyncRepairDocument(t *testing.T, ctx context.Context, collection *mongo.Collection, filter bson.M) bson.M {
	t.Helper()
	var row bson.M
	if err := collection.FindOne(ctx, filter).Decode(&row); err != nil {
		t.Fatal(err)
	}
	return row
}

func TestSyncCenterOlderActiveRunReusesFreshCheckpointAndRefreshesExpiredOnly(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	run := SyncCenterRun{ID: "older-active-retry", ProfileID: "brand", Status: SyncCenterFailed, Members: members, StartedAt: time.Now().Add(-90 * time.Minute), UpdatedAt: time.Now()}
	if _, err = center.runs.InsertOne(ctx, run); err != nil {
		t.Fatal(err)
	}
	freshObserved := time.Now().Add(-10 * time.Minute).Truncate(time.Millisecond)
	seedSyncCheckpoint(t, ctx, center, run, syncCheckpointSeed{"fresh", "FRESH", 1, freshObserved, false})
	seedSyncCheckpoint(t, ctx, center, run, syncCheckpointSeed{"expired", "EXPIRED", 1, time.Now().Add(-70 * time.Minute), false})
	var freshCalls, expiredCalls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if serveSyncMetadataDirectory(w, r) {
			return
		}
		if r.URL.Path == "/goods/items" {
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"total_count": 2, "list": []any{map[string]any{"item_id": "fresh", "item_no": "FRESH"}, map[string]any{"item_id": "expired", "item_no": "EXPIRED"}}}})
			return
		}
		id := strings.TrimPrefix(r.URL.Path, "/goods/items/")
		if id == "fresh" {
			freshCalls.Add(1)
		} else {
			expiredCalls.Add(1)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"item_id": id, "item_no": strings.ToUpper(id), "item_category_main": syncTestMetadataCategory(), "spec_items": []any{map[string]any{"item_id": id + "-0", "store": 8, "price": 5000}}}})
	}))
	defer upstream.Close()
	center.source.httpClient = upstream.Client()
	center.source.config.APIBase = upstream.URL
	resumed, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if resumed.ID != run.ID {
		t.Fatal("recently active older run discarded all checkpoints")
	}
	complete := waitSyncTestRun(t, ctx, center, run.ID)
	if complete.Status != SyncCenterComplete || freshCalls.Load() != 0 || expiredCalls.Load() != 1 {
		t.Fatalf("freshness handled at wrong scope: %#v fresh=%d expired=%d", complete, freshCalls.Load(), expiredCalls.Load())
	}
	var fresh, expired SyncCenterProduct
	if err = center.products.FindOne(ctx, bson.M{"generation": run.ID, "itemId": "fresh"}).Decode(&fresh); err != nil {
		t.Fatal(err)
	}
	if err = center.products.FindOne(ctx, bson.M{"generation": run.ID, "itemId": "expired"}).Decode(&expired); err != nil {
		t.Fatal(err)
	}
	if !fresh.SyncedAt.Equal(freshObserved) || fresh.Stock != 2 || expired.Stock != 8 || time.Since(expired.SyncedAt) > time.Minute {
		t.Fatal("fresh observation replaced or expired observation retained")
	}
}

func TestSyncCenterExpiredLifetimeOrIdleRunStartsFreshGeneration(t *testing.T) {
	for _, test := range []struct {
		name             string
		started, updated time.Duration
	}{{"lifetime", 4 * time.Hour, time.Minute}, {"idle", 2 * time.Hour, 70 * time.Minute}} {
		t.Run(test.name, func(t *testing.T) {
			ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
			_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand")
			if err != nil {
				t.Fatal(err)
			}
			old := SyncCenterRun{ID: "old-" + test.name, ProfileID: "brand", Status: SyncCenterFailed, Members: members, StartedAt: time.Now().Add(-test.started), UpdatedAt: time.Now().Add(-test.updated)}
			if _, err = center.runs.InsertOne(ctx, old); err != nil {
				t.Fatal(err)
			}
			fresh, err := center.Start(ctx, "brand")
			if err != nil {
				t.Fatal(err)
			}
			if fresh.ID == old.ID {
				t.Fatal("expired lifetime/idle run reused")
			}
			if complete := waitSyncTestRun(t, ctx, center, fresh.ID); complete.Status != SyncCenterComplete {
				t.Fatalf("fresh generation failed: %#v", complete)
			}
		})
	}
}

func syncTestMetadataCategory() map[string]any {
	return map[string]any{"category_id": "shoes", "category_name": "Shoes", "category_level": "2", "image_url": "https://fixture.invalid/shoes.png"}
}
func serveSyncMetadataDirectory(w http.ResponseWriter, r *http.Request) bool {
	if r.URL.Path != "/distributor/get_all_distributor" {
		return false
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"list": []any{map[string]any{"distributor_id": "store", "name": "Brand", "logo": "https://fixture.invalid/logo.png"}}}})
	return true
}
