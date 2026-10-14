package handler

import (
	"context"
	"fmt"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/xianyu"
	"strings"
	"time"
)

// listingBelongsToPlan 要求来源明确，不用商品标题模糊匹配编辑目标。
func listingBelongsToPlan(listing model.MarketplaceListing, plan publishBatchPlan) bool {
	if plan.BrandProfileID != "" {
		return listing.BrandProfileID == plan.BrandProfileID
	}
	key := plan.RegionID + ":" + plan.DistributorID
	for _, member := range listing.SourceMemberIDs {
		if member == key {
			return true
		}
	}
	return false
}

// prepareOfflineBatch 保持用户确认的下架意图；下架中心不再因货源恢复而撤销任务。
func prepareOfflineBatch(_ context.Context, _ *svc.ServiceContext, _ []model.PublishTask) map[string]error {
	return map[string]error{}
}

func taskPublishInput(task model.PublishTask) xianyu.PublishInput {
	variants := []xianyu.PublishVariant{}
	for _, sku := range task.Variants {
		props := []xianyu.PublishVariantProperty{}
		for _, p := range sku.Properties {
			props = append(props, xianyu.PublishVariantProperty{Name: p.Name, Value: p.Value})
		}
		variants = append(variants, xianyu.PublishVariant{PriceCents: sku.PriceCents, Quantity: sku.Quantity, ImageURL: sku.ImageURL, Properties: props})
	}
	return xianyu.PublishInput{Quantity: task.Quantity, Title: task.Title, Description: task.Description, PriceCents: task.PriceCents, OriginalPriceCents: task.OriginalPriceCents, Condition: task.Condition, Variants: variants}
}

// applyPublishTaskDates 保留首次发布时间，仅刷新本次内容更新时间。
func applyPublishTaskDates(task *model.PublishTask, publishedAt, updatedAt time.Time) {
	if publishedAt.IsZero() {
		publishedAt = task.PublishedAt
	}
	if publishedAt.IsZero() {
		publishedAt = task.CreatedAt
	}
	if publishedAt.IsZero() {
		publishedAt = updatedAt
	}
	task.PublishedAt = publishedAt
	task.Description = withPublishDescriptionDates(task.Description, publishedAt, updatedAt)
}

// publishDescriptionDates 读取已有描述中的日期，避免更新时间本身触发无意义修改。
func publishDescriptionDates(description string, fallback time.Time) (time.Time, time.Time) {
	publishedAt := fallback
	updatedAt := fallback
	for _, line := range strings.Split(description, "\n") {
		trimmedLine := strings.TrimSpace(line)
		for _, target := range []struct {
			label string
			date  *time.Time
		}{{publishedDateLabel, &publishedAt}, {legacyPublishedDateLabel, &publishedAt}, {updatedDateLabel, &updatedAt}} {
			if !strings.HasPrefix(trimmedLine, target.label) {
				continue
			}
			value := strings.TrimSpace(strings.TrimPrefix(trimmedLine, target.label))
			layouts := []string{publishedDateLayout}
			if target.date == &updatedAt {
				layouts = []string{updatedDateLayout, publishedDateLayout}
			}
			for _, layout := range layouts {
				parsed, err := time.ParseInLocation(layout, value, time.Local)
				if err == nil {
					*target.date = parsed
					break
				}
			}
		}
	}
	return publishedAt, updatedAt
}

func planListingUpdate(ctx context.Context, sc *svc.ServiceContext, plan publishBatchPlan, product map[string]any, listing model.MarketplaceListing) (model.PublishTask, bool, error) {
	if specs, ok := product["_merged_spec_items"]; ok {
		product["spec_items"] = specs
	}
	task, err := buildBatchPublishTask("", plan, product, time.Now())
	if err != nil {
		return task, false, err
	}
	before, err := sc.SellerXianyuService.ForAccount(plan.AccountID).GetSellerEditDetail(ctx, listing.PlatformItemID)
	if err != nil {
		return task, false, fmt.Errorf("核对货号%s失败：%w", listing.ItemNo, err)
	}
	task.Action = "update"
	task.AccountID = plan.AccountID
	task.Quantity = productNumber(product, "item_total_store")
	task.XianyuItemID = listing.PlatformItemID
	task.XianyuURL = listing.ItemURL
	task.PlannedAt = time.Now()
	task.Before = xianyu.ManagedState(before)
	publishedAt, updatedAt := publishDescriptionDates(fmt.Sprint(task.Before["description"]), listing.ListedAt)
	applyPublishTaskDates(&task, publishedAt, updatedAt)
	after := xianyu.ManagedState(xianyu.ManagedEditPayload(before, taskPublishInput(task)))
	if xianyu.SameActionableState(task.Before, after) {
		return task, false, nil
	}
	applyPublishTaskDates(&task, publishedAt, task.PlannedAt)
	after = xianyu.ManagedState(xianyu.ManagedEditPayload(before, taskPublishInput(task)))
	task.ChangeReasons = xianyu.StateChangeReasons(task.Before, after)
	return task, true, nil
}

// planListingRelist 为可发布商品复用最近下架的闲鱼商品 ID。
func planListingRelist(plan publishBatchPlan, product map[string]any, listing model.MarketplaceListing) (model.PublishTask, error) {
	if specs, ok := product["_merged_spec_items"]; ok {
		product["spec_items"] = specs
	}
	task, err := buildBatchPublishTask("", plan, product, time.Now())
	if err != nil {
		return task, err
	}
	task.Action = "relist"
	task.AccountID = plan.AccountID
	task.Quantity = productNumber(product, "item_total_store")
	task.XianyuItemID = listing.PlatformItemID
	task.XianyuURL = listing.ItemURL
	task.PlannedAt = time.Now()
	applyPublishTaskDates(&task, listing.ListedAt, task.PlannedAt)
	task.ChangeReasons = []string{"复用最近下架商品并按当前模板重新编辑"}
	return task, nil
}

// canonicalSpecValue 只合并明确等价的占位色名，不合并真实不同配色。
func canonicalSpecValue(name, value string) string {
	value = strings.TrimSpace(value)
	if strings.Contains(name, "颜色") && (value == "如图" || value == "颜色如图") {
		return "如图"
	}
	return value
}

// refreshReconcileTask 执行前重新拉齐货源，队列等待期间的缺货不能使用旧库存覆盖。
func refreshReconcileTask(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) (model.PublishTask, error) {
	if sc != nil && task.XianyuItemID != "" {
		if err := sc.ListingRepository.RequireManagedItems(ctx, task.AccountID, []string{task.XianyuItemID}); err != nil {
			return task, err
		}
	}
	if task.Action == "offline" {
		// 下架中心是人工确认后的强制操作，不重新依据小程序库存撤销。
		return task, nil
	}
	keys := task.SourceMemberIDs
	if task.BrandProfileID != "" {
		_, members, err := sc.InventoryRepository.GetBrandProfile(ctx, task.BrandProfileID)
		if err != nil {
			return task, err
		}
		keys = nil
		for _, m := range members {
			keys = append(keys, m.RegionID+":"+m.DistributorID)
		}
	}
	if len(keys) == 0 {
		return task, fmt.Errorf("缺少可核对的货源门店，请重新关联")
	}
	rows, err := loadReconcileSources(ctx, sc, keys, task.Action == "offline")
	if err != nil {
		return task, err
	}
	products := []map[string]any{}
	for _, p := range rows {
		if strings.EqualFold(productString(p, "item_no"), task.ItemNo) {
			products = append(products, p)
		}
	}
	merged := mergePublishProductsByItemNo(products)
	if len(merged) == 0 {
		return task, fmt.Errorf("全部来源已无货，请重新预览并确认下架")
	}
	product := merged[0]
	if task.Action != "offline" {
		product, err = retryPublishDetail(ctx, sc.CatalogService.GetLiveProductDetail, product, task)
		if err != nil {
			return task, err
		}
	}
	updated, err := buildBatchPublishTask(task.BatchID, publishBatchPlan{AccountID: task.AccountID, BrandProfileID: task.BrandProfileID, BrandName: task.Brand, RegionID: task.RegionID}, product, task.CreatedAt)
	if err != nil {
		return task, err
	}
	updated.MinDelaySeconds = task.MinDelaySeconds
	updated.MaxDelaySeconds = task.MaxDelaySeconds
	updated.ID = task.ID
	updated.AccountID = task.AccountID
	updated.Quantity = productNumber(merged[0], "item_total_store")
	updated.Action = task.Action
	updated.Before = task.Before
	updated.ChangeReasons = task.ChangeReasons
	updated.XianyuItemID = task.XianyuItemID
	updated.XianyuURL = task.XianyuURL
	updated.DuplicateXianyuItemIDs = task.DuplicateXianyuItemIDs
	updated.PlannedAt = time.Now()
	applyPublishTaskDates(&updated, task.PublishedAt, updated.PlannedAt)
	return updated, nil
}

// retryPublishDetail 发布重试必须读取完整商详图片，规格库存仍沿用跨地区合并结果。
func retryPublishDetail(ctx context.Context, fetch func(context.Context, map[string]any, string) (map[string]any, error), source map[string]any, task model.PublishTask) (map[string]any, error) {
	region := productString(source, "_primary_region")
	if region == "" {
		region = task.RegionID
	}
	detail, err := fetch(ctx, source, region)
	if err != nil {
		return nil, fmt.Errorf("重试读取完整商详失败，未发布：%w", err)
	}
	if !strings.EqualFold(productString(detail, "item_no"), task.ItemNo) {
		return nil, fmt.Errorf("重试商详货号不一致，未发布")
	}
	for _, key := range []string{"_source_regions", "_source_member_ids", "_source_item_ids", "_primary_region", "item_total_store", "store"} {
		if value, ok := source[key]; ok {
			detail[key] = value
		}
	}
	enrichProductSpecImages(source, detail)
	if specs, ok := source["_merged_spec_items"]; ok {
		detail["spec_items"] = specs
	}
	images := productImages(detail)
	if len(images) == 0 || (len(task.ImageURLs) > 1 && len(images) == 1) {
		return nil, fmt.Errorf("重试商详图片不完整（原%d张，现%d张），已阻止图片降级发布", len(task.ImageURLs), len(images))
	}
	return detail, nil
}
