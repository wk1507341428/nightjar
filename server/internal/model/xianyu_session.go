package model

import "time"

// XianyuSession 保存加密后的闲鱼会话，不保存明文 Cookie。
type XianyuSession struct {
	Platform                  string    `bson:"_id"`
	AccountID                 string    `bson:"accountId,omitempty"`
	EncryptedCookie           string    `bson:"encryptedCookie"`
	EncryptedSearchCredential string    `bson:"encryptedSearchCredential,omitempty"`
	DisplayName               string    `bson:"displayName,omitempty"`
	PlatformUserID            string    `bson:"platformUserId,omitempty"`
	CredentialVersion         int64     `bson:"credentialVersion,omitempty"`
	UpdatedAt                 time.Time `bson:"updatedAt"`
}
