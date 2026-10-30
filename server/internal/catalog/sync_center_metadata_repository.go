package catalog

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (center *SyncCenter) metadataHead(ctx context.Context, profileID, regionID, distributorID string) (SyncCenterSnapshot, error) {
	if profileID == "" {
		if regionID == "" || distributorID == "" {
			return SyncCenterSnapshot{}, fmt.Errorf("请选择已同步品牌或门店")
		}
		heads, err := center.heads.Find(ctx, bson.M{"members": bson.M{"$elemMatch": bson.M{"regionId": regionID, "distributorId": distributorID}}})
		if err != nil {
			return SyncCenterSnapshot{}, err
		}
		defer heads.Close(ctx)
		rows := []SyncCenterSnapshot{}
		if err = heads.All(ctx, &rows); err != nil {
			return SyncCenterSnapshot{}, err
		}
		if len(rows) != 1 {
			return SyncCenterSnapshot{}, fmt.Errorf("门店尚未完整同步或归属不唯一，请到同步中心检查")
		}
		profileID = rows[0].ProfileID
	}
	head, err := center.readHead(ctx, profileID)
	if err != nil {
		return head, err
	}
	if err = center.ValidateVersion(ctx, profileID, head.Generation); err != nil {
		return head, err
	}
	if regionID != "" || distributorID != "" {
		found := false
		for _, member := range head.Members {
			found = found || ((regionID == "" || member.RegionID == regionID) && (distributorID == "" || member.DistributorID == distributorID))
		}
		if !found {
			return head, fmt.Errorf("门店不属于当前同步品牌")
		}
	}
	return head, nil
}

func (center *SyncCenter) readMetadataBrand(ctx context.Context, head SyncCenterSnapshot) (SyncCenterBrand, error) {
	var brand SyncCenterBrand
	err := center.brands.FindOne(ctx, bson.M{"profileId": head.ProfileID, "generation": head.Generation, "version": syncMetadataVersion}).Decode(&brand)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return brand, fmt.Errorf("当前同步版本尚未补齐品牌类目，请在同步中心同步或补齐元数据")
	}
	return brand, err
}

// ReadCategories reads the small persisted taxonomy only, with no product/SKU scan or upstream fallback.
func (center *SyncCenter) ReadCategories(ctx context.Context, profileID, regionID, distributorID string) ([]BrandCategory, error) {
	head, err := center.metadataHead(ctx, strings.TrimSpace(profileID), strings.TrimSpace(regionID), strings.TrimSpace(distributorID))
	if err != nil {
		return nil, err
	}
	brand, err := center.readMetadataBrand(ctx, head)
	if err != nil {
		return nil, err
	}
	if err = center.validateMetadataStores(ctx, head, brand); err != nil {
		return nil, err
	}
	filter := bson.M{"profileId": head.ProfileID, "generation": head.Generation}
	cursor, err := center.categories.Find(ctx, filter, options.Find().SetProjection(bson.M{"categoryId": 1, "name": 1, "imageUrl": 1, "regionId": 1, "distributorId": 1, "display": 1}).SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	rows := []SyncCenterCategory{}
	if err = cursor.All(ctx, &rows); err != nil {
		return nil, err
	}
	if len(rows) != brand.CategoryCount {
		return nil, fmt.Errorf("本地类目数据不完整，请重新同步")
	}
	selected := []SyncCenterCategory{}
	for _, row := range rows {
		if (regionID == "" || row.RegionID == regionID) && (distributorID == "" || row.DistributorID == distributorID) {
			selected = append(selected, row)
		}
	}
	return metadataDisplayRows(selected), nil
}

func (center *SyncCenter) ReadMetadata(ctx context.Context, profileID string) (SyncCenterMetadata, error) {
	var result SyncCenterMetadata
	head, err := center.metadataHead(ctx, profileID, "", "")
	if err != nil {
		return result, err
	}
	result.Brand, err = center.readMetadataBrand(ctx, head)
	if err != nil {
		return result, err
	}
	filter := bson.M{"profileId": head.ProfileID, "generation": head.Generation}
	stores, err := center.stores.Find(ctx, filter)
	if err != nil {
		return result, err
	}
	defer stores.Close(ctx)
	if err = stores.All(ctx, &result.Stores); err != nil {
		return result, err
	}
	categories, err := center.categories.Find(ctx, filter)
	if err != nil {
		return result, err
	}
	defer categories.Close(ctx)
	if err = categories.All(ctx, &result.Categories); err != nil {
		return result, err
	}
	if len(result.Stores) != result.Brand.StoreCount || len(result.Categories) != result.Brand.CategoryCount {
		return result, fmt.Errorf("本地品牌元数据不完整，请重新同步")
	}
	sort.Slice(result.Stores, func(i, j int) bool { return result.Stores[i].ID < result.Stores[j].ID })
	sort.Slice(result.Categories, func(i, j int) bool { return result.Categories[i].ID < result.Categories[j].ID })
	return result, nil
}

func (center *SyncCenter) ensureMetadataIndexes(ctx context.Context) error {
	for _, collection := range []*mongo.Collection{center.brands, center.stores, center.categories} {
		if _, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "profileId", Value: 1}, {Key: "generation", Value: 1}}}); err != nil {
			return err
		}
	}
	return nil
}

func (center *SyncCenter) validateMetadataStores(ctx context.Context, head SyncCenterSnapshot, brand SyncCenterBrand) error {
	cursor, err := center.stores.Find(ctx, bson.M{"profileId": head.ProfileID, "generation": head.Generation})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	stores := []SyncCenterStore{}
	if err = cursor.All(ctx, &stores); err != nil {
		return err
	}
	if len(stores) != brand.StoreCount || len(stores) != len(head.Members) {
		return fmt.Errorf("本地门店元数据不完整，请重新同步")
	}
	identities := map[string]bool{}
	for _, store := range stores {
		identities[store.RegionID+":"+store.DistributorID] = true
	}
	for _, member := range head.Members {
		if !identities[member.RegionID+":"+member.DistributorID] {
			return fmt.Errorf("本地门店元数据归属不完整，请重新同步")
		}
	}
	return nil
}
