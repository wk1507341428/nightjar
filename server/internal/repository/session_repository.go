package repository

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

// ErrSessionNotFound 表示尚未保存闲鱼登录会话。
var ErrSessionNotFound = errors.New("xianyu session not found")

// SessionRepository 管理加密后的闲鱼登录会话。
type SessionRepository struct {
	collection *mongo.Collection
	sessionID  string
}

// NewSessionRepository 创建闲鱼会话仓储。
func NewSessionRepository(database *mongo.Database) *SessionRepository {
	return &SessionRepository{collection: database.Collection("xianyu_sessions"), sessionID: model.XianyuPlatform}
}

// NewSellerSessionRepository 创建卖家工作台专用会话仓储。
func NewSellerSessionRepository(database *mongo.Database) *SessionRepository {
	return &SessionRepository{collection: database.Collection("xianyu_seller_sessions"), sessionID: model.XianyuSellerPlatform}
}

// Save 保存或更新加密会话。
func (repository *SessionRepository) Save(ctx context.Context, session model.XianyuSession) error {
	_, err := repository.collection.UpdateOne(
		ctx,
		bson.M{"_id": repository.sessionID},
		bson.M{"$set": session},
		options.Update().SetUpsert(true),
	)
	return err
}

// Get 读取加密会话。
func (repository *SessionRepository) Get(ctx context.Context) (model.XianyuSession, error) {
	var session model.XianyuSession
	err := repository.collection.FindOne(ctx, bson.M{"_id": repository.sessionID}).Decode(&session)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.XianyuSession{}, ErrSessionNotFound
	}
	return session, err
}

// Delete 删除闲鱼会话。
func (repository *SessionRepository) Delete(ctx context.Context) error {
	_, err := repository.collection.DeleteOne(ctx, bson.M{"_id": repository.sessionID})
	return err
}
