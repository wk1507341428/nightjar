package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/config"
	"sidejob-server/internal/marketplace"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
	"sidejob-server/internal/xianyu"
)

// TestJQ0585CompletePreviewWithoutExecution 回放真实列表数据，完整执行计划生成，不启动任何队列。
func TestJQ0585CompletePreviewWithoutExecution(t *testing.T) {
	uri, path := os.Getenv("SIDEJOB_TEST_MONGO_URI"), os.Getenv("SIDEJOB_TEST_JQ0585_DETAIL")
	if uri == "" || path == "" {
		t.Skip("requires isolated MongoDB and a captured source-list fixture")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Disconnect(context.Background()) })
	db := client.Database("sidejob_preview_test_" + primitive.NewObjectID().Hex())
	t.Cleanup(func() { _ = db.Drop(context.Background()) })
	product := capturedEligibilityProduct(t, path)
	upstream := eligibilityReadOnlyUpstream(t, product)
	defer upstream.Close()
	sc := eligibilityPreviewContext(t, ctx, db, upstream.URL)
	seedSyncedFixture(t, ctx, db, []map[string]any{product})
	request := types.CreatePublishBatchRequest{AccountID: "default", BrandProfileID: "adidas", SourceType: "live", MinPriceCents: 10000, MaxDiscountRate: 70, ExcludeBrokenSizeItems: true, ActionMode: model.PublishPresetFull}
	plan, err := buildPublishBatchPlan(ctx, sc, request)
	if err != nil {
		t.Fatal(err)
	}
	preview := publishBatchOfflineCandidateResponses(plan)
	if len(preview) != 0 {
		t.Fatalf("broken-size item incorrectly entered offline preview: %#v, skips=%#v", preview, plan.Skipped)
	}
	if len(plan.Candidates)+len(plan.Relists)+len(plan.Updates) != 0 {
		t.Fatal("broken-size item entered a publish/update action")
	}
	count, err := db.Collection("publish_tasks").CountDocuments(ctx, bson.M{})
	if err != nil || count != 1 {
		t.Fatalf("preview created tasks: count=%d err=%v", count, err)
	}
	t.Logf("full preview skipped JQ0585 without offlining it, no execution queue, no external write")
	if output := os.Getenv("SIDEJOB_TEST_PREVIEW_EVIDENCE"); output != "" {
		data, _ := json.MarshalIndent(map[string]any{"offlineCandidates": preview, "offlineReasons": plan.OfflineReasons, "skipped": plan.Skipped, "newTasksCreated": 0, "executionWorkerStarted": false}, "", "  ")
		if err := os.WriteFile(output, data, 0600); err != nil {
			t.Fatal(err)
		}
	}
}

func capturedEligibilityProduct(t *testing.T, path string) map[string]any {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var response struct{ Data map[string]any }
	if err := json.Unmarshal(data, &response); err != nil {
		t.Fatal(err)
	}
	return response.Data
}

func eligibilityReadOnlyUpstream(t *testing.T, product map[string]any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var response any
		switch {
		case r.Method == http.MethodGet && (r.URL.Path == "/goods/items" || strings.HasPrefix(r.URL.Path, "/goods/items/")):
			if r.URL.Path != "/goods/items" {
				_ = json.NewEncoder(w).Encode(map[string]any{"data": product})
				return
			}
			response = map[string]any{"data": map[string]any{"list": []any{product}, "total_count": 1}}
		case strings.Contains(r.URL.Path, "mtop.alibaba.idle.seller.pc.common.item.search"):
			response = map[string]any{"ret": []string{"SUCCESS::调用成功"}, "data": map[string]any{"total": 1, "itemSearchResponseList": []any{map[string]any{"itemId": "1085110331628", "itemTitle": "全新 阿迪达斯 JQ0585", "price": "239", "itemStatus": "0"}}}}
		default:
			t.Errorf("unexpected upstream call (writes are forbidden): %s %s", r.Method, r.URL.Path)
			http.Error(w, "not allowed in preview test", http.StatusForbidden)
			return
		}
		_ = json.NewEncoder(w).Encode(response)
	}))
}

func eligibilityPreviewContext(t *testing.T, ctx context.Context, db *mongo.Database, upstream string) *svc.ServiceContext {
	t.Helper()
	account := model.XianyuAccount{ID: "default", Status: model.XianyuAccountActive, SellerConnected: true}
	if _, err := db.Collection("xianyu_managed_accounts").InsertOne(ctx, account); err != nil {
		t.Fatal(err)
	}
	inv := catalog.NewInventoryRepository(db)
	if err := inv.SaveBrandProfile(ctx, catalog.BrandProfile{ID: "adidas", Name: "ADIDAS", DefaultRegionID: "5"}, []catalog.BrandProfileMember{{ProfileID: "adidas", RegionID: "5", DistributorID: "278"}}); err != nil {
		t.Fatal(err)
	}
	tasks := repository.NewPublishTaskRepository(db)
	if err := tasks.Create(ctx, model.PublishTask{ID: "published-history", AccountID: "default", ItemNo: "JQ0585", XianyuItemID: "1085110331628", Status: model.PublishTaskSucceeded, Action: model.PublishActionPublish, BrandProfileID: "adidas"}); err != nil {
		t.Fatal(err)
	}
	listings := repository.NewMarketplaceListingRepository(db)
	accounts := repository.NewXianyuAccountRepository(db)
	cipher, err := security.NewCipherFromFile(filepath.Join(t.TempDir(), "session.key"))
	if err != nil {
		t.Fatal(err)
	}
	cookie, err := cipher.Encrypt("_m_h5_tk=fixture_9999999999999; cookie2=fixture; unb=fixture")
	if err != nil {
		t.Fatal(err)
	}
	sessions := repository.NewSellerSessionRepository(db)
	if err := sessions.ForAccount("default").Save(ctx, model.XianyuSession{EncryptedCookie: cookie}); err != nil {
		t.Fatal(err)
	}
	seller := xianyu.NewSellerService(config.XianyuConfig{APIBase: upstream, AppKey: "test", RequestTimeout: 3}, sessions, cipher)
	service := catalog.NewService(config.CatalogConfig{APIBase: upstream, CompanyID: "1", RequestTimeout: 3}, inv, listings)
	return &svc.ServiceContext{SyncCenter: catalog.NewSyncCenter(db, service), SellerXianyuService: seller, XianyuAccountRepository: accounts, InventoryRepository: inv, PublishRepository: tasks, ListingRepository: listings,
		CatalogService:     service,
		MarketplaceService: marketplace.NewService(listings, tasks, accounts, seller, seller)}
}
