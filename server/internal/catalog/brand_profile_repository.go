package catalog

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ListBrandProfiles 返回全部品牌档案及成员。
func (repository *InventoryRepository) ListBrandProfiles(ctx context.Context) ([]BrandProfile, []BrandProfileMember, error) {
	profileCursor, err := repository.brandProfiles.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "updatedAt", Value: -1}}))
	if err != nil {
		return nil, nil, err
	}
	defer profileCursor.Close(ctx)
	profiles := make([]BrandProfile, 0)
	if err := profileCursor.All(ctx, &profiles); err != nil {
		return nil, nil, err
	}
	memberCursor, err := repository.brandProfileMembers.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "regionId", Value: 1}, {Key: "sourceName", Value: 1}}))
	if err != nil {
		return nil, nil, err
	}
	defer memberCursor.Close(ctx)
	members := make([]BrandProfileMember, 0)
	if err := memberCursor.All(ctx, &members); err != nil {
		return nil, nil, err
	}
	return profiles, members, nil
}

// GetBrandProfile 返回一个品牌档案及全部成员。
func (repository *InventoryRepository) GetBrandProfile(ctx context.Context, profileID string) (BrandProfile, []BrandProfileMember, error) {
	var profile BrandProfile
	if err := repository.brandProfiles.FindOne(ctx, bson.M{"_id": profileID}).Decode(&profile); err != nil {
		return BrandProfile{}, nil, err
	}
	cursor, err := repository.brandProfileMembers.Find(ctx, bson.M{"profileId": profileID})
	if err != nil {
		return BrandProfile{}, nil, err
	}
	defer cursor.Close(ctx)
	members := make([]BrandProfileMember, 0)
	if err := cursor.All(ctx, &members); err != nil {
		return BrandProfile{}, nil, err
	}
	return profile, members, nil
}

// SaveBrandProfile 保存档案并完整替换成员关系。
func (repository *InventoryRepository) SaveBrandProfile(ctx context.Context, profile BrandProfile, members []BrandProfileMember) error {
	now := time.Now()
	profile.UpdatedAt = now
	if profile.CreatedAt.IsZero() {
		profile.CreatedAt = now
	}
	if _, err := repository.brandProfiles.UpdateOne(ctx, bson.M{"_id": profile.ID}, bson.M{"$set": profile}, options.Update().SetUpsert(true)); err != nil {
		return err
	}
	if _, err := repository.brandProfileMembers.DeleteMany(ctx, bson.M{"profileId": profile.ID}); err != nil {
		return err
	}
	if len(members) == 0 {
		return nil
	}
	documents := make([]any, 0, len(members))
	for _, member := range members {
		member.ProfileID = profile.ID
		member.CreatedAt = now
		member.UpdatedAt = now
		documents = append(documents, member)
	}
	_, err := repository.brandProfileMembers.InsertMany(ctx, documents)
	return err
}

// DeleteBrandProfile 删除品牌档案和成员映射。
func (repository *InventoryRepository) DeleteBrandProfile(ctx context.Context, profileID string) error {
	if _, err := repository.brandProfileMembers.DeleteMany(ctx, bson.M{"profileId": profileID}); err != nil {
		return err
	}
	_, err := repository.brandProfiles.DeleteOne(ctx, bson.M{"_id": profileID})
	return err
}

// HasBrandProfileMemberConflict 判断成员是否已属于其他品牌档案。
func (repository *InventoryRepository) HasBrandProfileMemberConflict(ctx context.Context, profileID string, members []BrandProfileMember) (bool, error) {
	if len(members) == 0 {
		return false, nil
	}
	memberFilters := make(bson.A, 0, len(members))
	for _, member := range members {
		memberFilters = append(memberFilters, bson.M{"regionId": member.RegionID, "distributorId": member.DistributorID})
	}
	count, err := repository.brandProfileMembers.CountDocuments(ctx, bson.M{"profileId": bson.M{"$ne": profileID}, "$or": memberFilters}, options.Count().SetLimit(1))
	return count > 0, err
}
