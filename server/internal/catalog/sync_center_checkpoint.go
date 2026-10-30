package catalog

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
)

// reconcileStagingIdentities intersects checkpoints with a freshly completed source list.
// It does not compare mutable price/stock fields and never edits an activated generation.
func (center *SyncCenter) reconcileStagingIdentities(ctx context.Context, run SyncCenterRun, work []syncCenterWork) error {
	if err := center.ensureStagingWritable(ctx, run); err != nil {
		return err
	}
	current := make(map[string]syncCenterWork, len(work))
	ids := make([]string, 0, len(work))
	for _, item := range work {
		id := hashID(run.ID, item.member.RegionID, item.member.DistributorID, syncSourceID(item.product))
		current[id] = item
		ids = append(ids, id)
	}
	cursor, err := center.products.Find(ctx, bson.M{"generation": run.ID}, options.Find().SetProjection(bson.M{"_id": 1, "profileId": 1, "generation": 1, "regionId": 1, "distributorId": 1, "itemId": 1, "itemNo": 1, "syncedAt": 1}))
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var product SyncCenterProduct
		if err = cursor.Decode(&product); err != nil {
			return err
		}
		item, present := current[product.ID]
		if present && syncCheckpointIdentityMatches(run, item, product) && syncCheckpointFresh(product, time.Now()) {
			continue
		}
		if err = center.removeStagedProduct(ctx, run, product.ID); err != nil {
			return err
		}
	}
	if err = cursor.Err(); err != nil {
		return err
	}
	if err = center.ensureStagingWritable(ctx, run); err != nil {
		return err
	}
	// Partial writes may have SKU rows without a committed product document.
	_, err = center.skus.DeleteMany(ctx, bson.M{"generation": run.ID, "productId": bson.M{"$nin": ids}})
	return err
}

func syncCheckpointIdentityMatches(run SyncCenterRun, work syncCenterWork, product SyncCenterProduct) bool {
	expectedNo := model.ItemNoKey(mapString(work.product, "item_no"))
	return expectedNo != "" && product.ProfileID == run.ProfileID && product.Generation == run.ID && product.RegionID == work.member.RegionID && product.DistributorID == work.member.DistributorID && product.ItemID == syncSourceID(work.product) && model.ItemNoKey(product.ItemNo) == expectedNo
}

// checkStagedProduct derives the expected SKU set from the original complete detail.
// Counting the existing rows alone would incorrectly bless a partial previous bulk write.
func (center *SyncCenter) checkStagedProduct(ctx context.Context, run SyncCenterRun, work syncCenterWork, product SyncCenterProduct) (bool, int, error) {
	if !syncCheckpointIdentityMatches(run, work, product) || !syncCheckpointFresh(product, time.Now()) {
		return false, 0, nil
	}
	products := []SyncCenterProduct{product}
	normalizeSyncProducts(products)
	_, expected, err := buildSyncCenterRows(run, work, products[0].Data)
	if err != nil {
		return false, 0, nil
	}
	values, err := center.skus.Distinct(ctx, "_id", bson.M{"generation": run.ID, "productId": product.ID})
	if err != nil {
		return false, 0, err
	}
	if len(values) != len(expected) {
		return false, 0, nil
	}
	actual := make(map[string]bool, len(values))
	for _, value := range values {
		id, ok := value.(string)
		if !ok {
			return false, 0, nil
		}
		actual[id] = true
	}
	for _, sku := range expected {
		if !actual[sku.ID] {
			return false, 0, nil
		}
	}
	return true, len(expected), nil
}

func (center *SyncCenter) removeStagedProduct(ctx context.Context, run SyncCenterRun, id string) error {
	if err := center.ensureStagingWritable(ctx, run); err != nil {
		return err
	}
	if _, err := center.products.DeleteOne(ctx, bson.M{"generation": run.ID, "_id": id}); err != nil {
		return err
	}
	_, err := center.skus.DeleteMany(ctx, bson.M{"generation": run.ID, "productId": id})
	return err
}

const (
	syncRunMaxLifetime   = 3 * time.Hour
	syncRunMaxIdle       = time.Hour
	syncCheckpointMaxAge = time.Hour
)

func syncCheckpointFresh(product SyncCenterProduct, now time.Time) bool {
	return !product.SyncedAt.IsZero() && now.Sub(product.SyncedAt) <= syncCheckpointMaxAge
}

func syncRunWithinResumeWindow(run SyncCenterRun, now time.Time) bool {
	return !run.StartedAt.IsZero() && !run.UpdatedAt.IsZero() && now.Sub(run.StartedAt) <= syncRunMaxLifetime && now.Sub(run.UpdatedAt) <= syncRunMaxIdle
}
