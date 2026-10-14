package handler

import (
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
	"testing"
)

func sourceTestSKU(size, status string, stock int64) map[string]any {
	return map[string]any{"store": stock, "price": int64(51000), "approve_status": status, "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": size}}}
}

// 验证 ARNV021-3 有库存但已下架的尺码会退出合并、描述和闲鱼规格，并触发编辑。
func TestInstockSizesTriggerListingUpdate(t *testing.T) {
	product := map[string]any{"item_no": "ARNV021-3", "store": int64(87), "item_total_store": int64(87), "_source_regions": []string{"3"}, "spec_items": []any{
		sourceTestSKU("43", "instock", 16), sourceTestSKU("42", "instock", 12), sourceTestSKU("41", sourceStatusOnSale, 19), sourceTestSKU("40", sourceStatusOnSale, 15), sourceTestSKU("39", sourceStatusOnSale, 14), sourceTestSKU("44", "instock", 11),
	}}
	merged := mergePublishProductsByItemNo([]map[string]any{product})
	if len(merged) != 1 || productNumber(merged[0], "store") != 48 {
		t.Fatalf("wrong sellable stock: %#v", merged)
	}
	sizes := productSizes(merged[0])
	if len(sizes) != 3 {
		t.Fatalf("unavailable sizes leaked: %v", sizes)
	}
	variants := productPublishVariants(merged[0], true, 59000)
	if len(variants) != 3 {
		t.Fatalf("unavailable variants leaked: %#v", variants)
	}
	after := taskPublishInput(model.PublishTask{Variants: variants, Quantity: 48, PriceCents: 59000})
	detail := map[string]any{"quantity": "16", "itemPriceDTO": map[string]any{"priceInCent": "59000"}, "itemSkuList": []any{}}
	for _, size := range []string{"39", "40", "41", "42", "43", "44"} {
		detail["itemSkuList"] = append(detail["itemSkuList"].([]any), map[string]any{"quantity": "1", "priceInCent": "59000", "propertyList": []any{map[string]any{"propertyText": "鞋码", "valueText": size}}})
	}
	if xianyu.SameActionableState(xianyu.ManagedState(detail), xianyu.ManagedState(xianyu.ManagedEditPayload(detail, after))) {
		t.Fatal("removed sizes did not trigger update")
	}
}

func TestUnavailableRegionDoesNotMaskRemainingSize(t *testing.T) {
	active := map[string]any{"item_no": "A", "_source_regions": []string{"3"}, "spec_items": []any{sourceTestSKU("40", sourceStatusOnSale, 1)}}
	inactive := map[string]any{"item_no": "A", "store": int64(9), "_source_regions": []string{"4"}, "spec_items": []any{sourceTestSKU("41", "instock", 9)}}
	merged := mergePublishProductsByItemNo([]map[string]any{active, inactive})
	if len(merged) != 1 || len(productSizes(merged[0])) != 1 || len(productStringSlice(merged[0], "_source_regions", nil)) != 1 {
		t.Fatalf("inactive region leaked: %#v", merged)
	}
	if rows := mergePublishProductsByItemNo([]map[string]any{inactive}); len(rows) != 0 {
		t.Fatal("all inactive specs fell back to stale parent stock")
	}
}
