package catalog

import "time"

const (
	SyncCenterRunning       = "running"
	SyncCenterComplete      = "complete"
	SyncCenterFailed        = "failed"
	SyncCenterInterrupted   = "interrupted"
	SyncCenterStageLists    = "lists"
	SyncCenterStageDetails  = "details"
	SyncCenterStageActivate = "activate"
)

// SyncCenterRun tracks an explicit complete-brand snapshot; failed runs never become authoritative.
type SyncCenterRun struct {
	StabilityError  string               `bson:"stabilityError,omitempty" json:"stabilityError,omitempty"`
	WorkFingerprint string               `bson:"workFingerprint" json:"-"`
	Members         []BrandProfileMember `bson:"members" json:"-"`
	ID              string               `bson:"_id" json:"id"`
	ProfileID       string               `bson:"profileId" json:"profileId"`
	ProfileName     string               `bson:"profileName" json:"profileName"`
	Status          string               `bson:"status" json:"status"`
	Stage           string               `bson:"stage" json:"stage"`
	Total           int                  `bson:"total" json:"total"`
	Processed       int                  `bson:"processed" json:"processed"`
	ProductCount    int                  `bson:"productCount" json:"productCount"`
	SKUCount        int                  `bson:"skuCount" json:"skuCount"`
	Error           string               `bson:"error,omitempty" json:"error,omitempty"`
	StartedAt       time.Time            `bson:"startedAt" json:"startedAt"`
	UpdatedAt       time.Time            `bson:"updatedAt" json:"updatedAt"`
	FinishedAt      *time.Time           `bson:"finishedAt,omitempty" json:"finishedAt,omitempty"`
}

// SyncCenterProduct retains the complete source document, including every original SKU.
type SyncCenterProduct struct {
	XianyuListed  bool           `bson:"xianyuListed,omitempty" json:"-"`
	ItemNoKey     string         `bson:"itemNoKey" json:"itemNoKey"`
	DiscountRate  float64        `bson:"discountRate" json:"discountRate"`
	Stock         int64          `bson:"stock" json:"stock"`
	PriceCents    int64          `bson:"priceCents" json:"priceCents"`
	CategoryIDs   []string       `bson:"categoryIds" json:"categoryIds"`
	ID            string         `bson:"_id" json:"id"`
	ProfileID     string         `bson:"profileId" json:"profileId"`
	Generation    string         `bson:"generation" json:"generation"`
	RegionID      string         `bson:"regionId" json:"regionId"`
	DistributorID string         `bson:"distributorId" json:"distributorId"`
	ItemID        string         `bson:"itemId" json:"itemId"`
	ItemNo        string         `bson:"itemNo" json:"itemNo"`
	Name          string         `bson:"name" json:"name"`
	Data          map[string]any `bson:"data" json:"data"`
	SyncedAt      time.Time      `bson:"syncedAt" json:"syncedAt"`
}

// SyncCenterSKU is one region/store SKU; raw preserves source prices, status and specification fields.
type SyncCenterSKU struct {
	ProfileName        string    `bson:"profileName" json:"profileName"`
	Name               string    `bson:"name" json:"name"`
	SourceItemID       string    `bson:"sourceItemId" json:"sourceItemId"`
	SKUCode            string    `bson:"skuCode" json:"skuCode"`
	ActivityPriceCents int64     `bson:"activityPriceCents" json:"activityPriceCents"`
	SaleStatus         string    `bson:"saleStatus" json:"saleStatus"`
	AvailableStock     int64     `bson:"availableStock" json:"availableStock"`
	CategoryIDs        []string  `bson:"categoryIds" json:"categoryIds"`
	ObservedAt         time.Time `bson:"observedAt" json:"observedAt"`

	ID            string         `bson:"_id" json:"id"`
	ProfileID     string         `bson:"profileId" json:"profileId"`
	Generation    string         `bson:"generation" json:"generation"`
	ProductID     string         `bson:"productId" json:"productId"`
	RegionID      string         `bson:"regionId" json:"regionId"`
	DistributorID string         `bson:"distributorId" json:"distributorId"`
	ItemNo        string         `bson:"itemNo" json:"itemNo"`
	SourceSKUID   string         `bson:"sourceSkuId" json:"skuId"`
	Label         string         `bson:"label" json:"variantLabel"`
	Stock         int64          `bson:"stock" json:"stock"`
	PriceCents    int64          `bson:"priceCents" json:"priceCents"`
	MarketCents   int64          `bson:"marketCents" json:"marketPriceCents"`
	Raw           map[string]any `bson:"raw" json:"raw"`
	SyncedAt      time.Time      `bson:"syncedAt" json:"syncedAt"`
}

type SyncCenterSnapshot struct {
	ProfileID    string               `bson:"_id" json:"profileId"`
	Generation   string               `bson:"generation" json:"generation"`
	SyncedAt     time.Time            `bson:"syncedAt" json:"syncedAt"`
	Members      []BrandProfileMember `bson:"members" json:"members"`
	ProductCount int                  `bson:"productCount" json:"productCount"`
	SKUCount     int                  `bson:"skuCount" json:"skuCount"`
	Products     []SyncCenterProduct  `bson:"-" json:"products"`
}

type SyncCenterSearchResult struct {
	List     []SyncCenterProduct `json:"list"`
	Total    int64               `json:"total"`
	Page     int                 `json:"page"`
	PageSize int                 `json:"pageSize"`
}

type SyncCenterProductSearch struct {
	AccountID     string
	ProfileID     string
	Keyword       string
	RegionID      string
	DistributorID string
	CategoryIDs   []string
	StockOnly     bool
	Page          int
	PageSize      int
	Sort          string
}
