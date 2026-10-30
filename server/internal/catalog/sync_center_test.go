package catalog

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sidejob-server/internal/config"
	"strings"
	"testing"

	"go.mongodb.org/mongo-driver/bson"
)

func TestSyncCenterRowsKeepZeroAndUnavailableSKUs(t *testing.T) {
	run := SyncCenterRun{ID: "generation", ProfileID: "brand", ProfileName: "Brand"}
	work := syncCenterWork{member: BrandProfileMember{RegionID: "4", DistributorID: "store"}, product: map[string]any{"item_id": "source", "item_no": "MT51205"}}
	detail := map[string]any{"item_no": "MT51205", "price": 10000, "activity_price": 8000, "market_price": 20000, "item_category_main": []any{map[string]any{"category_id": "27"}, map[string]any{"category_id": "leaf"}}, "spec_items": []any{
		map[string]any{"item_id": "s1", "store": 0, "approve_status": "onsale"},
		map[string]any{"item_id": "s2", "store": 10, "approve_status": "instock"},
		map[string]any{"item_id": "s3", "store": 2, "approve_status": "onsale"},
	}}
	product, skus, err := buildSyncCenterRows(run, work, detail)
	if err != nil {
		t.Fatal(err)
	}
	if len(skus) != 3 || product.Stock != 2 || skus[1].Stock != 10 || skus[1].AvailableStock != 0 {
		t.Fatalf("incorrect physical/saleable stock: %#v %#v", product, skus)
	}
	if skus[0].PriceCents != 8000 || skus[0].MarketCents != 20000 || len(product.CategoryIDs) != 2 {
		t.Fatalf("lost product price/category fallback %#v", product)
	}
	if len(anySlice(product.Data["spec_items"])) != 3 {
		t.Fatal("zero stock source SKU dropped")
	}
}

func TestSyncCenterRowsRefuseUnknownOrWrongIdentity(t *testing.T) {
	run := SyncCenterRun{ID: "generation"}
	work := syncCenterWork{product: map[string]any{"item_id": "source", "item_no": "MT51205"}}
	for _, detail := range []map[string]any{
		{"item_no": "wrong", "store": 0},
		{"store": 0},
		{"item_no": "MT51205"},
		{"item_no": "MT51205", "spec_items": []any{map[string]any{"item_id": "s1"}}},
		{"item_no": "MT51205", "spec_items": []any{map[string]any{"item_id": "s1", "store": 0}, map[string]any{"item_id": "s1", "store": 1}}},
	} {
		if _, _, err := buildSyncCenterRows(run, work, detail); err == nil {
			t.Fatalf("unsafe detail accepted %#v", detail)
		}
	}
}

func TestSyncCenterResponseMissingMustBeExplicit(t *testing.T) {
	for _, detail := range []map[string]any{nil, {"status_code": 422}, {"status_code": 403, "message": "权限不足"}} {
		err := validateSyncDetailResponse(detail)
		var missing syncCenterMissingError
		if err == nil || errors.As(err, &missing) {
			t.Fatalf("unknown response became absence: %#v %v", detail, err)
		}
	}
	err := validateSyncDetailResponse(map[string]any{"status_code": 422, "message": "该商品已下架"})
	var missing syncCenterMissingError
	if !errors.As(err, &missing) {
		t.Fatalf("explicit absence not classified: %v", err)
	}
}

func TestSyncCenterBSONNormalizationPreservesSpecs(t *testing.T) {
	products := []SyncCenterProduct{{Data: map[string]any{"spec_items": bson.A{bson.M{"item_id": "s1", "store": int32(2)}}}}}
	normalizeSyncProducts(products)
	specs, ok := products[0].Data["spec_items"].([]any)
	if !ok || len(specs) != 1 {
		t.Fatalf("BSON array was not normalized: %#v", products)
	}
	if _, ok = specs[0].(map[string]any); !ok {
		t.Fatal("BSON map was not normalized")
	}
}

func TestSyncCenterMembershipIsOrderIndependentButRequiresFullCoverage(t *testing.T) {
	a := []BrandProfileMember{{RegionID: "1", DistributorID: "a"}, {RegionID: "2", DistributorID: "b"}}
	if !sameSyncMembers(a, []BrandProfileMember{a[1], a[0]}) {
		t.Fatal("same membership rejected")
	}
	if sameSyncMembers(a, a[:1]) {
		t.Fatal("partial membership accepted")
	}
}

func TestSyncCenterMalformedStockIsUnknownNeverZero(t *testing.T) {
	for _, raw := range []any{nil, "", "bad", "1.2", -1, float64(0.5), true, map[string]any{}, []any{}} {
		if _, err := strictSyncStock(map[string]any{"store": raw}); err == nil {
			t.Fatalf("malformed stock accepted as zero: %#v", raw)
		}
	}
	for _, raw := range []any{0, int32(0), int64(0), float64(0), "0", " 12 "} {
		if _, err := strictSyncStock(map[string]any{"store": raw}); err != nil {
			t.Fatalf("valid inventory rejected: %#v %v", raw, err)
		}
	}
	if _, err := strictSyncStock(map[string]any{"store": 0, "item_total_store": "invalid"}); err == nil {
		t.Fatal("invalid secondary inventory field ignored")
	}
}

func TestSyncCenterMissingArticleRejectedEvenWhenListHasNoArticle(t *testing.T) {
	work := syncCenterWork{product: map[string]any{"item_id": "one"}}
	if _, _, err := buildSyncCenterRows(SyncCenterRun{ID: "run"}, work, map[string]any{"store": 0}); err == nil {
		t.Fatal("missing detail identity accepted")
	}
}

func TestSyncCenterHTTPFailuresNeverBecomeTombstones(t *testing.T) {
	for _, status := range []int{401, 403, 421, 422, 503} {
		t.Run(fmt.Sprint(status), func(t *testing.T) {
			upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(status)
				_, _ = w.Write([]byte(`{"data":{"status_code":422}}`))
			}))
			defer upstream.Close()
			center := &SyncCenter{source: &Service{config: config.CatalogConfig{APIBase: upstream.URL}, httpClient: upstream.Client(), detailSemaphore: make(chan struct{}, 1)}}
			_, err := center.fetchStrictDetail(context.Background(), syncCenterWork{member: BrandProfileMember{RegionID: "4"}, product: map[string]any{"item_id": "one"}})
			var missing syncCenterMissingError
			if err == nil || errors.As(err, &missing) {
				t.Fatalf("HTTP %d became confirmed absence: %v", status, err)
			}
		})
	}
}

func TestSyncCenterHTTP422ExplicitMissingBodyPreserved(t *testing.T) {
	for _, body := range []string{`{"message":"商品不存在"}`, `{"data":{"message":"该商品已下架"}}`} {
		upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(422); _, _ = w.Write([]byte(body)) }))
		center := &SyncCenter{source: &Service{config: config.CatalogConfig{APIBase: upstream.URL}, httpClient: upstream.Client(), detailSemaphore: make(chan struct{}, 1)}}
		_, err := center.fetchStrictDetail(context.Background(), syncCenterWork{member: BrandProfileMember{RegionID: "4"}, product: map[string]any{"item_id": "one"}})
		var missing syncCenterMissingError
		if !errors.As(err, &missing) {
			t.Fatalf("explicit HTTP 422 absence lost: %s %v", body, err)
		}
		upstream.Close()
	}
}

func TestSyncCenterDiscountUsesCorrespondingCheapestAvailableSKU(t *testing.T) {
	work := syncCenterWork{product: map[string]any{"item_id": "one", "item_no": "ONE"}}
	detail := map[string]any{"item_no": "ONE", "spec_items": []any{
		map[string]any{"item_id": "soldout", "store": 0, "price": 100, "market_price": 10000, "approve_status": "onsale"},
		map[string]any{"item_id": "a", "store": 2, "price": 6000, "market_price": 10000, "approve_status": "onsale"},
		map[string]any{"item_id": "b", "store": 2, "price": 5000, "market_price": 20000, "approve_status": "onsale"},
	}}
	product, _, err := buildSyncCenterRows(SyncCenterRun{ID: "run"}, work, detail)
	if err != nil {
		t.Fatal(err)
	}
	if product.PriceCents != 5000 || product.DiscountRate != 25 {
		t.Fatalf("wrong available SKU discount: %#v", product)
	}
	detail["spec_items"] = []any{map[string]any{"item_id": "no-market", "store": 2, "price": 5000}}
	product, _, err = buildSyncCenterRows(SyncCenterRun{ID: "run"}, work, detail)
	if err != nil || product.DiscountRate != 101 {
		t.Fatalf("missing market price did not sort last: %#v %v", product, err)
	}
}

func TestSyncCenterSKUKeywordCoversIdentityCodeAndSpecification(t *testing.T) {
	query := SyncCenterProductSearch{ProfileID: "brand", Keyword: "ERP[42]", StockOnly: true}
	skuFilter := bson.M{}
	addSyncSKUSearchFilters(skuFilter, query)
	clauses := skuFilter["$or"].(bson.A)
	for _, field := range []string{"itemNo", "name", "sourceSkuId", "skuCode", "label"} {
		found := false
		for _, clause := range clauses {
			if value, ok := clause.(bson.M)[field]; ok {
				pattern := value.(bson.M)
				found = pattern["$regex"] == `ERP\[42\]` && pattern["$options"] == "i"
			}
		}
		if !found {
			t.Fatalf("SKU search cannot find literal keyword in %s: %#v", field, skuFilter)
		}
	}
	if _, exists := skuFilter["stock"]; exists {
		t.Fatal("SKU stock search used physical instead of saleable stock")
	}
	productFilter := bson.M{}
	addSyncSearchFilters(productFilter, query)
	if len(productFilter["$or"].(bson.A)) != 2 {
		t.Fatal("SKU search changed product-only keyword fields")
	}
}

func TestSyncCenterCanonicalArticleKeepsSourceSpelling(t *testing.T) {
	work := syncCenterWork{product: map[string]any{"item_id": "one", "item_no": "mt 51205"}}
	detail := map[string]any{"item_no": "MT\t51205", "store": 0}
	product, _, err := buildSyncCenterRows(SyncCenterRun{ID: "run"}, work, detail)
	if err != nil {
		t.Fatal(err)
	}
	if product.ItemNoKey != "MT51205" || product.ItemNo != "MT\t51205" || product.Data["item_no"] != "MT\t51205" {
		t.Fatalf("canonicalization lost source spelling %#v", product)
	}
}

func TestSyncCenterWorkFingerprintIgnoresOrderPriceAndInventory(t *testing.T) {
	a := syncCenterWork{member: BrandProfileMember{RegionID: "4", DistributorID: "store"}, product: map[string]any{"item_id": "one", "item_no": "A B", "store": 1, "price": 1000}}
	b := syncCenterWork{member: BrandProfileMember{RegionID: "2", DistributorID: "store"}, product: map[string]any{"item_id": "two", "item_no": "CD"}}
	before := strings.Join(workFingerprintRows([]syncCenterWork{a, b}), "|")
	a.product["store"] = 99
	a.product["price"] = 9000
	a.product["item_no"] = "ab"
	after := strings.Join(workFingerprintRows([]syncCenterWork{b, a}), "|")
	if before != after {
		t.Fatal("volatile list values/order invalidate identity digest")
	}
	a.product["item_no"] = "OTHER"
	if before == strings.Join(workFingerprintRows([]syncCenterWork{b, a}), "|") {
		t.Fatal("identity change did not affect digest")
	}
}

func TestSyncCenterCategoryIDsIncludeThreeLevelMainRegionAndPaths(t *testing.T) {
	detail := map[string]any{
		"item_category_main": []any{map[string]any{"category_id": "1", "path": "1", "children": []any{map[string]any{"category_id": "27", "path": "1,27", "children": []any{map[string]any{"category_id": "28", "path": "1,27,28"}}}}}},
		"item_category_info": bson.A{bson.M{"category_id": "1416", "children": bson.A{bson.M{"category_id": "1417", "children": bson.A{bson.M{"category_id": "1419", "path": "1416,1417,1419"}}}}}},
	}
	actual := strings.Join(syncCategoryIDs(detail), ",")
	if actual != "1,27,28,1416,1417,1419" {
		t.Fatalf("category tree lost main/region ancestors: %s", actual)
	}
	pathOnly := syncCategoryIDs(map[string]any{"item_category_main": map[string]any{"category_id": "28", "path": "1,27,28"}})
	if strings.Join(pathOnly, ",") != "28,1,27" {
		t.Fatalf("path ancestors missing without parent nodes: %v", pathOnly)
	}
}
