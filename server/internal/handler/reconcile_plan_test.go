package handler

import (
	"context"
	"testing"

	"sidejob-server/internal/model"
)

func TestRetryPublishDetailEnrichesMergedSpecImagesForUpdate(t *testing.T) {
	mergedSKU := map[string]any{"store": "3", "price": "11950", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}, map[string]any{"spec_name": "颜色", "spec_value_name": "BK黑色"}}}
	source := map[string]any{"item_no": "NEF22092", "_primary_region": "4", "_merged_spec_items": []any{mergedSKU}, "item_total_store": float64(3), "store": float64(3)}
	fetch := func(context.Context, map[string]any, string) (map[string]any, error) {
		return map[string]any{"item_no": "NEF22092", "pics": []any{"https://example.com/main.jpg"}, "spec_items": []any{
			map[string]any{"sku_img_url": "https://example.com/black.jpg", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}, map[string]any{"spec_name": "颜色", "spec_value_name": "BK黑色"}}},
		}}, nil
	}
	detail, err := retryPublishDetail(context.Background(), fetch, source, model.PublishTask{Action: "update", ItemNo: "NEF22092", RegionID: "4"})
	if err != nil {
		t.Fatal(err)
	}
	specs, _ := detail["spec_items"].([]any)
	if len(specs) != 1 || productString(specs[0].(map[string]any), "sku_img_url") != "https://example.com/black.jpg" {
		t.Fatalf("merged spec image was not preserved: %#v", detail["spec_items"])
	}
}

func TestMergedStockExcludesUnavailableCheapestRegion(t *testing.T) {
	product := func(region string, stock, price int64, color string) map[string]any {
		return map[string]any{"item_no": "123", "price": price, "store": stock, "item_total_store": stock, "_source_regions": []string{region}, "spec_items": []any{map[string]any{"price": price, "store": stock, "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "42"}, map[string]any{"spec_name": "颜色", "spec_value_name": color}}}}}
	}
	merged := mergePublishProductsByItemNo([]map[string]any{product("A", 2, 20000, "如图"), product("B", 3, 21000, "颜色如图"), product("C", 0, 10000, "如图")})
	if len(merged) != 1 || productNumber(merged[0], "store") != 5 || productNumber(merged[0], "price") != 20000 {
		t.Fatalf("incorrect stock/price: %#v", merged)
	}
	regions := productStringSlice(merged[0], "_source_regions", nil)
	if len(regions) != 2 {
		t.Fatalf("unavailable region retained: %v", regions)
	}
	variants := productPublishVariants(merged[0], true, 24000)
	if len(variants) != 1 || variants[0].Quantity != 5 || len(variants[0].Properties) != 1 {
		t.Fatalf("duplicate placeholder color/size: %#v", variants)
	}
}

func TestAllRegionsOutOfStock(t *testing.T) {
	if got := mergePublishProductsByItemNo([]map[string]any{{"item_no": "123", "store": int64(0)}}); len(got) != 0 {
		t.Fatal("out of stock remains sellable")
	}
}
