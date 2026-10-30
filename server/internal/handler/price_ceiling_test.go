package handler

import (
	"testing"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/types"
)

func priceCeilingProduct(no string, price, original int64) map[string]any {
	return map[string]any{"item_no": no, "item_name": "商品" + no, "main_img": "https://example.com/item.jpg", "price": price, "market_price": original, "store": int64(1)}
}

func TestPriceCeilingAppliesWithoutOptionalFiltersAndAllowsEquality(t *testing.T) {
	products := []map[string]any{
		priceCeilingProduct("FULL-PRICE", 10000, 10000),
		priceCeilingProduct("EQUAL", 6000, 10000),
		priceCeilingProduct("ONE-YUAN-OVER", 6100, 10000),
		priceCeilingProduct("PROFITABLE", 6000, 20000),
	}
	filtered, skipped := filterPublishProducts(products, types.CreatePublishBatchRequest{})
	if len(filtered) != 2 || len(skipped) != 2 || productString(filtered[0], "item_no") != "EQUAL" {
		t.Fatalf("price ceiling could be bypassed with empty filters: %#v %#v", filtered, skipped)
	}
	_, err := buildBatchPublishTask("batch", publishBatchPlan{}, products[0], time.Now())
	if err == nil {
		t.Fatal("full-price plus markup bypassed task creation")
	}
}

func TestPriceCeilingChecksSizePricesAfterMarkup(t *testing.T) {
	product := priceCeilingProduct("SIZES", 10000, 20000)
	product["spec_items"] = []any{
		map[string]any{"price": int64(10000), "store": int64(2), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}}},
		map[string]any{"price": int64(19000), "store": int64(1), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "L"}}},
	}
	filtered, skipped := filterPublishProducts([]map[string]any{product}, types.CreatePublishBatchRequest{})
	if len(filtered) != 0 || len(skipped) != 1 {
		t.Fatal("higher-priced sellable size bypassed the rule through its lower starting price")
	}
}

func TestStoredPreviewCannotBypassNewPriceCeiling(t *testing.T) {
	plan := publishBatchPlan{
		Candidates:      []map[string]any{priceCeilingProduct("OLD-PREVIEW", 6100, 10000)},
		Relists:         []model.PublishTask{{ItemNo: "RESTORE", OriginalPriceCents: 10000, PriceCents: 14000}},
		Updates:         []model.PublishTask{{ItemNo: "BAD-UPDATE", OriginalPriceCents: 10000, PriceCents: 14000}, {ItemNo: "GOOD-UPDATE", OriginalPriceCents: 20000, PriceCents: 14000}},
		OfflineListings: []model.MarketplaceListing{{PlatformItemID: "allow-offline"}},
	}
	filterPreviewPriceCeiling(&plan)
	if len(plan.Candidates) != 0 || len(plan.Relists) != 0 || len(plan.Updates) != 1 || len(plan.Skipped) != 3 {
		t.Fatalf("stored preview kept a disallowed price: %#v", plan)
	}
	if len(plan.OfflineListings) != 1 {
		t.Fatal("price ceiling interfered with authorized offlining")
	}
}

func TestPriceCeilingUsesActualVariantStartingPriceNotUnavailableDefault(t *testing.T) {
	product := priceCeilingProduct("DEFAULT-SOLD-OUT", 10000, 10000)
	product["spec_items"] = []any{
		map[string]any{"price": int64(10000), "store": int64(0), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}}},
		map[string]any{"price": int64(5000), "store": int64(2), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "L"}}},
	}
	if err := publishProductPriceError(product); err != nil {
		t.Fatalf("unavailable default blocked a sellable ¥90 variant under ¥100 original: %v", err)
	}
}

func TestStoredFullPriceMarkupAndUnknownOriginalTasksAreSkipped(t *testing.T) {
	for _, tc := range []struct {
		itemNo                    string
		source, original, planned int64
	}{
		{"JQ0585", 19900, 0, 23900},
		{"JQ0585", 19900, 19900, 23900},
		{"CU068 B4MPL", 265000, 265000, 277000},
	} {
		task := model.PublishTask{ItemNo: tc.itemNo, SourcePriceCents: tc.source, OriginalPriceCents: tc.original, PriceCents: tc.planned}
		plan := publishBatchPlan{Updates: []model.PublishTask{task}, Relists: []model.PublishTask{task}, Candidates: []map[string]any{priceCeilingProduct(tc.itemNo, tc.source, tc.original)}}
		filterPreviewPriceCeiling(&plan)
		if len(plan.Candidates) != 0 || len(plan.Updates) != 0 || len(plan.Relists) != 0 || len(plan.Skipped) != 3 || len(plan.OfflineListings) != 0 {
			t.Fatalf("unsafe stored preview was not skipped: %#v", plan)
		}
		if _, err := buildBatchPublishTask("batch", publishBatchPlan{}, priceCeilingProduct(tc.itemNo, tc.source, tc.original), time.Now()); err == nil {
			t.Fatal("task creation bypassed original-price validation")
		}
	}
}
