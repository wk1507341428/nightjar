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

// CatalogProduct 是按照品牌与货号归一的商品主档。
type CatalogProduct struct {
	ID        string    `bson:"_id" json:"id"`
	BrandID   string    `bson:"brandId" json:"brandId"`
	ItemNo    string    `bson:"itemNo" json:"itemNo"`
	Name      string    `bson:"name" json:"name"`
	MainImage string    `bson:"mainImage,omitempty" json:"mainImage,omitempty"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
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

// CatalogSKU 保存地区商品下的可售规格。
type CatalogSKU struct {
	ID            string    `bson:"_id" json:"id"`
	OfferID       string    `bson:"offerId" json:"offerId"`
	SourceSKUId   string    `bson:"sourceSkuId" json:"sourceSkuId"`
	Size          string    `bson:"size,omitempty" json:"size,omitempty"`
	Color         string    `bson:"color,omitempty" json:"color,omitempty"`
	PriceCents    int64     `bson:"priceCents" json:"priceCents"`
	ActivityCents int64     `bson:"activityCents" json:"activityCents"`
	MarketCents   int64     `bson:"marketCents" json:"marketCents"`
	Stock         int64     `bson:"stock" json:"stock"`
	SaleStatus    string    `bson:"saleStatus" json:"saleStatus"`
	LastSeenAt    time.Time `bson:"lastSeenAt" json:"lastSeenAt"`
	LastSyncedAt  time.Time `bson:"lastSyncedAt" json:"lastSyncedAt"`
}

// PriceHistory 只在商品价格发生变化时记录一次。
type PriceHistory struct {
	ID             string    `bson:"_id" json:"id"`
	OfferID        string    `bson:"offerId" json:"offerId"`
	OldPriceCents  int64     `bson:"oldPriceCents" json:"oldPriceCents"`
	NewPriceCents  int64     `bson:"newPriceCents" json:"newPriceCents"`
	OldActivityCts int64     `bson:"oldActivityCents" json:"oldActivityCents"`
	NewActivityCts int64     `bson:"newActivityCents" json:"newActivityCents"`
	ChangedAt      time.Time `bson:"changedAt" json:"changedAt"`
	SyncRunID      string    `bson:"syncRunId" json:"syncRunId"`
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
	products     *mongo.Collection
	offers       *mongo.Collection
	skus         *mongo.Collection
	priceHistory *mongo.Collection
	syncRuns     *mongo.Collection
}

// NewInventoryRepository 创建本地商品库仓储。
func NewInventoryRepository(database *mongo.Database) *InventoryRepository {
	return &InventoryRepository{
		regions:      database.Collection("catalog_regions"),
		brands:       database.Collection("catalog_brands"),
		brandStores:  database.Collection("catalog_brand_stores"),
		products:     database.Collection("catalog_products"),
		offers:       database.Collection("catalog_offers"),
		skus:         database.Collection("catalog_skus"),
		priceHistory: database.Collection("catalog_price_history"),
		syncRuns:     database.Collection("catalog_sync_runs"),
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
		{repository.products, []mongo.IndexModel{{Keys: bson.D{{Key: "brandId", Value: 1}, {Key: "itemNo", Value: 1}}, Options: options.Index().SetUnique(true)}}},
		{repository.offers, []mongo.IndexModel{{Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "sourceItemId", Value: 1}}, Options: options.Index().SetUnique(true)}, {Keys: bson.D{{Key: "regionId", Value: 1}, {Key: "itemNo", Value: 1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "lastSeenAt", Value: -1}}}}},
		{repository.skus, []mongo.IndexModel{{Keys: bson.D{{Key: "offerId", Value: 1}, {Key: "sourceSkuId", Value: 1}}, Options: options.Index().SetUnique(true)}}},
		{repository.priceHistory, []mongo.IndexModel{{Keys: bson.D{{Key: "offerId", Value: 1}, {Key: "changedAt", Value: -1}}}}},
		{repository.syncRuns, []mongo.IndexModel{{Keys: bson.D{{Key: "startedAt", Value: -1}}}, {Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "startedAt", Value: -1}}}}},
	}
	for _, indexGroup := range indexGroups {
		if _, err := indexGroup.collection.Indexes().CreateMany(ctx, indexGroup.models); err != nil {
			return err
		}
	}
	return nil
}
