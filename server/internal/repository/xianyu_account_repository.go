package repository

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

// ErrXianyuAccountNotFound 表示闲鱼账号不存在。
var ErrXianyuAccountNotFound = errors.New("xianyu account not found")

// XianyuAccountRepository 管理闲鱼账号公开信息和运行状态。
type XianyuAccountRepository struct{ collection *mongo.Collection }

// NewXianyuAccountRepository 创建闲鱼账号仓储。
func NewXianyuAccountRepository(database *mongo.Database) *XianyuAccountRepository {
	// xianyu_accounts 是早期浏览器登录状态集合；多账号档案使用独立集合避免误迁移。
	return &XianyuAccountRepository{collection: database.Collection("xianyu_managed_accounts")}
}

// EnsureIndexes 创建账号身份查询索引。
func (repository *XianyuAccountRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "platformUserId", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true)},
		{Keys: bson.D{{Key: "updatedAt", Value: -1}}},
	})
	return err
}

// EnsureDefault 创建或补齐历史单账号对应的默认账号。
func (repository *XianyuAccountRepository) EnsureDefault(ctx context.Context) error {
	now := time.Now()
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": model.DefaultXianyuAccountID}, bson.M{
		"$setOnInsert": bson.M{"name": "默认闲鱼账号", "status": model.XianyuAccountActive, "isDefault": true, "createdAt": now, "updatedAt": now},
	}, options.Update().SetUpsert(true))
	return err
}

// Create 新增闲鱼账号。
func (repository *XianyuAccountRepository) Create(ctx context.Context, account model.XianyuAccount) error {
	_, err := repository.collection.InsertOne(ctx, account)
	return err
}

// List 返回全部闲鱼账号。
func (repository *XianyuAccountRepository) List(ctx context.Context) ([]model.XianyuAccount, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "isDefault", Value: -1}, {Key: "createdAt", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	accounts := make([]model.XianyuAccount, 0)
	err = cursor.All(ctx, &accounts)
	return accounts, err
}

// Get 按 ID 返回闲鱼账号。
func (repository *XianyuAccountRepository) Get(ctx context.Context, accountID string) (model.XianyuAccount, error) {
	var account model.XianyuAccount
	err := repository.collection.FindOne(ctx, bson.M{"_id": accountID}).Decode(&account)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.XianyuAccount{}, ErrXianyuAccountNotFound
	}
	return account, err
}

// FindByPlatformUserID 按闲鱼真实用户 ID 查找已绑定账号。
func (repository *XianyuAccountRepository) FindByPlatformUserID(ctx context.Context, platformUserID string) (model.XianyuAccount, error) {
	var account model.XianyuAccount
	err := repository.collection.FindOne(ctx, bson.M{"platformUserId": platformUserID}).Decode(&account)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.XianyuAccount{}, ErrXianyuAccountNotFound
	}
	return account, err
}

// Update 更新账号名称或运行状态。
func (repository *XianyuAccountRepository) Update(ctx context.Context, accountID, name, status string) error {
	fields := bson.M{"updatedAt": time.Now()}
	if name != "" {
		fields["name"] = name
	}
	if status != "" {
		fields["status"] = status
	}
	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": accountID}, bson.M{"$set": fields})
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return ErrXianyuAccountNotFound
	}
	return nil
}

// UpdateConnection 保存一类凭证的公开连接状态。
func (repository *XianyuAccountRepository) UpdateConnection(ctx context.Context, accountID, kind, displayName, platformUserID string, connected, searchReady bool) error {
	now := time.Now()
	fields := bson.M{"updatedAt": now}
	if displayName != "" {
		fields["displayName"] = displayName
	}
	if platformUserID != "" {
		fields["platformUserId"] = platformUserID
	}
	if kind == "seller" {
		fields["sellerConnected"] = connected
		fields["lastSellerVerifiedAt"] = now
	} else {
		fields["sessionConnected"] = connected
		fields["searchReady"] = searchReady
		fields["lastVerifiedAt"] = now
	}
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": accountID}, bson.M{"$set": fields})
	return err
}

// MarkSynced 更新账号在售商品的最近同步时间。
func (repository *XianyuAccountRepository) MarkSynced(ctx context.Context, accountID string) error {
	now := time.Now()
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": accountID}, bson.M{"$set": bson.M{"lastSyncedAt": now, "updatedAt": now}})
	return err
}
