package repository

import (
	"context"
	"errors"
	"strings"
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
		{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "itemNo", Value: 1}}},
		{Keys: bson.D{{Key: "batchId", Value: 1}, {Key: "createdAt", Value: 1}}},
	})
	return err
}

// ListByBatchID 返回一个批次的全部发布任务。
func (repository *PublishTaskRepository) ListByBatchID(ctx context.Context, batchID string) ([]model.PublishTask, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{"batchId": batchID}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var tasks []model.PublishTask
	err = cursor.All(ctx, &tasks)
	return tasks, err
}

// ExistingItemNos 返回当前正在排队或发布中的货号集合。
func (repository *PublishTaskRepository) ExistingItemNos(ctx context.Context, accountID string, itemNos []string) (map[string]struct{}, error) {
	result := make(map[string]struct{})
	if len(itemNos) == 0 {
		return result, nil
	}
	accountFilter := bson.A{bson.M{"accountId": accountID}}
	if accountID == model.DefaultXianyuAccountID {
		accountFilter = append(accountFilter, bson.M{"accountId": bson.M{"$exists": false}})
	}
	cursor, err := repository.collection.Find(ctx, bson.M{"$or": accountFilter, "itemNo": bson.M{"$in": itemNos}, "status": bson.M{"$in": bson.A{model.PublishTaskQueued, model.PublishTaskPreparing, model.PublishTaskPublishing}}}, options.Find().SetProjection(bson.M{"itemNo": 1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var tasks []model.PublishTask
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	for _, task := range tasks {
		result[strings.ToUpper(strings.TrimSpace(task.ItemNo))] = struct{}{}
	}
	return result, nil
}

// Create 新建发布任务。
func (repository *PublishTaskRepository) Create(ctx context.Context, task model.PublishTask) error {
	if task.AccountID == "" {
		task.AccountID = model.DefaultXianyuAccountID
	}
	_, err := repository.collection.InsertOne(ctx, task)
	return err
}

// Get 按任务 ID 查询发布任务。
// ClaimRetry 原子领取失败任务，避免重复点击或单件与批量重试造成重复入队。
func (repository *PublishTaskRepository) ClaimRetry(ctx context.Context, taskID string) (bool, error) {
	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": taskID, "status": bson.M{"$in": bson.A{model.PublishTaskFailed, model.PublishTaskNeedsLogin}}, "cancelledAt": bson.M{"$exists": false}}, bson.M{"$set": bson.M{"status": model.PublishTaskQueued, "retryRequested": true, "updatedAt": time.Now()}, "$inc": bson.M{"retryCount": 1}})
	if err != nil {
		return false, err
	}
	return result.ModifiedCount == 1, nil
}

// FinishRetryPreparation 保存重新核对后的基线并清除重试标记。
func (repository *PublishTaskRepository) FinishRetryPreparation(ctx context.Context, task model.PublishTask) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": task.ID}, bson.M{"$set": bson.M{"before": task.Before, "retryRequested": false, "errorMessage": "", "updatedAt": time.Now()}})
	return err
}

func (repository *PublishTaskRepository) Get(ctx context.Context, taskID string) (model.PublishTask, error) {
	var task model.PublishTask
	err := repository.collection.FindOne(ctx, bson.M{"_id": taskID}).Decode(&task)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.PublishTask{}, ErrPublishTaskNotFound
	}
	return task, err
}

// List 返回最近创建的发布任务。
func (repository *PublishTaskRepository) List(ctx context.Context, accountID string, limit int64) ([]model.PublishTask, error) {
	filter := bson.M{}
	if accountID != "" {
		filter["accountId"] = accountID
	}
	cursor, err := repository.collection.Find(
		ctx,
		filter,
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

// ListQueued 返回服务重启后需要恢复调度的排队任务。
func (repository *PublishTaskRepository) ListQueued(ctx context.Context, limit int64) ([]model.PublishTask, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{"status": model.PublishTaskQueued}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}}).SetLimit(limit))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var tasks []model.PublishTask
	err = cursor.All(ctx, &tasks)
	return tasks, err
}

// FailInterruptedTasks 将重启时状态不确定的处理中任务留给人工确认重试。
func (repository *PublishTaskRepository) FailInterruptedTasks(ctx context.Context) error {
	_, err := repository.collection.UpdateMany(ctx, bson.M{"status": bson.M{"$in": bson.A{model.PublishTaskPreparing, model.PublishTaskPublishing}}}, bson.M{"$set": bson.M{"status": model.PublishTaskFailed, "errorMessage": "服务重启中断，需确认闲鱼状态后重试", "updatedAt": time.Now()}})
	return err
}

// FindByXianyuItemIDs 查询已记录闲鱼商品 ID 的发布任务。
func (repository *PublishTaskRepository) FindByXianyuItemIDs(
	ctx context.Context,
	accountID string,
	itemIDs []string,
) ([]model.PublishTask, error) {
	if len(itemIDs) == 0 {
		return []model.PublishTask{}, nil
	}

	accountFilter := bson.A{bson.M{"accountId": accountID}}
	if accountID == model.DefaultXianyuAccountID {
		accountFilter = append(accountFilter, bson.M{"accountId": bson.M{"$exists": false}})
	}
	cursor, err := repository.collection.Find(ctx, bson.M{"$or": accountFilter, "xianyuItemId": bson.M{"$in": itemIDs}})
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

// ListSucceededByRegions 返回指定地区可追溯的成功发布任务。
func (repository *PublishTaskRepository) ListSucceededByRegions(ctx context.Context, regionIDs []string) ([]model.PublishTask, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{"status": model.PublishTaskSucceeded, "regionId": bson.M{"$in": regionIDs}, "xianyuItemId": bson.M{"$exists": true, "$ne": ""}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	tasks := make([]model.PublishTask, 0)
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

// CancelByBatchID 取消批次中尚未执行的任务。
func (repository *PublishTaskRepository) CancelByBatchID(ctx context.Context, batchID string) (int64, error) {
	result, err := repository.collection.UpdateMany(ctx, bson.M{"batchId": batchID, "status": bson.M{"$in": bson.A{model.PublishTaskQueued, model.PublishTaskPreparing}}}, bson.M{"$set": bson.M{"status": model.PublishTaskFailed, "errorMessage": "用户取消队列，未执行", "cancelledAt": time.Now(), "updatedAt": time.Now()}})
	if err != nil {
		return 0, err
	}
	return result.ModifiedCount, nil
}

// UpdateContent 更新重试前重新生成的发布内容。
func (repository *PublishTaskRepository) UpdateContent(ctx context.Context, task model.PublishTask) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"_id": task.ID}, bson.M{"$set": bson.M{
		"sourceItemId":       task.SourceItemID,
		"itemNo":             task.ItemNo,
		"title":              task.Title,
		"description":        task.Description,
		"priceCents":         task.PriceCents,
		"originalPriceCents": task.OriginalPriceCents,
		"imageUrls":          task.ImageURLs,
		"regionId":           task.RegionID,
		"brand":              task.Brand,
		"condition":          task.Condition,
		"availableSizes":     task.AvailableSizes,
		"variants":           task.Variants,
		"quantity":           task.Quantity,
		"sourceRegions":      task.SourceRegions,
		"sourceMemberIds":    task.SourceMemberIDs,
		"sourceItemIds":      task.SourceItemIDs,
		"isFootwear":         task.IsFootwear,
		"updatedAt":          time.Now(),
	}})
	return err
}
