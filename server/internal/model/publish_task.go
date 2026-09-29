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
	AccountID              string           `bson:"accountId" json:"accountId"`
	RetryRequested         bool             `bson:"retryRequested,omitempty" json:"-"`
	Quantity               int64            `bson:"quantity,omitempty" json:"quantity,omitempty"`
	Action                 string           `bson:"action,omitempty" json:"action,omitempty"`
	Before                 map[string]any   `bson:"before,omitempty" json:"before,omitempty"`
	ChangeReasons          []string         `bson:"changeReasons,omitempty" json:"changeReasons,omitempty"`
	PlannedAt              time.Time        `bson:"plannedAt,omitempty" json:"plannedAt,omitempty"`
	ID                     string           `bson:"_id" json:"id"`
	BatchID                string           `bson:"batchId,omitempty" json:"batchId,omitempty"`
	SourceItemID           string           `bson:"sourceItemId" json:"sourceItemId"`
	ItemNo                 string           `bson:"itemNo" json:"itemNo"`
	Title                  string           `bson:"title" json:"title"`
	Description            string           `bson:"description" json:"description"`
	PriceCents             int64            `bson:"priceCents" json:"priceCents"`
	OriginalPriceCents     int64            `bson:"originalPriceCents" json:"originalPriceCents"`
	ImageURLs              []string         `bson:"imageUrls" json:"imageUrls"`
	RegionID               string           `bson:"regionId" json:"regionId"`
	Brand                  string           `bson:"brand,omitempty" json:"brand,omitempty"`
	BrandProfileID         string           `bson:"brandProfileId,omitempty" json:"brandProfileId,omitempty"`
	SegmentID              string           `bson:"segmentId,omitempty" json:"segmentId,omitempty"`
	SourceType             string           `bson:"sourceType,omitempty" json:"sourceType,omitempty"`
	SourceRegions          []string         `bson:"sourceRegions,omitempty" json:"sourceRegions,omitempty"`
	SourceMemberIDs        []string         `bson:"sourceMemberIds,omitempty" json:"sourceMemberIds,omitempty"`
	SourceItemIDs          []string         `bson:"sourceItemIds,omitempty" json:"sourceItemIds,omitempty"`
	Condition              string           `bson:"condition,omitempty" json:"condition,omitempty"`
	AvailableSizes         []string         `bson:"availableSizes,omitempty" json:"availableSizes,omitempty"`
	Variants               []PublishVariant `bson:"variants,omitempty" json:"variants,omitempty"`
	IsFootwear             bool             `bson:"isFootwear" json:"isFootwear"`
	MinDelaySeconds        int              `bson:"minDelaySeconds,omitempty" json:"minDelaySeconds,omitempty"`
	MaxDelaySeconds        int              `bson:"maxDelaySeconds,omitempty" json:"maxDelaySeconds,omitempty"`
	Status                 string           `bson:"status" json:"status"`
	XianyuItemID           string           `bson:"xianyuItemId,omitempty" json:"xianyuItemId,omitempty"`
	DuplicateXianyuItemIDs []string         `bson:"duplicateXianyuItemIds,omitempty" json:"duplicateXianyuItemIds,omitempty"`
	XianyuURL              string           `bson:"xianyuUrl,omitempty" json:"xianyuUrl,omitempty"`
	ErrorMessage           string           `bson:"errorMessage,omitempty" json:"errorMessage,omitempty"`
	CreatedAt              time.Time        `bson:"createdAt" json:"createdAt"`
	UpdatedAt              time.Time        `bson:"updatedAt" json:"updatedAt"`
}

// PublishVariant 保存买家下单时可选择的一种销售规格。
type PublishVariant struct {
	PriceCents int64                    `bson:"priceCents" json:"priceCents"`
	Quantity   int64                    `bson:"quantity" json:"quantity"`
	Properties []PublishVariantProperty `bson:"properties" json:"properties"`
}

// PublishVariantProperty 保存销售规格的属性名称和值。
type PublishVariantProperty struct {
	Name  string `bson:"name" json:"name"`
	Value string `bson:"value" json:"value"`
}
