package model

import "time"

const (
	PublishPresetUpdateOnly    = "update_only"
	PublishPresetPublishUpdate = "publish_update"
	PublishPresetFull          = "full"
)

// PublishPresetRule 保存一个常用方案中的品牌、品类与操作范围。
type PublishPresetRule struct {
	ID                     string   `bson:"id" json:"id"`
	SourceType             string   `bson:"sourceType" json:"sourceType"`
	BrandProfileID         string   `bson:"brandProfileId,omitempty" json:"brandProfileId,omitempty"`
	BrandStoreID           string   `bson:"brandStoreId,omitempty" json:"brandStoreId,omitempty"`
	DistributorID          string   `bson:"distributorId,omitempty" json:"distributorId,omitempty"`
	BrandName              string   `bson:"brandName" json:"brandName"`
	RegionID               string   `bson:"regionId" json:"regionId"`
	CategoryIDs            []string `bson:"categoryIds" json:"categoryIds"`
	CategoryNames          []string `bson:"categoryNames" json:"categoryNames"`
	Limit                  int      `bson:"limit" json:"limit"`
	MinDelaySeconds        int      `bson:"minDelaySeconds" json:"minDelaySeconds"`
	MaxDelaySeconds        int      `bson:"maxDelaySeconds" json:"maxDelaySeconds"`
	MinPriceCents          int64    `bson:"minPriceCents,omitempty" json:"minPriceCents,omitempty"`
	MaxPriceCents          int64    `bson:"maxPriceCents,omitempty" json:"maxPriceCents,omitempty"`
	MinDiscountRate        int      `bson:"minDiscountRate,omitempty" json:"minDiscountRate,omitempty"`
	MaxDiscountRate        int      `bson:"maxDiscountRate,omitempty" json:"maxDiscountRate,omitempty"`
	ExcludeBrokenSizeItems bool     `bson:"excludeBrokenSizeItems,omitempty" json:"excludeBrokenSizeItems,omitempty"`
	ActionMode             string   `bson:"actionMode" json:"actionMode"`
}

// PublishPreset 保存当前闲鱼账号可复用的一组发布规则。
type PublishPreset struct {
	ID        string              `bson:"_id" json:"id"`
	AccountID string              `bson:"accountId" json:"accountId"`
	Name      string              `bson:"name" json:"name"`
	Rules     []PublishPresetRule `bson:"rules" json:"rules"`
	CreatedAt time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time           `bson:"updatedAt" json:"updatedAt"`
}
