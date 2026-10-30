package catalog

import "time"

const syncMetadataVersion = 1

// SyncCenterBrand is published last: readers never consume a partial metadata generation.
type SyncCenterBrand struct {
	ID            string    `bson:"_id" json:"id"`
	ProfileID     string    `bson:"profileId" json:"profileId"`
	Generation    string    `bson:"generation" json:"generation"`
	Name          string    `bson:"name" json:"name"`
	LogoURL       string    `bson:"logoUrl" json:"logoUrl,omitempty"`
	SyncedAt      time.Time `bson:"syncedAt" json:"syncedAt"`
	Version       int       `bson:"version" json:"version"`
	StoreCount    int       `bson:"storeCount" json:"storeCount"`
	CategoryCount int       `bson:"categoryCount" json:"categoryCount"`
}

type SyncCenterStore struct {
	ID               string    `bson:"_id" json:"id"`
	ProfileID        string    `bson:"profileId" json:"profileId"`
	Generation       string    `bson:"generation" json:"generation"`
	RegionID         string    `bson:"regionId" json:"regionId"`
	DistributorID    string    `bson:"distributorId" json:"distributorId"`
	BrandName        string    `bson:"brandName" json:"brandName"`
	StoreName        string    `bson:"storeName" json:"storeName,omitempty"`
	ShopCode         string    `bson:"shopCode" json:"shopCode,omitempty"`
	LogoURL          string    `bson:"logoUrl" json:"logoUrl,omitempty"`
	OnlineGoodsCount int       `bson:"onlineGoodsCount" json:"onlineGoodsCount"`
	SyncedAt         time.Time `bson:"syncedAt" json:"syncedAt"`
}

// SyncCenterCategory retains region-specific identities, hierarchy and the full original category node.
type SyncCenterCategory struct {
	ID            string         `bson:"_id" json:"id"`
	ProfileID     string         `bson:"profileId" json:"profileId"`
	Generation    string         `bson:"generation" json:"generation"`
	RegionID      string         `bson:"regionId" json:"regionId"`
	DistributorID string         `bson:"distributorId" json:"distributorId"`
	System        string         `bson:"system" json:"system"`
	CategoryID    string         `bson:"categoryId" json:"categoryId"`
	ParentID      string         `bson:"parentId" json:"parentId,omitempty"`
	Depth         int            `bson:"depth" json:"depth"`
	Level         string         `bson:"level" json:"level,omitempty"`
	Path          string         `bson:"path" json:"path,omitempty"`
	Name          string         `bson:"name" json:"name"`
	ImageURL      string         `bson:"imageUrl" json:"imageUrl,omitempty"`
	Display       bool           `bson:"display" json:"display"`
	Raw           map[string]any `bson:"raw" json:"raw"`
	SyncedAt      time.Time      `bson:"syncedAt" json:"syncedAt"`
}

type SyncCenterMetadata struct {
	Brand      SyncCenterBrand      `json:"brand"`
	Stores     []SyncCenterStore    `json:"stores"`
	Categories []SyncCenterCategory `json:"categories"`
}

type SyncCenterMetadataBackfillResult struct {
	ProfileID  string `json:"profileId"`
	Generation string `json:"generation"`
	Products   int    `json:"products"`
	Stores     int    `json:"stores"`
	Categories int    `json:"categories"`
	Error      string `json:"error,omitempty"`
}
