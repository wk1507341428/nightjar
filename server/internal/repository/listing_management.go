package repository

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
)

const ListingManagementManual = "manual"
const UnmanagedListingMessage = "商品未由系统发布或已设为独立维护，禁止系统操作"

// ManagedItemIDs 以账号和远端商品 ID 校验发布归属；修改、下架、恢复记录不能成为接管依据。
// 独立维护记录存于另一集合，避免全量在售同步覆盖用户的管理意图。
func (repository *MarketplaceListingRepository) ManagedItemIDs(ctx context.Context, accountID string, itemIDs []string) (map[string]bool, error) {
	managed := make(map[string]bool)
	if len(itemIDs) == 0 {
		return managed, nil
	}
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	values, err := repository.publishTasks.Distinct(ctx, "xianyuItemId", managedPublishFilter(accountID, itemIDs))
	if err != nil {
		return nil, err
	}
	for _, value := range values {
		if id, ok := value.(string); ok {
			managed[id] = true
		}
	}
	manualIDs, err := repository.management.Distinct(ctx, "platformItemId", bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "platformItemId": bson.M{"$in": itemIDs}, "mode": ListingManagementManual})
	if err != nil {
		return nil, err
	}
	for _, value := range manualIDs {
		if id, ok := value.(string); ok {
			delete(managed, id)
		}
	}
	return managed, nil
}

func managedPublishFilter(accountID string, itemIDs []string) bson.M {
	return bson.M{"accountId": accountID, "xianyuItemId": bson.M{"$in": itemIDs}, "status": model.PublishTaskSucceeded,
		"$or": bson.A{bson.M{"action": "publish"}, bson.M{"action": ""}, bson.M{"action": bson.M{"$exists": false}}}}
}

// RequireManagedItems 在远程写操作前拒绝未授权商品；数据库读取失败时关闭操作。
func (repository *MarketplaceListingRepository) RequireManagedItems(ctx context.Context, accountID string, itemIDs []string) error {
	managed, err := repository.ManagedItemIDs(ctx, accountID, itemIDs)
	if err != nil {
		return err
	}
	for _, id := range itemIDs {
		if !managed[id] {
			return fmt.Errorf("%s：%s", UnmanagedListingMessage, id)
		}
	}
	return nil
}

// FilterManagedListings 批量筛出有发布归属且未设置独立维护的商品。
func (repository *MarketplaceListingRepository) FilterManagedListings(ctx context.Context, accountID string, listings []model.MarketplaceListing) ([]model.MarketplaceListing, error) {
	ids := make([]string, 0, len(listings))
	for _, listing := range listings {
		ids = append(ids, listing.PlatformItemID)
	}
	managed, err := repository.ManagedItemIDs(ctx, accountID, ids)
	if err != nil {
		return nil, err
	}
	result := make([]model.MarketplaceListing, 0, len(listings))
	for _, listing := range listings {
		if managed[listing.PlatformItemID] {
			result = append(result, listing)
		}
	}
	return result, nil
}

// SetManualManagement 按商品 ID 保存独立维护设置，不改变闲鱼商品内容。
func (repository *MarketplaceListingRepository) SetManualManagement(ctx context.Context, accountID, itemID string) error {
	key := accountID + ":" + model.XianyuPlatform + ":" + itemID
	_, err := repository.management.UpdateOne(ctx, bson.M{"_id": key}, bson.M{"$set": bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "platformItemId": itemID, "mode": ListingManagementManual}}, options.Update().SetUpsert(true))
	return err
}
