package catalog

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// BrandStore 是一个品牌在一个仓库地区的上游门店配置。
type BrandStore struct {
	ID            string    `bson:"_id" json:"id"`
	RegionID      string    `bson:"regionId" json:"regionId"`
	DistributorID string    `bson:"distributorId" json:"distributorId"`
	BrandID       string    `bson:"brandId" json:"brandId"`
	BrandName     string    `bson:"brandName" json:"brandName"`
	ShopCode      string    `bson:"shopCode,omitempty" json:"shopCode,omitempty"`
	StoreName     string    `bson:"storeName,omitempty" json:"storeName,omitempty"`
	SyncEnabled   bool      `bson:"syncEnabled" json:"syncEnabled"`
	LastSyncedAt  time.Time `bson:"lastSyncedAt,omitempty" json:"lastSyncedAt,omitempty"`
	CreatedAt     time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time `bson:"updatedAt" json:"updatedAt"`
}

// CatalogRegion 是本地商品库的仓库地区档案。
type CatalogRegion struct {
	ID        string    `bson:"_id" json:"id"`
	Name      string    `bson:"name" json:"name"`
	Enabled   bool      `bson:"enabled" json:"enabled"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

// CatalogBrand 是统一的品牌档案。
type CatalogBrand struct {
	ID             string    `bson:"_id" json:"id"`
	Name           string    `bson:"name" json:"name"`
	NormalizedName string    `bson:"normalizedName" json:"normalizedName"`
	UpdatedAt      time.Time `bson:"updatedAt" json:"updatedAt"`
}

// BrandProfile 是发布、同步和渠道对账统一引用的品牌档案。
type BrandProfile struct {
	ID              string    `bson:"_id" json:"id"`
	Name            string    `bson:"name" json:"name"`
	DefaultRegionID string    `bson:"defaultRegionId,omitempty" json:"defaultRegionId,omitempty"`
	CreatedAt       time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time `bson:"updatedAt" json:"updatedAt"`
}

// BrandProfileMember 把一个地区的上游品牌门店归入品牌档案。
type BrandProfileMember struct {
	ID            string    `bson:"_id" json:"id"`
	ProfileID     string    `bson:"profileId" json:"profileId"`
	RegionID      string    `bson:"regionId" json:"regionId"`
	DistributorID string    `bson:"distributorId" json:"distributorId"`
	SourceName    string    `bson:"sourceName" json:"sourceName"`
	CreatedAt     time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time `bson:"updatedAt" json:"updatedAt"`
}

// CatalogOffer 保存上游商品在一个品牌门店中的当前状态。
type CatalogOffer struct {
	ID              string         `bson:"_id" json:"id"`
	ProductID       string         `bson:"productId" json:"productId"`
	BrandStoreID    string         `bson:"brandStoreId" json:"brandStoreId"`
	RegionID        string         `bson:"regionId" json:"regionId"`
	DistributorID   string         `bson:"distributorId" json:"distributorId"`
	SourceGoodsID   string         `bson:"sourceGoodsId,omitempty" json:"sourceGoodsId,omitempty"`
	SourceItemID    string         `bson:"sourceItemId,omitempty" json:"sourceItemId,omitempty"`
	SourceDefaultID string         `bson:"sourceDefaultId,omitempty" json:"sourceDefaultId,omitempty"`
	ItemNo          string         `bson:"itemNo,omitempty" json:"itemNo,omitempty"`
	Name            string         `bson:"name" json:"name"`
	BrandName       string         `bson:"brandName,omitempty" json:"brandName,omitempty"`
	PriceCents      int64          `bson:"priceCents" json:"priceCents"`
	ActivityCents   int64          `bson:"activityCents" json:"activityCents"`
	MarketCents     int64          `bson:"marketCents" json:"marketCents"`
	Stock           int64          `bson:"stock" json:"stock"`
	SaleStatus      string         `bson:"saleStatus" json:"saleStatus"`
	SyncState       string         `bson:"syncState" json:"syncState"`
	MissingRuns     int            `bson:"missingRuns" json:"missingRuns"`
	XianyuListed    bool           `bson:"xianyuListed" json:"-"`
	SourceData      map[string]any `bson:"sourceData" json:"sourceData"`
	FirstSeenAt     time.Time      `bson:"firstSeenAt" json:"firstSeenAt"`
	LastSeenAt      time.Time      `bson:"lastSeenAt" json:"lastSeenAt"`
	LastSyncedAt    time.Time      `bson:"lastSyncedAt" json:"lastSyncedAt"`
	InactiveAt      *time.Time     `bson:"inactiveAt,omitempty" json:"inactiveAt,omitempty"`
}

// SKUPriceSnapshot 保存一个商品 SKU 在某次同步观察到的价格。
type SKUPriceSnapshot struct {
	ID                 string    `bson:"_id" json:"id"`
	OfferID            string    `bson:"offerId" json:"offerId"`
	ProductID          string    `bson:"productId" json:"productId"`
	BrandStoreID       string    `bson:"brandStoreId" json:"brandStoreId"`
	RegionID           string    `bson:"regionId" json:"regionId"`
	ItemNo             string    `bson:"itemNo" json:"itemNo"`
	SKUID              string    `bson:"skuId" json:"skuId"`
	SKUCode            string    `bson:"skuCode,omitempty" json:"skuCode,omitempty"`
	VariantLabel       string    `bson:"variantLabel" json:"variantLabel"`
	PriceCents         int64     `bson:"priceCents" json:"priceCents"`
	SourcePriceCents   int64     `bson:"sourcePriceCents" json:"sourcePriceCents"`
	ActivityPriceCents int64     `bson:"activityPriceCents" json:"activityPriceCents"`
	MarketPriceCents   int64     `bson:"marketPriceCents" json:"marketPriceCents"`
	Stock              int64     `bson:"stock" json:"stock"`
	SyncRunID          string    `bson:"syncRunId,omitempty" json:"syncRunId,omitempty"`
	ObservedAt         time.Time `bson:"observedAt" json:"observedAt"`
}

// SyncRun 是一次品牌或单商品同步的审计记录。
type SyncRun struct {
	ID             string    `bson:"_id" json:"id"`
	ScopeType      string    `bson:"scopeType" json:"scopeType"`
	BrandStoreID   string    `bson:"brandStoreId,omitempty" json:"brandStoreId,omitempty"`
	BrandName      string    `bson:"brandName,omitempty" json:"brandName,omitempty"`
	RegionID       string    `bson:"regionId,omitempty" json:"regionId,omitempty"`
	OfferID        string    `bson:"offerId,omitempty" json:"offerId,omitempty"`
	Status         string    `bson:"status" json:"status"`
	TotalCount     int       `bson:"totalCount" json:"totalCount"`
	ProcessedCount int       `bson:"processedCount" json:"processedCount"`
	CreatedCount   int       `bson:"createdCount" json:"createdCount"`
	UpdatedCount   int       `bson:"updatedCount" json:"updatedCount"`
	InactiveCount  int       `bson:"inactiveCount" json:"inactiveCount"`
	SuspectedCount int       `bson:"suspectedCount" json:"suspectedCount"`
	ErrorMessage   string    `bson:"errorMessage,omitempty" json:"errorMessage,omitempty"`
	StartedAt      time.Time `bson:"startedAt" json:"startedAt"`
	FinishedAt     time.Time `bson:"finishedAt,omitempty" json:"finishedAt,omitempty"`
}

// SyncChangeValue 保存一个 SKU 在同步前后的关键状态。
type SyncChangeValue struct {
	PriceCents         int64  `bson:"priceCents" json:"priceCents"`
	SourcePriceCents   int64  `bson:"sourcePriceCents" json:"sourcePriceCents"`
	ActivityPriceCents int64  `bson:"activityPriceCents" json:"activityPriceCents"`
	MarketPriceCents   int64  `bson:"marketPriceCents" json:"marketPriceCents"`
	Stock              int64  `bson:"stock" json:"stock"`
	Status             string `bson:"status,omitempty" json:"status,omitempty"`
}

// SyncChange 保存一次同步中一条可审计的商品或 SKU 变化。
type SyncChange struct {
	ID           string          `bson:"_id" json:"id"`
	RunID        string          `bson:"runId" json:"runId"`
	BrandStoreID string          `bson:"brandStoreId" json:"brandStoreId"`
	OfferID      string          `bson:"offerId" json:"offerId"`
	ProductID    string          `bson:"productId" json:"productId"`
	RegionID     string          `bson:"regionId" json:"regionId"`
	ItemNo       string          `bson:"itemNo" json:"itemNo"`
	ProductName  string          `bson:"productName" json:"productName"`
	ImageURL     string          `bson:"imageUrl,omitempty" json:"imageUrl,omitempty"`
	SKUID        string          `bson:"skuId" json:"skuId"`
	SKUCode      string          `bson:"skuCode,omitempty" json:"skuCode,omitempty"`
	VariantLabel string          `bson:"variantLabel" json:"variantLabel"`
	ChangeType   string          `bson:"changeType" json:"changeType"`
	Before       SyncChangeValue `bson:"before" json:"before"`
	After        SyncChangeValue `bson:"after" json:"after"`
	ChangedAt    time.Time       `bson:"changedAt" json:"changedAt"`
}

// InventoryRepository 管理本地商品库的集合与索引。
type InventoryRepository struct {
	regions             *mongo.Collection
	brands              *mongo.Collection
	brandStores         *mongo.Collection
	brandProfiles       *mongo.Collection
	brandProfileMembers *mongo.Collection
	offers              *mongo.Collection
	syncRuns            *mongo.Collection
	priceHistory        *mongo.Collection
	syncChanges         *mongo.Collection
}

// NewInventoryRepository 创建本地商品库仓储。
func NewInventoryRepository(database *mongo.Database) *InventoryRepository {
	return &InventoryRepository{
		regions:             database.Collection("catalog_regions"),
		brands:              database.Collection("catalog_brands"),
		brandStores:         database.Collection("catalog_brand_stores"),
		brandProfiles:       database.Collection("catalog_brand_profiles"),
		brandProfileMembers: database.Collection("catalog_brand_profile_members"),
		offers:              database.Collection("catalog_offers"),
		syncRuns:            database.Collection("catalog_sync_runs"),
		priceHistory:        database.Collection("catalog_sku_price_history"),
		syncChanges:         database.Collection("catalog_sync_changes"),
	}
}

// EnsureIndexes 创建本地查询和同步需要的索引。
func (repository *InventoryRepository) EnsureIndexes(ctx context.Context) error {
	indexGroups := []struct {
		collection *mongo.Collection
		models     []mongo.IndexModel
	}{
		{repository.regions, []mongo.IndexModel{{Keys: bson.D{{Key: "enabled", Value: 1}}}}},
		{repository.brands, []mongo.IndexModel{{Keys: bson.D{{Key: "normalizedName", Value: 1}}, Options: options.Index().SetUnique(true)}}},
		{repository.brandStores, []mongo.IndexModel{{Keys: bson.D{{Key: "regionId", Value: 1}, {Key: "distributorId", Value: 1}}, Options: options.Index().SetUnique(true)}, {Keys: bson.D{{Key: "syncEnabled", Value: 1}, {Key: "regionId", Value: 1}}}}},
		{repository.brandProfiles, []mongo.IndexModel{{Keys: bson.D{{Key: "updatedAt", Value: -1}}}}},
		{repository.brandProfileMembers, []mongo.IndexModel{{Keys: bson.D{{Key: "regionId", Value: 1}, {Key: "distributorId", Value: 1}}, Options: options.Index().SetUnique(true)}, {Keys: bson.D{{Key: "profileId", Value: 1}}}}},
		{repository.offers, []mongo.IndexModel{{Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "sourceItemId", Value: 1}}, Options: options.Index().SetUnique(true)}, {Keys: bson.D{{Key: "regionId", Value: 1}, {Key: "itemNo", Value: 1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "lastSeenAt", Value: -1}}}}},
		{repository.syncRuns, []mongo.IndexModel{{Keys: bson.D{{Key: "startedAt", Value: -1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "startedAt", Value: -1}}}}},
		{repository.priceHistory, []mongo.IndexModel{{Keys: bson.D{{Key: "offerId", Value: 1}, {Key: "skuId", Value: 1}, {Key: "observedAt", Value: 1}}}, {Keys: bson.D{{Key: "itemNo", Value: 1}, {Key: "observedAt", Value: -1}}}}},
		{repository.syncChanges, []mongo.IndexModel{{Keys: bson.D{{Key: "runId", Value: 1}, {Key: "changedAt", Value: -1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "changedAt", Value: -1}}}, {Keys: bson.D{{Key: "itemNo", Value: 1}, {Key: "changeType", Value: 1}}}}},
	}
	for _, indexGroup := range indexGroups {
		if _, err := indexGroup.collection.Indexes().CreateMany(ctx, indexGroup.models); err != nil {
			return err
		}
	}
	return nil
}

// InsertSyncChanges 批量保存同步变更明细。
func (repository *InventoryRepository) InsertSyncChanges(ctx context.Context, changes []SyncChange) error {
	if len(changes) == 0 {
		return nil
	}
	documents := make([]any, 0, len(changes))
	for _, change := range changes {
		documents = append(documents, change)
	}
	_, err := repository.syncChanges.InsertMany(ctx, documents, options.InsertMany().SetOrdered(false))
	return err
}

// ListSyncRuns 分页返回同步任务历史。
func (repository *InventoryRepository) ListSyncRuns(ctx context.Context, brandStoreID, regionID string, page, pageSize int) ([]SyncRun, int64, error) {
	filter := bson.M{"scopeType": "brand_store"}
	if brandStoreID != "" {
		filter["brandStoreId"] = brandStoreID
	}
	if brandStoreID == "" && regionID != "" && regionID != "all" {
		brandStoreIDs, err := repository.brandStores.Distinct(ctx, "_id", bson.M{"regionId": regionID})
		if err != nil {
			return nil, 0, err
		}
		filter["brandStoreId"] = bson.M{"$in": brandStoreIDs}
	}
	total, err := repository.syncRuns.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	cursor, err := repository.syncRuns.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "startedAt", Value: -1}}).SetSkip(int64((page-1)*pageSize)).SetLimit(int64(pageSize)))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	runs := make([]SyncRun, 0)
	if err := cursor.All(ctx, &runs); err != nil {
		return nil, 0, err
	}
	return runs, total, nil
}

// ListSyncChanges 分页返回一次同步的变更明细。
func (repository *InventoryRepository) ListSyncChanges(ctx context.Context, runID, changeType, keyword string, page, pageSize int) ([]SyncChange, int64, error) {
	filter := bson.M{"runId": runID}
	if changeType != "" && changeType != "all" {
		filter["changeType"] = changeType
	}
	if keyword != "" {
		filter["$or"] = bson.A{bson.M{"itemNo": bson.M{"$regex": keyword, "$options": "i"}}, bson.M{"productName": bson.M{"$regex": keyword, "$options": "i"}}, bson.M{"variantLabel": bson.M{"$regex": keyword, "$options": "i"}}}
	}
	total, err := repository.syncChanges.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	cursor, err := repository.syncChanges.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "changedAt", Value: -1}, {Key: "itemNo", Value: 1}}).SetSkip(int64((page-1)*pageSize)).SetLimit(int64(pageSize)))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	changes := make([]SyncChange, 0)
	if err := cursor.All(ctx, &changes); err != nil {
		return nil, 0, err
	}
	return changes, total, nil
}

// HasPriceHistory 判断商品是否已经建立价格历史基线。
func (repository *InventoryRepository) HasPriceHistory(ctx context.Context, offerID string) (bool, error) {
	count, err := repository.priceHistory.CountDocuments(ctx, bson.M{"offerId": offerID}, options.Count().SetLimit(1))
	return count > 0, err
}

// InsertPriceSnapshots 批量保存价格快照。
func (repository *InventoryRepository) InsertPriceSnapshots(ctx context.Context, snapshots []SKUPriceSnapshot) error {
	if len(snapshots) == 0 {
		return nil
	}
	documents := make([]any, 0, len(snapshots))
	for _, snapshot := range snapshots {
		documents = append(documents, snapshot)
	}
	_, err := repository.priceHistory.InsertMany(ctx, documents, options.InsertMany().SetOrdered(false))
	return err
}

// ListPriceHistory 返回商品按时间正序排列的全部 SKU 价格快照。
func (repository *InventoryRepository) ListPriceHistory(ctx context.Context, offerID string) ([]SKUPriceSnapshot, error) {
	cursor, err := repository.priceHistory.Find(ctx, bson.M{"offerId": offerID}, options.Find().SetSort(bson.D{{Key: "observedAt", Value: 1}, {Key: "skuId", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	snapshots := make([]SKUPriceSnapshot, 0)
	if err := cursor.All(ctx, &snapshots); err != nil {
		return nil, err
	}
	return snapshots, nil
}
