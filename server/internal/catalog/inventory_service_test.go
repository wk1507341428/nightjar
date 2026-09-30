package catalog

import (
	"testing"

	"go.mongodb.org/mongo-driver/bson"
)

func TestProductCategorySelectsSecondLevelFromLiveHierarchy(t *testing.T) {
	source := map[string]any{"item_category_main": []any{
		map[string]any{"category_id": "1", "category_name": "运动户外", "category_level": "1"},
		map[string]any{"category_id": "2", "category_name": "运动服饰", "category_level": "2"},
		map[string]any{"category_id": "3", "category_name": "运动T恤", "category_level": "3"},
	}}
	categoryID, categoryName := productCategory(source)
	if categoryID != "2" || categoryName != "运动服饰" {
		t.Fatalf("unexpected category: %s %s", categoryID, categoryName)
	}
}

func TestProductCategorySupportsBSONHierarchyAndLegacyObject(t *testing.T) {
	bsonSource := map[string]any{"item_category_main": bson.A{
		bson.M{"category_id": "1", "category_name": "运动户外", "category_level": "1"},
		bson.M{"category_id": "27", "category_name": "运动鞋靴", "category_level": "2"},
		bson.M{"category_id": "28", "category_name": "运动休闲鞋", "category_level": "3"},
	}}
	categoryID, categoryName := productCategory(bsonSource)
	if categoryID != "27" || categoryName != "运动鞋靴" {
		t.Fatalf("unexpected BSON category: %s %s", categoryID, categoryName)
	}

	legacySource := map[string]any{"item_category_main": map[string]any{"category_id": "74", "category_name": "女士上装"}}
	categoryID, categoryName = productCategory(legacySource)
	if categoryID != "74" || categoryName != "女士上装" {
		t.Fatalf("unexpected legacy category: %s %s", categoryID, categoryName)
	}
}

func TestSKUCategoryBindingUniqueFilterMatchesIndexFields(t *testing.T) {
	filter := skuCategoryBindingUniqueFilter("store-1", " abc-123 ", "source-1", "27")
	if filter["brandStoreId"] != "store-1" || filter["itemNo"] != "ABC-123" || filter["sourceItemId"] != "source-1" || filter["categoryId"] != "27" {
		t.Fatalf("unexpected SKU category binding filter: %#v", filter)
	}
}
