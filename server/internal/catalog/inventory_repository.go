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
	OfferID        string    `bson:"offerId,omitempty" json:"offerId,omitempty"`
	Status         string    `bson:"status" json:"status"`
	TotalCount     int       `bson:"totalCount" json:"totalCount"`
	CreatedCount   int       `bson:"createdCount" json:"createdCount"`
	UpdatedCount   int       `bson:"updatedCount" json:"updatedCount"`
	InactiveCount  int       `bson:"inactiveCount" json:"inactiveCount"`
	SuspectedCount int       `bson:"suspectedCount" json:"suspectedCount"`
	ErrorMessage   string    `bson:"errorMessage,omitempty" json:"errorMessage,omitempty"`
	StartedAt      time.Time `bson:"startedAt" json:"startedAt"`
	FinishedAt     time.Time `bson:"finishedAt,omitempty" json:"finishedAt,omitempty"`
}

// InventoryRepository 管理本地商品库的集合与索引。
type InventoryRepository struct {
	regions      *mongo.Collection
	brands       *mongo.Collection
	brandStores  *mongo.Collection
	offers       *mongo.Collection
	syncRuns     *mongo.Collection
	priceHistory *mongo.Collection
}

// NewInventoryRepository 创建本地商品库仓储。
func NewInventoryRepository(database *mongo.Database) *InventoryRepository {
	return &InventoryRepository{
		regions:      database.Collection("catalog_regions"),
		brands:       database.Collection("catalog_brands"),
		brandStores:  database.Collection("catalog_brand_stores"),
		offers:       database.Collection("catalog_offers"),
		syncRuns:     database.Collection("catalog_sync_runs"),
		priceHistory: database.Collection("catalog_sku_price_history"),
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
		{repository.offers, []mongo.IndexModel{{Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "sourceItemId", Value: 1}}, Options: options.Index().SetUnique(true)}, {Keys: bson.D{{Key: "regionId", Value: 1}, {Key: "itemNo", Value: 1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "lastSeenAt", Value: -1}}}}},
		{repository.syncRuns, []mongo.IndexModel{{Keys: bson.D{{Key: "startedAt", Value: -1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "startedAt", Value: -1}}}}},
		{repository.priceHistory, []mongo.IndexModel{{Keys: bson.D{{Key: "offerId", Value: 1}, {Key: "skuId", Value: 1}, {Key: "observedAt", Value: 1}}}, {Keys: bson.D{{Key: "itemNo", Value: 1}, {Key: "observedAt", Value: -1}}}}},
	}
	for _, indexGroup := range indexGroups {
		if _, err := indexGroup.collection.Indexes().CreateMany(ctx, indexGroup.models); err != nil {
			return err
		}
	}
	return nil
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
