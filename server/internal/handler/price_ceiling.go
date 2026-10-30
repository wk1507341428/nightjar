package handler

import "sidejob-server/internal/model"

func publishProductPriceError(product map[string]any) error {
	original := productNumber(product, "market_price")
	price := batchPriceCents(productNumber(product, "activity_price"), productNumber(product, "price"))
	variants := productPublishVariants(product, false, price)
	if len(variants) > 0 {
		price = variants[0].PriceCents
		for _, variant := range variants {
			if variant.PriceCents < price {
				price = variant.PriceCents
			}
		}
	}
	return model.ValidateListingSourcePriceCeiling(offlineSourcePrice(product), original, price, variants)
}

func filterPublishPriceCeiling(products []map[string]any) ([]map[string]any, []model.PublishBatchSkip) {
	filtered := make([]map[string]any, 0, len(products))
	skipped := make([]model.PublishBatchSkip, 0)
	for _, product := range products {
		if err := publishProductPriceError(product); err != nil {
			skipped = append(skipped, model.PublishBatchSkip{ItemNo: productString(product, "item_no"), Title: productString(product, "item_name"), Reason: err.Error()})
			continue
		}
		filtered = append(filtered, product)
	}
	return filtered, skipped
}

// filterPreviewPriceCeiling 同时保护旧预览的确认入口，不能恢复/改价绕过当前规则。
func filterPreviewPriceCeiling(plan *publishBatchPlan) {
	products, skipped := filterPublishPriceCeiling(plan.Candidates)
	plan.Candidates = products
	plan.Skipped = append(plan.Skipped, skipped...)
	plan.Relists = filterTaskPriceCeiling(plan.Relists, &plan.Skipped)
	plan.Updates = filterTaskPriceCeiling(plan.Updates, &plan.Skipped)
}

func filterTaskPriceCeiling(tasks []model.PublishTask, skipped *[]model.PublishBatchSkip) []model.PublishTask {
	filtered := make([]model.PublishTask, 0, len(tasks))
	for _, task := range tasks {
		if err := model.ValidateListingSourcePriceCeiling(task.SourcePriceCents, task.OriginalPriceCents, task.PriceCents, task.Variants); err != nil {
			*skipped = append(*skipped, model.PublishBatchSkip{ItemNo: task.ItemNo, Title: task.Title, Reason: err.Error()})
			continue
		}
		filtered = append(filtered, task)
	}
	return filtered
}
