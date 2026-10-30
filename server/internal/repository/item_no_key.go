package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

func activePublishStatuses() []string {
	return []string{model.PublishTaskQueued, model.PublishTaskPreparing, model.PublishTaskPublishing}
}

// backfillItemNoKeys 只为旧记录补查询键，不改原始货号、商品内容或历史结果。
// 后续启动只读取缺键记录；批量写入避免逐件数据库往返。
func backfillItemNoKeys(ctx context.Context, collection *mongo.Collection, tasks bool) error {
	filter := bson.M{"itemNo": bson.M{"$type": "string", "$ne": ""}, "itemNoKey": bson.M{"$exists": false}}
	cursor, err := collection.Find(ctx, filter, options.Find().SetProjection(bson.M{"itemNo": 1, "action": 1, "status": 1}))
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	writes := make([]mongo.WriteModel, 0, 1000)
	for cursor.Next(ctx) {
		var row struct {
			ID     string `bson:"_id"`
			ItemNo string `bson:"itemNo"`
			Action string `bson:"action"`
			Status string `bson:"status"`
		}
		if err := cursor.Decode(&row); err != nil {
			return err
		}
		fields := bson.M{"itemNoKey": model.ItemNoKey(row.ItemNo)}
		if tasks && row.Action == "" && isActivePublishStatus(row.Status) {
			fields["action"] = model.PublishActionPublish
		}
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": row.ID, "itemNoKey": bson.M{"$exists": false}}).SetUpdate(bson.M{"$set": fields}))
		if len(writes) == cap(writes) {
			if _, err := collection.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false)); err != nil {
				return err
			}
			writes = writes[:0]
		}
	}
	if err := cursor.Err(); err != nil {
		return err
	}
	if len(writes) > 0 {
		_, err = collection.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false))
	}
	return err
}

func isActivePublishStatus(status string) bool {
	return status == model.PublishTaskQueued || status == model.PublishTaskPreparing || status == model.PublishTaskPublishing
}

func itemNoKeys(itemNos []string) []string {
	keys := make([]string, 0, len(itemNos))
	seen := make(map[string]bool, len(itemNos))
	for _, itemNo := range itemNos {
		key := model.ItemNoKey(itemNo)
		if key != "" && !seen[key] {
			keys = append(keys, key)
			seen[key] = true
		}
	}
	return keys
}
