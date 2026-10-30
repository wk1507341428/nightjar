package catalog

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
)

// ReadDirectory reads only the compact brand/store metadata for page dropdowns.
func (center *SyncCenter) ReadDirectory(ctx context.Context, profileID string) (SyncCenterBrand, []SyncCenterStore, error) {
	head, err := center.metadataHead(ctx, profileID, "", "")
	if err != nil {
		return SyncCenterBrand{}, nil, err
	}
	brand, err := center.readMetadataBrand(ctx, head)
	if err != nil {
		return brand, nil, err
	}
	cursor, err := center.stores.Find(ctx, bson.M{"profileId": head.ProfileID, "generation": head.Generation})
	if err != nil {
		return brand, nil, err
	}
	defer cursor.Close(ctx)
	stores := []SyncCenterStore{}
	if err = cursor.All(ctx, &stores); err != nil {
		return brand, nil, err
	}
	if len(stores) != brand.StoreCount || len(stores) != len(head.Members) {
		return brand, nil, fmt.Errorf("本地门店元数据不完整，请重新同步")
	}
	identities := make(map[string]bool, len(stores))
	for _, store := range stores {
		identities[store.RegionID+":"+store.DistributorID] = true
	}
	for _, member := range head.Members {
		if !identities[member.RegionID+":"+member.DistributorID] {
			return brand, nil, fmt.Errorf("本地门店元数据归属不完整，请重新同步")
		}
	}
	return brand, stores, nil
}
