package model

import "time"

const (
	PublishBatchPreparing = "preparing"
	PublishBatchRunning   = "running"
	PublishBatchCompleted = "completed"
	PublishBatchFailed    = "failed"
)

// PublishBatchSkip 保存批量发布时自动跳过的一件商品。
type PublishBatchSkip struct {
	ItemNo string `bson:"itemNo" json:"itemNo"`
	Title  string `bson:"title" json:"title"`
	Reason string `bson:"reason" json:"reason"`
}

// PublishBatch 保存一次品牌批量发布计划。
type PublishBatch struct {
	ID              string             `bson:"_id" json:"id"`
	BrandStoreID    string             `bson:"brandStoreId" json:"brandStoreId"`
	BrandName       string             `bson:"brandName" json:"brandName"`
	RegionID        string             `bson:"regionId" json:"regionId"`
	CategoryIDs     []string           `bson:"categoryIds,omitempty" json:"categoryIds,omitempty"`
	CategoryNames   []string           `bson:"categoryNames,omitempty" json:"categoryNames,omitempty"`
	Limit           int                `bson:"limit" json:"limit"`
	MinDelaySeconds int                `bson:"minDelaySeconds" json:"minDelaySeconds"`
	MaxDelaySeconds int                `bson:"maxDelaySeconds" json:"maxDelaySeconds"`
	TaskIDs         []string           `bson:"taskIds" json:"taskIds"`
	Skipped         []PublishBatchSkip `bson:"skipped" json:"skipped"`
	Status          string             `bson:"status" json:"status"`
	ErrorMessage    string             `bson:"errorMessage,omitempty" json:"errorMessage,omitempty"`
	CreatedAt       time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time          `bson:"updatedAt" json:"updatedAt"`
}
