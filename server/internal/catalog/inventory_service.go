package catalog

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// BrandStoreCandidate 是上游品牌馆发现的一家门店。
type BrandStoreCandidate struct {
	RegionID      string `json:"regionId"`
	DistributorID string `json:"distributorId"`
	BrandName     string `json:"brandName"`
	ShopCode      string `json:"shopCode,omitempty"`
	StoreName     string `json:"storeName,omitempty"`
}

// OfferListResult 是本地商品列表结果。
type OfferListResult struct {
	List  []map[string]any `json:"list"`
	Total int64            `json:"total"`
}

// BrandCategory 是品牌门店用于商品筛选的平台类目。
type BrandCategory struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	ImageURL string `json:"imageUrl,omitempty"`
}

// SyncResult 是一次同步的结果摘要。
type SyncResult struct {
	Run SyncRun `json:"run"`
}

// DiscoverBrandStores 从上游按地区发现品牌门店。
func (service *Service) DiscoverBrandStores(ctx context.Context, regionID string) ([]BrandStoreCandidate, error) {
	var response struct {
		Data struct {
			List []struct {
				DistributorID string `json:"distributor_id"`
				Name          string `json:"name"`
				ShopCode      string `json:"shop_code"`
				UnitNumber    string `json:"unit_number"`
			} `json:"list"`
		} `json:"data"`
	}
	if err := service.getJSON(ctx, "/distributor/get_all_distributor", url.Values{
		"regionauth_id": {regionID},
		"page":          {"1"},
		"pageSize":      {"1000"},
		"sort_type":     {"5"},
	}, &response); err != nil {
		return nil, err
	}
	candidates := make([]BrandStoreCandidate, 0, len(response.Data.List))
	for _, distributor := range response.Data.List {
		if strings.TrimSpace(distributor.DistributorID) == "" || strings.TrimSpace(distributor.Name) == "" {
			continue
		}
		candidates = append(candidates, BrandStoreCandidate{
			RegionID:      regionID,
			DistributorID: strings.TrimSpace(distributor.DistributorID),
			BrandName:     strings.TrimSpace(distributor.Name),
			ShopCode:      strings.TrimSpace(distributor.ShopCode),
			StoreName:     strings.TrimSpace(distributor.UnitNumber),
		})
	}
	sort.Slice(candidates, func(leftIndex, rightIndex int) bool {
		return candidates[leftIndex].BrandName < candidates[rightIndex].BrandName
	})
	return candidates, nil
}

// ListBrandStores 返回本地已配置的品牌门店。
func (service *Service) ListBrandStores(ctx context.Context, regionID string) ([]BrandStore, error) {
	filter := bson.M{}
	if strings.TrimSpace(regionID) != "" && regionID != "all" {
		filter["regionId"] = regionID
	}
	cursor, err := service.inventoryRepository.brandStores.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "brandName", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	brandStores := make([]BrandStore, 0)
	if err := cursor.All(ctx, &brandStores); err != nil {
		return nil, err
	}
	return brandStores, nil
}

// GetBrandStore 返回一家本地品牌门店配置。
func (service *Service) GetBrandStore(ctx context.Context, brandStoreID string) (BrandStore, error) {
	var brandStore BrandStore
	err := service.inventoryRepository.brandStores.FindOne(ctx, bson.M{"_id": brandStoreID}).Decode(&brandStore)
	return brandStore, err
}

// ListBrandCategories 读取一家品牌门店在小程序中展示的品类。
func (service *Service) ListBrandCategories(ctx context.Context, brandStoreID string) ([]BrandCategory, error) {
	brandStore, err := service.GetBrandStore(ctx, brandStoreID)
	if err != nil {
		return nil, err
	}
	var response struct {
		Data []struct {
			CategoryID   string `json:"category_id"`
			CategoryName string `json:"category_name"`
			ImageURL     string `json:"image_url"`
		} `json:"data"`
	}
	if err := service.getJSON(ctx, "/goods/shopcategory", url.Values{
		"regionauth_id":         {brandStore.RegionID},
		"distributor_id":        {brandStore.DistributorID},
		"is_marketing_category": {"1"},
	}, &response); err != nil {
		return nil, err
	}
	categories := make([]BrandCategory, 0, len(response.Data))
	for _, category := range response.Data {
		if strings.TrimSpace(category.CategoryID) == "" || strings.TrimSpace(category.CategoryName) == "" {
			continue
		}
		categories = append(categories, BrandCategory{ID: strings.TrimSpace(category.CategoryID), Name: strings.TrimSpace(category.CategoryName), ImageURL: strings.TrimSpace(category.ImageURL)})
	}
	return categories, nil
}

// GetLiveProductDetail 从小程序读取一件商品的最新商详。
func (service *Service) GetLiveProductDetail(ctx context.Context, sourceProduct map[string]any, regionID string) (map[string]any, error) {
	return service.fetchProductDetail(ctx, sourceProduct, regionID)
}

// SaveBrandStore 保存品牌门店同步开关。
func (service *Service) SaveBrandStore(ctx context.Context, candidate BrandStoreCandidate, syncEnabled bool) (BrandStore, error) {
	now := time.Now()
	brandID := normalizeBrandID(candidate.BrandName)
	region := CatalogRegion{ID: candidate.RegionID, Name: regionDisplayName(candidate.RegionID), Enabled: true, UpdatedAt: now}
	if _, err := service.inventoryRepository.regions.UpdateOne(ctx, bson.M{"_id": region.ID}, bson.M{"$set": region}, options.Update().SetUpsert(true)); err != nil {
		return BrandStore{}, err
	}
	brand := CatalogBrand{ID: brandID, Name: candidate.BrandName, NormalizedName: strings.ToUpper(strings.TrimSpace(candidate.BrandName)), UpdatedAt: now}
	if _, err := service.inventoryRepository.brands.UpdateOne(ctx, bson.M{"_id": brand.ID}, bson.M{"$set": brand}, options.Update().SetUpsert(true)); err != nil {
		return BrandStore{}, err
	}
	brandStore := BrandStore{
		ID:            buildBrandStoreID(candidate.RegionID, candidate.DistributorID),
		RegionID:      candidate.RegionID,
		DistributorID: candidate.DistributorID,
		BrandID:       brandID,
		BrandName:     candidate.BrandName,
		ShopCode:      candidate.ShopCode,
		StoreName:     candidate.StoreName,
		SyncEnabled:   syncEnabled,
		UpdatedAt:     now,
	}
	brandStoreFields := bson.M{
		"regionId":      brandStore.RegionID,
		"distributorId": brandStore.DistributorID,
		"brandId":       brandStore.BrandID,
		"brandName":     brandStore.BrandName,
		"shopCode":      brandStore.ShopCode,
		"storeName":     brandStore.StoreName,
		"syncEnabled":   brandStore.SyncEnabled,
		"updatedAt":     brandStore.UpdatedAt,
	}
	_, err := service.inventoryRepository.brandStores.UpdateOne(ctx, bson.M{"_id": brandStore.ID}, bson.M{
		"$set":         brandStoreFields,
		"$setOnInsert": bson.M{"createdAt": now},
	}, options.Update().SetUpsert(true))
	if err != nil {
		return BrandStore{}, err
	}
	return brandStore, nil
}

// ListOffers 查询本地商品库，供首页和品牌筛选使用。
func (service *Service) ListOffers(ctx context.Context, regionID, brandStoreID, categoryID, keyword string, page, pageSize int, stockOnly bool, sortMode string) (OfferListResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 60 {
		pageSize = 24
	}
	filter := bson.M{"saleStatus": "onsale", "inactiveAt": bson.M{"$exists": false}}
	if regionID != "" && regionID != "all" {
		filter["regionId"] = regionID
	}
	if brandStoreID != "" && brandStoreID != "all" {
		filter["brandStoreId"] = brandStoreID
	} else {
		// 仅展示当前已启用同步的品牌门店，关闭同步的历史数据保留但不进入商品库列表。
		brandStoreFilter := bson.M{"syncEnabled": true}
		if regionID != "" && regionID != "all" {
			brandStoreFilter["regionId"] = regionID
		}
		cursor, findErr := service.inventoryRepository.brandStores.Find(ctx, brandStoreFilter, options.Find().SetProjection(bson.M{"_id": 1}))
		if findErr != nil {
			return OfferListResult{}, findErr
		}
		defer cursor.Close(ctx)
		enabledBrandStores := make([]BrandStore, 0)
		if decodeErr := cursor.All(ctx, &enabledBrandStores); decodeErr != nil {
			return OfferListResult{}, decodeErr
		}
		enabledBrandStoreIDs := make([]string, 0, len(enabledBrandStores))
		for _, enabledBrandStore := range enabledBrandStores {
			enabledBrandStoreIDs = append(enabledBrandStoreIDs, enabledBrandStore.ID)
		}
		filter["brandStoreId"] = bson.M{"$in": enabledBrandStoreIDs}
	}
	if stockOnly {
		filter["stock"] = bson.M{"$gt": 0}
	}
	if categoryIDs := splitCategoryIDs(categoryID); len(categoryIDs) == 1 {
		filter["sourceData.item_category_main.category_id"] = categoryIDs[0]
	} else if len(categoryIDs) > 1 {
		filter["sourceData.item_category_main.category_id"] = bson.M{"$in": categoryIDs}
	}
	if trimmedKeyword := strings.TrimSpace(keyword); trimmedKeyword != "" {
		filter["$or"] = bson.A{
			bson.M{"itemNo": bson.M{"$regex": trimmedKeyword, "$options": "i"}},
			bson.M{"name": bson.M{"$regex": trimmedKeyword, "$options": "i"}},
			bson.M{"brandName": bson.M{"$regex": trimmedKeyword, "$options": "i"}},
		}
	}
	total, err := service.inventoryRepository.offers.CountDocuments(ctx, filter)
	if err != nil {
		return OfferListResult{}, err
	}
	// 默认的本地商品库排序。
	sortDocument := bson.D{{Key: "lastSyncedAt", Value: -1}, {Key: "name", Value: 1}}
	if sortMode == "priceAsc" {
		sortDocument = bson.D{{Key: "activityCents", Value: 1}, {Key: "priceCents", Value: 1}}
	} else if sortMode == "priceDesc" {
		sortDocument = bson.D{{Key: "activityCents", Value: -1}, {Key: "priceCents", Value: -1}}
	}
	// 聚合查询在分页前完成可选的闲鱼状态计算。
	pipeline := mongo.Pipeline{{{Key: "$match", Value: filter}}}
	if sortMode == "xianyuLast" {
		// 当前闲鱼在售货号；只在用户选择置底排序时读取。
		xianyuItemNos, listErr := service.listingRepository.ListNormalizedItemNos(ctx, "xianyu")
		if listErr != nil {
			return OfferListResult{}, listErr
		}
		pipeline = append(pipeline, bson.D{{Key: "$addFields", Value: bson.M{
			"xianyuListed": bson.M{"$in": bson.A{
				bson.M{"$toUpper": bson.M{"$trim": bson.M{"input": bson.M{"$ifNull": bson.A{"$itemNo", ""}}}}},
				xianyuItemNos,
			}},
		}}})
		sortDocument = bson.D{{Key: "xianyuListed", Value: 1}, {Key: "lastSyncedAt", Value: -1}, {Key: "name", Value: 1}}
	}
	pipeline = append(pipeline,
		bson.D{{Key: "$sort", Value: sortDocument}},
		bson.D{{Key: "$skip", Value: int64((page - 1) * pageSize)}},
		bson.D{{Key: "$limit", Value: int64(pageSize)}},
	)
	cursor, err := service.inventoryRepository.offers.Aggregate(ctx, pipeline)
	if err != nil {
		return OfferListResult{}, err
	}
	defer cursor.Close(ctx)
	offers := make([]CatalogOffer, 0)
	if err := cursor.All(ctx, &offers); err != nil {
		return OfferListResult{}, err
	}
	products := make([]map[string]any, 0, len(offers))
	for _, offer := range offers {
		product := offerToProductMap(offer)
		product["xianyu_listed"] = offer.XianyuListed
		products = append(products, product)
	}
	return OfferListResult{List: products, Total: total}, nil
}

// GetOffer 返回本地商品详情。
func (service *Service) GetOffer(ctx context.Context, offerID string) (map[string]any, error) {
	var offer CatalogOffer
	if err := service.inventoryRepository.offers.FindOne(ctx, bson.M{"_id": offerID}).Decode(&offer); err != nil {
		return nil, err
	}
	return offerToProductMap(offer), nil
}

// GetOfferPriceHistory 返回商品档案和已保存的 SKU 价格历史。
func (service *Service) GetOfferPriceHistory(ctx context.Context, offerID string) (CatalogOffer, []SKUPriceSnapshot, error) {
	var offer CatalogOffer
	if err := service.inventoryRepository.offers.FindOne(ctx, bson.M{"_id": offerID}).Decode(&offer); err != nil {
		return CatalogOffer{}, nil, err
	}
	hasHistory, err := service.inventoryRepository.HasPriceHistory(ctx, offerID)
	if err != nil {
		return CatalogOffer{}, nil, err
	}
	if !hasHistory {
		observedAt := offer.LastSyncedAt
		if observedAt.IsZero() {
			observedAt = time.Now()
		}
		if err := service.inventoryRepository.InsertPriceSnapshots(ctx, buildSKUPriceSnapshots(offer, offer.SourceData, "", observedAt)); err != nil {
			return CatalogOffer{}, nil, err
		}
	}
	snapshots, err := service.inventoryRepository.ListPriceHistory(ctx, offerID)
	return offer, snapshots, err
}

// SyncBrandStore 全量同步一家启用品牌门店的商品列表。
func (service *Service) SyncBrandStore(ctx context.Context, brandStoreID string) (SyncResult, error) {
	var brandStore BrandStore
	if err := service.inventoryRepository.brandStores.FindOne(ctx, bson.M{"_id": brandStoreID}).Decode(&brandStore); err != nil {
		return SyncResult{}, err
	}
	run := SyncRun{ID: uuid.NewString(), ScopeType: "brand_store", BrandStoreID: brandStore.ID, Status: "running", StartedAt: time.Now()}
	if _, err := service.inventoryRepository.syncRuns.InsertOne(ctx, run); err != nil {
		return SyncResult{}, err
	}
	result, err := service.syncBrandStore(ctx, brandStore, run)
	return SyncResult{Run: result}, err
}

// StartBrandStoreSync 在后台启动一家品牌门店的全量同步。
func (service *Service) StartBrandStoreSync(ctx context.Context, brandStoreID string) (SyncResult, error) {
	var runningRun SyncRun
	err := service.inventoryRepository.syncRuns.FindOne(ctx, bson.M{"brandStoreId": brandStoreID, "status": "running"}).Decode(&runningRun)
	if err == nil {
		if time.Since(runningRun.StartedAt) < 35*time.Minute {
			return SyncResult{Run: runningRun}, nil
		}
		// 超时任务不再阻塞后续手动同步。
		runningRun.Status = "failed"
		runningRun.ErrorMessage = "同步任务超时，已允许重新发起"
		runningRun.FinishedAt = time.Now()
		if _, updateErr := service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": runningRun.ID}, bson.M{"$set": runningRun}); updateErr != nil {
			return SyncResult{}, updateErr
		}
	}
	if err != mongo.ErrNoDocuments {
		return SyncResult{}, err
	}
	var brandStore BrandStore
	if err := service.inventoryRepository.brandStores.FindOne(ctx, bson.M{"_id": brandStoreID}).Decode(&brandStore); err != nil {
		return SyncResult{}, err
	}
	run := SyncRun{ID: uuid.NewString(), ScopeType: "brand_store", BrandStoreID: brandStore.ID, Status: "running", StartedAt: time.Now()}
	if _, err := service.inventoryRepository.syncRuns.InsertOne(ctx, run); err != nil {
		return SyncResult{}, err
	}
	go func() {
		syncContext, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
		defer cancel()
		_, _ = service.syncBrandStore(syncContext, brandStore, run)
	}()
	return SyncResult{Run: run}, nil
}

// GetSyncRun 返回一条同步任务状态。
func (service *Service) GetSyncRun(ctx context.Context, runID string) (SyncRun, error) {
	var run SyncRun
	err := service.inventoryRepository.syncRuns.FindOne(ctx, bson.M{"_id": runID}).Decode(&run)
	return run, err
}

// SyncEnabledBrandStores 顺序同步全部启用品牌门店，避免上游接口高并发限流。
func (service *Service) SyncEnabledBrandStores(ctx context.Context) ([]SyncResult, error) {
	brandStores, err := service.ListBrandStores(ctx, "all")
	if err != nil {
		return nil, err
	}
	results := make([]SyncResult, 0)
	for _, brandStore := range brandStores {
		if !brandStore.SyncEnabled {
			continue
		}
		result, syncErr := service.SyncBrandStore(ctx, brandStore.ID)
		results = append(results, result)
		if syncErr != nil {
			return results, syncErr
		}
	}
	return results, nil
}

// RefreshOffer 使用上游详情接口刷新单个本地商品。
func (service *Service) RefreshOffer(ctx context.Context, offerID string) (SyncResult, error) {
	var offer CatalogOffer
	if err := service.inventoryRepository.offers.FindOne(ctx, bson.M{"_id": offerID}).Decode(&offer); err != nil {
		return SyncResult{}, err
	}
	run := SyncRun{ID: uuid.NewString(), ScopeType: "offer", OfferID: offer.ID, BrandStoreID: offer.BrandStoreID, Status: "running", StartedAt: time.Now()}
	if _, err := service.inventoryRepository.syncRuns.InsertOne(ctx, run); err != nil {
		return SyncResult{}, err
	}
	detailProduct, err := service.fetchProductDetail(ctx, offer.SourceData, offer.RegionID)
	if err == nil {
		purchaseNotice, purchaseNoticeOpen, noticeErr := service.fetchPurchaseNotice(ctx, offer.RegionID)
		if noticeErr != nil {
			err = noticeErr
		} else {
			detailProduct["purchase_notice"] = purchaseNotice
			detailProduct["purchase_notice_open"] = purchaseNoticeOpen
			_, err = service.upsertOffer(ctx, offer.BrandStoreID, offer.RegionID, offer.DistributorID, detailProduct, run.ID, time.Now())
		}
	}
	run.TotalCount = 1
	run.UpdatedCount = 1
	run.FinishedAt = time.Now()
	run.Status = "completed"
	if err != nil {
		run.Status = "failed"
		run.ErrorMessage = err.Error()
	}
	_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
	return SyncResult{Run: run}, err
}

// fetchPurchaseNotice 获取地区级购买须知，用于写入本地商品详情缓存。
func (service *Service) fetchPurchaseNotice(ctx context.Context, regionID string) (string, bool, error) {
	var response struct {
		Data struct {
			PurchaseNotice     string `json:"product_purchase_notice"`
			PurchaseNoticeOpen bool   `json:"product_purchase_notice_open"`
		} `json:"data"`
	}
	if err := service.getJSON(ctx, "/setting/itemNotice", url.Values{"regionauth_id": {regionID}}, &response); err != nil {
		return "", false, fmt.Errorf("读取购买须知失败：%w", err)
	}
	return response.Data.PurchaseNotice, response.Data.PurchaseNoticeOpen, nil
}

// fetchProductDetail 拉取单品详情并合并列表字段，确保本地库包含图文与完整库存。
func (service *Service) fetchProductDetail(ctx context.Context, sourceProduct map[string]any, regionID string) (map[string]any, error) {
	itemID := firstNonEmpty(mapString(sourceProduct, "default_item_id"), mapString(sourceProduct, "item_id"), mapString(sourceProduct, "goods_id"))
	if itemID == "" {
		return nil, errors.New("商品缺少详情 ID")
	}
	var response struct {
		Data map[string]any `json:"data"`
	}
	if err := service.getJSON(ctx, "/goods/items/"+itemID, url.Values{"regionauth_id": {regionID}}, &response); err != nil {
		return nil, fmt.Errorf("读取商品详情失败：%w", err)
	}
	if len(response.Data) == 0 {
		return nil, errors.New("商品详情为空")
	}
	mergedProduct := make(map[string]any, len(sourceProduct)+len(response.Data))
	for key, value := range sourceProduct {
		mergedProduct[key] = value
	}
	for key, value := range response.Data {
		mergedProduct[key] = value
	}
	return mergedProduct, nil
}

func (service *Service) syncBrandStore(ctx context.Context, brandStore BrandStore, run SyncRun) (SyncRun, error) {
	syncStartedAt := run.StartedAt
	existingActiveCount, err := service.inventoryRepository.offers.CountDocuments(ctx, bson.M{"brandStoreId": brandStore.ID, "saleStatus": "onsale"})
	if err != nil {
		return run, err
	}
	page := 1
	const upstreamPageSize = 24
	for {
		var response struct {
			Data struct {
				List       []map[string]any `json:"list"`
				TotalCount int64            `json:"total_count"`
			} `json:"data"`
		}
		err := service.getJSON(ctx, "/goods/items", url.Values{
			"regionauth_id":  {brandStore.RegionID},
			"distributor_id": {brandStore.DistributorID},
			"page":           {strconv.Itoa(page)},
			"pageSize":       {strconv.Itoa(upstreamPageSize)},
			"keywords":       {""},
			"approve_status": {"onsale,only_show"},
			"item_type":      {"normal"},
			"is_point":       {"false"},
		}, &response)
		if err != nil {
			run.Status = "failed"
			run.ErrorMessage = err.Error()
			run.FinishedAt = time.Now()
			_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
			return run, err
		}
		if page == 1 {
			run.TotalCount = int(response.Data.TotalCount)
			if response.Data.TotalCount == 0 && existingActiveCount > 0 {
				run.Status = "suspicious_empty"
				run.ErrorMessage = "上游返回空结果，已保护本地商品，未执行下架"
				run.FinishedAt = time.Now()
				_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
				return run, nil
			}
			_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
		}
		for _, sourceProduct := range response.Data.List {
			wasCreated, upsertErr := service.upsertOffer(ctx, brandStore.ID, brandStore.RegionID, brandStore.DistributorID, sourceProduct, run.ID, syncStartedAt)
			if upsertErr != nil {
				return run, upsertErr
			}
			if wasCreated {
				run.CreatedCount++
			} else {
				run.UpdatedCount++
			}
		}
		// 每页完成即写回任务进度，供前端轮询展示。
		_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
		if len(response.Data.List) == 0 && int64((page-1)*upstreamPageSize) < response.Data.TotalCount {
			run.Status = "suspicious_incomplete"
			run.ErrorMessage = "上游分页提前结束，已保护本地商品，未执行下架"
			run.FinishedAt = time.Now()
			_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
			return run, nil
		}
		if len(response.Data.List) == 0 || int64(page*upstreamPageSize) >= response.Data.TotalCount {
			break
		}
		page++
	}
	now := time.Now()
	if err := service.reconcileMissingOffers(ctx, brandStore.ID, syncStartedAt, now, &run); err != nil {
		run.Status = "failed"
		run.ErrorMessage = err.Error()
		run.FinishedAt = now
		_, _ = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
		return run, err
	}
	run.Status = "completed"
	run.FinishedAt = now
	_, err = service.inventoryRepository.syncRuns.UpdateOne(ctx, bson.M{"_id": run.ID}, bson.M{"$set": run})
	if err != nil {
		return run, err
	}
	_, _ = service.inventoryRepository.brandStores.UpdateOne(ctx, bson.M{"_id": brandStore.ID}, bson.M{"$set": bson.M{"lastSyncedAt": now, "updatedAt": now}})
	return run, nil
}

func (service *Service) upsertOffer(ctx context.Context, brandStoreID, regionID, distributorID string, sourceProduct map[string]any, syncRunID string, seenAt time.Time) (bool, error) {
	itemNo := mapString(sourceProduct, "item_no")
	brandName := mapString(sourceProduct, "goods_brand")
	sourceItemID := firstNonEmpty(mapString(sourceProduct, "item_id"), mapString(sourceProduct, "default_item_id"), mapString(sourceProduct, "goods_id"))
	if sourceItemID == "" {
		return false, fmt.Errorf("upstream product has no item id")
	}
	offerID := buildOfferID(brandStoreID, sourceItemID)
	var existingOffer CatalogOffer
	findErr := service.inventoryRepository.offers.FindOne(ctx, bson.M{"_id": offerID}).Decode(&existingOffer)
	isCreated := findErr == mongo.ErrNoDocuments
	if findErr != nil && !isCreated {
		return false, findErr
	}
	offer := CatalogOffer{
		ID:              offerID,
		ProductID:       buildProductID(brandName, itemNo, sourceItemID),
		BrandStoreID:    brandStoreID,
		RegionID:        regionID,
		DistributorID:   distributorID,
		SourceGoodsID:   mapString(sourceProduct, "goods_id"),
		SourceItemID:    mapString(sourceProduct, "item_id"),
		SourceDefaultID: mapString(sourceProduct, "default_item_id"),
		ItemNo:          itemNo,
		Name:            mapString(sourceProduct, "item_name"),
		BrandName:       brandName,
		PriceCents:      mapInt64(sourceProduct, "price"),
		ActivityCents:   firstPositive(mapInt64(sourceProduct, "activity_price"), mapInt64(sourceProduct, "act_price")),
		MarketCents:     mapInt64(sourceProduct, "market_price"),
		Stock:           productStock(sourceProduct),
		SaleStatus:      firstNonEmpty(mapString(sourceProduct, "approve_status"), "onsale"),
		SyncState:       "onsale",
		MissingRuns:     0,
		SourceData:      sourceProduct,
		LastSeenAt:      seenAt,
		LastSyncedAt:    seenAt,
	}
	if err := service.recordPriceHistory(ctx, offer, existingOffer, isCreated, syncRunID, seenAt); err != nil {
		return false, err
	}
	if isCreated {
		offer.FirstSeenAt = seenAt
	} else {
		offer.FirstSeenAt = existingOffer.FirstSeenAt
	}
	_, err := service.inventoryRepository.offers.UpdateOne(ctx, bson.M{"_id": offer.ID}, bson.M{"$set": offer, "$unset": bson.M{"inactiveAt": ""}}, options.Update().SetUpsert(true))
	if err != nil {
		return false, err
	}
	return isCreated, nil
}

// recordPriceHistory 保存首次价格，并仅为发生价格变化的 SKU 追加快照。
func (service *Service) recordPriceHistory(ctx context.Context, nextOffer, existingOffer CatalogOffer, isCreated bool, syncRunID string, observedAt time.Time) error {
	nextSnapshots := buildSKUPriceSnapshots(nextOffer, nextOffer.SourceData, syncRunID, observedAt)
	if isCreated {
		return service.inventoryRepository.InsertPriceSnapshots(ctx, nextSnapshots)
	}
	hasHistory, err := service.inventoryRepository.HasPriceHistory(ctx, nextOffer.ID)
	if err != nil {
		return err
	}
	previousObservedAt := existingOffer.LastSyncedAt
	if previousObservedAt.IsZero() {
		previousObservedAt = observedAt
	}
	previousSnapshots := buildSKUPriceSnapshots(existingOffer, existingOffer.SourceData, syncRunID, previousObservedAt)
	if !hasHistory {
		if err := service.inventoryRepository.InsertPriceSnapshots(ctx, previousSnapshots); err != nil {
			return err
		}
	}
	previousBySKU := make(map[string]SKUPriceSnapshot, len(previousSnapshots))
	for _, snapshot := range previousSnapshots {
		previousBySKU[snapshot.SKUID] = snapshot
	}
	changedSnapshots := make([]SKUPriceSnapshot, 0)
	for _, snapshot := range nextSnapshots {
		previous, exists := previousBySKU[snapshot.SKUID]
		if !exists || snapshot.PriceCents != previous.PriceCents || snapshot.SourcePriceCents != previous.SourcePriceCents || snapshot.ActivityPriceCents != previous.ActivityPriceCents || snapshot.MarketPriceCents != previous.MarketPriceCents {
			changedSnapshots = append(changedSnapshots, snapshot)
		}
	}
	return service.inventoryRepository.InsertPriceSnapshots(ctx, changedSnapshots)
}

// buildSKUPriceSnapshots 将商品或 SKU 当前价格转换为可持久化快照。
func buildSKUPriceSnapshots(offer CatalogOffer, source map[string]any, syncRunID string, observedAt time.Time) []SKUPriceSnapshot {
	baseSnapshot := SKUPriceSnapshot{OfferID: offer.ID, ProductID: offer.ProductID, BrandStoreID: offer.BrandStoreID, RegionID: offer.RegionID, ItemNo: offer.ItemNo, SyncRunID: syncRunID, ObservedAt: observedAt}
	specItems := anySlice(source["spec_items"])
	if len(specItems) == 0 {
		baseSnapshot.ID = uuid.NewString()
		baseSnapshot.SKUID = firstNonEmpty(offer.SourceDefaultID, offer.SourceItemID, offer.ID)
		baseSnapshot.VariantLabel = "默认规格"
		baseSnapshot.SourcePriceCents = mapInt64(source, "price")
		baseSnapshot.ActivityPriceCents = firstPositive(mapInt64(source, "activity_price"), mapInt64(source, "act_price"))
		baseSnapshot.MarketPriceCents = mapInt64(source, "market_price")
		baseSnapshot.PriceCents = firstPositive(baseSnapshot.ActivityPriceCents, baseSnapshot.SourcePriceCents)
		baseSnapshot.Stock = productStock(source)
		return []SKUPriceSnapshot{baseSnapshot}
	}
	snapshots := make([]SKUPriceSnapshot, 0, len(specItems))
	for _, rawSKU := range specItems {
		sku := anyMap(rawSKU)
		if len(sku) == 0 {
			continue
		}
		snapshot := baseSnapshot
		snapshot.ID = uuid.NewString()
		snapshot.SKUID = firstNonEmpty(mapString(sku, "item_id"), mapString(sku, "erp_sku_code"), mapString(sku, "custom_spec_id"))
		if snapshot.SKUID == "" {
			continue
		}
		snapshot.SKUCode = mapString(sku, "erp_sku_code")
		snapshot.VariantLabel = firstNonEmpty(mapString(sku, "custom_spec_name"), variantLabel(sku))
		snapshot.SourcePriceCents = mapInt64(sku, "price")
		snapshot.ActivityPriceCents = firstPositive(mapInt64(sku, "activity_price"), mapInt64(sku, "act_price"))
		snapshot.MarketPriceCents = mapInt64(sku, "market_price")
		snapshot.PriceCents = firstPositive(snapshot.ActivityPriceCents, snapshot.SourcePriceCents)
		snapshot.Stock = mapInt64(sku, "store")
		snapshots = append(snapshots, snapshot)
	}
	return snapshots
}

// variantLabel 将 SKU 规格整理成易读标签。
func variantLabel(sku map[string]any) string {
	labels := make([]string, 0)
	for _, rawSpec := range anySlice(sku["item_spec"]) {
		spec := anyMap(rawSpec)
		if value := mapString(spec, "spec_value_name"); value != "" {
			labels = append(labels, value)
		}
	}
	return strings.Join(labels, " / ")
}

// anySlice 兼容 JSON 与 BSON 解码后的数组。
func anySlice(value any) []any {
	switch values := value.(type) {
	case []any:
		return values
	case bson.A:
		return []any(values)
	default:
		return nil
	}
}

// anyMap 兼容 JSON 与 BSON 解码后的对象。
func anyMap(value any) map[string]any {
	switch values := value.(type) {
	case map[string]any:
		return values
	case bson.M:
		return map[string]any(values)
	default:
		return nil
	}
}

// reconcileMissingOffers 将完整同步中缺失的商品先标为疑似下架，连续两次才正式下架。
func (service *Service) reconcileMissingOffers(ctx context.Context, brandStoreID string, syncStartedAt, now time.Time, run *SyncRun) error {
	cursor, err := service.inventoryRepository.offers.Find(ctx, bson.M{
		"brandStoreId": brandStoreID,
		"lastSeenAt":   bson.M{"$lt": syncStartedAt},
		"saleStatus":   bson.M{"$in": bson.A{"onsale", "suspected_missing"}},
	})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	missingOffers := make([]CatalogOffer, 0)
	if err := cursor.All(ctx, &missingOffers); err != nil {
		return err
	}
	for _, offer := range missingOffers {
		nextMissingRuns := offer.MissingRuns + 1
		if nextMissingRuns >= 2 {
			_, err := service.inventoryRepository.offers.UpdateOne(ctx, bson.M{"_id": offer.ID}, bson.M{"$set": bson.M{"saleStatus": "off_shelf", "syncState": "off_shelf", "missingRuns": nextMissingRuns, "inactiveAt": now}})
			if err != nil {
				return err
			}
			run.InactiveCount++
			continue
		}
		_, err := service.inventoryRepository.offers.UpdateOne(ctx, bson.M{"_id": offer.ID}, bson.M{"$set": bson.M{"saleStatus": "suspected_missing", "syncState": "suspected_missing", "missingRuns": nextMissingRuns}})
		if err != nil {
			return err
		}
		run.SuspectedCount++
	}
	return nil
}

func offerToProductMap(offer CatalogOffer) map[string]any {
	product := make(map[string]any, len(offer.SourceData)+8)
	for key, value := range offer.SourceData {
		product[key] = value
	}
	product["catalog_offer_id"] = offer.ID
	product["regionauth_id"] = offer.RegionID
	product["item_no"] = offer.ItemNo
	product["item_name"] = offer.Name
	product["goods_brand"] = offer.BrandName
	product["price"] = offer.PriceCents
	product["activity_price"] = offer.ActivityCents
	product["market_price"] = offer.MarketCents
	product["item_total_store"] = offer.Stock
	product["approve_status"] = offer.SaleStatus
	product["last_synced_at"] = offer.LastSyncedAt.Format(time.RFC3339)
	return product
}

// splitCategoryIDs 清理逗号分隔的一个或多个品类 ID。
func splitCategoryIDs(categoryFilter string) []string {
	categoryIDs := make([]string, 0)
	seenCategoryIDs := make(map[string]struct{})
	for _, categoryID := range strings.Split(categoryFilter, ",") {
		trimmedCategoryID := strings.TrimSpace(categoryID)
		if trimmedCategoryID == "" {
			continue
		}
		if _, exists := seenCategoryIDs[trimmedCategoryID]; exists {
			continue
		}
		seenCategoryIDs[trimmedCategoryID] = struct{}{}
		categoryIDs = append(categoryIDs, trimmedCategoryID)
	}
	return categoryIDs
}

func normalizeBrandID(brandName string) string {
	return hashID("brand", strings.ToUpper(strings.TrimSpace(brandName)))
}
func buildBrandStoreID(regionID, distributorID string) string {
	return hashID("brand-store", regionID, distributorID)
}
func buildProductID(brandName, itemNo, sourceID string) string {
	return hashID("product", strings.ToUpper(strings.TrimSpace(brandName)), strings.ToUpper(strings.TrimSpace(firstNonEmpty(itemNo, sourceID))))
}
func buildOfferID(brandStoreID, sourceID string) string {
	return hashID("offer", brandStoreID, sourceID)
}
func buildSKUId(offerID, sourceSKUId string) string { return hashID("sku", offerID, sourceSKUId) }
func hashID(parts ...string) string {
	hash := sha1.Sum([]byte(strings.Join(parts, ":")))
	return hex.EncodeToString(hash[:])
}
func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}
func firstPositive(values ...int64) int64 {
	for _, value := range values {
		if value > 0 {
			return value
		}
	}
	return 0
}
func mapString(source map[string]any, key string) string {
	switch value := source[key].(type) {
	case string:
		return strings.TrimSpace(value)
	case float64:
		return strconv.FormatInt(int64(value), 10)
	case int64:
		return strconv.FormatInt(value, 10)
	default:
		return ""
	}
}
func mapInt64(source map[string]any, key string) int64 {
	switch value := source[key].(type) {
	case float64:
		return int64(value)
	case int:
		return int64(value)
	case int64:
		return value
	case string:
		parsed, _ := strconv.ParseInt(value, 10, 64)
		return parsed
	default:
		return 0
	}
}
func productStock(source map[string]any) int64 {
	if stock := mapInt64(source, "item_total_store"); stock > 0 {
		return stock
	}
	return mapInt64(source, "store")
}
func skuSpecs(source map[string]any) (string, string) {
	specItems, _ := source["item_spec"].([]any)
	var size, color string
	for _, rawSpec := range specItems {
		spec, ok := rawSpec.(map[string]any)
		if !ok {
			continue
		}
		name := mapString(spec, "spec_name")
		value := mapString(spec, "spec_value_name")
		if name == "尺码" {
			size = value
		}
		if name == "颜色" {
			color = value
		}
	}
	return size, color
}

// regionDisplayName 返回内置仓库地区名称。
func regionDisplayName(regionID string) string {
	names := map[string]string{"2": "京津佛罗伦萨小镇", "3": "上海佛罗伦萨小镇", "4": "广佛佛罗伦萨小镇", "5": "成都佛罗伦萨小镇", "6": "武汉佛罗伦萨小镇", "7": "重庆佛罗伦萨小镇"}
	return names[regionID]
}
