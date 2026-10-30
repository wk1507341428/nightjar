package catalog

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ErrSyncCenterBusy = errors.New("品牌正在同步或操作中，请完成后再试")
var ErrSyncCenterBrandNotFound = errors.New("品牌尚未加入同步中心")

const (
	syncRegistryStarting = "starting"
	syncRegistryDeleting = "deleting"
)

type SyncCenterBrandState struct {
	Active      bool                `bson:"active" json:"-"`
	DeletedAt   *time.Time          `bson:"deletedAt,omitempty" json:"-"`
	ProfileID   string              `bson:"_id" json:"profileId"`
	ProfileName string              `bson:"profileName" json:"profileName"`
	LastRunID   string              `bson:"lastRunId" json:"lastRunId,omitempty"`
	CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time           `bson:"updatedAt" json:"updatedAt"`
	Operation   string              `bson:"operation,omitempty" json:"-"`
	LatestRun   *SyncCenterRun      `bson:"-" json:"latestRun,omitempty"`
	Snapshot    *SyncCenterSnapshot `bson:"-" json:"snapshot,omitempty"`
}

type SyncCenterDeleteResult struct {
	ProfileID  string `json:"profileId"`
	Products   int64  `json:"products"`
	SKUs       int64  `json:"skus"`
	Runs       int64  `json:"runs"`
	Heads      int64  `json:"heads"`
	Brands     int64  `json:"brands"`
	Stores     int64  `json:"stores"`
	Categories int64  `json:"categories"`
}

func (center *SyncCenter) registry() *mongo.Collection {
	return center.heads.Database().Collection("source_sync_registry")
}

// InitializeRegistry runs only during API initialization, before accepting requests. Existing successful or failed source brands become one row each.
func (center *SyncCenter) InitializeRegistry(ctx context.Context) error {
	if _, err := center.registry().UpdateMany(ctx, bson.M{"operationExpiresAt": bson.M{"$lte": time.Now()}}, bson.M{"$unset": bson.M{"operation": ""}}); err != nil {
		return err
	}
	profiles, err := center.runs.Distinct(ctx, "profileId", bson.M{})
	if err != nil {
		return err
	}
	heads, err := center.ListSnapshots(ctx)
	if err != nil {
		return err
	}
	ids := map[string]bool{}
	for _, value := range profiles {
		if id, ok := value.(string); ok && id != "" {
			ids[id] = true
		}
	}
	for _, head := range heads {
		ids[head.ProfileID] = true
	}
	for id := range ids {
		name := id
		if center.source != nil && center.source.inventoryRepository != nil {
			if profile, _, getErr := center.source.inventoryRepository.GetBrandProfile(ctx, id); getErr == nil {
				name = profile.Name
			}
		}
		now := time.Now()
		if _, err = center.registry().UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$setOnInsert": bson.M{"profileName": name, "active": true, "createdAt": now, "updatedAt": now}}, options.Update().SetUpsert(true)); err != nil {
			return err
		}
	}
	return nil
}

// ListBrands exposes the latest state of each registered brand, never a task-history row per run.
func (center *SyncCenter) ListBrands(ctx context.Context) ([]SyncCenterBrandState, error) {
	cursor, err := center.registry().Find(ctx, bson.M{"active": bson.M{"$ne": false}}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}, {Key: "_id", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	rows := []SyncCenterBrandState{}
	if err = cursor.All(ctx, &rows); err != nil {
		return nil, err
	}
	for index := range rows {
		rows[index].LatestRun, err = center.latestRegistryRun(ctx, rows[index])
		if err != nil {
			return nil, err
		}
		var head SyncCenterSnapshot
		err = center.heads.FindOne(ctx, bson.M{"_id": rows[index].ProfileID}).Decode(&head)
		if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
			return nil, err
		}
		if err == nil {
			rows[index].Snapshot = &head
		}
	}
	return rows, nil
}

// A resumed run retains its original startedAt, so active work and the recorded run take priority over history ordering.
func (center *SyncCenter) latestRegistryRun(ctx context.Context, state SyncCenterBrandState) (*SyncCenterRun, error) {
	filters := []bson.M{{"profileId": state.ProfileID, "status": SyncCenterRunning}}
	if state.LastRunID != "" {
		filters = append(filters, bson.M{"profileId": state.ProfileID, "_id": state.LastRunID})
	}
	filters = append(filters, bson.M{"profileId": state.ProfileID})
	order := options.FindOne().SetSort(bson.D{{Key: "updatedAt", Value: -1}, {Key: "startedAt", Value: -1}, {Key: "_id", Value: -1}})
	for _, filter := range filters {
		var run SyncCenterRun
		err := center.runs.FindOne(ctx, filter, order).Decode(&run)
		if errors.Is(err, mongo.ErrNoDocuments) {
			continue
		}
		if err != nil {
			return nil, err
		}
		return &run, nil
	}
	return nil, nil
}

type syncRegistryLease struct {
	center           *SyncCenter
	ctx              context.Context
	cancel           context.CancelFunc
	profileID, owner string
}

func (center *SyncCenter) lockRegistry(ctx context.Context, profileID, operation string, create bool) (*syncRegistryLease, error) {
	now := time.Now()
	owner := uuid.NewString()
	filter := bson.M{"_id": profileID, "$or": bson.A{bson.M{"operation": bson.M{"$in": bson.A{"", nil}}}, bson.M{"operationExpiresAt": bson.M{"$lte": now}}}}
	if operation != syncRegistryStarting {
		filter["active"] = bson.M{"$ne": false}
	}
	update := bson.M{"$set": bson.M{"operation": operation, "operationOwner": owner, "operationExpiresAt": now.Add(2 * time.Minute)}, "$setOnInsert": bson.M{"profileName": profileID, "active": true, "createdAt": now, "updatedAt": now}}
	err := center.registry().FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetUpsert(create).SetReturnDocument(options.After)).Err()
	if mongo.IsDuplicateKeyError(err) {
		return nil, ErrSyncCenterBusy
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		if count, countErr := center.registry().CountDocuments(ctx, bson.M{"_id": profileID, "active": bson.M{"$ne": false}}); countErr == nil && count > 0 {
			return nil, ErrSyncCenterBusy
		}
		return nil, ErrSyncCenterBrandNotFound
	}
	if err != nil {
		return nil, err
	}
	leaseCtx, cancel := context.WithCancel(ctx)
	lease := &syncRegistryLease{center: center, ctx: leaseCtx, cancel: cancel, profileID: profileID, owner: owner}
	go lease.renew()
	return lease, nil
}

func (lease *syncRegistryLease) renew() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-lease.ctx.Done():
			return
		case <-ticker.C:
			result, err := lease.center.registry().UpdateOne(lease.ctx, bson.M{"_id": lease.profileID, "operationOwner": lease.owner}, bson.M{"$set": bson.M{"operationExpiresAt": time.Now().Add(2 * time.Minute)}})
			if err != nil || result.MatchedCount != 1 {
				lease.cancel()
				return
			}
		}
	}
}

func (lease *syncRegistryLease) close() {
	lease.cancel()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, _ = lease.center.registry().UpdateOne(ctx, bson.M{"_id": lease.profileID, "operationOwner": lease.owner}, bson.M{"$unset": bson.M{"operation": "", "operationOwner": "", "operationExpiresAt": ""}})
}

func (center *SyncCenter) updateRegistryRun(ctx context.Context, run SyncCenterRun) error {
	_, err := center.registry().UpdateOne(ctx, bson.M{"_id": run.ProfileID}, bson.M{"$set": bson.M{"profileName": run.ProfileName, "lastRunId": run.ID, "active": true, "updatedAt": time.Now()}, "$unset": bson.M{"deletedAt": ""}})
	return err
}

func (center *SyncCenter) requireNoRunningSync(ctx context.Context, profileID string) error {
	count, err := center.runs.CountDocuments(ctx, bson.M{"profileId": profileID, "status": SyncCenterRunning})
	if err != nil {
		return err
	}
	if count > 0 {
		return ErrSyncCenterBusy
	}
	return nil
}

// DeleteBrand only removes local synchronized source data. Configured brand membership and marketplace records are not touched.
func (center *SyncCenter) DeleteBrand(ctx context.Context, profileID string) (SyncCenterDeleteResult, error) {
	result := SyncCenterDeleteResult{ProfileID: profileID}
	if profileID == "" {
		return result, fmt.Errorf("请选择同步品牌")
	}
	if err := center.requireNoRunningSync(ctx, profileID); err != nil {
		return result, err
	}
	lease, err := center.lockRegistry(ctx, profileID, syncRegistryDeleting, false)
	if err != nil {
		return result, err
	}
	defer lease.close()
	ctx = lease.ctx
	if err := center.requireNoRunningSync(ctx, profileID); err != nil {
		return result, err
	}
	skuFilter, err := center.deletedBrandSKUFilter(ctx, profileID)
	if err != nil {
		return result, err
	}
	if err = center.deleteBrandCollections(ctx, profileID, skuFilter, &result); err != nil {
		return result, err
	}
	_, err = center.registry().UpdateOne(ctx, bson.M{"_id": profileID, "operationOwner": lease.owner}, bson.M{"$set": bson.M{"active": false, "deletedAt": time.Now(), "updatedAt": time.Now()}, "$unset": bson.M{"lastRunId": ""}})
	return result, err
}

func (center *SyncCenter) deletedBrandSKUFilter(ctx context.Context, profileID string) (bson.M, error) {
	productIDs, err := center.products.Distinct(ctx, "_id", bson.M{"profileId": profileID})
	if err != nil {
		return nil, err
	}
	generations, err := center.products.Distinct(ctx, "generation", bson.M{"profileId": profileID})
	if err != nil {
		return nil, err
	}
	runs, err := center.runs.Distinct(ctx, "_id", bson.M{"profileId": profileID})
	if err != nil {
		return nil, err
	}
	generations = append(generations, runs...)
	var head SyncCenterSnapshot
	err = center.heads.FindOne(ctx, bson.M{"_id": profileID}).Decode(&head)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}
	if err == nil {
		generations = append(generations, head.Generation)
	}
	validGenerations := []any{}
	for _, value := range generations {
		if generation, ok := value.(string); ok && generation != "" {
			validGenerations = append(validGenerations, generation)
		}
	}
	generations = validGenerations
	legacy := bson.M{"profileId": bson.M{"$in": bson.A{"", nil}}, "$or": bson.A{bson.M{"productId": bson.M{"$in": productIDs}}, bson.M{"generation": bson.M{"$in": generations}}}}
	return bson.M{"$or": bson.A{bson.M{"profileId": profileID}, legacy}}, nil
}

func (center *SyncCenter) deleteBrandCollections(ctx context.Context, profileID string, skuFilter bson.M, result *SyncCenterDeleteResult) error {
	operations := []struct {
		collection *mongo.Collection
		filter     bson.M
		count      *int64
	}{
		{center.heads, bson.M{"_id": profileID}, &result.Heads},
		{center.skus, skuFilter, &result.SKUs},
		{center.products, bson.M{"profileId": profileID}, &result.Products},
		{center.categories, bson.M{"profileId": profileID}, &result.Categories},
		{center.stores, bson.M{"profileId": profileID}, &result.Stores},
		{center.brands, bson.M{"profileId": profileID}, &result.Brands},
		{center.runs, bson.M{"profileId": profileID}, &result.Runs},
	}
	for _, operation := range operations {
		deleted, err := operation.collection.DeleteMany(ctx, operation.filter)
		if err != nil {
			return err
		}
		*operation.count = deleted.DeletedCount
	}
	return nil
}
