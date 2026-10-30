package handler

import (
	"context"
	"fmt"

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
)

// loadManualPublishSource resolves identity only from the activated local source table.
func loadManualPublishSource(ctx context.Context, sc *svc.ServiceContext, region, itemID, itemNo string) (map[string]any, error) {
	if sc == nil || sc.SyncCenter == nil {
		return nil, fmt.Errorf(syncedSourceRequired)
	}
	if region == "" || itemID == "" {
		return nil, fmt.Errorf("缺少同步货源地区或商品ID，请重新选择商品")
	}
	source, err := sc.SyncCenter.FindProduct(ctx, region, itemID)
	if err != nil {
		return nil, err
	}
	if model.ItemNoKey(productString(source, "item_no")) != model.ItemNoKey(itemNo) {
		return nil, fmt.Errorf("同步货源货号与发布货号不一致")
	}
	if firstProductString(source, "brand_profile_id") == "" || firstProductString(source, "_sync_generation") == "" {
		return nil, fmt.Errorf(syncedSourceRequired)
	}
	if err := sc.SyncCenter.ValidateVersion(ctx, productString(source, "brand_profile_id"), productString(source, "_sync_generation")); err != nil {
		return nil, err
	}
	if sourceAvailableStock(source) <= 0 {
		return nil, fmt.Errorf("同步货源没有可售库存，已停止发布")
	}
	return source, nil
}

// bindManualPublishSource preserves user prices and chosen variants, while source identity and costs remain authoritative.
func bindManualPublishSource(task model.PublishTask, source map[string]any) (model.PublishTask, error) {
	quantity := int64(1)
	if len(task.Variants) > 0 {
		quantity = 0
		for _, variant := range task.Variants {
			if variant.Quantity <= 0 || variant.Quantity > sourceAvailableStock(source)-quantity {
				return task, fmt.Errorf("所选规格总库存超过本地可售货源库存，请重新选择；系统不会猜测规格别名")
			}
			quantity += variant.Quantity
		}
	}
	if quantity > sourceAvailableStock(source) {
		return task, fmt.Errorf("所选规格总库存超过本地可售货源库存，请重新选择；系统不会猜测规格别名")
	}
	task.Quantity = quantity
	task.SourceSyncVersion = productString(source, "_sync_generation")
	task.BrandProfileID = productString(source, "brand_profile_id")
	task.RegionID = productString(source, "regionauth_id")
	task.SourceItemID = firstProductString(source, "default_item_id", "item_id", "goods_id")
	task.SourceRegions = []string{task.RegionID}
	task.SourceMemberIDs = []string{task.RegionID + ":" + productString(source, "distributor_id")}
	task.SourceItemIDs = []string{task.SourceItemID}
	task.SourcePriceCents = offlineSourcePrice(source)
	task.OriginalPriceCents = productNumber(source, "market_price")
	if err := model.ValidateListingSourcePriceCeiling(task.SourcePriceCents, task.OriginalPriceCents, task.PriceCents, task.Variants); err != nil {
		return task, err
	}
	return task, nil
}

func refreshManualPublishTask(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) (model.PublishTask, error) {
	source, err := loadManualPublishSource(ctx, sc, task.RegionID, task.SourceItemID, task.ItemNo)
	if err != nil {
		return task, err
	}
	if productString(source, "_sync_generation") != task.SourceSyncVersion || productString(source, "brand_profile_id") != task.BrandProfileID {
		return task, fmt.Errorf("同步货源版本或归属已变化，请重新生成发布任务")
	}
	return bindManualPublishSource(task, source)
}
