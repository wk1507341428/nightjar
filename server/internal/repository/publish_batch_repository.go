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

// ErrPublishBatchNotFound 表示批量发布计划不存在。
var ErrPublishBatchNotFound = errors.New("publish batch not found")

// PublishBatchRepository 管理品牌批量发布计划。
type PublishBatchRepository struct{ collection *mongo.Collection }

// NewPublishBatchRepository 创建批量发布计划仓储。
func NewPublishBatchRepository(database *mongo.Database) *PublishBatchRepository {
	return &PublishBatchRepository{collection: database.Collection("publish_batches")}
}

// CompletePreparation 保存后台生成的任务并进入发布阶段。
func (repository *PublishBatchRepository) CompletePreparation(ctx context.Context, batchID string, taskIDs []string, skipped []model.PublishBatchSkip) error {
	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID, "status": bson.M{"$in": bson.A{model.PublishBatchPreparing, model.PublishBatchRunning}}}, bson.M{
		"$push": bson.M{"taskIds": bson.M{"$each": taskIDs}, "skipped": bson.M{"$each": skipped}},
		"$set":  bson.M{"status": model.PublishBatchRunning, "updatedAt": time.Now(), "errorMessage": ""},
	})
	if err == nil && result.MatchedCount == 0 {
		return ErrPublishBatchNotFound
	}
	return err
}

// FailPreparation 标记批量任务准备失败。
func (repository *PublishBatchRepository) FailPreparation(ctx context.Context, batchID string, errorMessage string) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID, "status": model.PublishBatchPreparing}, bson.M{"$set": bson.M{"status": model.PublishBatchFailed, "errorMessage": errorMessage, "updatedAt": time.Now()}})
	return err
}

// EnsureIndexes 创建批次查询索引。
func (repository *PublishBatchRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "createdAt", Value: -1}}},
	})
	return err
}

// Create 新建批量发布计划。
func (repository *PublishBatchRepository) Create(ctx context.Context, batch model.PublishBatch) error {
	if batch.AccountID == "" {
		batch.AccountID = model.DefaultXianyuAccountID
	}
	_, err := repository.collection.InsertOne(ctx, batch)
	return err
}

// Get 查询一个批量发布计划。
func (repository *PublishBatchRepository) Get(ctx context.Context, batchID string) (model.PublishBatch, error) {
	var batch model.PublishBatch
	err := repository.collection.FindOne(ctx, bson.M{"_id": batchID}).Decode(&batch)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.PublishBatch{}, ErrPublishBatchNotFound
	}
	return batch, err
}

// FindActive 返回当前仍可追加的发布操作。
func (repository *PublishBatchRepository) FindActive(ctx context.Context, accountID string) (model.PublishBatch, error) {
	var batch model.PublishBatch
	accountFilter := bson.A{bson.M{"accountId": accountID}}
	if accountID == model.DefaultXianyuAccountID {
		accountFilter = append(accountFilter, bson.M{"accountId": bson.M{"$exists": false}})
	}
	err := repository.collection.FindOne(ctx, bson.M{"$or": accountFilter, "status": bson.M{"$in": bson.A{model.PublishBatchPreparing, model.PublishBatchRunning}}}, options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})).Decode(&batch)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.PublishBatch{}, ErrPublishBatchNotFound
	}
	return batch, err
}

// AppendSegment 预留容量并把一个品牌范围追加到发布操作。
func (repository *PublishBatchRepository) AppendSegment(ctx context.Context, batchID string, segment model.PublishBatchSegment) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID}, bson.M{
		"$push": bson.M{"segments": segment},
		"$inc":  bson.M{"limit": segment.Requested},
		"$set":  bson.M{"updatedAt": time.Now()},
	})
	return err
}

// MarkStatus 更新发布操作状态。
func (repository *PublishBatchRepository) MarkStatus(ctx context.Context, batchID, status string) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID}, bson.M{"$set": bson.M{"status": status, "updatedAt": time.Now()}})
	return err
}

// Cancel 将一个正在准备或运行的批次及其未执行任务标记为用户取消。
func (repository *PublishBatchRepository) Cancel(ctx context.Context, batchID string) (int64, error) {
	now := time.Now()
	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID, "status": bson.M{"$in": bson.A{model.PublishBatchPreparing, model.PublishBatchRunning}}}, bson.M{"$set": bson.M{"status": model.PublishBatchCancelled, "errorMessage": "用户取消队列，未执行", "updatedAt": now}})
	if err != nil {
		return 0, err
	}
	if result.MatchedCount == 0 {
		return 0, ErrPublishBatchNotFound
	}
	return result.ModifiedCount, nil
}

// AddOfflineResult 累加一次品牌追加产生的闲鱼下架结果。
func (repository *PublishBatchRepository) AddOfflineResult(ctx context.Context, batchID string, requested, succeeded, failed int) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID}, bson.M{"$inc": bson.M{"offlineRequested": requested, "offlineSucceeded": succeeded, "offlineFailed": failed}, "$set": bson.M{"updatedAt": time.Now()}})
	return err
}

// List 分页返回发布操作历史。
func (repository *PublishBatchRepository) List(ctx context.Context, accountID string, page, pageSize int) ([]model.PublishBatch, int64, error) {
	filter := bson.M{}
	if accountID != "" {
		filter["accountId"] = accountID
	}
	total, err := repository.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	cursor, err := repository.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetSkip(int64((page-1)*pageSize)).SetLimit(int64(pageSize)))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	batches := make([]model.PublishBatch, 0)
	if err := cursor.All(ctx, &batches); err != nil {
		return nil, 0, err
	}
	return batches, total, nil
}
