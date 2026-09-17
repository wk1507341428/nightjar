package model

import "time"

const (
	PublishTaskQueued     = "queued"
	PublishTaskPreparing  = "preparing"
	PublishTaskPublishing = "publishing"
	PublishTaskNeedsLogin = "needs_login"
	PublishTaskSucceeded  = "succeeded"
	PublishTaskFailed     = "failed"
)

// PublishTask 保存一次闲鱼发布任务及其结果，不包含任何登录凭证。
type PublishTask struct {
	ID                 string    `bson:"_id" json:"id"`
	SourceItemID       string    `bson:"sourceItemId" json:"sourceItemId"`
	ItemNo             string    `bson:"itemNo" json:"itemNo"`
	Title              string    `bson:"title" json:"title"`
	Description        string    `bson:"description" json:"description"`
	PriceCents         int64     `bson:"priceCents" json:"priceCents"`
	OriginalPriceCents int64     `bson:"originalPriceCents" json:"originalPriceCents"`
	ImageURLs          []string  `bson:"imageUrls" json:"imageUrls"`
	RegionID           string    `bson:"regionId" json:"regionId"`
	Brand              string    `bson:"brand,omitempty" json:"brand,omitempty"`
	Condition          string    `bson:"condition,omitempty" json:"condition,omitempty"`
	AvailableSizes     []string  `bson:"availableSizes,omitempty" json:"availableSizes,omitempty"`
	IsFootwear         bool      `bson:"isFootwear" json:"isFootwear"`
	Status             string    `bson:"status" json:"status"`
	XianyuItemID       string    `bson:"xianyuItemId,omitempty" json:"xianyuItemId,omitempty"`
	XianyuURL          string    `bson:"xianyuUrl,omitempty" json:"xianyuUrl,omitempty"`
	ErrorMessage       string    `bson:"errorMessage,omitempty" json:"errorMessage,omitempty"`
	CreatedAt          time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time `bson:"updatedAt" json:"updatedAt"`
}
