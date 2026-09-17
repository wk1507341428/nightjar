package model

import "time"

// MarketplaceListing 保存第三方渠道当前在售商品，不保留下架状态。
type MarketplaceListing struct {
	ID             string    `bson:"_id" json:"id"`
	Platform       string    `bson:"platform" json:"platform"`
	PlatformItemID string    `bson:"platformItemId" json:"platformItemId"`
	SourceItemID   string    `bson:"sourceItemId,omitempty" json:"sourceItemId,omitempty"`
	ItemNo         string    `bson:"itemNo,omitempty" json:"itemNo,omitempty"`
	Title          string    `bson:"title" json:"title"`
	PriceCents     int64     `bson:"priceCents" json:"priceCents"`
	ImageURL       string    `bson:"imageUrl,omitempty" json:"imageUrl,omitempty"`
	ItemURL        string    `bson:"itemUrl,omitempty" json:"itemUrl,omitempty"`
	ListedAt       time.Time `bson:"listedAt" json:"listedAt"`
	LastSyncedAt   time.Time `bson:"lastSyncedAt" json:"lastSyncedAt"`
}
