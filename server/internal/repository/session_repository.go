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
	legacyID   string
	accountID  string
}

// NewSessionRepository 创建闲鱼会话仓储。
func NewSessionRepository(database *mongo.Database) *SessionRepository {
	return &SessionRepository{collection: database.Collection("xianyu_sessions"), sessionID: model.XianyuPlatform, legacyID: model.XianyuPlatform, accountID: model.DefaultXianyuAccountID}
}

// NewSellerSessionRepository 创建卖家工作台专用会话仓储。
func NewSellerSessionRepository(database *mongo.Database) *SessionRepository {
	return &SessionRepository{collection: database.Collection("xianyu_seller_sessions"), sessionID: model.XianyuSellerPlatform, legacyID: model.XianyuSellerPlatform, accountID: model.DefaultXianyuAccountID}
}

// ForAccount 返回绑定到指定账号的会话仓储。
func (repository *SessionRepository) ForAccount(accountID string) *SessionRepository {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	return &SessionRepository{collection: repository.collection, sessionID: accountID, legacyID: repository.legacyID, accountID: accountID}
}

// Save 保存或更新加密会话。
func (repository *SessionRepository) Save(ctx context.Context, session model.XianyuSession) error {
	session.Platform = repository.sessionID
	session.AccountID = repository.accountID
	_, err := repository.collection.UpdateOne(
		ctx,
		bson.M{"_id": repository.sessionID},
		bson.M{"$set": session},
		options.Update().SetUpsert(true),
	)
	return err
}

// SaveIfVersion 仅在凭证版本未变化时回写请求中刷新后的 Cookie。
func (repository *SessionRepository) SaveIfVersion(ctx context.Context, session model.XianyuSession, expectedVersion int64) (bool, error) {
	session.Platform = repository.sessionID
	session.AccountID = repository.accountID
	versionFilter := bson.A{bson.M{"credentialVersion": expectedVersion}}
	if expectedVersion == 0 {
		versionFilter = append(versionFilter, bson.M{"credentialVersion": bson.M{"$exists": false}})
	}
	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": repository.sessionID, "$or": versionFilter}, bson.M{"$set": session})
	if err != nil {
		return false, err
	}
	return result.ModifiedCount == 1, nil
}

// Get 读取加密会话。
func (repository *SessionRepository) Get(ctx context.Context) (model.XianyuSession, error) {
	var session model.XianyuSession
	err := repository.collection.FindOne(ctx, bson.M{"_id": repository.sessionID}).Decode(&session)
	if errors.Is(err, mongo.ErrNoDocuments) && repository.accountID == model.DefaultXianyuAccountID && repository.sessionID != repository.legacyID {
		err = repository.collection.FindOne(ctx, bson.M{"_id": repository.legacyID}).Decode(&session)
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.XianyuSession{}, ErrSessionNotFound
	}
	return session, err
}

// Delete 删除闲鱼会话。
func (repository *SessionRepository) Delete(ctx context.Context) error {
	_, err := repository.collection.DeleteOne(ctx, bson.M{"_id": repository.sessionID})
	if err == nil && repository.accountID == model.DefaultXianyuAccountID && repository.sessionID != repository.legacyID {
		_, err = repository.collection.DeleteOne(ctx, bson.M{"_id": repository.legacyID})
	}
	return err
}
