package handler

import (
	"context"
	"errors"
	"reflect"
	"sync/atomic"
	"testing"

	"sidejob-server/internal/model"
)

// snapshotSource 保留列表故意过时的库存，便于断言商详才是对账依据。
func snapshotSource(itemNo, region, itemID string, stock, price int64) map[string]any {
	return map[string]any{
		"item_no": itemNo, "item_id": itemID, "item_name": "测试商品", "price": price,
		"main_img": "https://example.invalid/source.jpg", "item_total_store": stock,
		"_primary_region": region, "_source_regions": []string{region},
		"_source_member_ids": []string{region + ":shop"}, "_source_item_ids": []string{itemID},
		"spec_items": snapshotSpecs(stock, sourceStatusOnSale, price),
	}
}

func snapshotSpecs(stock int64, status string, price int64) []any {
	return []any{map[string]any{
		"store": stock, "approve_status": status, "price": price,
		"item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "M"}},
	}}
}

// snapshotFetcher 模拟 Fresh 接口：继承来源身份和图文，但不继承旧库存与可售状态。
func snapshotFetcher(details map[string]map[string]any, failures map[string]error) publishDetailFetcher {
	return func(_ context.Context, source map[string]any, region string) (map[string]any, error) {
		itemID := productString(source, "item_id")
		if err := failures[itemID]; err != nil {
			return nil, err
		}
		if region != productString(source, "_primary_region") {
			return nil, errors.New("未使用来源实际地区")
		}
		merged := make(map[string]any)
		for key, value := range source {
			switch key {
			case "spec_items", "item_total_store", "store", "approve_status", "_merged_spec_items", "_source_detail_candidates":
				continue
			}
			merged[key] = value
		}
		for key, value := range details[itemID] {
			merged[key] = value
		}
		return merged, nil
	}
}

func TestPublishFreshSourcesReplacesStaleListStock(t *testing.T) {
	tests := []struct {
		name                    string
		listedStock, freshStock int64
		status                  string
		missing                 bool
	}{
		{name: "旧列表有货但商详已无货", listedStock: 24, freshStock: 0, status: "instock", missing: true},
		{name: "旧列表零库存但商详已补货", listedStock: 0, freshStock: 7, status: sourceStatusOnSale},
		{name: "有实物库存但非可售状态", listedStock: 24, freshStock: 7, status: "instock", missing: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			source := snapshotSource(" mt51205 ", "region-a", "item-a", test.listedStock, 10000)
			fetch := snapshotFetcher(map[string]map[string]any{"item-a": {"item_no": "MT51205", "spec_items": snapshotSpecs(test.freshStock, test.status, 9000), "price": int64(9000)}}, nil)
			products, validations := refreshPublishSources(context.Background(), fetch, []map[string]any{source})
			validation, exists := validations[model.ItemNoKey("MT51205")]
			if !exists || validation.err != nil || validation.missing != test.missing {
				t.Fatalf("unexpected validation: exists=%v value=%#v", exists, validation)
			}
			if test.missing {
				if len(products) != 0 {
					t.Fatalf("无货商品仍可发布：%#v", products)
				}
				return
			}
			if len(products) != 1 || sourceAvailableStock(products[0]) != test.freshStock || productNumber(products[0], "price") != 9000 {
				t.Fatalf("未使用实时商详：%#v", products)
			}
			if productNumber(source, "item_total_store") != test.listedStock {
				t.Fatal("改写了原始列表快照")
			}
		})
	}
}

func TestPublishFreshSourcesAggregatesAllRegionsAndKeepsMetadata(t *testing.T) {
	sources := []map[string]any{
		snapshotSource("MT51205", "region-a", "empty", 24, 100),
		snapshotSource("MT51205", "region-b", "expensive", 0, 10000),
		snapshotSource("MT51205", "region-c", "cheap", 0, 10000),
	}
	fetch := snapshotFetcher(map[string]map[string]any{
		"empty":     {"spec_items": snapshotSpecs(0, "instock", 100), "price": int64(100)},
		"expensive": {"spec_items": snapshotSpecs(2, sourceStatusOnSale, 8000), "price": int64(8000)},
		"cheap":     {"spec_items": snapshotSpecs(3, sourceStatusOnSale, 7000), "price": int64(7000)},
	}, nil)
	products, validations := refreshPublishSources(context.Background(), fetch, sources)
	if len(products) != 1 || validations["MT51205"].err != nil || validations["MT51205"].missing {
		t.Fatalf("跨地区核验失败：%#v %#v", products, validations)
	}
	product := products[0]
	if sourceAvailableStock(product) != 5 || productNumber(product, "price") != 7000 || productString(product, "item_id") != "cheap" {
		t.Fatalf("库存或最低有货价来源错误：%#v", product)
	}
	if !reflect.DeepEqual(productStringSlice(product, "_source_regions", nil), []string{"region-b", "region-c"}) || !reflect.DeepEqual(productStringSlice(product, "_source_member_ids", nil), []string{"region-b:shop", "region-c:shop"}) || !reflect.DeepEqual(productStringSlice(product, "_source_item_ids", nil), []string{"expensive", "cheap"}) {
		t.Fatalf("丢失或混入无货地区：%#v", product)
	}
	candidates, ok := product["_source_detail_candidates"].([]any)
	if !ok || len(candidates) != 2 || len(product["spec_items"].([]any)) != 1 {
		t.Fatalf("合并规格或商详候选丢失：%#v", product)
	}
	if productString(product, "main_img") == "" {
		t.Fatal("丢失来源图片兜底")
	}
}

func TestPublishFreshSourcesFailureRemainsUnknownAcrossRegions(t *testing.T) {
	failure := errors.New("浏览器读取失败")
	for _, stock := range []int64{0, 5} {
		sources := []map[string]any{snapshotSource("MT51205", "a", "good", 24, 10000), snapshotSource("MT51205", "b", "bad", 24, 10000)}
		fetch := snapshotFetcher(map[string]map[string]any{"good": {"spec_items": snapshotSpecs(stock, sourceStatusOnSale, 9000)}}, map[string]error{"bad": failure})
		products, validations := refreshPublishSources(context.Background(), fetch, sources)
		validation := validations["MT51205"]
		if len(products) != 0 || !errors.Is(validation.err, failure) || validation.missing {
			t.Fatalf("部分成功被误当成完整库存或确认缺货：%#v %#v", products, validation)
		}
	}
}

func TestPublishFreshSourcesMalformedDetailsStayUnknown(t *testing.T) {
	tests := map[string]map[string]any{
		"缺少库存":      {"item_no": "MT51205"},
		"规格缺少库存":    {"spec_items": []any{map[string]any{"approve_status": sourceStatusOnSale}}},
		"规格结构损坏":    {"spec_items": []any{"invalid"}},
		"货号不符":      {"item_no": "OTHER", "spec_items": snapshotSpecs(2, sourceStatusOnSale, 9000)},
		"库存不是数字":    {"spec_items": []any{map[string]any{"store": "unknown"}}},
		"商品总库存不是数字": {"item_total_store": "unknown"},
		"商品库存不是数字":  {"store": "unknown"},
		"规格库存为空":    {"spec_items": []any{map[string]any{"store": ""}}},
	}
	for name, detail := range tests {
		t.Run(name, func(t *testing.T) {
			fetch := snapshotFetcher(map[string]map[string]any{"item": detail}, nil)
			products, validations := refreshPublishSources(context.Background(), fetch, []map[string]any{snapshotSource("MT51205", "a", "item", 24, 10000)})
			validation := validations["MT51205"]
			if len(products) != 0 || validation.err == nil || validation.missing {
				t.Fatalf("损坏商详被当成库存零：%#v %#v", products, validation)
			}
		})
	}
}

func TestPublishFreshPlanScopesSelectedItemsAndSkipsUnknown(t *testing.T) {
	selected := []map[string]any{snapshotSource("selected", "a", "selected", 0, 10000), snapshotSource("unknown", "a", "unknown", 24, 10000)}
	all := append(append([]map[string]any{}, selected...), snapshotSource("other", "b", "other", 24, 10000))
	baseFetch := snapshotFetcher(map[string]map[string]any{"selected": {"spec_items": snapshotSpecs(2, sourceStatusOnSale, 9000)}, "other": {"spec_items": snapshotSpecs(3, sourceStatusOnSale, 9000)}}, map[string]error{"unknown": errors.New("网络失败")})
	var calls atomic.Int64
	fetch := func(ctx context.Context, source map[string]any, region string) (map[string]any, error) {
		calls.Add(1)
		return baseFetch(ctx, source, region)
	}
	plan := publishBatchPlan{}
	products, allProducts, validations := refreshPublishPlanSources(context.Background(), fetch, &plan, selected, all)
	if len(products) != 1 || model.ItemNoKey(productString(products[0], "item_no")) != "SELECTED" || len(allProducts) != 2 || calls.Load() != 3 {
		t.Fatalf("选中范围或完整核验数量错误：%#v %#v calls=%d", products, allProducts, calls.Load())
	}
	if plan.Total != 2 || len(plan.Skipped) != 1 || model.ItemNoKey(plan.Skipped[0].ItemNo) != "UNKNOWN" || validations["UNKNOWN"].err == nil || validations["UNKNOWN"].missing {
		t.Fatalf("未知项未独立保留：%#v %#v", plan, validations)
	}
}

func TestReconcileStockOutTaskRequiresFullAggregateUpdateAuthorization(t *testing.T) {
	authorized := model.PublishTask{ID: "task", AccountID: "account", ItemNo: "MT51205", Action: model.PublishActionUpdate, ReconcileMode: model.PublishPresetFull, BrandProfileID: "profile", XianyuItemID: "listing"}
	converted, err := reconcileStockOutTask(authorized)
	if err != nil || converted.Action != model.PublishActionOffline || !converted.StockOutOffline || !reflect.DeepEqual(converted.ChangeReasons, []string{sourceStockOutReason}) || converted.XianyuItemID != authorized.XianyuItemID || converted.AccountID != authorized.AccountID {
		t.Fatalf("授权对账未正确转缺货下架：%#v %v", converted, err)
	}
	tests := []struct {
		name   string
		change func(*model.PublishTask)
	}{
		{"仅更新", func(task *model.PublishTask) { task.ReconcileMode = model.PublishPresetUpdateOnly }},
		{"发布并更新", func(task *model.PublishTask) { task.ReconcileMode = model.PublishPresetPublishUpdate }},
		{"旧任务无授权", func(task *model.PublishTask) { task.ReconcileMode = "" }},
		{"新品", func(task *model.PublishTask) { task.Action = model.PublishActionPublish }},
		{"恢复商品", func(task *model.PublishTask) { task.Action = model.PublishActionRelist }},
		{"单门店", func(task *model.PublishTask) { task.BrandProfileID = "" }},
		{"没有在售链接", func(task *model.PublishTask) { task.XianyuItemID = "" }},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			task := authorized
			test.change(&task)
			result, err := reconcileStockOutTask(task)
			if err == nil || !reflect.DeepEqual(result, task) {
				t.Fatalf("未授权任务获得下架权限：%#v %v", result, err)
			}
		})
	}
}
