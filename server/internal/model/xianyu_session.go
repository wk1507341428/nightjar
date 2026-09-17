package model

import "time"

// XianyuSession 保存加密后的闲鱼会话，不保存明文 Cookie。
type XianyuSession struct {
	Platform        string    `bson:"_id"`
	EncryptedCookie string    `bson:"encryptedCookie"`
	DisplayName     string    `bson:"displayName,omitempty"`
	UpdatedAt       time.Time `bson:"updatedAt"`
}
