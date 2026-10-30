package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"sidejob-server/internal/model"
)

// PauseForPublishLimit preserves disabled accounts and never changes login credentials.
func (repository *XianyuAccountRepository) PauseForPublishLimit(ctx context.Context, accountID, reason string) error {
	now := time.Now()
	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": accountID, "status": bson.M{"$ne": model.XianyuAccountDisabled}}, bson.M{"$set": bson.M{"status": model.XianyuAccountPaused, "queueStopReason": reason, "queueStoppedAt": now, "updatedAt": now}})
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		account, getErr := repository.Get(ctx, accountID)
		if getErr == nil && account.Status == model.XianyuAccountDisabled {
			return nil
		}
		return ErrXianyuAccountNotFound
	}
	return nil
}

// AbortAccountQueueForPublishLimit marks queued work as unexecuted and prevents async batch preparation from reopening it.
func (repository *PublishTaskRepository) AbortAccountQueueForPublishLimit(ctx context.Context, accountID, reason string) error {
	now := time.Now()
	batches := publishLimitAccountFilter(accountID)
	batches["status"] = bson.M{"$in": bson.A{model.PublishBatchPreparing, model.PublishBatchRunning}}
	if _, err := repository.collection.Database().Collection("publish_batches").UpdateMany(ctx, batches, bson.M{"$set": bson.M{"status": model.PublishBatchCancelled, "errorMessage": reason, "updatedAt": now}}); err != nil {
		return err
	}
	tasks := publishLimitAccountFilter(accountID)
	tasks["status"] = bson.M{"$in": bson.A{model.PublishTaskQueued, model.PublishTaskPreparing}}
	_, err := repository.collection.UpdateMany(ctx, tasks, bson.M{"$set": bson.M{"status": model.PublishTaskFailed, "errorMessage": reason + "；未执行", "cancelledAt": now, "updatedAt": now}})
	return err
}

func publishLimitAccountFilter(accountID string) bson.M {
	if accountID == model.DefaultXianyuAccountID {
		return bson.M{"$or": bson.A{bson.M{"accountId": accountID}, bson.M{"accountId": ""}, bson.M{"accountId": bson.M{"$exists": false}}}}
	}
	return bson.M{"accountId": accountID}
}
