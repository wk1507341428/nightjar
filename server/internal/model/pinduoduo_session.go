package model

import "time"

// PinduoduoSession 保存加密后的拼多多商家后台 Cookie。
type PinduoduoSession struct {
	Platform            string    `bson:"_id"`
	EncryptedCredential string    `bson:"encryptedCredential"`
	UpdatedAt           time.Time `bson:"updatedAt"`
}
