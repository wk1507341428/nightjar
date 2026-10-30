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

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// TestPublishPerformanceBoundsNewProductDetails measures upstream work rather than wall time.
// Every upstream is a local read-only fixture; no execution worker is started.
func TestPublishPerformanceBoundsNewProductDetails(t *testing.T) {
	for _, test := range []struct {
		name       string
		maxPrice   int64
		wantCalls  int32
		wantActive int
	}{
		{name: "one_candidate_does_not_refresh_whole_brand", wantActive: 1},
		{name: "excluded_unlisted_products_need_no_details", maxPrice: 10000},
	} {
		t.Run(test.name, func(t *testing.T) {
			ctx, sc, db, calls := newPerformancePreviewFixture(t)
			request := types.CreatePublishBatchRequest{
				AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", SourceType: "live",
				ActionMode: model.PublishPresetFull, Limit: 1, MaxPriceCents: test.maxPrice,
			}
			plan, err := buildPublishBatchPlan(ctx, sc, request)
			if err != nil {
				t.Fatal(err)
			}
			if calls := calls.details.Load(); calls != test.wantCalls {
				t.Fatalf("40 unlisted products, limit=1: source detail calls=%d, want %d", calls, test.wantCalls)
			}
			if active := len(plan.Candidates) + len(plan.Relists); active != test.wantActive {
				t.Fatalf("activation candidates=%d, want %d", active, test.wantActive)
			}
			if len(plan.Updates)+len(plan.OfflineListings) != 0 {
				t.Fatalf("unlisted fixture produced listing mutations: %#v", plan)
			}
			_ = db
		})
	}
}

type performanceUpstreamCounters struct {
	details     atomic.Int32
	lists       atomic.Int32
	failDetails atomic.Bool
}

func newPerformancePreviewFixture(t *testing.T) (context.Context, *svc.ServiceContext, *mongo.Database, *performanceUpstreamCounters) {
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
	db := client.Database("sidejob_preview_performance_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = db.Drop(context.Background()) })
	calls := &performanceUpstreamCounters{}
	upstream := newPerformanceReadOnlyUpstream(t, calls)
	t.Cleanup(upstream.Close)
	sc := eligibilityPreviewContext(t, ctx, db, upstream.URL)
	products := make([]map[string]any, 40)
	for index := range products {
		product := aggregateFixtureProduct(24, sourceStatusOnSale)
		id := fmt.Sprintf("PERF%03d", index)
		product["item_no"], product["item_id"], product["default_item_id"] = id, id, id
		products[index] = product
	}
	seedSyncedFixture(t, ctx, db, products)
	return ctx, sc, db, calls
}

func newPerformanceReadOnlyUpstream(t *testing.T, calls *performanceUpstreamCounters) *httptest.Server {
	t.Helper()
	products := make([]any, 40)
	byID := make(map[string]any, len(products))
	for index := range products {
		itemNo := fmt.Sprintf("PERF%03d", index)
		product := aggregateFixtureProduct(24, sourceStatusOnSale)
		product["item_no"], product["item_id"], product["default_item_id"] = itemNo, itemNo, itemNo
		products[index], byID[itemNo] = product, product
	}
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response any
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/goods/items":
			calls.lists.Add(1)
			response = map[string]any{"data": map[string]any{"list": products, "total_count": len(products)}}
		case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/goods/items/"):
			product, exists := byID[strings.TrimPrefix(r.URL.Path, "/goods/items/")]
			if !exists {
				t.Errorf("unexpected source detail: %s", r.URL.Path)
				w.WriteHeader(http.StatusNotFound)
				return
			}
			calls.details.Add(1)
			if calls.failDetails.Load() {
				w.WriteHeader(http.StatusBadGateway)
				_ = json.NewEncoder(w).Encode(map[string]any{"message": "fixture source unavailable"})
				return
			}
			response = map[string]any{"data": product}
		case strings.Contains(r.URL.Path, "mtop.alibaba.idle.seller.pc.common.item.search"):
			response = map[string]any{"ret": []string{"SUCCESS::调用成功"}, "data": map[string]any{"total": 0, "itemSearchResponseList": []any{}}}
		default:
			t.Errorf("unexpected upstream call; writes forbidden: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusForbidden)
			return
		}
		_ = json.NewEncoder(w).Encode(response)
	}))
}

// Two rules in one user run share a snapshot, while a new run must read upstream again.
func TestPublishPerformanceSharesOneRunAndRefreshesNextRun(t *testing.T) {
	ctx, sc, db, calls := newPerformancePreviewFixture(t)
	request := types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID,
		BrandProfileID: "adidas", SourceType: "live", ActionMode: model.PublishPresetFull,
		Limit: 1, SourceSnapshotID: "run-one", MaxDiscountRate: 100}
	first, err := buildPublishBatchPlan(ctx, sc, request)
	if err != nil {
		t.Fatal(err)
	}
	if len(first.Candidates) != 1 {
		t.Fatalf("expected one candidate, got %#v", first)
	}
	first.Candidates[0]["item_total_store"] = int64(999)
	first.Candidates[0]["spec_items"].([]any)[0].(map[string]any)["store"] = int64(999)
	request.MaxDiscountRate = 75
	second, err := buildPublishBatchPlan(ctx, sc, request)
	if err != nil {
		t.Fatal(err)
	}
	if calls.details.Load() != 0 || calls.lists.Load() != 0 {
		t.Fatalf("same run repeated source reads: details=%d lists=%d", calls.details.Load(), calls.lists.Load())
	}
	if len(second.Candidates) != 1 || sourceAvailableStock(second.Candidates[0]) != 24 {
		t.Fatalf("caller mutation leaked into shared stock: %#v", second.Candidates)
	}
	request.SourceSnapshotID = "run-two"
	if _, err := buildPublishBatchPlan(ctx, sc, request); err != nil {
		t.Fatal(err)
	}
	if calls.details.Load() != 0 || calls.lists.Load() != 0 {
		t.Fatalf("new run reused previous source snapshot: details=%d lists=%d", calls.details.Load(), calls.lists.Load())
	}
	_ = db
}

// A brand without an activated generation is blocked instead of falling back to remote data.
func TestPublishPerformanceDoesNotFallbackForUnsynced(t *testing.T) {
	ctx, sc, db, calls := newPerformancePreviewFixture(t)
	if _, err := db.Collection("source_sync_heads").DeleteMany(ctx, bson.M{}); err != nil {
		t.Fatal(err)
	}
	_, err := buildPublishBatchPlan(ctx, sc, types.CreatePublishBatchRequest{AccountID: model.DefaultXianyuAccountID, BrandProfileID: "adidas", ActionMode: model.PublishPresetFull, Limit: 1})
	if err == nil {
		t.Fatal("unsynced brand accepted")
	}
	if calls.details.Load() != 0 || calls.lists.Load() != 0 {
		t.Fatal("unsynced brand queried mini program")
	}
}
