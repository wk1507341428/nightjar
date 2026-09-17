package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/model"
)

// MarketplaceListingRepository 管理第三方渠道当前在售快照。
type MarketplaceListingRepository struct {
	collection *mongo.Collection
}

// NewMarketplaceListingRepository 创建渠道在售商品仓储。
func NewMarketplaceListingRepository(database *mongo.Database) *MarketplaceListingRepository {
	return &MarketplaceListingRepository{collection: database.Collection("marketplace_listings")}
}

// EnsureIndexes 创建渠道商品唯一索引和查询索引。
func (repository *MarketplaceListingRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "platform", Value: 1}, {Key: "platformItemId", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{Keys: bson.D{{Key: "platform", Value: 1}, {Key: "itemNo", Value: 1}}},
		{Keys: bson.D{{Key: "lastSyncedAt", Value: -1}}},
	})
	return err
}

// Upsert 写入一个当前在售渠道商品。
func (repository *MarketplaceListingRepository) Upsert(ctx context.Context, listing model.MarketplaceListing) error {
	_, err := repository.collection.UpdateOne(
		ctx,
		bson.M{"platform": listing.Platform, "platformItemId": listing.PlatformItemID},
		bson.M{"$set": listing},
		options.Update().SetUpsert(true),
	)
	return err
}

// ReplacePlatformSnapshot 用完整远程结果替换某个渠道的当前在售快照。
func (repository *MarketplaceListingRepository) ReplacePlatformSnapshot(
	ctx context.Context,
	platform string,
	listings []model.MarketplaceListing,
) error {
	// 当前远程商品 ID。
	platformItemIDs := make([]string, 0, len(listings))
	// 批量写入操作。
	writes := make([]mongo.WriteModel, 0, len(listings))

	for _, listing := range listings {
		platformItemIDs = append(platformItemIDs, listing.PlatformItemID)
		writes = append(writes, mongo.NewUpdateOneModel().
			SetFilter(bson.M{"platform": platform, "platformItemId": listing.PlatformItemID}).
			SetUpdate(bson.M{"$set": listing}).
			SetUpsert(true))
	}

	if len(writes) > 0 {
		if _, err := repository.collection.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false)); err != nil {
			return err
		}
	}

	// 只有完整快照写入成功后才清理远程已不存在的商品。
	deleteFilter := bson.M{"platform": platform}
	if len(platformItemIDs) > 0 {
		deleteFilter["platformItemId"] = bson.M{"$nin": platformItemIDs}
	}
	_, err := repository.collection.DeleteMany(ctx, deleteFilter)
	return err
}

// List 返回指定渠道当前在售商品。
func (repository *MarketplaceListingRepository) List(
	ctx context.Context,
	platform string,
	limit int64,
) ([]model.MarketplaceListing, error) {
	filter := bson.M{}
	if platform != "" && platform != "all" {
		filter["platform"] = platform
	}

	cursor, err := repository.collection.Find(
		ctx,
		filter,
		options.Find().SetSort(bson.D{{Key: "lastSyncedAt", Value: -1}}).SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var listings []model.MarketplaceListing
	if err := cursor.All(ctx, &listings); err != nil {
		return nil, err
	}
	return listings, nil
}

// LatestSyncTime 返回某个渠道最近同步时间。
func (repository *MarketplaceListingRepository) LatestSyncTime(ctx context.Context, platform string) (time.Time, error) {
	var listing model.MarketplaceListing
	err := repository.collection.FindOne(
		ctx,
		bson.M{"platform": platform},
		options.FindOne().SetSort(bson.D{{Key: "lastSyncedAt", Value: -1}}),
	).Decode(&listing)
	if err == mongo.ErrNoDocuments {
		return time.Time{}, nil
	}
	return listing.LastSyncedAt, err
}
