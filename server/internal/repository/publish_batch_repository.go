package repository

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

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
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID}, bson.M{"$set": bson.M{"taskIds": taskIDs, "skipped": skipped, "status": model.PublishBatchRunning, "updatedAt": time.Now(), "errorMessage": ""}})
	return err
}

// FailPreparation 标记批量任务准备失败。
func (repository *PublishBatchRepository) FailPreparation(ctx context.Context, batchID string, errorMessage string) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": batchID}, bson.M{"$set": bson.M{"status": model.PublishBatchFailed, "errorMessage": errorMessage, "updatedAt": time.Now()}})
	return err
}

// EnsureIndexes 创建批次查询索引。
func (repository *PublishBatchRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "brandStoreId", Value: 1}, {Key: "createdAt", Value: -1}}},
	})
	return err
}

// Create 新建批量发布计划。
func (repository *PublishBatchRepository) Create(ctx context.Context, batch model.PublishBatch) error {
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
