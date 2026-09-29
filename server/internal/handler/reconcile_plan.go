package handler

import (
	"context"
	"fmt"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/xianyu"
	"sort"
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

// prepareOfflineBatch 一次读取每组货源，再判断批量重试的下架商品是否仍有货。
func prepareOfflineBatch(ctx context.Context, sc *svc.ServiceContext, tasks []model.PublishTask) map[string]error {
	results := make(map[string]error)
	type offlineGroup struct {
		tasks []model.PublishTask
		keys  []string
	}
	groups := make(map[string]*offlineGroup)
	for _, task := range tasks {
		if !task.RetryRequested {
			continue
		}
		keys := append([]string{}, task.SourceMemberIDs...)
		if task.BrandProfileID != "" {
			_, members, err := sc.InventoryRepository.GetBrandProfile(ctx, task.BrandProfileID)
			if err != nil {
				results[task.ID] = err
				continue
			}
			keys = keys[:0]
			for _, member := range members {
				keys = append(keys, member.RegionID+":"+member.DistributorID)
			}
		}
		sort.Strings(keys)
		groupKey := task.AccountID + "|" + task.BrandProfileID + "|" + strings.Join(keys, "|")
		group := groups[groupKey]
		if group == nil {
			group = &offlineGroup{keys: keys}
			groups[groupKey] = group
		}
		group.tasks = append(group.tasks, task)
	}
	for _, group := range groups {
		rows, err := loadReconcileSources(ctx, sc, group.keys, true)
		if err != nil {
			for _, task := range group.tasks {
				results[task.ID] = fmt.Errorf("重试前读取货源失败：%w", err)
			}
			continue
		}
		productsByItemNo := make(map[string][]map[string]any)
		for _, row := range rows {
			itemNo := strings.ToUpper(strings.TrimSpace(productString(row, "item_no")))
			if itemNo != "" {
				productsByItemNo[itemNo] = append(productsByItemNo[itemNo], row)
			}
		}
		for _, task := range group.tasks {
			itemNo := strings.ToUpper(strings.TrimSpace(task.ItemNo))
			if len(mergePublishProductsByItemNo(productsByItemNo[itemNo])) > 0 {
				results[task.ID] = fmt.Errorf("货源已恢复库存，取消本次下架")
			}
		}
	}
	return results
}

func taskPublishInput(task model.PublishTask) xianyu.PublishInput {
	variants := []xianyu.PublishVariant{}
	for _, sku := range task.Variants {
		props := []xianyu.PublishVariantProperty{}
		for _, p := range sku.Properties {
			props = append(props, xianyu.PublishVariantProperty{Name: p.Name, Value: p.Value})
		}
		variants = append(variants, xianyu.PublishVariant{PriceCents: sku.PriceCents, Quantity: sku.Quantity, Properties: props})
	}
	return xianyu.PublishInput{Quantity: task.Quantity, Title: task.Title, Description: task.Description, PriceCents: task.PriceCents, OriginalPriceCents: task.OriginalPriceCents, Variants: variants}
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
	after := xianyu.ManagedState(xianyu.ManagedEditPayload(before, taskPublishInput(task)))
	task.ChangeReasons = xianyu.StateChangeReasons(task.Before, after)
	return task, !xianyu.SameActionableState(task.Before, after), nil
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
	if task.Action == "offline" {
		if len(merged) > 0 {
			return task, fmt.Errorf("货源已恢复库存，取消本次下架")
		}
		return task, nil
	}
	if len(merged) == 0 {
		return task, fmt.Errorf("全部来源已无货，请重新预览并确认下架")
	}
	product := merged[0]
	if task.Action == "" || task.Action == "publish" || task.Action == "relist" {
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
	if specs, ok := source["_merged_spec_items"]; ok {
		detail["spec_items"] = specs
	}
	images := productImages(detail)
	if len(images) == 0 || (len(task.ImageURLs) > 1 && len(images) == 1) {
		return nil, fmt.Errorf("重试商详图片不完整（原%d张，现%d张），已阻止图片降级发布", len(task.ImageURLs), len(images))
	}
	return detail, nil
}
