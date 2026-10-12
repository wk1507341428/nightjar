package handler

import (
	"context"
	"strings"
	"testing"
	"time"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
)

func TestApplyPublishTaskDatesPreservesFirstPublishDate(t *testing.T) {
	publishedAt := time.Date(2026, 9, 20, 15, 0, 0, 0, time.Local)
	firstUpdate := time.Date(2026, 10, 10, 15, 0, 0, 0, time.Local)
	secondUpdate := time.Date(2026, 10, 11, 15, 0, 0, 0, time.Local)
	task := model.PublishTask{Description: "商品说明"}
	applyPublishTaskDates(&task, publishedAt, firstUpdate)
	applyPublishTaskDates(&task, task.PublishedAt, secondUpdate)
	if !task.PublishedAt.Equal(publishedAt) {
		t.Fatalf("published date changed: %v", task.PublishedAt)
	}
	if !strings.Contains(task.Description, "发布时间： 2026-09-20") || !strings.Contains(task.Description, "更新时间： 2026-10-11 15:00") {
		t.Fatalf("unexpected dated description: %s", task.Description)
	}
	if strings.Count(task.Description, publishedDateLabel) != 1 || strings.Count(task.Description, updatedDateLabel) != 1 {
		t.Fatalf("date labels were duplicated: %s", task.Description)
	}
}

func TestPublishDescriptionDatesReadsMinuteAndLegacyDayFormats(t *testing.T) {
	fallback := time.Date(2026, 10, 1, 8, 0, 0, 0, time.Local)
	publishedAt, updatedAt := publishDescriptionDates("发布时间: 2026-09-20\n更新时间： 2026-10-11 21:35", fallback)
	if publishedAt.Format(publishedDateLayout) != "2026-09-20" || updatedAt.Format(updatedDateLayout) != "2026-10-11 21:35" {
		t.Fatalf("unexpected parsed dates: published=%v updated=%v", publishedAt, updatedAt)
	}
	_, legacyUpdatedAt := publishDescriptionDates("更新时间：2026-10-10", fallback)
	if legacyUpdatedAt.Format(publishedDateLayout) != "2026-10-10" {
		t.Fatalf("legacy day format was not parsed: %v", legacyUpdatedAt)
	}
}

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

func TestOfflineTasksRemainExecutableAfterSourceRestocks(t *testing.T) {
	task := model.PublishTask{ID: "offline-task", Action: "offline", ItemNo: "SKU-1"}
	if results := prepareOfflineBatch(context.Background(), nil, []model.PublishTask{task}); len(results) != 0 {
		t.Fatalf("manual offline task should not be blocked by restock: %#v", results)
	}
	refreshedTask, err := refreshReconcileTask(context.Background(), nil, task)
	if err != nil || refreshedTask.ID != task.ID {
		t.Fatalf("offline task should bypass source refresh: task=%#v err=%v", refreshedTask, err)
	}
}

func TestActiveOfflineCenterBindingsExcludeStaleRegions(t *testing.T) {
	bindings := []catalog.SKUCategoryBinding{
		{ItemNo: "KC0052", RegionID: "3", SourceItemID: "2762352", SourcePriceCents: 18266},
		{ItemNo: "KC0052", RegionID: "4", SourceItemID: "2315028", SourcePriceCents: 19926},
	}
	activeKeys := map[string]struct{}{
		offlineCenterBindingKey("KC0052", "4", "2315028"): {},
	}
	active := activeOfflineCenterBindings(bindings, activeKeys)
	if len(active) != 1 || active[0].RegionID != "4" || active[0].SourcePriceCents != 19926 {
		t.Fatalf("stale source must not enter offline preview: %#v", active)
	}
}
