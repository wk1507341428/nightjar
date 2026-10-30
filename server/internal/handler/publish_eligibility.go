package handler

import (
	"fmt"

	"sidejob-server/internal/model"
	"sidejob-server/internal/types"
)

// publishProductExclusionReasons 原价与采购价相同也按100%折扣判断，不豁免售价上限。
func publishProductExclusionReasons(product map[string]any, request types.CreatePublishBatchRequest) []string {
	if err := publishProductPriceError(product); err != nil {
		return []string{err.Error()}
	}
	reasons := make([]string, 0, 3)
	price := batchPriceCents(productNumber(product, "activity_price"), productNumber(product, "price"))
	if (request.MinPriceCents > 0 && price < request.MinPriceCents) || (request.MaxPriceCents > 0 && price > request.MaxPriceCents) {
		reasons = append(reasons, fmt.Sprintf("发布售价%s不在筛选区间", formatPriceYuan(price)))
	}
	sourcePrice, original := offlineSourcePrice(product), productNumber(product, "market_price")
	if original > 0 {
		discount := smallProgramDiscountRate(sourcePrice, original)
		if (request.MinDiscountRate > 0 && discount < request.MinDiscountRate) || (request.MaxDiscountRate > 0 && (discount == 0 || discount > request.MaxDiscountRate)) {
			reasons = append(reasons, fmt.Sprintf("折扣率%d%%不在筛选区间", discount))
		}
	}
	if request.ExcludeBrokenSizeItems && isBrokenSizeProducts([]map[string]any{product}) {
		reasons = append(reasons, "鞋服商品仅剩一个可售尺码，已按设置跳过")
	}
	return reasons
}

func offlineListingReasons(plan publishBatchPlan, listing model.MarketplaceListing) []string {
	if reasons := plan.OfflineReasons[listing.PlatformItemID]; len(reasons) > 0 {
		return reasons
	}
	return []string{"全部来源已无可售库存"}
}
