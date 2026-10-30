package handler

import (
	"context"
	"fmt"
	"sync"

	"sidejob-server/internal/model"
)

type publishProductUpdate struct {
	matched   bool
	updates   []model.PublishTask
	unchanged int
	err       error
}

// publishPlanActions 保存同一账号在售、历史及忙任务视图，供各动作共享一致的查重范围。
type publishPlanActions struct {
	build           *publishPlanBuildState
	listings        []model.MarketplaceListing
	listedItemNos   map[string]struct{}
	existingTaskNos map[string]struct{}
	busyListings    map[string]struct{}
	historyByItemNo map[string][]model.MarketplaceListing
	updateResults   []publishProductUpdate
	selectedItemNos map[string]struct{}
}

func (actions *publishPlanActions) loadListings(ctx context.Context) error {
	state := actions.build
	itemNos := make([]string, 0, len(state.products))
	for _, product := range state.products {
		itemNos = append(itemNos, productString(product, "item_no"))
	}
	var err error
	actions.existingTaskNos, err = state.service.PublishRepository.ExistingItemNos(ctx, state.plan.AccountID, itemNos)
	if err != nil {
		return err
	}
	listings, err := state.service.ListingRepository.List(ctx, state.plan.AccountID, model.XianyuPlatform, 0)
	if err != nil {
		return err
	}
	actions.listedItemNos = make(map[string]struct{}, len(listings))
	listingNos := make([]string, 0, len(listings))
	for _, listing := range listings {
		listingNos = append(listingNos, listing.ItemNo)
		actions.listedItemNos[model.ItemNoKey(listing.ItemNo)] = struct{}{}
	}
	actions.busyListings, err = state.service.PublishRepository.ExistingItemNos(ctx, state.plan.AccountID, listingNos)
	if err != nil {
		return err
	}
	// 所有在售链接参与查重，仅明确系统发布且非独立维护的链接参与修改和下架。
	actions.listings, err = state.service.ListingRepository.FilterManagedListings(ctx, state.plan.AccountID, listings)
	return err
}

func (actions *publishPlanActions) potentialItemNos() []string {
	itemNos := make([]string, 0)
	for _, product := range actions.build.products {
		itemNo := model.ItemNoKey(productString(product, "item_no"))
		if itemNo == "" {
			continue
		}
		if _, listed := actions.listedItemNos[itemNo]; listed {
			continue
		}
		if _, busy := actions.existingTaskNos[itemNo]; busy {
			continue
		}
		itemNos = append(itemNos, itemNo)
	}
	return itemNos
}

func (actions *publishPlanActions) loadHistory(ctx context.Context) error {
	actions.historyByItemNo = make(map[string][]model.MarketplaceListing)
	itemNos := actions.potentialItemNos()
	if len(itemNos) == 0 {
		return nil
	}
	state := actions.build
	if err := state.service.MarketplaceService.EnsureOffShelfSnapshot(ctx, state.plan.AccountID); err != nil {
		return fmt.Errorf("读取闲鱼下架历史失败：%w", err)
	}
	listings, err := state.service.ListingRepository.ListOffShelfByItemNos(ctx, state.plan.AccountID, itemNos)
	if err != nil {
		return err
	}
	listings, err = state.service.ListingRepository.FilterManagedListings(ctx, state.plan.AccountID, listings)
	if err != nil {
		return err
	}
	for _, listing := range listings {
		if listing.BrandProfileID != "" && !listingBelongsToPlan(listing, state.plan) {
			continue
		}
		itemNo := model.ItemNoKey(listing.ItemNo)
		actions.historyByItemNo[itemNo] = append(actions.historyByItemNo[itemNo], listing)
	}
	return nil
}

// planUpdates 受控并发核对已有在售详情，结果按原货源次序存放。
func (actions *publishPlanActions) planUpdates(ctx context.Context) error {
	actions.updateResults = make([]publishProductUpdate, len(actions.build.products))
	semaphore := make(chan struct{}, 4)
	var group sync.WaitGroup
	for index, product := range actions.build.products {
		itemNo := model.ItemNoKey(productString(product, "item_no"))
		validation := actions.build.validations[itemNo]
		if validation.missing || validation.err != nil {
			continue
		}
		if _, listed := actions.listedItemNos[itemNo]; !listed {
			continue
		}
		group.Add(1)
		go func(index int, product map[string]any) {
			defer group.Done()
			select {
			case semaphore <- struct{}{}:
				defer func() { <-semaphore }()
			case <-ctx.Done():
				actions.updateResults[index].err = ctx.Err()
				return
			}
			actions.updateResults[index] = actions.planProductUpdate(ctx, product)
		}(index, product)
	}
	group.Wait()
	for _, result := range actions.updateResults {
		if result.err != nil {
			return result.err
		}
	}
	return nil
}

func (actions *publishPlanActions) planProductUpdate(ctx context.Context, product map[string]any) publishProductUpdate {
	result := publishProductUpdate{}
	itemNo := model.ItemNoKey(productString(product, "item_no"))
	for _, listing := range actions.listings {
		if model.ItemNoKey(listing.ItemNo) != itemNo || !listingBelongsToPlan(listing, actions.build.plan) {
			continue
		}
		result.matched = true
		updated, changed, err := planListingUpdate(ctx, actions.build.service, actions.build.plan, product, listing)
		if err != nil {
			result.err = err
			return result
		}
		if changed {
			result.updates = append(result.updates, updated)
		} else {
			result.unchanged++
		}
	}
	return result
}

func (actions *publishPlanActions) appendMissingOfflines() {
	if len(actions.build.request.ItemNos) > 0 {
		actions.appendRequestedMissingOfflines()
		return
	}
	current := make(map[string]struct{}, len(actions.build.allScopeProducts))
	for _, product := range actions.build.allScopeProducts {
		current[model.ItemNoKey(productString(product, "item_no"))] = struct{}{}
	}
	for itemNo, validation := range actions.build.validations {
		if validation.missing {
			delete(current, itemNo)
		} else if validation.err != nil {
			// 未知库存不能从可售集合中消失，保护原在售商品。
			current[itemNo] = struct{}{}
		}
	}
	for _, listing := range actions.listings {
		if !listingBelongsToPlan(listing, actions.build.plan) {
			continue
		}
		itemNo := model.ItemNoKey(listing.ItemNo)
		if _, busy := actions.busyListings[itemNo]; busy {
			continue
		}
		if _, exists := current[itemNo]; !exists {
			actions.build.plan.OfflineListings = append(actions.build.plan.OfflineListings, listing)
		}
	}
}

func (actions *publishPlanActions) appendRequestedMissingOfflines() {
	requested := make(map[string]struct{}, len(actions.build.request.ItemNos))
	for _, itemNo := range actions.build.request.ItemNos {
		requested[model.ItemNoKey(itemNo)] = struct{}{}
	}
	for _, listing := range actions.listings {
		itemNo := model.ItemNoKey(listing.ItemNo)
		if _, exists := requested[itemNo]; !exists || !actions.build.validations[itemNo].missing {
			continue
		}
		if listingBelongsToPlan(listing, actions.build.plan) {
			actions.build.plan.OfflineListings = append(actions.build.plan.OfflineListings, listing)
		}
	}
}

// selectActivations 先接收修改/跳过决定，其余商品优先复用历史下架链接。
func (actions *publishPlanActions) selectActivations() {
	actions.selectedItemNos = make(map[string]struct{}, len(actions.build.products))
	for index, product := range actions.build.products {
		reason, handled := actions.productSelection(index, product)
		if handled {
			continue
		}
		itemNo := model.ItemNoKey(productString(product, "item_no"))
		if reason != "" {
			actions.build.plan.Skipped = append(actions.build.plan.Skipped, model.PublishBatchSkip{ItemNo: itemNo, Title: productString(product, "item_name"), Reason: reason})
			continue
		}
		actions.selectedItemNos[itemNo] = struct{}{}
		if !actions.appendRelist(product, actions.historyByItemNo[itemNo]) {
			actions.build.plan.Candidates = append(actions.build.plan.Candidates, product)
		}
	}
}

func (actions *publishPlanActions) productSelection(index int, product map[string]any) (string, bool) {
	itemNo := model.ItemNoKey(productString(product, "item_no"))
	validation := actions.build.validations[itemNo]
	if itemNo == "" || productString(product, "item_name") == "" || productString(product, "main_img") == "" {
		return "商品信息不完整", false
	}
	if validation.err != nil && !validation.missing {
		return "商详核对失败，未操作：" + validation.err.Error(), false
	}
	if validation.missing {
		_, listed := actions.listedItemNos[itemNo]
		return "", listed
	}
	if productNumber(product, "item_total_store") <= 0 && productNumber(product, "store") <= 0 {
		return "库存为 0", false
	}
	if _, busy := actions.existingTaskNos[itemNo]; busy {
		return "已有进行中的发布任务", false
	}
	if _, listed := actions.listedItemNos[itemNo]; listed {
		result := actions.updateResults[index]
		if result.matched {
			actions.build.plan.Updates = append(actions.build.plan.Updates, result.updates...)
			actions.build.plan.Unchanged += result.unchanged
			return "", true
		}
		return "已在售但来源未关联，请先确认品牌归属", false
	}
	if _, selected := actions.selectedItemNos[itemNo]; selected {
		return "当前品牌存在重复货号", false
	}
	return "", false
}

func (actions *publishPlanActions) appendRelist(product map[string]any, listings []model.MarketplaceListing) bool {
	for index, listing := range listings {
		task, err := planListingRelist(actions.build.plan, product, listing)
		if err != nil {
			continue
		}
		for duplicateIndex, duplicate := range listings {
			if duplicateIndex != index {
				task.DuplicateXianyuItemIDs = append(task.DuplicateXianyuItemIDs, duplicate.PlatformItemID)
			}
		}
		actions.build.plan.Relists = append(actions.build.plan.Relists, task)
		return true
	}
	return false
}
