package handler

import "testing"

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
