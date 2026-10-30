package catalog

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// SyncCenterCategoryRepair reports only modified derived projection rows.
type SyncCenterCategoryRepair struct {
	Products int64 `json:"products"`
	SKUs     int64 `json:"skus"`
}

// RepairCategoryProjections is an explicit one-off maintenance operation for this upgrade.
// Startup and background workers never invoke this full-history scan. It can run without restarting sync jobs.
// It updates categoryIds only; raw data, stock, prices, timestamps, generations and heads are immutable.
func (center *SyncCenter) RepairCategoryProjections(ctx context.Context) (SyncCenterCategoryRepair, error) {
	result := SyncCenterCategoryRepair{}
	cursor, err := center.products.Find(ctx, bson.M{}, options.Find().SetProjection(bson.M{"_id": 1, "generation": 1, "data.item_category_main": 1, "data.item_category_info": 1}).SetBatchSize(256))
	if err != nil {
		return result, err
	}
	defer cursor.Close(ctx)
	products := make([]mongo.WriteModel, 0, 256)
	skus := make([]mongo.WriteModel, 0, 256)
	for cursor.Next(ctx) {
		var row SyncCenterProduct
		if err = cursor.Decode(&row); err != nil {
			return result, err
		}
		categories := syncCategoryIDs(row.Data)
		products = append(products, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": row.ID, "generation": row.Generation}).SetUpdate(bson.M{"$set": bson.M{"categoryIds": categories}}))
		skus = append(skus, mongo.NewUpdateManyModel().SetFilter(bson.M{"productId": row.ID, "generation": row.Generation}).SetUpdate(bson.M{"$set": bson.M{"categoryIds": categories}}))
		if len(products) == 256 {
			if err = center.writeCategoryRepairBatch(ctx, products, skus, &result); err != nil {
				return result, err
			}
			products = products[:0]
			skus = skus[:0]
		}
	}
	if err = cursor.Err(); err != nil {
		return result, err
	}
	if len(products) > 0 {
		err = center.writeCategoryRepairBatch(ctx, products, skus, &result)
	}
	return result, err
}

func (center *SyncCenter) writeCategoryRepairBatch(ctx context.Context, products, skus []mongo.WriteModel, result *SyncCenterCategoryRepair) error {
	productResult, err := center.products.BulkWrite(ctx, products)
	if err != nil {
		return err
	}
	result.Products += productResult.ModifiedCount
	skuResult, err := center.skus.BulkWrite(ctx, skus)
	if err != nil {
		return err
	}
	result.SKUs += skuResult.ModifiedCount
	return nil
}
