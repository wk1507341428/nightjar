package handler

import (
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"sidejob-server/internal/model"
)

// TestDecodePublishBatchRequestKeepsCategory 验证品类筛选与默认发布设置会进入批次请求。
func TestDecodePublishBatchRequestKeepsCategory(t *testing.T) {
	request := httptest.NewRequest("POST", "/api/xianyu/publish-batches/preview", strings.NewReader(`{"brandStoreId":" store-1 ","categoryIds":[" 2 ","27","27"],"categoryNames":[" 运动服饰 ","运动鞋靴"],"limit":20}`))
	response := httptest.NewRecorder()
	body, ok := decodePublishBatchRequest(response, request)
	if !ok {
		t.Fatalf("decode request failed: %s", response.Body.String())
	}
	if body.BrandStoreID != "store-1" || strings.Join(body.CategoryIDs, ",") != "2,27" || strings.Join(body.CategoryNames, ",") != "运动服饰,运动鞋靴" {
		t.Fatalf("unexpected category request: %#v", body)
	}
	if body.MinDelaySeconds != 1 || body.MaxDelaySeconds != 2 {
		t.Fatalf("unexpected default delay: %d-%d", body.MinDelaySeconds, body.MaxDelaySeconds)
	}
}

func TestBuildReconcileOfflineTaskKeepsListingPresentation(t *testing.T) {
	plan := publishBatchPlan{AccountID: "account-1", BrandName: "NIKE-多地区", BrandProfileID: "profile-1", RegionID: "4", SourceRegions: []string{"4"}, SourceMemberIDs: []string{"4:4175"}}
	listing := model.MarketplaceListing{PlatformItemID: "1085680973385", SourceItemID: "2798572", ItemNo: "HV6891-010", Title: "全新 NIKE耐克时尚百搭运动胸包HV6891-010", PriceCents: 16000, ImageURL: "https://example.com/hv6891.png", ItemURL: "https://www.goofish.com/item?id=1085680973385", SourceType: "live"}

	task := buildReconcileOfflineTask(plan, listing, time.Now())
	if task.PriceCents != 16000 || len(task.ImageURLs) != 1 || task.ImageURLs[0] != listing.ImageURL {
		t.Fatalf("offline task lost listing presentation: %#v", task)
	}
	if task.SourceItemID != listing.SourceItemID || task.XianyuItemID != listing.PlatformItemID {
		t.Fatalf("offline task lost source linkage: %#v", task)
	}
}

// TestBuildBatchPublishTaskMatchesSingleDefaults 验证批量任务与单个发布默认模板一致。
func TestBuildBatchPublishTaskMatchesSingleDefaults(t *testing.T) {
	product := map[string]any{
		"default_item_id": "10001",
		"item_no":         "DM6822-410",
		"item_name":       "NIKE耐克 男子拉链卫衣开衫夹克薄外套运动休闲DM6822-410",
		"goods_brand":     "NIKE",
		"price":           "27440",
		"market_price":    "64900",
		"main_img":        "https://example.com/main.jpg",
		"pics":            []any{"https://example.com/main.jpg", "https://example.com/side.jpg"},
		"spec_items": []any{
			map[string]any{"store": "2", "approve_status": "onsale", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "XL"}}},
			map[string]any{"store": "1", "approve_status": "onsale", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "L"}}},
		},
	}
	task, err := buildBatchPublishTask("batch-1", publishBatchPlan{BrandName: "NIKE 耐克", RegionID: "3", MinDelaySeconds: 5, MaxDelaySeconds: 9}, product, time.Now())
	if err != nil {
		t.Fatalf("build batch task: %v", err)
	}
	if len([]rune(task.Title)) > 30 || !strings.HasPrefix(task.Title, "全新 ") || !strings.HasSuffix(task.Title, " DM6822-410") {
		t.Fatalf("unexpected title: %s", task.Title)
	}
	if task.PriceCents != 31490 {
		t.Fatalf("unexpected price: %d", task.PriceCents)
	}
	for _, expected := range []string{"有货尺码/型号：XL、L", "发货地区：上海", "1. 正品保障", "6. 尺码与售后", "下单即表示已阅读并接受以下说明：", "感谢理解，祝购物愉快！"} {
		if !strings.Contains(task.Description, expected) {
			t.Fatalf("description missing %q", expected)
		}
	}
	if strings.Contains(task.Description, "商品品相") {
		t.Fatal("description still contains removed product condition section")
	}
	if task.Condition != "全新" {
		t.Fatalf("unexpected condition: %s", task.Condition)
	}
	if task.MinDelaySeconds != 5 || task.MaxDelaySeconds != 9 {
		t.Fatalf("unexpected delay range: %d-%d", task.MinDelaySeconds, task.MaxDelaySeconds)
	}
	if len(task.Variants) != 2 || task.Variants[0].Properties[0].Name != "尺码" {
		t.Fatalf("unexpected publish variants: %#v", task.Variants)
	}
}

// TestProductPublishVariantsMergesFootwearSpecs 验证鞋类 SKU 转为买家可选鞋码及真实库存。
func TestProductPublishVariantsMergesFootwearSpecs(t *testing.T) {
	product := map[string]any{"spec_items": []any{
		map[string]any{"store": "8", "price": "38440", "approve_status": "onsale", "sku_img_url": "https://example.com/black.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "42"}, map[string]any{"spec_name": "颜色", "spec_value_name": "黑色"}}},
		map[string]any{"store": "3", "price": "38440", "approve_status": "onsale", "sku_img_url": "https://example.com/black.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "43"}, map[string]any{"spec_name": "颜色", "spec_value_name": "黑色"}}},
	}}
	variants := productPublishVariants(product, true, 42490)
	if len(variants) != 2 || variants[0].Quantity != 8 || variants[0].PriceCents != 42490 {
		t.Fatalf("unexpected footwear variants: %#v", variants)
	}
	if len(variants[0].Properties) != 1 || variants[0].Properties[0].Name != "鞋码" || variants[0].Properties[0].Value != "42" {
		t.Fatalf("unexpected footwear property: %#v", variants[0].Properties)
	}
	if variants[0].ImageURL != "https://example.com/black.jpg" {
		t.Fatalf("unexpected footwear image: %q", variants[0].ImageURL)
	}
}

// TestProductPublishVariantsKeepsVisualImages 验证同一货号的颜色图片随销售规格进入发布任务。
func TestProductPublishVariantsKeepsVisualImages(t *testing.T) {
	product := map[string]any{"spec_items": []any{
		map[string]any{"store": "3", "price": "11950", "approve_status": "onsale", "sku_img_url": "https://example.com/black.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}, map[string]any{"spec_name": "颜色", "spec_value_name": "BK黑色"}}},
		map[string]any{"store": "18", "price": "9000", "approve_status": "onsale", "sku_img_url": "https://example.com/gray.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "S"}, map[string]any{"spec_name": "颜色", "spec_value_name": "暗灰"}}},
		map[string]any{"store": "15", "price": "9000", "approve_status": "onsale", "sku_img_url": "https://example.com/gray.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}, map[string]any{"spec_name": "颜色", "spec_value_name": "暗灰"}}},
	}}
	variants := productPublishVariants(product, false, 13000)
	if len(variants) != 3 || variants[0].ImageURL != "https://example.com/black.jpg" || variants[1].ImageURL != "https://example.com/gray.jpg" {
		t.Fatalf("unexpected visual variants: %#v", variants)
	}
	if len(variants[0].Properties) != 2 || variants[0].Properties[1].Name != "颜色" || variants[0].Properties[1].Value != "BK黑色" {
		t.Fatalf("unexpected visual properties: %#v", variants[0].Properties)
	}
}

// TestEnrichProductSpecImages 验证商详图片补入列表 SKU 时不会改写库存和价格。
func TestEnrichProductSpecImages(t *testing.T) {
	listSKU := map[string]any{"store": "3", "price": "11950", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}, map[string]any{"spec_name": "颜色", "spec_value_name": "BK黑色"}}}
	product := map[string]any{"spec_items": []any{listSKU}, "_merged_spec_items": []any{listSKU}}
	detail := map[string]any{"spec_items": []any{
		map[string]any{"store": "99", "price": "99999", "sku_img_url": "https://example.com/black.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}, map[string]any{"spec_name": "颜色", "spec_value_name": "BK黑色"}}},
	}}
	enrichProductSpecImages(product, detail)
	if productString(listSKU, "sku_img_url") != "https://example.com/black.jpg" {
		t.Fatalf("spec image was not enriched: %#v", listSKU)
	}
	if productNumber(listSKU, "store") != 3 || productNumber(listSKU, "price") != 11950 {
		t.Fatalf("list inventory or price was overwritten: %#v", listSKU)
	}
}

func TestApplyPublishActionMode(t *testing.T) {
	plan := publishBatchPlan{ActionMode: "update_only", Candidates: []map[string]any{{"item_no": "A"}}, Relists: []model.PublishTask{{ItemNo: "B"}}, Updates: []model.PublishTask{{ItemNo: "C"}}, OfflineListings: []model.MarketplaceListing{{ItemNo: "D"}}}
	applyPublishActionMode(&plan)
	if len(plan.Candidates) != 0 || len(plan.Relists) != 0 || len(plan.OfflineListings) != 0 || len(plan.Updates) != 1 {
		t.Fatalf("update-only mode retained unauthorized actions: %#v", plan)
	}

	plan = publishBatchPlan{ActionMode: "publish_update", Candidates: []map[string]any{{"item_no": "A"}}, Relists: []model.PublishTask{{ItemNo: "B"}}, Updates: []model.PublishTask{{ItemNo: "C"}}, OfflineListings: []model.MarketplaceListing{{ItemNo: "D"}}}
	applyPublishActionMode(&plan)
	if len(plan.Candidates) != 1 || len(plan.Relists) != 1 || len(plan.Updates) != 1 || len(plan.OfflineListings) != 0 {
		t.Fatalf("publish-update mode retained offline actions: %#v", plan)
	}
}
