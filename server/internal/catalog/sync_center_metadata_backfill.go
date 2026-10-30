package catalog

import (
	"context"
	"fmt"
	"sort"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type syncMetadataDiscovery map[string][]BrandStoreCandidate

// BackfillMetadata upgrades current successful generations using local source documents only.
func (center *SyncCenter) BackfillMetadata(ctx context.Context) ([]SyncCenterMetadataBackfillResult, error) {
	return center.backfillMetadata(ctx, false)
}

// BackfillMetadataWithDiscovery explicitly refreshes the small store directory, never goods or SKUs.
func (center *SyncCenter) BackfillMetadataWithDiscovery(ctx context.Context) ([]SyncCenterMetadataBackfillResult, error) {
	return center.backfillMetadata(ctx, true)
}

func (center *SyncCenter) backfillMetadata(ctx context.Context, discover bool) ([]SyncCenterMetadataBackfillResult, error) {
	if err := center.ensureMetadataIndexes(ctx); err != nil {
		return nil, err
	}
	heads, err := center.ListSnapshots(ctx)
	if err != nil {
		return nil, err
	}
	results := []SyncCenterMetadataBackfillResult{}
	cache := syncMetadataDiscovery{}
	for _, head := range heads {
		result, backfillErr := center.backfillMetadataHead(ctx, head, cache, discover)
		if backfillErr != nil {
			result.Error = backfillErr.Error()
		}
		results = append(results, result)
	}
	return results, nil
}

func (center *SyncCenter) backfillMetadataHead(ctx context.Context, head SyncCenterSnapshot, cache syncMetadataDiscovery, discover bool) (SyncCenterMetadataBackfillResult, error) {
	result := SyncCenterMetadataBackfillResult{ProfileID: head.ProfileID, Generation: head.Generation}
	lease, leaseErr := center.lockRegistry(ctx, head.ProfileID, "metadata", false)
	if leaseErr != nil {
		return result, leaseErr
	}
	defer lease.close()
	ctx = lease.ctx
	if err := center.ValidateVersion(ctx, head.ProfileID, head.Generation); err != nil {
		return result, err
	}
	profile, _, err := center.source.inventoryRepository.GetBrandProfile(ctx, head.ProfileID)
	if err != nil {
		return result, err
	}
	metadata, count, err := center.buildMetadata(ctx, head, profile.Name, cache, discover)
	result.Products = count
	result.Stores = len(metadata.Stores)
	result.Categories = len(metadata.Categories)
	if err != nil {
		return result, err
	}
	// A concurrently activated head must never gain a marker for a different generation.
	if err = center.ValidateVersion(ctx, head.ProfileID, head.Generation); err != nil {
		return result, err
	}
	return result, center.writeMetadata(ctx, metadata)
}

func (center *SyncCenter) buildMetadata(ctx context.Context, head SyncCenterSnapshot, name string, cache syncMetadataDiscovery, discover bool) (SyncCenterMetadata, int, error) {
	metadata := SyncCenterMetadata{Brand: SyncCenterBrand{ID: hashID(head.ProfileID, head.Generation), ProfileID: head.ProfileID, Generation: head.Generation, Name: name, SyncedAt: head.SyncedAt, Version: syncMetadataVersion}, Stores: []SyncCenterStore{}, Categories: []SyncCenterCategory{}}
	for _, member := range head.Members {
		store, err := center.metadataStore(ctx, head, member, cache, discover)
		if err != nil {
			return metadata, 0, err
		}
		metadata.Stores = append(metadata.Stores, store)
		if metadata.Brand.LogoURL == "" {
			metadata.Brand.LogoURL = store.LogoURL
		}
	}
	categories, count, err := center.collectMetadataCategories(ctx, head)
	if err != nil {
		return metadata, count, err
	}
	metadata.Categories = categories
	metadata.Brand.StoreCount = len(metadata.Stores)
	metadata.Brand.CategoryCount = len(categories)
	return metadata, count, nil
}

func (center *SyncCenter) metadataStore(ctx context.Context, head SyncCenterSnapshot, member BrandProfileMember, cache syncMetadataDiscovery, discover bool) (SyncCenterStore, error) {
	store := SyncCenterStore{ID: hashID(head.ProfileID, head.Generation, member.RegionID, member.DistributorID), ProfileID: head.ProfileID, Generation: head.Generation, RegionID: member.RegionID, DistributorID: member.DistributorID, BrandName: member.SourceName, SyncedAt: head.SyncedAt}
	if !discover {
		var previous SyncCenterStore
		err := center.stores.FindOne(ctx, bson.M{"_id": store.ID}).Decode(&previous)
		if err == nil {
			return previous, nil
		}
		if err != mongo.ErrNoDocuments {
			return store, err
		}
		return store, nil
	}
	candidates, ok := cache[member.RegionID]
	if !ok {
		var err error
		candidates, err = center.source.DiscoverBrandStores(ctx, member.RegionID)
		if err != nil {
			return store, fmt.Errorf("同步品牌门店目录失败：%w", err)
		}
		cache[member.RegionID] = candidates
	}
	for _, candidate := range candidates {
		if candidate.DistributorID != member.DistributorID {
			continue
		}
		store.BrandName = candidate.BrandName
		store.StoreName = candidate.StoreName
		store.ShopCode = candidate.ShopCode
		store.LogoURL = candidate.LogoURL
		store.OnlineGoodsCount = candidate.OnlineGoodsCount
		return store, nil
	}
	return store, fmt.Errorf("地区%s门店%s未出现在品牌目录，停止元数据激活", member.RegionID, member.DistributorID)
}

// collectMetadataCategories streams each current source product exactly once and keeps only its taxonomy projection.
func (center *SyncCenter) collectMetadataCategories(ctx context.Context, head SyncCenterSnapshot) ([]SyncCenterCategory, int, error) {
	filter := bson.M{"profileId": head.ProfileID, "generation": head.Generation}
	projection := bson.M{"regionId": 1, "distributorId": 1, "data.item_category_main": 1, "data.item_category_info": 1}
	cursor, err := center.products.Find(ctx, filter, options.Find().SetProjection(projection).SetBatchSize(256))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	rows := map[string]SyncCenterCategory{}
	count := 0
	categorized := 0
	for cursor.Next(ctx) {
		var product SyncCenterProduct
		if err = cursor.Decode(&product); err != nil {
			return nil, count, err
		}
		count++
		_, selected := selectedMetadataCategories(product.Data)
		if len(selected) > 0 {
			categorized++
		}
		appendMetadataCategories(rows, head, product)
	}
	if err = cursor.Err(); err != nil {
		return nil, count, err
	}
	if count != head.ProductCount {
		return nil, count, fmt.Errorf("同步商品覆盖不完整，拒绝生成类目元数据")
	}
	if count > 0 && categorized == 0 {
		return nil, count, fmt.Errorf("完整商品没有可识别类目，拒绝空类目覆盖")
	}
	result := make([]SyncCenterCategory, 0, len(rows))
	for _, row := range rows {
		result = append(result, row)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].ID < result[j].ID })
	return result, count, nil
}

func (center *SyncCenter) writeMetadata(ctx context.Context, metadata SyncCenterMetadata) error {
	// Only this metadata generation is rebuilt. Remove its ready marker first so readers fail closed during a retry.
	filter := bson.M{"profileId": metadata.Brand.ProfileID, "generation": metadata.Brand.Generation}
	if _, err := center.brands.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := center.stores.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := center.categories.DeleteMany(ctx, filter); err != nil {
		return err
	}
	for _, store := range metadata.Stores {
		if _, err := center.stores.ReplaceOne(ctx, bson.M{"_id": store.ID}, store, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}
	for _, category := range metadata.Categories {
		if _, err := center.categories.ReplaceOne(ctx, bson.M{"_id": category.ID}, category, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}
	// The small manifest is the commit marker, written after every required metadata row.
	_, err := center.brands.ReplaceOne(ctx, bson.M{"_id": metadata.Brand.ID}, metadata.Brand, options.Replace().SetUpsert(true))
	return err
}

func (center *SyncCenter) stageMetadata(ctx context.Context, head SyncCenterSnapshot, name string) error {
	metadata, _, err := center.buildMetadata(ctx, head, name, syncMetadataDiscovery{}, true)
	if err != nil {
		return err
	}
	return center.writeMetadata(ctx, metadata)
}
