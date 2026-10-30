package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
)

// SyncCenter owns explicit source synchronization and local authoritative reads.
type SyncCenter struct {
	source                      *Service
	runs, heads, products, skus *mongo.Collection
	brands, stores, categories  *mongo.Collection
}

func NewSyncCenter(database *mongo.Database, source *Service) *SyncCenter {
	return &SyncCenter{brands: database.Collection("source_sync_brands"), stores: database.Collection("source_sync_stores"), categories: database.Collection("source_sync_categories"), source: source, runs: database.Collection("source_sync_runs"), heads: database.Collection("source_sync_heads"), products: database.Collection("source_sync_products"), skus: database.Collection("source_sync_skus")}
}

// EnsureIndexes is called once on process startup. A prior process cannot continue its in-flight run.
func (center *SyncCenter) EnsureIndexes(ctx context.Context) error {
	if err := center.InitializeRegistry(ctx); err != nil {
		return err
	}
	if err := center.ensureMetadataIndexes(ctx); err != nil {
		return err
	}
	if err := center.backfillItemNoKeys(ctx); err != nil {
		return err
	}
	groups := []struct {
		collection *mongo.Collection
		indexes    []mongo.IndexModel
	}{
		{center.runs, []mongo.IndexModel{
			{Keys: bson.D{{Key: "profileId", Value: 1}}, Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.M{"status": SyncCenterRunning}).SetName("one_running_brand")},
			{Keys: bson.D{{Key: "startedAt", Value: -1}}}}},
		{center.products, []mongo.IndexModel{
			{Keys: bson.D{{Key: "profileId", Value: 1}, {Key: "generation", Value: 1}, {Key: "regionId", Value: 1}, {Key: "distributorId", Value: 1}, {Key: "itemId", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "generation", Value: 1}, {Key: "itemNo", Value: 1}}},
			{Keys: bson.D{{Key: "profileId", Value: 1}, {Key: "generation", Value: 1}, {Key: "itemNoKey", Value: 1}}},
			{Keys: bson.D{{Key: "profileId", Value: 1}, {Key: "generation", Value: 1}, {Key: "discountRate", Value: 1}, {Key: "_id", Value: 1}}}}},
		{center.skus, []mongo.IndexModel{{Keys: bson.D{{Key: "generation", Value: 1}, {Key: "itemNo", Value: 1}}}, {Keys: bson.D{{Key: "productId", Value: 1}}}}},
	}
	for _, group := range groups {
		if _, err := group.collection.Indexes().CreateMany(ctx, group.indexes); err != nil {
			return err
		}
	}
	now := time.Now()
	_, err := center.runs.UpdateMany(ctx, bson.M{"status": SyncCenterRunning}, bson.M{"$set": bson.M{"status": SyncCenterInterrupted, "error": "服务重启，同步中断；上次完整数据保留，请重新同步", "updatedAt": now, "finishedAt": now}})
	return err
}

func (center *SyncCenter) ListRuns(ctx context.Context) ([]SyncCenterRun, error) {
	cursor, err := center.runs.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "startedAt", Value: -1}}).SetLimit(100))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	rows := []SyncCenterRun{}
	err = cursor.All(ctx, &rows)
	return rows, err
}

func (center *SyncCenter) GetRun(ctx context.Context, id string) (SyncCenterRun, error) {
	var run SyncCenterRun
	err := center.runs.FindOne(ctx, bson.M{"_id": id}).Decode(&run)
	return run, err
}

func (center *SyncCenter) readHead(ctx context.Context, profileID string) (SyncCenterSnapshot, error) {
	var snapshot SyncCenterSnapshot
	err := center.heads.FindOne(ctx, bson.M{"_id": profileID}).Decode(&snapshot)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return snapshot, fmt.Errorf("聚合品牌尚未完整同步，请先到同步中心同步")
	}
	normalizeSyncProducts(snapshot.Products)
	return snapshot, err
}

// ReadProfile returns exactly one activated generation, never staging rows from a partial run.
func (center *SyncCenter) ReadProfile(ctx context.Context, profileID string) (SyncCenterSnapshot, error) {
	snapshot, err := center.readHead(ctx, profileID)
	if err != nil {
		return snapshot, err
	}
	_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, profileID)
	if err != nil {
		return snapshot, err
	}
	if !sameSyncMembers(members, snapshot.Members) {
		return snapshot, fmt.Errorf("聚合品牌门店已变更，请先在同步中心重新同步")
	}
	cursor, err := center.products.Find(ctx, bson.M{"profileId": profileID, "generation": snapshot.Generation}, options.Find().SetSort(bson.D{{Key: "regionId", Value: 1}, {Key: "distributorId", Value: 1}, {Key: "itemId", Value: 1}}))
	if err != nil {
		return snapshot, err
	}
	defer cursor.Close(ctx)
	snapshot.Products = []SyncCenterProduct{}
	err = cursor.All(ctx, &snapshot.Products)
	if err == nil && len(snapshot.Products) != snapshot.ProductCount {
		err = fmt.Errorf("本地同步版本商品覆盖不完整，禁止对账")
	}
	normalizeSyncProducts(snapshot.Products)
	return snapshot, err
}

func sameSyncMembers(a, b []BrandProfileMember) bool {
	if len(a) != len(b) {
		return false
	}
	keys := map[string]bool{}
	for _, member := range a {
		keys[member.RegionID+":"+member.DistributorID] = true
	}
	for _, member := range b {
		if !keys[member.RegionID+":"+member.DistributorID] {
			return false
		}
	}
	return true
}

// FindProduct reads a source identity only from currently activated brand generations.
func (center *SyncCenter) FindProduct(ctx context.Context, regionID, itemID string) (map[string]any, error) {
	heads, err := center.heads.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer heads.Close(ctx)
	snapshots := []SyncCenterSnapshot{}
	if err = heads.All(ctx, &snapshots); err != nil {
		return nil, err
	}
	generations := []string{}
	for _, head := range snapshots {
		generations = append(generations, head.Generation)
	}
	var product SyncCenterProduct
	filter := bson.M{"generation": bson.M{"$in": generations}, "$or": bson.A{bson.M{"_id": itemID}, bson.M{"itemId": itemID}, bson.M{"data.default_item_id": itemID}, bson.M{"data.item_id": itemID}, bson.M{"data.goods_id": itemID}}}
	if regionID != "" {
		filter["regionId"] = regionID
	}
	err = center.products.FindOne(ctx, filter).Decode(&product)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, fmt.Errorf("本地同步数据不存在该商品，请先到同步中心同步")
	}
	if product.Data != nil {
		product.Data["brand_profile_id"] = product.ProfileID
		encoded, _ := json.Marshal(product.Data)
		_ = json.Unmarshal(encoded, &product.Data)
	}
	if err == nil && product.Data != nil {
		product.Data["catalog_offer_id"] = product.ID
		product.Data["regionauth_id"] = product.RegionID
		product.Data["distributor_id"] = product.DistributorID
		product.Data["_sync_generation"] = product.Generation
		product.Data["last_synced_at"] = product.SyncedAt.Format(time.RFC3339)
	}
	return product.Data, err
}

func (center *SyncCenter) Search(ctx context.Context, profileID, keyword string, page, pageSize int) (SyncCenterSearchResult, error) {
	result := SyncCenterSearchResult{List: []SyncCenterProduct{}, Page: page, PageSize: pageSize}
	head, err := center.readHead(ctx, profileID)
	if err != nil {
		return result, err
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 200 {
		pageSize = 50
	}
	result.Page = page
	result.PageSize = pageSize
	filter := bson.M{"profileId": profileID, "generation": head.Generation}
	if keyword != "" {
		pattern := bson.M{"$regex": regexp.QuoteMeta(keyword), "$options": "i"}
		filter["$or"] = bson.A{bson.M{"itemNo": pattern}, bson.M{"name": pattern}}
	}
	result.Total, err = center.products.CountDocuments(ctx, filter)
	if err != nil {
		return result, err
	}
	cursor, err := center.products.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "itemNo", Value: 1}, {Key: "_id", Value: 1}}).SetSkip(int64((page-1)*pageSize)).SetLimit(int64(pageSize)))
	if err != nil {
		return result, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &result.List)
	normalizeSyncProducts(result.List)
	return result, err
}

func (center *SyncCenter) saveRun(ctx context.Context, run *SyncCenterRun) error {
	run.UpdatedAt = time.Now()
	_, err := center.runs.ReplaceOne(ctx, bson.M{"_id": run.ID}, run)
	return err
}

// ReadStore requires its containing aggregate brand to have a complete active generation.
func (center *SyncCenter) ReadStore(ctx context.Context, regionID, distributorID string) (SyncCenterSnapshot, error) {
	profileID, err := center.source.inventoryRepository.FindBrandProfileIDByMember(ctx, regionID, distributorID)
	if err != nil {
		return SyncCenterSnapshot{}, err
	}
	if profileID == "" {
		return SyncCenterSnapshot{}, fmt.Errorf("门店未加入聚合品牌，请先建立品牌关系并在同步中心同步")
	}
	snapshot, err := center.ReadProfile(ctx, profileID)
	if err != nil {
		return snapshot, err
	}
	selected := []SyncCenterProduct{}
	for _, product := range snapshot.Products {
		if product.RegionID == regionID && product.DistributorID == distributorID {
			selected = append(selected, product)
		}
	}
	snapshot.Products = selected
	return snapshot, nil
}

// SearchProducts executes bounded indexed local queries across activated snapshots only.
func (center *SyncCenter) SearchProducts(ctx context.Context, query SyncCenterProductSearch) (SyncCenterSearchResult, error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 || query.PageSize > 200 {
		query.PageSize = 50
	}
	result := SyncCenterSearchResult{List: []SyncCenterProduct{}, Page: query.Page, PageSize: query.PageSize}
	filter, err := center.activeFilter(ctx, query.ProfileID)
	if err != nil {
		return result, err
	}
	addSyncSearchFilters(filter, query)
	result.Total, err = center.products.CountDocuments(ctx, filter)
	if err != nil {
		return result, err
	}
	if query.Sort == "xianyuLast" {
		return center.searchXianyuLast(ctx, query, filter, result)
	}
	order := bson.D{{Key: "itemNo", Value: 1}, {Key: "_id", Value: 1}}
	switch query.Sort {
	case "discount":
		order = bson.D{{Key: "discountRate", Value: 1}, {Key: "_id", Value: 1}}
	case "price_asc":
		order = bson.D{{Key: "priceCents", Value: 1}, {Key: "_id", Value: 1}}
	case "price_desc":
		order = bson.D{{Key: "priceCents", Value: -1}, {Key: "_id", Value: 1}}
	case "stock_desc":
		order = bson.D{{Key: "stock", Value: -1}, {Key: "_id", Value: 1}}
	}
	cursor, err := center.products.Find(ctx, filter, options.Find().SetSort(order).SetSkip(int64((query.Page-1)*query.PageSize)).SetLimit(int64(query.PageSize)))
	if err != nil {
		return result, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &result.List)
	normalizeSyncProducts(result.List)
	return result, err
}

func (center *SyncCenter) activeFilter(ctx context.Context, profileID string) (bson.M, error) {
	headsFilter := bson.M{}
	if profileID != "" {
		headsFilter["_id"] = profileID
	}
	cursor, err := center.heads.Find(ctx, headsFilter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	heads := []SyncCenterSnapshot{}
	if err = cursor.All(ctx, &heads); err != nil {
		return nil, err
	}
	generations := []string{}
	for _, head := range heads {
		generations = append(generations, head.Generation)
	}
	return bson.M{"generation": bson.M{"$in": generations}}, nil
}

func addSyncSearchFilters(filter bson.M, query SyncCenterProductSearch) {
	if query.ProfileID != "" {
		filter["profileId"] = query.ProfileID
	}
	if query.RegionID != "" {
		filter["regionId"] = query.RegionID
	}
	if query.DistributorID != "" {
		filter["distributorId"] = query.DistributorID
	}
	if len(query.CategoryIDs) > 0 {
		filter["categoryIds"] = bson.M{"$in": query.CategoryIDs}
	}
	if query.StockOnly {
		filter["stock"] = bson.M{"$gt": 0}
	}
	if query.Keyword != "" {
		pattern := bson.M{"$regex": regexp.QuoteMeta(query.Keyword), "$options": "i"}
		filter["$or"] = bson.A{bson.M{"itemNo": pattern}, bson.M{"name": pattern}}
	}
}

type SyncCenterSKUSearchResult struct {
	List     []SyncCenterSKU `json:"list"`
	Total    int64           `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
}

func (center *SyncCenter) SearchSKUs(ctx context.Context, query SyncCenterProductSearch) (SyncCenterSKUSearchResult, error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 || query.PageSize > 200 {
		query.PageSize = 50
	}
	result := SyncCenterSKUSearchResult{List: []SyncCenterSKU{}, Page: query.Page, PageSize: query.PageSize}
	filter, err := center.activeFilter(ctx, query.ProfileID)
	if err != nil {
		return result, err
	}
	addSyncSKUSearchFilters(filter, query)
	result.Total, err = center.skus.CountDocuments(ctx, filter)
	if err != nil {
		return result, err
	}
	cursor, err := center.skus.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "itemNo", Value: 1}, {Key: "_id", Value: 1}}).SetSkip(int64((query.Page-1)*query.PageSize)).SetLimit(int64(query.PageSize)))
	if err != nil {
		return result, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &result.List)
	return result, err
}

func (center *SyncCenter) ListSnapshots(ctx context.Context) ([]SyncCenterSnapshot, error) {
	cursor, err := center.heads.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	rows := []SyncCenterSnapshot{}
	err = cursor.All(ctx, &rows)
	return rows, err
}

// ValidateVersion is a bounded head/config check for queued mutations.
func (center *SyncCenter) ValidateVersion(ctx context.Context, profileID, generation string) error {
	head, err := center.readHead(ctx, profileID)
	if err != nil {
		return err
	}
	if head.Generation != generation {
		return errors.New("同步版本已更新，请重新生成预览")
	}
	_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, profileID)
	if err != nil {
		return err
	}
	if !sameSyncMembers(members, head.Members) {
		return errors.New("聚合品牌门店已变化，请重新同步并预览")
	}
	return nil
}

// ReadArticle obtains all regional sources for one article without loading the entire brand.
func (center *SyncCenter) ReadArticle(ctx context.Context, profileID, itemNo string) (SyncCenterSnapshot, error) {
	head, err := center.readHead(ctx, profileID)
	if err != nil {
		return head, err
	}
	if err = center.ValidateVersion(ctx, profileID, head.Generation); err != nil {
		return head, err
	}
	cursor, err := center.products.Find(ctx, bson.M{"profileId": profileID, "generation": head.Generation, "itemNoKey": model.ItemNoKey(itemNo)})
	if err != nil {
		return head, err
	}
	defer cursor.Close(ctx)
	head.Products = []SyncCenterProduct{}
	err = cursor.All(ctx, &head.Products)
	normalizeSyncProducts(head.Products)
	return head, err
}

func normalizeSyncProducts(products []SyncCenterProduct) {
	for i := range products {
		data, err := json.Marshal(products[i].Data)
		if err == nil {
			_ = json.Unmarshal(data, &products[i].Data)
		}
	}
}

// resumeRun reuses successful per-product staging checkpoints from a failed/interrupted run.
func (center *SyncCenter) resumeRun(ctx context.Context, profile BrandProfile, members []BrandProfileMember) (SyncCenterRun, bool, error) {
	var run SyncCenterRun
	err := center.runs.FindOne(ctx, bson.M{"profileId": profile.ID, "status": bson.M{"$in": bson.A{SyncCenterFailed, SyncCenterInterrupted}}}, options.FindOne().SetSort(bson.D{{Key: "startedAt", Value: -1}})).Decode(&run)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return run, false, nil
	}
	if err != nil {
		return run, false, err
	}
	// Head publication can succeed before the final run status write. Such a generation
	// is immutable authoritative data, even if a restart marked its run interrupted.
	published, repairErr := center.repairPublishedRun(ctx, &run)
	if repairErr != nil || published {
		return run, false, repairErr
	}
	// An active retry can retain its run for three hours; each product has an independent freshness bound.
	if !sameSyncMembers(members, run.Members) || !syncRunWithinResumeWindow(run, time.Now()) {
		return run, false, nil
	}
	previousStatus := run.Status
	run.Status = SyncCenterRunning
	run.Stage = SyncCenterStageLists
	run.Error = ""
	run.FinishedAt = nil
	run.UpdatedAt = time.Now()
	result, err := center.runs.ReplaceOne(ctx, bson.M{"_id": run.ID, "status": previousStatus}, run)
	if mongo.IsDuplicateKeyError(err) {
		err = center.runs.FindOne(ctx, bson.M{"profileId": profile.ID, "status": SyncCenterRunning}).Decode(&run)
		return run, true, err
	}
	if err != nil {
		return run, false, err
	}
	if result.MatchedCount == 0 {
		return run, false, nil
	}
	go center.execute(run, members)
	return run, true, nil
}

func (center *SyncCenter) stagedProduct(ctx context.Context, run SyncCenterRun, work syncCenterWork) (syncCenterResult, bool, error) {
	id := hashID(run.ID, work.member.RegionID, work.member.DistributorID, syncSourceID(work.product))
	var product SyncCenterProduct
	err := center.products.FindOne(ctx, bson.M{"_id": id}).Decode(&product)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return syncCenterResult{}, false, nil
	}
	if err != nil {
		return syncCenterResult{}, false, err
	}
	complete, count, err := center.checkStagedProduct(ctx, run, work, product)
	if err != nil {
		return syncCenterResult{}, false, err
	}
	if !complete {
		return syncCenterResult{}, false, center.removeStagedProduct(ctx, run, id)
	}
	return syncCenterResult{products: 1, skus: count}, true, nil
}

func (center *SyncCenter) repairPublishedRun(ctx context.Context, run *SyncCenterRun) (bool, error) {
	var head SyncCenterSnapshot
	err := center.heads.FindOne(ctx, bson.M{"_id": run.ProfileID}).Decode(&head)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if head.Generation != run.ID {
		return false, nil
	}
	run.Status = SyncCenterComplete
	run.Error = ""
	run.Stage = SyncCenterStageActivate
	run.FinishedAt = &head.SyncedAt
	run.ProductCount = head.ProductCount
	run.SKUCount = head.SKUCount
	run.Processed = run.Total
	return true, center.saveRun(ctx, run)
}

// SKU search includes source identities and human-readable specifications in addition to product fields.
func addSyncSKUSearchFilters(filter bson.M, query SyncCenterProductSearch) {
	addSyncSearchFilters(filter, query)
	if query.StockOnly {
		delete(filter, "stock")
		filter["availableStock"] = bson.M{"$gt": 0}
	}
	if query.Keyword == "" {
		return
	}
	pattern := bson.M{"$regex": regexp.QuoteMeta(query.Keyword), "$options": "i"}
	clauses, _ := filter["$or"].(bson.A)
	filter["$or"] = append(clauses, bson.M{"sourceSkuId": pattern}, bson.M{"skuCode": pattern}, bson.M{"label": pattern})
}

// backfillItemNoKeys adds only a derived lookup key to this synchronization schema.
// It never changes raw article strings, source documents, quantities, or active heads.
func (center *SyncCenter) backfillItemNoKeys(ctx context.Context) error {
	missing := bson.M{"$or": bson.A{bson.M{"itemNoKey": bson.M{"$exists": false}}, bson.M{"itemNoKey": ""}, bson.M{"itemNoKey": nil}}}
	cursor, err := center.products.Find(ctx, missing, options.Find().SetProjection(bson.M{"_id": 1, "itemNo": 1}).SetBatchSize(256))
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	writes := make([]mongo.WriteModel, 0, 256)
	for cursor.Next(ctx) {
		var row struct {
			ID     string `bson:"_id"`
			ItemNo string `bson:"itemNo"`
		}
		if err = cursor.Decode(&row); err != nil {
			return err
		}
		key := model.ItemNoKey(row.ItemNo)
		if key == "" {
			continue
		}
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": row.ID, "$or": missing["$or"]}).SetUpdate(bson.M{"$set": bson.M{"itemNoKey": key}}))
		if len(writes) == 256 {
			if _, err = center.products.BulkWrite(ctx, writes); err != nil {
				return err
			}
			writes = writes[:0]
		}
	}
	if err = cursor.Err(); err != nil {
		return err
	}
	if len(writes) > 0 {
		_, err = center.products.BulkWrite(ctx, writes)
	}
	return err
}

// searchXianyuLast orders the complete local result before pagination, scoped to one account.
func (center *SyncCenter) searchXianyuLast(ctx context.Context, query SyncCenterProductSearch, filter bson.M, result SyncCenterSearchResult) (SyncCenterSearchResult, error) {
	if center.source.listingRepository == nil {
		return result, errors.New("闲鱼本地快照仓储不可用")
	}
	itemNos, err := center.source.listingRepository.ListNormalizedItemNos(ctx, query.AccountID, "xianyu")
	if err != nil {
		return result, err
	}
	keys := make([]string, 0, len(itemNos))
	seen := map[string]bool{}
	for _, itemNo := range itemNos {
		key := model.ItemNoKey(itemNo)
		if key != "" && !seen[key] {
			seen[key] = true
			keys = append(keys, key)
		}
	}
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: filter}},
		bson.D{{Key: "$addFields", Value: bson.M{"xianyuListed": bson.M{"$in": bson.A{"$itemNoKey", bson.M{"$literal": keys}}}}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "xianyuListed", Value: 1}, {Key: "itemNo", Value: 1}, {Key: "_id", Value: 1}}}},
		bson.D{{Key: "$skip", Value: int64((query.Page - 1) * query.PageSize)}},
		bson.D{{Key: "$limit", Value: int64(query.PageSize)}},
	}
	cursor, err := center.products.Aggregate(ctx, pipeline)
	if err != nil {
		return result, err
	}
	defer cursor.Close(ctx)
	if err = cursor.All(ctx, &result.List); err != nil {
		return result, err
	}
	normalizeSyncProducts(result.List)
	for i := range result.List {
		if result.List[i].Data == nil {
			result.List[i].Data = map[string]any{}
		}
		result.List[i].Data["xianyu_listed"] = result.List[i].XianyuListed
	}
	return result, nil
}
