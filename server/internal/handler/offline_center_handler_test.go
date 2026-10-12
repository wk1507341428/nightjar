package handler

import (
	"testing"

	"sidejob-server/internal/types"
)

func TestSmallProgramDiscountRateDoesNotUseXianyuPrice(t *testing.T) {
	discountRate := smallProgramDiscountRate(19900, 49900)
	if discountRate != 40 {
		t.Fatalf("unexpected small-program discount rate: %d", discountRate)
	}
	filters := types.OfflineCenterPreviewRequest{MaxDiscountRate: 50}
	if !matchesOfflineCenterRange(45990, discountRate, filters) {
		t.Fatal("xianyu price incorrectly affected the small-program discount filter")
	}
}

func TestOfflineMinimumDiscountExcludesBoundary(t *testing.T) {
	filters := types.OfflineCenterPreviewRequest{MinDiscountRate: 40}
	if matchesOfflineCenterRange(45990, 40, filters) {
		t.Fatal("40% must remain owned by publish center, not offline center")
	}
	if !matchesOfflineCenterRange(45990, 41, filters) {
		t.Fatal("discount strictly above the offline threshold must remain selectable")
	}
}

func TestBrokenSizeDetectionOnlyTargetsSingleSizeShoesAndApparel(t *testing.T) {
	product := func(categoryName string, sizes ...string) map[string]any {
		specItems := make([]any, 0, len(sizes))
		for _, size := range sizes {
			specItems = append(specItems, map[string]any{"store": int64(1), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": size}}})
		}
		return map[string]any{"item_category_main": map[string]any{"category_name": categoryName}, "spec_items": specItems}
	}
	if !isBrokenSizeProducts([]map[string]any{product("运动鞋靴", "40")}) {
		t.Fatal("single-size shoe must be treated as broken size")
	}
	if isBrokenSizeProducts([]map[string]any{product("运动鞋靴", "40", "41")}) {
		t.Fatal("multi-size shoe must not be treated as broken size")
	}
	if isBrokenSizeProducts([]map[string]any{product("单肩包", "均码")}) {
		t.Fatal("single-spec bag must not be treated as broken size")
	}
}

func TestOfflineSourcePricePrefersActivityPrice(t *testing.T) {
	product := map[string]any{"activity_price": "15900", "price": "19900", "market_price": "49900"}
	if sourcePrice := offlineSourcePrice(product); sourcePrice != 15900 {
		t.Fatalf("unexpected source price: %d", sourcePrice)
	}
}

func TestOfflineProductCategorySelectsSecondLevel(t *testing.T) {
	product := map[string]any{"item_category_main": []any{
		map[string]any{"category_id": "1", "category_name": "运动户外", "category_level": "1"},
		map[string]any{"category_id": "2", "category_name": "运动服饰", "category_level": "2"},
		map[string]any{"category_id": "3", "category_name": "运动T恤", "category_level": "3"},
	}}
	categoryID, categoryName := offlineProductCategory(product)
	if categoryID != "2" || categoryName != "运动服饰" {
		t.Fatalf("unexpected offline category: %s %s", categoryID, categoryName)
	}
}
