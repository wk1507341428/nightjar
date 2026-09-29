package repository

import (
	"context"
	"strings"
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
	// 旧单账号唯一索引不包含 accountId，会阻止两个账号保存相同平台商品 ID。
	_, _ = repository.collection.Indexes().DropOne(ctx, "platform_1_platformItemId_1")
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "accountId", Value: 1}, {Key: "platform", Value: 1}, {Key: "platformItemId", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "platform", Value: 1}, {Key: "itemNo", Value: 1}}},
		{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "platform", Value: 1}, {Key: "saleStatus", Value: 1}, {Key: "itemNo", Value: 1}, {Key: "offShelfAt", Value: -1}}},
		{Keys: bson.D{{Key: "lastSyncedAt", Value: -1}}},
	})
	return err
}

// UpsertOffShelfSnapshot 保存卖家工作台当前下架商品，不影响正式在售快照。
func (repository *MarketplaceListingRepository) UpsertOffShelfSnapshot(ctx context.Context, accountID string, listings []model.MarketplaceListing) error {
	if len(listings) == 0 {
		return nil
	}
	writes := make([]mongo.WriteModel, 0, len(listings))
	remoteItemIDs := make([]string, 0, len(listings))
	for _, listing := range listings {
		remoteItemIDs = append(remoteItemIDs, listing.PlatformItemID)
		listing.AccountID = accountID
		setFields := bson.M{"title": listing.Title, "priceCents": listing.PriceCents, "imageUrl": listing.ImageURL, "itemUrl": listing.ItemURL, "remoteStatus": listing.RemoteStatus, "saleStatus": "off_shelf", "lastSeenAt": listing.LastSeenAt, "lastSyncedAt": listing.LastSyncedAt}
		if listing.ItemNo != "" {
			setFields["itemNo"] = listing.ItemNo
		}
		setOnInsert := bson.M{"_id": listing.ID, "accountId": accountID, "platform": listing.Platform, "platformItemId": listing.PlatformItemID, "listedAt": listing.ListedAt, "offShelfAt": listing.OffShelfAt}
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"accountId": accountID, "platform": listing.Platform, "platformItemId": listing.PlatformItemID}).SetUpdate(bson.M{"$set": setFields, "$setOnInsert": setOnInsert}).SetUpsert(true))
	}
	if _, err := repository.collection.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false)); err != nil {
		return err
	}
	_, err := repository.collection.UpdateMany(ctx, bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "saleStatus": "off_shelf", "platformItemId": bson.M{"$nin": remoteItemIDs}}, bson.M{"$set": bson.M{"saleStatus": "deleted", "lastSyncedAt": time.Now()}})
	return err
}

// ListOffShelfByItemNos 批量返回货号对应的历史下架商品，最近记录优先。
func (repository *MarketplaceListingRepository) ListOffShelfByItemNos(ctx context.Context, accountID string, itemNos []string) ([]model.MarketplaceListing, error) {
	if len(itemNos) == 0 {
		return []model.MarketplaceListing{}, nil
	}
	normalizedItemNos := make([]string, 0, len(itemNos))
	for _, itemNo := range itemNos {
		if normalizedItemNo := strings.ToUpper(strings.TrimSpace(itemNo)); normalizedItemNo != "" {
			normalizedItemNos = append(normalizedItemNos, normalizedItemNo)
		}
	}
	cursor, err := repository.collection.Find(ctx, bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "saleStatus": "off_shelf", "itemNo": bson.M{"$in": normalizedItemNos}}, options.Find().SetSort(bson.D{{Key: "offShelfAt", Value: -1}, {Key: "listedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	listings := make([]model.MarketplaceListing, 0)
	if err := cursor.All(ctx, &listings); err != nil {
		return nil, err
	}
	return listings, nil
}

// MarkDeleted 标记已从卖家后台永久删除的历史商品。
func (repository *MarketplaceListingRepository) MarkDeleted(ctx context.Context, accountID string, platformItemIDs []string) error {
	if len(platformItemIDs) == 0 {
		return nil
	}
	_, err := repository.collection.UpdateMany(ctx, bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "platformItemId": bson.M{"$in": platformItemIDs}}, bson.M{"$set": bson.M{"saleStatus": "deleted", "lastSyncedAt": time.Now()}})
	return err
}

// Upsert 写入一个当前在售渠道商品。
func (repository *MarketplaceListingRepository) Upsert(ctx context.Context, listing model.MarketplaceListing) error {
	if listing.AccountID == "" {
		listing.AccountID = model.DefaultXianyuAccountID
	}
	if listing.SaleStatus == "" {
		listing.SaleStatus = "onsale"
	}
	if listing.LastSeenAt.IsZero() {
		listing.LastSeenAt = listing.LastSyncedAt
	}
	_, err := repository.collection.UpdateOne(
		ctx,
		bson.M{"accountId": listing.AccountID, "platform": listing.Platform, "platformItemId": listing.PlatformItemID},
		bson.M{"$set": listing},
		options.Update().SetUpsert(true),
	)
	return err
}

// ReplacePlatformSnapshot 用完整远程结果替换某个渠道的当前在售快照。
func (repository *MarketplaceListingRepository) ReplacePlatformSnapshot(
	ctx context.Context,
	accountID string,
	platform string,
	listings []model.MarketplaceListing,
) error {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	// 当前远程商品 ID。
	platformItemIDs := make([]string, 0, len(listings))
	// 批量写入操作。
	writes := make([]mongo.WriteModel, 0, len(listings))

	for _, listing := range listings {
		listing.AccountID = accountID
		listing.SaleStatus = "onsale"
		listing.LastSeenAt = listing.LastSyncedAt
		listing.OffShelfAt = nil
		platformItemIDs = append(platformItemIDs, listing.PlatformItemID)
		writes = append(writes, mongo.NewUpdateOneModel().
			SetFilter(bson.M{"accountId": accountID, "platform": platform, "platformItemId": listing.PlatformItemID}).
			SetUpdate(bson.M{"$set": listing, "$unset": bson.M{"offShelfAt": ""}}).
			SetUpsert(true))
	}

	if len(writes) > 0 {
		if _, err := repository.collection.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false)); err != nil {
			return err
		}
	}

	// 完整快照写入成功后，把远程已不存在的商品保留为下架档案。
	offShelfFilter := bson.M{"accountId": accountID, "platform": platform, "saleStatus": bson.M{"$ne": "off_shelf"}}
	if len(platformItemIDs) > 0 {
		offShelfFilter["platformItemId"] = bson.M{"$nin": platformItemIDs}
	}
	now := time.Now()
	_, err := repository.collection.UpdateMany(ctx, offShelfFilter, bson.M{"$set": bson.M{"saleStatus": "off_shelf", "offShelfAt": now, "lastSyncedAt": now}})
	return err
}

// List 返回指定渠道当前在售商品。
func (repository *MarketplaceListingRepository) List(
	ctx context.Context,
	accountID string,
	platform string,
	limit int64,
) ([]model.MarketplaceListing, error) {
	filter := bson.M{"$or": bson.A{bson.M{"saleStatus": "onsale"}, bson.M{"saleStatus": bson.M{"$exists": false}}}}
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	filter["$and"] = bson.A{bson.M{"$or": bson.A{bson.M{"accountId": accountID}, bson.M{"accountId": bson.M{"$exists": false}, "_id": bson.M{"$regex": "^xianyu:"}}}}}
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

// ListByItemNos 返回指定货号集合对应的当前在售商品。
func (repository *MarketplaceListingRepository) ListByItemNos(ctx context.Context, accountID, platform string, itemNos []string) ([]model.MarketplaceListing, error) {
	normalizedItemNos := make([]string, 0, len(itemNos))
	for _, itemNo := range itemNos {
		if normalizedItemNo := strings.ToUpper(strings.TrimSpace(itemNo)); normalizedItemNo != "" {
			normalizedItemNos = append(normalizedItemNos, normalizedItemNo)
		}
	}
	if len(normalizedItemNos) == 0 {
		return []model.MarketplaceListing{}, nil
	}
	filter := bson.M{"itemNo": bson.M{"$in": normalizedItemNos}, "$or": bson.A{bson.M{"saleStatus": "onsale"}, bson.M{"saleStatus": bson.M{"$exists": false}}}}
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	filter["$and"] = bson.A{bson.M{"$or": bson.A{bson.M{"accountId": accountID}, bson.M{"accountId": bson.M{"$exists": false}, "_id": bson.M{"$regex": "^xianyu:"}}}}}
	if platform != "" && platform != "all" {
		filter["platform"] = platform
	}
	cursor, err := repository.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "lastSyncedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	listings := make([]model.MarketplaceListing, 0)
	if err := cursor.All(ctx, &listings); err != nil {
		return nil, err
	}
	return listings, nil
}

// ListByPlatformItemIDs 返回指定账号的一组闲鱼商品记录。
func (repository *MarketplaceListingRepository) ListByPlatformItemIDs(ctx context.Context, accountID string, platformItemIDs []string) ([]model.MarketplaceListing, error) {
	if len(platformItemIDs) == 0 {
		return []model.MarketplaceListing{}, nil
	}
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	filter := bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "platformItemId": bson.M{"$in": platformItemIDs}, "$or": bson.A{bson.M{"saleStatus": "onsale"}, bson.M{"saleStatus": bson.M{"$exists": false}}}}
	cursor, err := repository.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "lastSyncedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	listings := make([]model.MarketplaceListing, 0)
	if err := cursor.All(ctx, &listings); err != nil {
		return nil, err
	}
	return listings, nil
}

// ListByBrandProfileID 返回一个品牌档案当前在售的渠道商品。
func (repository *MarketplaceListingRepository) ListByBrandProfileID(ctx context.Context, accountID, platform, brandProfileID string) ([]model.MarketplaceListing, error) {
	filter := bson.M{"brandProfileId": brandProfileID, "$or": bson.A{bson.M{"saleStatus": "onsale"}, bson.M{"saleStatus": bson.M{"$exists": false}}}}
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	filter["$and"] = bson.A{bson.M{"$or": bson.A{bson.M{"accountId": accountID}, bson.M{"accountId": bson.M{"$exists": false}, "_id": bson.M{"$regex": "^xianyu:"}}}}}
	if platform != "" && platform != "all" {
		filter["platform"] = platform
	}
	cursor, err := repository.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "lastSyncedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	listings := make([]model.MarketplaceListing, 0)
	if err := cursor.All(ctx, &listings); err != nil {
		return nil, err
	}
	return listings, nil
}

// BindBrandProfile 为已有闲鱼商品补齐品牌档案和来源链路。
func (repository *MarketplaceListingRepository) BindBrandProfile(ctx context.Context, accountID, platformItemID, brandProfileID, sourceType string, regions, memberIDs, sourceItemIDs []string) error {
	_, err := repository.collection.UpdateOne(ctx, bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "platformItemId": platformItemID}, bson.M{"$set": bson.M{"brandProfileId": brandProfileID, "sourceType": sourceType, "sourceRegions": regions, "sourceMemberIds": memberIDs, "sourceItemIds": sourceItemIDs}})
	return err
}

// ListNormalizedItemNos 返回一个渠道全部在售商品的标准化货号。
func (repository *MarketplaceListingRepository) ListNormalizedItemNos(ctx context.Context, accountID, platform string) ([]string, error) {
	filter := bson.M{"$or": bson.A{bson.M{"saleStatus": "onsale"}, bson.M{"saleStatus": bson.M{"$exists": false}}}}
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	filter["$and"] = bson.A{bson.M{"$or": bson.A{bson.M{"accountId": accountID}, bson.M{"accountId": bson.M{"$exists": false}, "_id": bson.M{"$regex": "^xianyu:"}}}}}
	if platform != "" && platform != "all" {
		filter["platform"] = platform
	}
	values, err := repository.collection.Distinct(ctx, "itemNo", filter)
	if err != nil {
		return nil, err
	}

	// 去重后的标准化货号集合。
	itemNoSet := make(map[string]struct{}, len(values))
	for _, value := range values {
		itemNo, isString := value.(string)
		if !isString {
			continue
		}
		normalizedItemNo := strings.ToUpper(strings.TrimSpace(itemNo))
		if normalizedItemNo != "" {
			itemNoSet[normalizedItemNo] = struct{}{}
		}
	}

	// 标准化后的货号列表。
	itemNos := make([]string, 0, len(itemNoSet))
	for itemNo := range itemNoSet {
		itemNos = append(itemNos, itemNo)
	}
	return itemNos, nil
}

// DeletePlatformItemIDs 将已确认下架的商品保留为渠道档案。
func (repository *MarketplaceListingRepository) DeletePlatformItemIDs(ctx context.Context, accountID, platform string, itemIDs []string) error {
	if len(itemIDs) == 0 {
		return nil
	}
	now := time.Now()
	_, err := repository.collection.UpdateMany(ctx, bson.M{
		"accountId":      accountID,
		"platform":       platform,
		"platformItemId": bson.M{"$in": itemIDs},
	}, bson.M{"$set": bson.M{"saleStatus": "off_shelf", "offShelfAt": now, "lastSyncedAt": now}})
	return err
}

// LatestSyncTime 返回某个渠道最近同步时间。
func (repository *MarketplaceListingRepository) LatestSyncTime(ctx context.Context, accountID, platform string) (time.Time, error) {
	var listing model.MarketplaceListing
	err := repository.collection.FindOne(
		ctx,
		bson.M{"accountId": accountID, "platform": platform},
		options.FindOne().SetSort(bson.D{{Key: "lastSyncedAt", Value: -1}}),
	).Decode(&listing)
	if err == mongo.ErrNoDocuments {
		return time.Time{}, nil
	}
	return listing.LastSyncedAt, err
}
