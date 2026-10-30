package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
	"time"
)

func (repository *MarketplaceListingRepository) ListSnapshotCandidates(ctx context.Context, accountID, platform string) ([]model.MarketplaceListing, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{"accountId": accountID, "platform": platform, "saleStatus": bson.M{"$in": []string{"onsale", model.MarketplaceStatusUnknown}}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	rows := []model.MarketplaceListing{}
	err = cursor.All(ctx, &rows)
	return rows, err
}

// ReplaceVerifiedPlatformSnapshot writes explicit observations only, never interpreting absence as offline.
func (repository *MarketplaceListingRepository) ReplaceVerifiedPlatformSnapshot(ctx context.Context, accountID, platform string, listings, verified []model.MarketplaceListing, started time.Time) error {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	rows := make([]model.MarketplaceListing, 0, len(listings)+len(verified))
	for _, listing := range listings {
		listing.AccountID = accountID
		listing.Platform = platform
		listing.SaleStatus = "onsale"
		listing.RemoteStatus = "0"
		listing.OffShelfAt = nil
		rows = append(rows, listing)
	}
	for _, listing := range verified {
		listing.AccountID = accountID
		listing.Platform = platform
		rows = append(rows, listing)
	}
	return repository.persistObservedSnapshotRows(ctx, rows, started)
}

// Identity-only insertion avoids a conditional upsert colliding with a newer existing record.
// The second atomic update is guarded by the observation start time, preserving later writes.
func (repository *MarketplaceListingRepository) persistObservedSnapshotRows(ctx context.Context, rows []model.MarketplaceListing, started time.Time) error {
	inserts := make([]mongo.WriteModel, 0, len(rows))
	updates := make([]mongo.WriteModel, 0, len(rows))
	for _, listing := range rows {
		listing.ItemNoKey = model.ItemNoKey(listing.ItemNo)
		identity := bson.M{"accountId": listing.AccountID, "platform": listing.Platform, "platformItemId": listing.PlatformItemID}
		inserts = append(inserts, mongo.NewUpdateOneModel().SetFilter(identity).SetUpdate(bson.M{"$setOnInsert": listing}).SetUpsert(true))
		encoded, err := bson.Marshal(listing)
		if err != nil {
			return err
		}
		fields := bson.M{}
		if err = bson.Unmarshal(encoded, &fields); err != nil {
			return err
		}
		delete(fields, "_id")
		filter := bson.M{"accountId": listing.AccountID, "platform": listing.Platform, "platformItemId": listing.PlatformItemID, "$or": bson.A{bson.M{"lastSyncedAt": bson.M{"$lte": started}}, bson.M{"lastSyncedAt": bson.M{"$exists": false}}}}
		update := bson.M{"$set": fields}
		if listing.OffShelfAt == nil {
			update["$unset"] = bson.M{"offShelfAt": ""}
		}
		updates = append(updates, mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update))
	}
	if len(inserts) == 0 {
		return nil
	}
	if _, err := repository.collection.BulkWrite(ctx, inserts, options.BulkWrite().SetOrdered(false)); err != nil {
		return err
	}
	_, err := repository.collection.BulkWrite(ctx, updates, options.BulkWrite().SetOrdered(false))
	return err
}

func (repository *MarketplaceListingRepository) RecordObservedListingStatus(ctx context.Context, accountID, itemID, remote string) error {
	now := time.Now()
	fields := bson.M{"saleStatus": model.ObservedMarketplaceStatus(remote), "remoteStatus": remote, "lastSyncedAt": now, "lastSeenAt": now}
	update := bson.M{"$set": fields}
	if fields["saleStatus"] == "off_shelf" {
		fields["offShelfAt"] = now
	} else {
		update["$unset"] = bson.M{"offShelfAt": ""}
	}
	_, err := repository.collection.UpdateOne(ctx, bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "platformItemId": itemID}, update)
	return err
}
