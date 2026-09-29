package model

import "time"

const (
	// DefaultXianyuAccountID 是历史单账号数据迁移后的默认账号。
	DefaultXianyuAccountID = "default"
	// XianyuAccountActive 表示账号可以创建和执行任务。
	XianyuAccountActive = "active"
	// XianyuAccountPaused 表示账号队列已暂停。
	XianyuAccountPaused = "paused"
	// XianyuAccountDisabled 表示账号已停用。
	XianyuAccountDisabled = "disabled"
)

// XianyuAccount 保存一个闲鱼账号的公开信息和运行状态。
type XianyuAccount struct {
	ID                 string     `bson:"_id" json:"id"`
	Name               string     `bson:"name" json:"name"`
	DisplayName        string     `bson:"displayName,omitempty" json:"displayName,omitempty"`
	PlatformUserID     string     `bson:"platformUserId,omitempty" json:"platformUserId,omitempty"`
	Status             string     `bson:"status" json:"status"`
	IsDefault          bool       `bson:"isDefault,omitempty" json:"isDefault"`
	SessionConnected   bool       `bson:"sessionConnected,omitempty" json:"sessionConnected"`
	SellerConnected    bool       `bson:"sellerConnected,omitempty" json:"sellerConnected"`
	SearchReady        bool       `bson:"searchReady,omitempty" json:"searchReady"`
	LastVerifiedAt     *time.Time `bson:"lastVerifiedAt,omitempty" json:"lastVerifiedAt,omitempty"`
	LastSellerVerified *time.Time `bson:"lastSellerVerifiedAt,omitempty" json:"lastSellerVerifiedAt,omitempty"`
	LastSyncedAt       *time.Time `bson:"lastSyncedAt,omitempty" json:"lastSyncedAt,omitempty"`
	CreatedAt          time.Time  `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time  `bson:"updatedAt" json:"updatedAt"`
}
