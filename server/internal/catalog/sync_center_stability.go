package catalog

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
)

// SyncCenterAvailability is a current authoritative state, independent of historical stability scores.
type SyncCenterAvailability struct {
	Known      bool      `json:"known"`
	Available  bool      `json:"available"`
	Stock      int64     `json:"stock"`
	Generation string    `json:"generation"`
	ObservedAt time.Time `json:"observedAt"`
}

// CurrentAvailability reads one complete brand generation for all requested articles.
// A valid complete head proves a missing article unavailable; an unavailable head proves nothing.
func (center *SyncCenter) CurrentAvailability(ctx context.Context, profileID string, itemNos []string) (map[string]SyncCenterAvailability, error) {
	states := make(map[string]SyncCenterAvailability, len(itemNos))
	keys := []string{}
	for _, itemNo := range itemNos {
		key := model.ItemNoKey(itemNo)
		if key != "" {
			if _, exists := states[key]; !exists {
				keys = append(keys, key)
				states[key] = SyncCenterAvailability{}
			}
		}
	}
	head, err := center.stabilityHead(ctx, profileID)
	if err != nil {
		return states, err
	}
	cursor, err := center.products.Find(ctx, bson.M{"generation": head.Generation, "profileId": profileID, "itemNoKey": bson.M{"$in": keys}}, options.Find().SetProjection(bson.M{"itemNoKey": 1, "itemNo": 1, "stock": 1}))
	if err != nil {
		return states, err
	}
	defer cursor.Close(ctx)
	products := []SyncCenterProduct{}
	if err = cursor.All(ctx, &products); err != nil {
		return states, err
	}
	stocks := make(map[string]int64, len(keys))
	for _, product := range products {
		if product.Stock < 0 {
			return states, errors.New("同步商品可售库存异常，当前库存未知")
		}
		stocks[model.ItemNoKey(product.ItemNo)] += product.Stock
	}
	for key := range states {
		stock := stocks[key]
		states[key] = SyncCenterAvailability{Known: true, Available: stock > 0, Stock: stock, Generation: head.Generation, ObservedAt: head.SyncedAt}
	}
	return states, nil
}

func (center *SyncCenter) stabilityHead(ctx context.Context, profileID string) (SyncCenterSnapshot, error) {
	head, err := center.readHead(ctx, profileID)
	if err != nil {
		return head, err
	}
	if head.Generation == "" || head.SyncedAt.IsZero() {
		return head, errors.New("同步版本或观察时间缺失，当前库存未知")
	}
	_, members, err := NewInventoryRepository(center.products.Database()).GetBrandProfile(ctx, profileID)
	if err != nil {
		return head, err
	}
	if !sameSyncMembers(members, head.Members) {
		return head, errors.New("聚合品牌门店已变更，当前库存未知，请重新同步")
	}
	count, err := center.products.CountDocuments(ctx, bson.M{"profileId": profileID, "generation": head.Generation})
	if err != nil {
		return head, err
	}
	if count != int64(head.ProductCount) {
		return head, errors.New("完整同步商品覆盖不一致，当前库存未知")
	}
	return head, nil
}

type SyncCenterStabilityObservation struct {
	ProfileID         string    `json:"profileId"`
	Generation        string    `json:"generation"`
	ObservedAt        time.Time `json:"observedAt"`
	Articles          int       `json:"articles"`
	AvailableArticles int       `json:"availableArticles"`
	Modified          int64     `json:"modified"`
	SkippedNewer      int       `json:"skippedNewer"`
}

// RecordActiveStability projects an existing complete source generation into the existing daily table.
// The source head timestamp is the observation time: running this later never invents a new day.
func (center *SyncCenter) RecordActiveStability(ctx context.Context, profileID string) (SyncCenterStabilityObservation, error) {
	result := SyncCenterStabilityObservation{ProfileID: profileID}
	head, err := center.stabilityHead(ctx, profileID)
	if err != nil {
		return result, err
	}
	result.Generation = head.Generation
	result.ObservedAt = head.SyncedAt
	current, available, err := center.stabilitySourceArticles(ctx, head)
	if err != nil {
		return result, err
	}
	result.Articles = len(current)
	result.AvailableArticles = len(available)
	members := make([]string, 0, len(head.Members))
	for _, member := range head.Members {
		members = append(members, member.RegionID+":"+member.DistributorID)
	}
	sort.Strings(members)
	snapshot := stabilityScopeSnapshot{ScopeID: profileID, BrandProfileID: profileID, SourceMemberIDs: members, AvailableItemNos: available}
	return center.persistActiveStability(ctx, head, snapshot, current, result)
}

func (center *SyncCenter) stabilitySourceArticles(ctx context.Context, head SyncCenterSnapshot) (map[string]bool, map[string]struct{}, error) {
	cursor, err := center.products.Find(ctx, bson.M{"profileId": head.ProfileID, "generation": head.Generation}, options.Find().SetProjection(bson.M{"itemNo": 1}))
	if err != nil {
		return nil, nil, err
	}
	products := []SyncCenterProduct{}
	err = cursor.All(ctx, &products)
	cursor.Close(ctx)
	if err != nil {
		return nil, nil, err
	}
	current := make(map[string]bool, len(products))
	for _, product := range products {
		key := model.ItemNoKey(product.ItemNo)
		if key != "" {
			current[key] = true
		}
	}
	cursor, err = center.skus.Find(ctx, bson.M{"profileId": head.ProfileID, "generation": head.Generation}, options.Find().SetProjection(bson.M{"itemNo": 1, "availableStock": 1}))
	if err != nil {
		return nil, nil, err
	}
	defer cursor.Close(ctx)
	available := map[string]struct{}{}
	count := 0
	for cursor.Next(ctx) {
		var sku SyncCenterSKU
		if err = cursor.Decode(&sku); err != nil {
			return nil, nil, err
		}
		count++
		key := model.ItemNoKey(sku.ItemNo)
		if !current[key] || sku.AvailableStock < 0 {
			return nil, nil, errors.New("完整同步SKU身份或库存覆盖异常，拒绝写日度观察")
		}
		if sku.AvailableStock > 0 {
			available[key] = struct{}{}
		}
	}
	if err = cursor.Err(); err != nil {
		return nil, nil, err
	}
	if count != head.SKUCount {
		return nil, nil, fmt.Errorf("完整同步SKU覆盖异常：%d/%d", count, head.SKUCount)
	}
	return current, available, nil
}

func (center *SyncCenter) persistActiveStability(ctx context.Context, head SyncCenterSnapshot, snapshot stabilityScopeSnapshot, current map[string]bool, result SyncCenterStabilityObservation) (SyncCenterStabilityObservation, error) {
	collection := center.products.Database().Collection("catalog_item_stability")
	cursor, err := collection.Find(ctx, bson.M{"scopeId": head.ProfileID})
	if err != nil {
		return result, err
	}
	defer cursor.Close(ctx)
	existing := []ItemStability{}
	if err = cursor.All(ctx, &existing); err != nil {
		return result, err
	}
	writes := make([]mongo.WriteModel, 0, len(existing)+len(current))
	seen := map[string]bool{}
	for _, previous := range existing {
		key := model.ItemNoKey(previous.ItemNo)
		seen[key] = true
		if previous.LastObservedAt.After(head.SyncedAt) {
			result.SkippedNewer++
			continue
		}
		_, available := snapshot.AvailableItemNos[key]
		next := applyDailyAvailabilityObservation(previous, snapshot, previous.ItemNo, available, head.SyncedAt)
		writes = append(writes, stabilityObservationWrite(next))
	}
	for itemNo := range current {
		if seen[itemNo] {
			continue
		}
		_, available := snapshot.AvailableItemNos[itemNo]
		next := applyDailyAvailabilityObservation(ItemStability{}, snapshot, itemNo, available, head.SyncedAt)
		writes = append(writes, stabilityObservationWrite(next))
	}
	if len(writes) == 0 {
		return result, nil
	}
	writeResult, err := collection.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false))
	if err != nil {
		return result, err
	}
	result.Modified = writeResult.ModifiedCount + writeResult.UpsertedCount
	return result, nil
}

func stabilityObservationWrite(row ItemStability) mongo.WriteModel {
	return mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": row.ID, "$or": bson.A{bson.M{"lastObservedAt": bson.M{"$lte": row.LastObservedAt}}, bson.M{"lastObservedAt": bson.M{"$exists": false}}}}).SetUpdate(bson.M{"$set": row, "$unset": legacyStabilityFields()}).SetUpsert(true)
}
