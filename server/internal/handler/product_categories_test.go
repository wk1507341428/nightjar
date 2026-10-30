package handler

import (
	"go.mongodb.org/mongo-driver/bson"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/types"
	"testing"
	"time"
)

func categoryTreeFixture(id, name, leaf string) map[string]any {
	return map[string]any{"category_id": "1", "category_name": "运动户外", "category_level": "1", "children": []any{map[string]any{"category_id": id, "category_name": name, "category_level": "2", "children": []any{map[string]any{"category_id": leaf, "category_name": "三级具体品类", "category_level": "3"}}}}}
}
func treeCategoryProduct(id, name, leaf string) map[string]any {
	p := aggregateFixtureProduct(2, sourceStatusOnSale)
	p["price"], p["activity_price"], p["market_price"] = int64(20000), int64(20000), int64(40000)
	p["item_category_main"] = categoryTreeFixture(id, name, leaf)
	p["spec_items"] = []any{map[string]any{"store": int64(2), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}}}, map[string]any{"store": int64(0), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "L"}}}}
	return p
}

func TestNestedSourceCategorySelectsTrueSecondLevelAcrossJSONAndBSON(t *testing.T) {
	p := treeCategoryProduct("27", "运动鞋靴", "28")
	encoded, err := bson.Marshal(p)
	if err != nil {
		t.Fatal(err)
	}
	var bsonProduct bson.M
	if err = bson.Unmarshal(encoded, &bsonProduct); err != nil {
		t.Fatal(err)
	}
	for _, product := range []map[string]any{p, map[string]any(bsonProduct)} {
		id, name := offlineProductCategory(product)
		if id != "27" || name != "运动鞋靴" {
			t.Fatalf("root mistaken for second level: %s %s", id, name)
		}
		categories := localSourceCategories([]catalog.SyncCenterProduct{{Data: product}})
		if len(categories) != 1 || categories[0].ID != "27" {
			t.Fatalf("category selector mixed root/leaf: %#v", categories)
		}
	}
	task, err := buildBatchPublishTask("", publishBatchPlan{}, p, time.Now())
	if err != nil {
		t.Fatal(err)
	}
	if len(task.CategoryIDs) != 1 || task.CategoryIDs[0] != "27" {
		t.Fatalf("task category metadata retained root: %#v", task.CategoryIDs)
	}
}

func TestNestedCategoryFilterReadsChildrenEvenBeforeProjectionRepair(t *testing.T) {
	snapshot := catalog.SyncCenterSnapshot{Generation: "fixture", Products: []catalog.SyncCenterProduct{{CategoryIDs: []string{"1"}, Data: treeCategoryProduct("27", "运动鞋靴", "28")}}}
	for _, id := range []string{"1", "27", "28"} {
		if len(syncedSnapshotProducts(snapshot, []string{id})) != 1 {
			t.Fatalf("nested category %s unexpectedly empty", id)
		}
	}
	if len(syncedSnapshotProducts(snapshot, []string{"2"})) != 0 {
		t.Fatal("shoe entered apparel filter")
	}
	categories := syncedSnapshotCategories(snapshot)
	if len(categories) != 1 || categories[0].ID != "27" {
		t.Fatalf("snapshot category selector incorrect: %#v", categories)
	}
}

func TestNestedShoesAndApparelSingleSizeExcludedButBagsRetained(t *testing.T) {
	for _, tc := range []struct {
		id, name, leaf string
		broken         bool
	}{{"27", "运动鞋靴", "28", true}, {"2", "运动服饰", "11", true}, {"139", "男装", "140", true}, {"141", "女装", "142", true}, {"53", "运动包/配件", "56", false}, {"54", "服饰配件", "57", false}} {
		p := treeCategoryProduct(tc.id, tc.name, tc.leaf)
		if got := isBrokenSizeProducts([]map[string]any{p}); got != tc.broken {
			t.Fatalf("category %s broken=%v want=%v", tc.name, got, tc.broken)
		}
		kept, skipped := filterPublishProducts([]map[string]any{p}, types.CreatePublishBatchRequest{ExcludeBrokenSizeItems: true})
		if (len(skipped) == 1) != tc.broken || (len(kept) == 0) != tc.broken {
			t.Fatalf("category %s not filtered consistently: kept=%d skipped=%d", tc.name, len(kept), len(skipped))
		}
	}
}

func TestSourceCategoryLegacyFlatPathAndUnlevelledTreeCompatibility(t *testing.T) {
	flat := map[string]any{"item_category_main": []any{map[string]any{"category_id": "1", "category_name": "运动户外", "category_level": 1}, map[string]any{"category_id": "2", "category_name": "运动服饰", "category_level": 2}, map[string]any{"category_id": "3", "category_name": "运动T恤", "category_level": 3}}}
	id, name := offlineProductCategory(flat)
	if id != "2" || name != "运动服饰" {
		t.Fatal("legacy flat path changed")
	}
	root := categoryTreeFixture("27", "运动鞋靴", "28")
	delete(root, "category_level")
	child := root["children"].([]any)[0].(map[string]any)
	delete(child, "category_level")
	product := map[string]any{"item_category_main": root}
	id, _ = offlineProductCategory(product)
	if id != "27" {
		t.Fatal("unlevelled nested tree did not select structural second level")
	}
	rootsOnly := []catalog.SyncCenterProduct{{Data: map[string]any{"item_category_main": map[string]any{"category_id": "1", "category_name": "运动户外", "category_level": "1"}}}}
	if len(localSourceCategories(rootsOnly)) != 0 {
		t.Fatal("explicit root exposed as actual selectable second level")
	}
	unlevelledFlat := map[string]any{"item_category_main": []any{map[string]any{"category_id": "1", "category_name": "运动户外"}, map[string]any{"category_id": "27", "category_name": "运动鞋靴"}}}
	if rows := localSourceCategories([]catalog.SyncCenterProduct{{Data: unlevelledFlat}}); len(rows) != 1 || rows[0].ID != "27" {
		t.Fatal("legacy unlevelled flat fallback exposed root")
	}
	legacy := []catalog.SyncCenterProduct{{Data: map[string]any{"item_category_main": map[string]any{"category_id": "27", "category_name": "运动鞋靴"}}}}
	if rows := localSourceCategories(legacy); len(rows) != 1 || rows[0].ID != "27" {
		t.Fatal("legacy category object no longer selectable")
	}
}

func TestCategoryMenuPrefersMainOverRegionalCustomIDs(t *testing.T) {
	product := map[string]any{"item_category_main": categoryTreeFixture("27", "运动鞋靴", "28"), "item_category_info": categoryTreeFixture("1417", "运动鞋靴", "1418")}
	rows := localSourceCategories([]catalog.SyncCenterProduct{{Data: product}})
	if len(rows) != 1 || rows[0].ID != "27" {
		t.Fatalf("regional custom category duplicated standard menu: %#v", rows)
	}
	if !sourceMatchesCategories(product, nil, map[string]bool{"1417": true}) {
		t.Fatal("menu preference must not remove regional IDs from category matching")
	}
}

func TestCategoryMenuFallsBackOnlyWhenMainHasNoValidCategory(t *testing.T) {
	for _, main := range []any{nil, []any{}, map[string]any{"category_id": "1", "category_name": "运动户外", "category_level": "1"}, categoryTreeFixture("27", "", "28")} {
		product := map[string]any{"item_category_main": main, "item_category_info": categoryTreeFixture("1417", "运动鞋靴", "1418")}
		rows := localSourceCategories([]catalog.SyncCenterProduct{{Data: product}})
		if len(rows) != 1 || rows[0].ID != "1417" {
			t.Fatalf("missing/invalid main failed regional fallback: %#v", rows)
		}
	}
}

func TestSyncedCategoryImagesRetainSavedImageAcrossDuplicateProducts(t *testing.T) {
	withImage := treeCategoryProduct("27", "运动鞋靴", "28")
	sourceProductCategoryRows(withImage)[0]["image_url"] = "https://fixture.invalid/shoes.png"
	withoutImage := treeCategoryProduct("27", "运动鞋靴", "28")
	for _, products := range [][]catalog.SyncCenterProduct{
		{{Data: withImage}, {Data: withoutImage}},
		{{Data: withoutImage}, {Data: withImage}},
	} {
		rows := localSourceCategories(products)
		if len(rows) != 1 || rows[0].ID != "27" || rows[0].Name != "运动鞋靴" || rows[0].ImageURL != "https://fixture.invalid/shoes.png" {
			t.Fatalf("saved category image lost or category changed: %#v", rows)
		}
	}
	rows := localSourceCategories([]catalog.SyncCenterProduct{{Data: withoutImage}})
	if len(rows) != 1 || rows[0].ImageURL != "" {
		t.Fatalf("missing source image should retain existing UI fallback: %#v", rows)
	}
}
