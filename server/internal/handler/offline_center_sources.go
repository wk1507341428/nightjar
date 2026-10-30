package handler

import (
	"context"
	"fmt"
	"strings"
	"time"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
)

// offlineCenterLiveSources 只包含本次完整同步版本的有效货源，不使用历史缺失货源计算价格。
type offlineCenterLiveSources struct {
	activeBindingKeys map[string]struct{}
	productsByItemNo  map[string][]map[string]any
}

type offlineSnapshotReader func(context.Context, string, string, string) (catalog.SyncCenterSnapshot, error)

// readOfflineCenterSnapshot 整个聚合品牌只读取一次；单门店请求同样只调用一次读取。
func readOfflineCenterSnapshot(ctx context.Context, profileID string, members []catalog.BrandProfileMember, read offlineSnapshotReader) (catalog.SyncCenterSnapshot, error) {
	if len(members) == 0 {
		return catalog.SyncCenterSnapshot{}, fmt.Errorf("品牌门店范围为空，禁止生成下架预览")
	}
	if profileID != "" {
		return read(ctx, profileID, "", "")
	}
	if len(members) != 1 {
		return catalog.SyncCenterSnapshot{}, fmt.Errorf("多门店必须指定聚合品牌")
	}
	return read(ctx, "", members[0].RegionID, members[0].DistributorID)
}

// refreshOfflineCenterBindings 复用同一份本地完整快照，批量更新历史归属；不请求小程序。
func refreshOfflineCenterBindings(ctx context.Context, sc *svc.ServiceContext, profile catalog.BrandProfile, members []catalog.BrandProfileMember, categoryIDs []string) (offlineCenterLiveSources, error) {
	snapshot, err := readOfflineCenterSnapshot(ctx, profile.ID, members, func(ctx context.Context, p, r, d string) (catalog.SyncCenterSnapshot, error) {
		return readSyncedSource(ctx, sc, p, r, d)
	})
	if err != nil {
		return offlineCenterLiveSources{}, err
	}
	categories, err := sc.SyncCenter.ReadCategories(ctx, snapshot.ProfileID, "", "")
	if err != nil {
		return offlineCenterLiveSources{}, err
	}
	names := make(map[string]string, len(categories))
	for _, category := range categories {
		names[category.ID] = category.Name
	}
	sources, bindings := offlineSourcesFromSnapshot(snapshot, profile, members, categoryIDs, names)
	if err = sc.InventoryRepository.BulkUpsertSKUCategoryBindings(ctx, bindings); err != nil {
		return offlineCenterLiveSources{}, err
	}
	return sources, nil
}

// offlineSourcesFromSnapshot 直接使用只读商详，不深拷贝数万条规格，不修改快照内容。
func offlineSourcesFromSnapshot(snapshot catalog.SyncCenterSnapshot, profile catalog.BrandProfile, members []catalog.BrandProfileMember, categoryIDs []string, names map[string]string) (offlineCenterLiveSources, []catalog.SKUCategoryBinding) {
	memberKeys := make(map[string]bool, len(members))
	for _, member := range members {
		memberKeys[member.RegionID+":"+member.DistributorID] = true
	}
	selected := make(map[string]bool, len(categoryIDs))
	for _, id := range categoryIDs {
		selected[id] = true
	}
	sources := offlineCenterLiveSources{activeBindingKeys: map[string]struct{}{}, productsByItemNo: map[string][]map[string]any{}}
	bindings := make([]catalog.SKUCategoryBinding, 0, len(snapshot.Products))
	now := time.Now()
	for _, product := range snapshot.Products {
		if !memberKeys[product.RegionID+":"+product.DistributorID] || !sourceMatchesCategories(product.Data, product.CategoryIDs, selected) {
			continue
		}
		row := product.Data
		binding := offlineSnapshotBinding(row, profile, product.RegionID, product.DistributorID, categoryIDs, names, now)
		bindings = append(bindings, binding)
		itemNo := strings.ToUpper(strings.TrimSpace(binding.ItemNo))
		if itemNo == "" {
			continue
		}
		sources.activeBindingKeys[offlineCenterBindingKey(itemNo, product.RegionID, binding.SourceItemID)] = struct{}{}
		sources.productsByItemNo[itemNo] = append(sources.productsByItemNo[itemNo], row)
	}
	return sources, bindings
}

func offlineSnapshotBinding(product map[string]any, profile catalog.BrandProfile, regionID, distributorID string, selected []string, names map[string]string, now time.Time) catalog.SKUCategoryBinding {
	categoryID, categoryName := offlineBindingCategory(product, selected, names)
	return catalog.SKUCategoryBinding{
		ItemNo: firstProductString(product, "item_no"), BrandProfileID: profile.ID, BrandStoreID: catalog.BrandStoreIDForSource(regionID, distributorID), BrandName: profile.Name,
		RegionID: regionID, DistributorID: distributorID, SourceItemID: firstProductString(product, "default_item_id", "item_id", "goods_id"), CategoryID: categoryID, CategoryName: categoryName,
		SourcePriceCents: offlineSourcePrice(product), MarketPriceCents: productNumber(product, "market_price"), LastSeenAt: now,
	}
}
