package catalog

import (
	"testing"
	"time"
)

func TestMetadataCategoryProjectionPreservesHierarchyAndMainSelection(t *testing.T) {
	head := SyncCenterSnapshot{ProfileID: "coach", Generation: "complete", SyncedAt: time.Date(2026, 10, 28, 1, 0, 0, 0, time.UTC)}
	product := SyncCenterProduct{RegionID: "4", DistributorID: "943", Data: map[string]any{
		"item_category_main": map[string]any{"category_id": "1", "category_name": "全部", "children": []any{map[string]any{"category_id": "27", "category_name": "运动鞋靴", "category_level": "2", "image_url": "https://source/shoes.png", "path": "1,27", "children": []any{map[string]any{"category_id": "28", "category_name": "男鞋", "category_level": "3"}}}}},
		"item_category_info": map[string]any{"category_id": "custom-shoes", "category_name": "自定义鞋"},
	}}
	rows := map[string]SyncCenterCategory{}
	appendMetadataCategories(rows, head, product)
	if len(rows) != 4 {
		t.Fatalf("raw taxonomy lost nodes: %#v", rows)
	}
	all := []SyncCenterCategory{}
	for _, row := range rows {
		all = append(all, row)
		if row.CategoryID == "28" && (row.ParentID != "27" || row.Depth != 3 || row.RegionID != "4" || row.DistributorID != "943") {
			t.Fatalf("hierarchy/identity lost: %#v", row)
		}
	}
	display := metadataDisplayRows(all)
	if len(display) != 1 || display[0].ID != "27" || display[0].ImageURL != "https://source/shoes.png" {
		t.Fatalf("UI category semantics changed: %#v", display)
	}
}

func TestMetadataCategoryProjectionLegacyAndIdenticalNamesKeepIDs(t *testing.T) {
	data := map[string]any{"item_category_main": []any{map[string]any{"category_id": "1", "category_name": "root"}, map[string]any{"category_id": "2", "category_name": "leaf"}}}
	system, ids := selectedMetadataCategories(data)
	if system != "item_category_main" || !ids["2"] || len(ids) != 1 {
		t.Fatalf("legacy last valid node changed: %#v", ids)
	}
	rows := metadataDisplayRows([]SyncCenterCategory{{CategoryID: "A", Name: "鞋", Display: true}, {CategoryID: "B", Name: "鞋", Display: true}})
	if len(rows) != 2 || rows[0].ID == rows[1].ID {
		t.Fatalf("same-name source identities collapsed: %#v", rows)
	}
}
