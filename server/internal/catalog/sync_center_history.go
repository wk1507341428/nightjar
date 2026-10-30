package catalog

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ProductHistory reads SKU observations only from completed generations and the active head.
func (center *SyncCenter) ProductHistory(ctx context.Context, id string) (SyncCenterProduct, []SyncCenterSKU, error) {
	filter, err := center.activeFilter(ctx, "")
	if err != nil {
		return SyncCenterProduct{}, nil, err
	}
	filter["$or"] = bson.A{bson.M{"_id": id}, bson.M{"itemId": id}}
	var product SyncCenterProduct
	if err = center.products.FindOne(ctx, filter).Decode(&product); err != nil {
		return product, nil, err
	}
	cursor, err := center.runs.Find(ctx, bson.M{"profileId": product.ProfileID, "status": SyncCenterComplete}, options.Find().SetProjection(bson.M{"_id": 1}).SetSort(bson.D{{Key: "finishedAt", Value: -1}}).SetLimit(120))
	if err != nil {
		return product, nil, err
	}
	defer cursor.Close(ctx)
	versions := []string{product.Generation}
	for cursor.Next(ctx) {
		var run struct {
			ID string `bson:"_id"`
		}
		if err = cursor.Decode(&run); err != nil {
			return product, nil, err
		}
		versions = append(versions, run.ID)
	}
	if err = cursor.Err(); err != nil {
		return product, nil, err
	}
	rows, err := center.skus.Find(ctx, bson.M{"profileId": product.ProfileID, "generation": bson.M{"$in": versions}, "regionId": product.RegionID, "distributorId": product.DistributorID, "sourceItemId": product.ItemID}, options.Find().SetSort(bson.D{{Key: "syncedAt", Value: 1}, {Key: "sourceSkuId", Value: 1}}).SetLimit(5000))
	if err != nil {
		return product, nil, err
	}
	defer rows.Close(ctx)
	history := []SyncCenterSKU{}
	err = rows.All(ctx, &history)
	normalized := []SyncCenterProduct{product}
	normalizeSyncProducts(normalized)
	return normalized[0], history, err
}
