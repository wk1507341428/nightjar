package handler

import (
	"context"
	"testing"

	"sidejob-server/internal/model"
)

func TestOldPreviewCannotPublishExistingAliasesOrDuplicateSelections(t *testing.T) {
	product := func(no string) map[string]any { return map[string]any{"item_no": no, "item_name": no} }
	plan := publishBatchPlan{
		Candidates:      []map[string]any{product("31012802"), product("CFP04 IMXAQ"), product("CFP04  IMXAQ"), product("AGLW092-2"), product("NEW-1")},
		Relists:         []model.PublishTask{{ItemNo: "310128 02"}, {ItemNo: "NEW-2"}},
		Updates:         []model.PublishTask{{Action: model.PublishActionUpdate, ItemNo: "KEEP-UPDATE"}},
		OfflineListings: []model.MarketplaceListing{{PlatformItemID: "keep-offline"}},
	}
	filterPreviewActivations(&plan, []model.MarketplaceListing{{ItemNo: "310128 02"}}, map[string]struct{}{"AGLW092-2": {}})
	if len(plan.Candidates) != 2 || productString(plan.Candidates[0], "item_no") != "CFP04 IMXAQ" || productString(plan.Candidates[1], "item_no") != "NEW-1" {
		t.Fatalf("unsafe preview candidates retained: %#v", plan.Candidates)
	}
	if len(plan.Relists) != 1 || plan.Relists[0].ItemNo != "NEW-2" || len(plan.Skipped) != 4 {
		t.Fatalf("relist conflicts not filtered: %#v", plan)
	}
	if len(plan.Updates) != 1 || len(plan.OfflineListings) != 1 {
		t.Fatal("activation filtering changed normal update/offline plans")
	}
}

func TestDetailValidationAcceptsRawSupplierArticleAlias(t *testing.T) {
	source := map[string]any{"item_no": "31012802"}
	detail := map[string]any{"item_no": "310128 02", "store": 2, "_sync_generation": "fixture"}
	if err := validateSourceDetail(source, detail); err != nil {
		t.Fatalf("valid supplier alias rejected: %v", err)
	}
	results := validatePublishProductDetails(context.Background(), nil, []map[string]any{detail})
	if result, exists := results["31012802"]; !exists || result.err != nil || result.missing {
		t.Fatalf("local alias rejected: %#v", results)
	}

}

func TestSupplierWhitespaceAliasesMergeInventoryWithoutMergingColors(t *testing.T) {
	product := func(no, region string, stock, price int64) map[string]any {
		return map[string]any{"item_no": no, "store": stock, "price": price, "_source_regions": []string{region}, "spec_items": []any{
			map[string]any{"store": stock, "price": price, "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "F"}}},
		}}
	}
	merged := mergePublishProductsByItemNo([]map[string]any{
		product("310128 02", "4", 2, 20000), product("31012802", "6", 3, 21000),
		product("310128 03", "4", 4, 19000),
		product("CFP04  IMXAQ", "6", 2, 80000), product("CFP04 IMXAQ", "4", 1, 79000),
	})
	if len(merged) != 3 {
		t.Fatalf("expected 3 physical products, got %d", len(merged))
	}
	byKey := make(map[string]map[string]any)
	for _, p := range merged {
		byKey[model.ItemNoKey(productString(p, "item_no"))] = p
	}
	if productNumber(byKey["31012802"], "store") != 5 || productNumber(byKey["31012802"], "price") != 20000 {
		t.Fatal("PUMA merge lost source stock or lowest price")
	}
	if productNumber(byKey["CFP04IMXAQ"], "store") != 3 || productNumber(byKey["31012803"], "store") != 4 {
		t.Fatal("COACH alias or distinct PUMA color was merged incorrectly")
	}
}
