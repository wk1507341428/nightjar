package handler

import (
	"context"
	"sidejob-server/internal/model"
	"sidejob-server/internal/types"
	"strings"
	"testing"
	"time"
)

func TestExplicitOriginalPriceDoesNotExemptUndiscountedGoods(t *testing.T) {
	for _, original := range []int64{0, 19900, 21000} {
		product := priceCeilingProduct("NO-DISCOUNT", 19900, original)
		allowed, skipped := filterPublishProducts([]map[string]any{product}, types.CreatePublishBatchRequest{MaxDiscountRate: 70})
		if len(allowed) != 0 || len(skipped) != 1 {
			t.Fatalf("invalid price admitted: original=%d skip=%#v", original, skipped)
		}
	}
}

func TestStrikethroughPriceStillEnforcesCeilingAndDiscount(t *testing.T) {
	for _, tc := range []struct {
		product map[string]any
		filter  types.CreatePublishBatchRequest
		reason  string
	}{
		{priceCeilingProduct("ABOVE-ORIGINAL", 19900, 21000), types.CreatePublishBatchRequest{}, "高于商品原价"},
		{priceCeilingProduct("TOO-LITTLE-DISCOUNT", 19900, 25000), types.CreatePublishBatchRequest{MaxDiscountRate: 70}, "折扣率"},
	} {
		_, skipped := filterPublishProducts([]map[string]any{tc.product}, tc.filter)
		if len(skipped) != 1 || !strings.Contains(skipped[0].Reason, tc.reason) {
			t.Fatalf("missing guard: %#v", skipped)
		}
	}
}

// 筛选仅限制发布/更新；有库存的商品即使折扣、价格、断码不符，也必须保留原链接。
func TestFilteredProductsWithStockNeverBecomeOffline(t *testing.T) {
	for _, tc := range []struct {
		name   string
		filter types.CreatePublishBatchRequest
	}{
		{"discount", types.CreatePublishBatchRequest{MaxDiscountRate: 40}},
		{"price", types.CreatePublishBatchRequest{MaxPriceCents: 10000}},
		{"broken-size", types.CreatePublishBatchRequest{ExcludeBrokenSizeItems: true}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			product := priceCeilingProduct("CDX83 IMBLK", 148800, 225000)
			product["item_category_main"] = map[string]any{"category_name": "运动鞋靴"}
			product["spec_items"] = []any{map[string]any{"store": int64(15), "price": int64(148800), "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "40"}}}}
			_, skipped := filterPublishProducts([]map[string]any{product}, tc.filter)
			if len(skipped) != 1 {
				t.Fatalf("not skipped: %#v", skipped)
			}
			listing := model.MarketplaceListing{AccountID: "default", BrandProfileID: "coach", PlatformItemID: "keep", ItemNo: "CDX83 IMBLK"}
			state := &publishPlanBuildState{plan: publishBatchPlan{AccountID: "default", BrandProfileID: "coach", Skipped: skipped}, allScopeProducts: []map[string]any{product}, validations: map[string]publishDetailValidation{model.ItemNoKey(listing.ItemNo): {}}}
			actions := publishPlanActions{build: state, listings: []model.MarketplaceListing{listing}}
			actions.appendMissingOfflines()
			if len(state.plan.OfflineListings) != 0 {
				t.Fatal("filter rejection became a stock-out offline")
			}
		})
	}
}

func TestStockOutTaskKeepsActualReasonAndGuard(t *testing.T) {
	plan := publishBatchPlan{AccountID: "default", BrandProfileID: "coach", SourceSyncVersion: "current", ActionMode: model.PublishPresetFull}
	listing := model.MarketplaceListing{AccountID: "default", BrandProfileID: "coach", PlatformItemID: "no-stock", ItemNo: "OUT"}
	task := buildReconcileOfflineTask(plan, listing, time.Now())
	if !task.StockOutOffline || len(task.ChangeReasons) != 1 || task.ChangeReasons[0] != sourceStockOutReason {
		t.Fatalf("wrong guard/reason: %#v", task)
	}
}

func TestLegacyFilteredOfflinesRejectedWithoutReadingSources(t *testing.T) {
	for _, task := range []model.PublishTask{
		{SourceSyncVersion: "old", BrandProfileID: "coach"},
		{BrandProfileID: "coach", ReconcileMode: model.PublishPresetFull},
	} {
		if err := checkStockOutOfflineWithLoader(context.Background(), nil, task, nil); err == nil {
			t.Fatal("legacy filtered offline admitted")
		}
	}
	if err := checkStockOutOfflineWithLoader(context.Background(), nil, model.PublishTask{}, nil); err != nil {
		t.Fatalf("manual intent changed: %v", err)
	}
}
