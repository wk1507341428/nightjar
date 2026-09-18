package repository

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

// ErrPinduoduoSessionNotFound 表示尚未保存拼多多商家后台凭证。
var ErrPinduoduoSessionNotFound = errors.New("pinduoduo session not found")

// PinduoduoSessionRepository 管理加密后的拼多多商家后台凭证。
type PinduoduoSessionRepository struct {
	collection *mongo.Collection
}

// NewPinduoduoSessionRepository 创建拼多多会话仓储。
func NewPinduoduoSessionRepository(database *mongo.Database) *PinduoduoSessionRepository {
	return &PinduoduoSessionRepository{collection: database.Collection("pinduoduo_sessions")}
}

// Save 保存或更新拼多多凭证。
func (repository *PinduoduoSessionRepository) Save(ctx context.Context, session model.PinduoduoSession) error {
	_, err := repository.collection.UpdateOne(
		ctx,
		bson.M{"_id": model.PinduoduoPlatform},
		bson.M{"$set": session},
		options.Update().SetUpsert(true),
	)
	return err
}

// Get 读取拼多多凭证。
func (repository *PinduoduoSessionRepository) Get(ctx context.Context) (model.PinduoduoSession, error) {
	var session model.PinduoduoSession
	err := repository.collection.FindOne(ctx, bson.M{"_id": model.PinduoduoPlatform}).Decode(&session)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.PinduoduoSession{}, ErrPinduoduoSessionNotFound
	}
	return session, err
}

// Delete 删除拼多多凭证。
func (repository *PinduoduoSessionRepository) Delete(ctx context.Context) error {
	_, err := repository.collection.DeleteOne(ctx, bson.M{"_id": model.PinduoduoPlatform})
	return err
}
