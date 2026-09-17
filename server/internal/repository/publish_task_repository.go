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

// ErrPublishTaskNotFound 表示发布任务不存在。
var ErrPublishTaskNotFound = errors.New("publish task not found")

// PublishTaskRepository 管理闲鱼发布任务。
type PublishTaskRepository struct {
	collection *mongo.Collection
}

// NewPublishTaskRepository 创建发布任务仓储。
func NewPublishTaskRepository(database *mongo.Database) *PublishTaskRepository {
	return &PublishTaskRepository{collection: database.Collection("publish_tasks")}
}

// EnsureIndexes 创建任务列表和货号查询索引。
func (repository *PublishTaskRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "itemNo", Value: 1}}},
	})
	return err
}

// Create 新建发布任务。
func (repository *PublishTaskRepository) Create(ctx context.Context, task model.PublishTask) error {
	_, err := repository.collection.InsertOne(ctx, task)
	return err
}

// Get 按任务 ID 查询发布任务。
func (repository *PublishTaskRepository) Get(ctx context.Context, taskID string) (model.PublishTask, error) {
	var task model.PublishTask
	err := repository.collection.FindOne(ctx, bson.M{"_id": taskID}).Decode(&task)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.PublishTask{}, ErrPublishTaskNotFound
	}
	return task, err
}

// List 返回最近创建的发布任务。
func (repository *PublishTaskRepository) List(ctx context.Context, limit int64) ([]model.PublishTask, error) {
	cursor, err := repository.collection.Find(
		ctx,
		bson.M{},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []model.PublishTask
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	return tasks, nil
}

// FindByXianyuItemIDs 查询已记录闲鱼商品 ID 的发布任务。
func (repository *PublishTaskRepository) FindByXianyuItemIDs(
	ctx context.Context,
	itemIDs []string,
) ([]model.PublishTask, error) {
	if len(itemIDs) == 0 {
		return []model.PublishTask{}, nil
	}

	cursor, err := repository.collection.Find(ctx, bson.M{
		"xianyuItemId": bson.M{"$in": itemIDs},
	})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []model.PublishTask
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	return tasks, nil
}

// UpdateStatus 更新任务状态和可选结果。
func (repository *PublishTaskRepository) UpdateStatus(
	ctx context.Context,
	taskID string,
	status string,
	errorMessage string,
	xianyuItemID string,
	xianyuURL string,
) error {
	updateFields := bson.M{
		"status":       status,
		"errorMessage": errorMessage,
		"updatedAt":    time.Now(),
	}
	if xianyuItemID != "" {
		updateFields["xianyuItemId"] = xianyuItemID
	}
	if xianyuURL != "" {
		updateFields["xianyuUrl"] = xianyuURL
	}

	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": taskID}, bson.M{"$set": updateFields})
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return ErrPublishTaskNotFound
	}
	return nil
}
