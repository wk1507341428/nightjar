package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

const aggregateFixtureItemNo = "JQ0585"
const aggregateFixtureItemID = "1085110331628"

type aggregateReconcileFixture struct {
	ctx         context.Context
	sc          *svc.ServiceContext
	db          *mongo.Database
	detailCalls atomic.Int32
	stock       int64
	detailFails bool
	noListings  bool
}

// Each case owns a generated database; neither queues nor real upstreams are started.
func newAggregateReconcileFixture(t *testing.T, stock int64, detailFails bool) *aggregateReconcileFixture {
	t.Helper()
	uri := os.Getenv("SIDEJOB_TEST_MONGO_URI")
	if uri == "" {
		t.Skip("requires SIDEJOB_TEST_MONGO_URI for an isolated temporary database")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	t.Cleanup(cancel)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(context.Background()) })
	fixture := &aggregateReconcileFixture{ctx: ctx, db: client.Database("sidejob_aggregate_reconcile_test_" + primitive.NewObjectID().Hex()), stock: stock, detailFails: detailFails}
	t.Cleanup(func() { _ = fixture.db.Drop(context.Background()) })
	upstream := httptest.NewServer(http.HandlerFunc(fixture.serveReadOnly(t)))
	t.Cleanup(upstream.Close)
	fixture.sc = eligibilityPreviewContext(t, ctx, fixture.db, upstream.URL)
	return fixture
}

func aggregateFixtureProduct(stock int64, status string) map[string]any {
	return map[string]any{
		"item_id": "source-JQ0585", "default_item_id": "source-JQ0585", "item_no": aggregateFixtureItemNo,
		"item_name": "ADIDAS fixture", "main_img": "https://fixture.invalid/product.jpg", "price": 20000,
		"activity_price": 20000, "market_price": 40000, "item_total_store": stock, "store": stock,
		"spec_items": []any{map[string]any{"store": stock, "approve_status": status}},
	}
}

// Permit only source reads and the seller search used for the activation snapshot.
func (fixture *aggregateReconcileFixture) serveReadOnly(t *testing.T) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response any
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/goods/items":
			response = map[string]any{"data": map[string]any{"list": []any{aggregateFixtureProduct(24, sourceStatusOnSale)}, "total_count": 1}}
		case r.Method == http.MethodGet && r.URL.Path == "/goods/items/source-JQ0585":
			fixture.detailCalls.Add(1)
			if fixture.detailFails {
				w.WriteHeader(http.StatusBadGateway)
				_ = json.NewEncoder(w).Encode(map[string]any{"message": "fixture source unavailable"})
				return
			}
			status := sourceStatusOnSale
			if fixture.stock == 0 {
				status = "instock"
			}
			response = map[string]any{"data": aggregateFixtureProduct(fixture.stock, status)}
		case strings.Contains(r.URL.Path, "mtop.alibaba.idle.seller.pc.common.item.search"):
			if fixture.noListings {
				response = map[string]any{"ret": []string{"SUCCESS::调用成功"}, "data": map[string]any{"total": 0, "itemSearchResponseList": []any{}}}
				break
			}
			response = map[string]any{"ret": []string{"SUCCESS::调用成功"}, "data": map[string]any{"total": 1, "itemSearchResponseList": []any{map[string]any{"itemId": aggregateFixtureItemID, "itemTitle": "全新 阿迪达斯 JQ0585", "price": "239", "itemStatus": "0"}}}}
		default:
			t.Errorf("unexpected upstream request; writes forbidden: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusForbidden)
			_ = json.NewEncoder(w).Encode(map[string]any{"message": "not permitted by read-only test fixture"})
			return
		}
		_ = json.NewEncoder(w).Encode(response)
	}
}

// seedSyncedFixture stages a complete activated generation in an isolated test database.
func seedSyncedFixture(t *testing.T, ctx context.Context, db *mongo.Database, products []map[string]any) {
	t.Helper()
	members := []catalog.BrandProfileMember{{ProfileID: "adidas", RegionID: "5", DistributorID: "278"}}
	head := catalog.SyncCenterSnapshot{ProfileID: "adidas", Generation: "fixture-v1", Members: members, ProductCount: len(products), SyncedAt: time.Now()}
	if _, err := db.Collection("source_sync_heads").ReplaceOne(ctx, bson.M{"_id": "adidas"}, head, options.Replace().SetUpsert(true)); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Collection("source_sync_products").DeleteMany(ctx, bson.M{}); err != nil {
		t.Fatal(err)
	}
	for index, product := range products {
		row := catalog.SyncCenterProduct{ID: fmt.Sprint(index), ProfileID: "adidas", Generation: head.Generation, RegionID: "5", DistributorID: "278", ItemID: firstProductString(product, "default_item_id", "item_id"), ItemNo: productString(product, "item_no"), ItemNoKey: model.ItemNoKey(productString(product, "item_no")), Data: product}
		if _, err := db.Collection("source_sync_products").InsertOne(ctx, row); err != nil {
			t.Fatal(err)
		}
	}
}

func TestAggregatePreviewReadsOnlyCompleteLocalStock(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 6, false)
	fixture.noListings = true
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{aggregateFixtureProduct(6, sourceStatusOnSale)})
	plan, err := buildPublishBatchPlan(fixture.ctx, fixture.sc, types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", ActionMode: model.PublishPresetFull, Limit: 20})
	if err != nil {
		t.Fatal(err)
	}
	if len(plan.Candidates) != 1 || sourceAvailableStock(plan.Candidates[0]) != 6 || plan.SourceSyncVersion != "fixture-v1" {
		t.Fatalf("unexpected local plan: %#v", plan)
	}
	if fixture.detailCalls.Load() != 0 {
		t.Fatal("preview queried mini-program details")
	}
	task, err := buildBatchPublishTask("batch", plan, plan.Candidates[0], time.Now())
	if err != nil || task.SourceSyncVersion != "fixture-v1" {
		t.Fatalf("generation lost: %#v %v", task, err)
	}
}

func TestAggregateZeroLocalStockCreatesOffline(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{aggregateFixtureProduct(0, "instock")})
	plan, err := buildPublishBatchPlan(fixture.ctx, fixture.sc, types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", ActionMode: model.PublishPresetFull})
	if err != nil {
		t.Fatal(err)
	}
	if len(plan.OfflineListings) != 1 || len(plan.Candidates)+len(plan.Updates) != 0 {
		t.Fatalf("expected local stock-out offline: %#v", plan)
	}
	task := buildReconcileOfflineTask(plan, plan.OfflineListings[0], time.Now())
	if task.SourceSyncVersion != "fixture-v1" || !task.StockOutOffline {
		t.Fatalf("offline generation/authorization lost: %#v", task)
	}
	if fixture.detailCalls.Load() != 0 {
		t.Fatal("offline preview queried source")
	}
}

func TestAggregateUnsyncedPreventsMissingInference(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	_, err := buildPublishBatchPlan(fixture.ctx, fixture.sc, types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", ActionMode: model.PublishPresetFull})
	if err == nil {
		t.Fatal("no complete local generation must block entire plan")
	}
}

func TestAggregateConfirmationUsesVersionWithoutRebuilding(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	seedSyncedFixture(t, fixture.ctx, fixture.db, nil)
	plan := publishBatchPlan{BrandProfileID: "adidas", SourceSnapshotVersion: aggregateSnapshotVersion, SourceSyncVersion: "fixture-v1", Unchanged: 7}
	returned, err := refreshAggregatePreview(fixture.ctx, fixture.sc, types.CreatePublishBatchRequest{}, plan, nil)
	if err != nil || returned.Unchanged != 7 {
		t.Fatalf("same version must preserve preview: %#v %v", returned, err)
	}
	_, err = fixture.db.Collection("source_sync_heads").UpdateOne(fixture.ctx, bson.M{"_id": "adidas"}, bson.M{"$set": bson.M{"generation": "fixture-v2"}})
	if err != nil {
		t.Fatal(err)
	}
	if _, err = refreshAggregatePreview(fixture.ctx, fixture.sc, types.CreatePublishBatchRequest{}, plan, nil); err == nil {
		t.Fatal("changed generation must reject old preview")
	}
	if fixture.detailCalls.Load() != 0 {
		t.Fatal("confirmation queried mini program")
	}
}

func TestAggregateExecutionRejectsLegacyAndChangedVersions(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	seedSyncedFixture(t, fixture.ctx, fixture.db, nil)
	for _, version := range []string{"", "obsolete"} {
		err := validateTaskSourceVersion(fixture.ctx, fixture.sc, model.PublishTask{BrandProfileID: "adidas", SourceSyncVersion: version})
		if err == nil {
			t.Fatal("unsafe version accepted")
		}
	}
}

func TestAggregateConfirmationRejectsOldPreviewBeforeReadingSources(t *testing.T) {
	_, err := refreshAggregatePreview(context.Background(), nil, types.CreatePublishBatchRequest{}, publishBatchPlan{BrandProfileID: "adidas"}, nil)
	if err == nil {
		t.Fatal("old preview accepted")
	}
}

func TestAggregateUpdateOnlyNeverAddsOfflineFromLocalStockOut(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{aggregateFixtureProduct(0, "instock")})
	request := types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", ActionMode: model.PublishPresetFull}
	if _, err := buildPublishBatchPlan(fixture.ctx, fixture.sc, request); err != nil {
		t.Fatal(err)
	}
	request.ActionMode = model.PublishPresetUpdateOnly
	plan, err := buildPublishBatchPlan(fixture.ctx, fixture.sc, request)
	if err != nil {
		t.Fatal(err)
	}
	if len(plan.OfflineListings) != 0 || len(plan.Candidates)+len(plan.Relists) != 0 {
		t.Fatalf("update_only acquired forbidden actions: %#v", plan)
	}
}

func TestAggregateTaskPersistsSyncGeneration(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	task := model.PublishTask{ID: "versioned-test", AccountID: model.DefaultXianyuAccountID, ItemNo: "VERSION", SourceSyncVersion: "fixture-v1", Status: model.PublishTaskQueued}
	if err := fixture.sc.PublishRepository.Create(fixture.ctx, task); err != nil {
		t.Fatal(err)
	}
	task.SourceSyncVersion = "fixture-v2"
	if err := fixture.sc.PublishRepository.UpdateContent(fixture.ctx, task); err != nil {
		t.Fatal(err)
	}
	saved, err := fixture.sc.PublishRepository.Get(fixture.ctx, task.ID)
	if err != nil || saved.SourceSyncVersion != "fixture-v2" {
		t.Fatalf("sync generation lost: %#v %v", saved, err)
	}
}

func TestAggregateFilteredOfflineRequiresPreviewGeneration(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 6, false)
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{aggregateFixtureProduct(6, sourceStatusOnSale)})
	for _, test := range []struct {
		version string
		reject  bool
	}{{"fixture-v1", true}, {"obsolete", true}, {"", true}} {
		task := model.PublishTask{ID: "filter-offline", AccountID: model.DefaultXianyuAccountID, Action: model.PublishActionOffline, ReconcileMode: model.PublishPresetFull, BrandProfileID: "adidas", ItemNo: aggregateFixtureItemNo, XianyuItemID: aggregateFixtureItemID, SourceSyncVersion: test.version, StockOutOffline: false}
		_, err := refreshReconcileTask(fixture.ctx, fixture.sc, task)
		if (err != nil) != test.reject {
			t.Fatalf("version=%q refresh rejected=%v want=%v: %v", test.version, err != nil, test.reject, err)
		}
		checks := prepareOfflineBatch(fixture.ctx, fixture.sc, []model.PublishTask{task})
		if (checks[task.ID] != nil) != test.reject {
			t.Fatalf("version=%q batch guard=%v wantReject=%v", test.version, checks[task.ID], test.reject)
		}
	}
	if fixture.detailCalls.Load() != 0 {
		t.Fatal("offline generation guard queried mini program")
	}
}

func TestStockOutSemanticVersionRejectsOldReadyPreview(t *testing.T) {
	previous := publishBatchPlan{BrandProfileID: "adidas", SourceSnapshotVersion: "synced_source_stock_v4", SourceSyncVersion: "same-complete-head"}
	if _, err := refreshAggregatePreview(context.Background(), nil, types.CreatePublishBatchRequest{}, previous, nil); err == nil {
		t.Fatal("old filtered-offline semantics accepted with unchanged source generation")
	}
}

// 最便宜地区缺货并不代表整个聚合品牌缺货；执行保护也不得相信手写的缺货标记。
func TestAggregateAnyRegionStockPreventsOfflineEvenForFilteredProduct(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 0, false)
	soldOut := aggregateFixtureProduct(0, "instock")
	available := aggregateFixtureProduct(15, sourceStatusOnSale)
	available["item_id"], available["default_item_id"] = "other-region-source", "other-region-source"
	available["activity_price"], available["price"], available["market_price"] = 148800, 148800, 225000
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{soldOut, available})
	members := []catalog.BrandProfileMember{{ID: "region5", ProfileID: "adidas", RegionID: "5", DistributorID: "278"}, {ID: "region4", ProfileID: "adidas", RegionID: "4", DistributorID: "943"}}
	if err := fixture.sc.InventoryRepository.SaveBrandProfile(fixture.ctx, catalog.BrandProfile{ID: "adidas", Name: "ADIDAS", DefaultRegionID: "5"}, members); err != nil {
		t.Fatal(err)
	}
	if _, err := fixture.db.Collection("source_sync_heads").UpdateOne(fixture.ctx, bson.M{"_id": "adidas"}, bson.M{"$set": bson.M{"members": members}}); err != nil {
		t.Fatal(err)
	}
	if _, err := fixture.db.Collection("source_sync_products").UpdateOne(fixture.ctx, bson.M{"_id": "1"}, bson.M{"$set": bson.M{"regionId": "4", "distributorId": "943"}}); err != nil {
		t.Fatal(err)
	}
	plan, err := buildPublishBatchPlan(fixture.ctx, fixture.sc, types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", ActionMode: model.PublishPresetFull, MaxDiscountRate: 50})
	if err != nil {
		t.Fatal(err)
	}
	if len(plan.OfflineListings) != 0 || len(plan.Skipped) != 1 || !strings.Contains(plan.Skipped[0].Reason, "折扣率") {
		t.Fatalf("available filtered article must only skip: %#v", plan)
	}
	task := model.PublishTask{ID: "forged-stock-out", AccountID: model.DefaultXianyuAccountID, Action: model.PublishActionOffline, StockOutOffline: true, BrandProfileID: "adidas", ItemNo: aggregateFixtureItemNo, SourceSyncVersion: "fixture-v1"}
	article, err := fixture.sc.SyncCenter.ReadArticle(fixture.ctx, task.BrandProfileID, task.ItemNo)
	if err != nil || len(article.Products) != 2 {
		t.Fatalf("invalid article fixture: products=%d err=%v", len(article.Products), err)
	}
	regions := make(map[string]int64)
	for _, source := range article.Products {
		regions[source.RegionID+":"+source.DistributorID] = sourceAvailableStock(source.Data)
	}
	if regions["5:278"] != 0 || regions["4:943"] != 15 || len(regions) != 2 {
		t.Fatalf("invalid regional stocks: %#v", regions)
	}
	if err := checkStockOutOffline(fixture.ctx, fixture.sc, task); err == nil {
		t.Fatal("handwritten stock-out flag bypassed all-region stock read")
	}
	if fixture.detailCalls.Load() != 0 {
		t.Fatal("stock-out guard unexpectedly queried mini program")
	}
}
