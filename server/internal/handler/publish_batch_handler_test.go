package handler

import (
	"net/http/httptest"
	"strings"
	"testing"
	"time"
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
	if body.MinDelaySeconds != 4 || body.MaxDelaySeconds != 7 {
		t.Fatalf("unexpected default delay: %d-%d", body.MinDelaySeconds, body.MaxDelaySeconds)
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
	if task.Title != "【全新】NIKE耐克 男子拉链卫衣开衫夹克薄外套运动休闲DM6822-410" {
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
}
