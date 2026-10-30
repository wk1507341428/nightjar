package handler

import (
	"context"
	"fmt"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// publishPlanBuildState 收拢一次预览的请求、来源快照与计划，避免在各阶段传递长参数列表。
type publishPlanBuildState struct {
	service          *svc.ServiceContext
	request          types.CreatePublishBatchRequest
	plan             publishBatchPlan
	products         []map[string]any
	allScopeProducts []map[string]any
	validations      map[string]publishDetailValidation
}

type publishMemberProducts struct {
	products    []map[string]any
	allProducts []map[string]any
	err         error
}

func (state *publishPlanBuildState) validateAccount(ctx context.Context) error {
	account, err := state.service.XianyuAccountRepository.Get(ctx, state.request.AccountID)
	if err != nil || account.Status != model.XianyuAccountActive || !account.SellerConnected {
		return fmt.Errorf("目标闲鱼账号未连接卖家后台或队列不可用")
	}
	if state.request.ActionMode == model.PublishPresetUpdateOnly {
		return nil
	}
	if err := state.service.MarketplaceService.EnsureActivationSnapshot(ctx, state.request.AccountID, ""); err != nil {
		return fmt.Errorf("预览前核对闲鱼在售失败：%w", err)
	}
	return nil
}

func (state *publishPlanBuildState) loadSources(ctx context.Context) error {
	var err error
	switch {
	case state.request.BrandProfileID != "":
		err = state.loadProfileSources(ctx)
	case state.request.SourceType == "live":
		err = state.loadLiveStoreSources(ctx)
	default:
		err = state.loadLocalStoreSources(ctx)
	}
	if err != nil {
		return err
	}
	state.annotateSingleStoreSources()
	state.products = selectPublishRequestedProducts(state.products, state.request.ItemNos)
	return nil
}

func (state *publishPlanBuildState) loadProfileSources(ctx context.Context) error {
	profile, members, err := state.service.InventoryRepository.GetBrandProfile(ctx, state.request.BrandProfileID)
	if err != nil {
		return err
	}
	if len(members) == 0 {
		return fmt.Errorf("聚合品牌未配置货源门店，停止对账")
	}
	state.plan.BrandName, state.plan.RegionID = profile.Name, profile.DefaultRegionID
	if state.plan.RegionID == "" && len(members) > 0 {
		state.plan.RegionID = members[0].RegionID
	}
	snapshot, err := readSyncedSource(ctx, state.service, profile.ID, "", "")
	if err != nil {
		return err
	}
	state.plan.SourceSyncVersion = snapshot.Generation
	for _, member := range members {
		state.plan.SourceRegions = appendUniqueText(state.plan.SourceRegions, member.RegionID)
		state.plan.SourceMemberIDs = appendUniqueText(state.plan.SourceMemberIDs, member.RegionID+":"+member.DistributorID)
	}
	state.allScopeProducts = syncedSnapshotProducts(snapshot, nil)
	state.products = syncedSnapshotProducts(snapshot, state.request.CategoryIDs)
	return nil
}

func annotatePublishMemberProducts(products []map[string]any, member catalog.BrandProfileMember) {
	for _, product := range products {
		product["_source_regions"] = []string{member.RegionID}
		product["_source_member_ids"] = []string{member.RegionID + ":" + member.DistributorID}
		product["_source_item_ids"] = []string{firstProductString(product, "default_item_id", "item_id", "goods_id")}
		product["_primary_region"] = member.RegionID
	}
}

func (state *publishPlanBuildState) loadLiveStoreSources(ctx context.Context) error {
	snapshot, err := readSyncedSource(ctx, state.service, "", state.request.RegionID, state.request.DistributorID)
	if err != nil {
		return err
	}
	state.plan.SourceSyncVersion = snapshot.Generation
	state.products = syncedSnapshotProducts(snapshot, state.request.CategoryIDs)
	state.allScopeProducts = syncedSnapshotProducts(snapshot, nil)
	return nil
}

func (state *publishPlanBuildState) loadLocalStoreSources(ctx context.Context) error {
	store, err := state.service.CatalogService.GetBrandStore(ctx, state.request.BrandStoreID)
	if err != nil {
		return err
	}
	state.plan.BrandName, state.plan.RegionID, state.plan.DistributorID = store.BrandName, store.RegionID, store.DistributorID
	state.request.RegionID, state.request.DistributorID = store.RegionID, store.DistributorID
	return state.loadLiveStoreSources(ctx)
}

func (state *publishPlanBuildState) annotateSingleStoreSources() {
	if state.plan.BrandProfileID != "" {
		return
	}
	state.plan.SourceRegions = []string{state.plan.RegionID}
	state.plan.SourceMemberIDs = []string{state.plan.RegionID + ":" + state.plan.DistributorID}
	for _, products := range [][]map[string]any{state.products, state.allScopeProducts} {
		for _, product := range products {
			product["_source_regions"] = state.plan.SourceRegions
			product["_source_member_ids"] = state.plan.SourceMemberIDs
			product["_primary_region"] = state.plan.RegionID
			product["_source_item_ids"] = []string{firstProductString(product, "default_item_id", "item_id", "goods_id")}
		}
	}
}

func selectPublishRequestedProducts(products []map[string]any, requested []string) []map[string]any {
	if len(requested) == 0 {
		return products
	}
	itemNos := make(map[string]struct{}, len(requested))
	for _, itemNo := range requested {
		itemNos[itemNo] = struct{}{}
	}
	selected := make([]map[string]any, 0, len(products))
	for _, product := range products {
		if _, exists := itemNos[model.ItemNoKey(productString(product, "item_no"))]; exists {
			selected = append(selected, product)
		}
	}
	return selected
}

func (state *publishPlanBuildState) previewProductDetail(ctx context.Context, source map[string]any, region string) (map[string]any, error) {
	return syncedSourceDetail(ctx, source, region)
}
