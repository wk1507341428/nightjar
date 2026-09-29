package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// listOfflineCenterCategoriesHandler 汇总合并品牌所有地区门店的当前品类。
func listOfflineCenterCategoriesHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		profileID := strings.TrimSpace(pathvar.Vars(request)["id"])
		_, members, err := serviceContext.InventoryRepository.GetBrandProfile(request.Context(), profileID)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "品牌档案不存在")
			return
		}
		categories := collectProfileCategories(request.Context(), serviceContext, members)
		writeJSON(responseWriter, http.StatusOK, categories)
	}
}

// previewOfflineCenterHandler 根据品牌、品类、售价和折扣生成下架预览。
func previewOfflineCenterHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var body types.OfflineCenterPreviewRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "下架筛选条件格式错误")
			return
		}
		body.AccountID = strings.TrimSpace(body.AccountID)
		body.BrandProfileID = strings.TrimSpace(body.BrandProfileID)
		body.RegionID = strings.TrimSpace(body.RegionID)
		body.DistributorID = strings.TrimSpace(body.DistributorID)
		body.BrandName = strings.TrimSpace(body.BrandName)
		body.CategoryIDs = uniqueStrings(body.CategoryIDs)
		if body.AccountID == "" {
			body.AccountID = model.DefaultXianyuAccountID
		}
		if body.BrandProfileID == "" && (body.RegionID == "" || body.DistributorID == "") {
			writeError(responseWriter, http.StatusBadRequest, "请选择品牌")
			return
		}
		if !validOfflineCenterRange(body) {
			writeError(responseWriter, http.StatusBadRequest, "售价或折扣率区间无效")
			return
		}
		profile, members, err := resolveOfflineCenterBrand(request.Context(), serviceContext, body.BrandProfileID, body.RegionID, body.DistributorID, body.BrandName)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "品牌档案不存在")
			return
		}
		if err := refreshOfflineCenterBindings(request.Context(), serviceContext, profile, members, body.CategoryIDs); err != nil {
			writeError(responseWriter, http.StatusBadGateway, "读取小程序品牌商品失败："+err.Error())
			return
		}
		candidates, err := buildOfflineCenterCandidates(request.Context(), serviceContext, body, profile, members)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "生成下架预览失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.OfflineCenterPreviewResponse{AccountID: body.AccountID, BrandProfileID: profile.ID, BrandName: profile.Name, Total: len(candidates), Candidates: candidates})
	}
}

// createOfflineCenterOperationHandler 将用户确认的商品加入当前账号发布队列。
func createOfflineCenterOperationHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var body types.CreateOfflineCenterOperationRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "下架入队请求格式错误")
			return
		}
		body.AccountID = strings.TrimSpace(body.AccountID)
		body.BrandProfileID = strings.TrimSpace(body.BrandProfileID)
		body.RegionID = strings.TrimSpace(body.RegionID)
		body.DistributorID = strings.TrimSpace(body.DistributorID)
		body.BrandName = strings.TrimSpace(body.BrandName)
		body.PlatformItemIDs = uniqueStrings(body.PlatformItemIDs)
		if body.AccountID == "" {
			body.AccountID = model.DefaultXianyuAccountID
		}
		if (body.BrandProfileID == "" && (body.RegionID == "" || body.DistributorID == "")) || len(body.PlatformItemIDs) == 0 {
			writeError(responseWriter, http.StatusBadRequest, "请选择需要下架的商品")
			return
		}
		if len(body.PlatformItemIDs) > 3000 {
			writeError(responseWriter, http.StatusBadRequest, "单次最多加入 3000 件商品")
			return
		}
		if !requireActiveSellerAccount(responseWriter, request, serviceContext, body.AccountID) {
			return
		}
		profile, members, err := resolveOfflineCenterBrand(request.Context(), serviceContext, body.BrandProfileID, body.RegionID, body.DistributorID, body.BrandName)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "品牌档案不存在")
			return
		}
		listings, err := serviceContext.ListingRepository.ListByPlatformItemIDs(request.Context(), body.AccountID, body.PlatformItemIDs)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取闲鱼商品失败")
			return
		}
		if len(listings) == 0 {
			writeError(responseWriter, http.StatusConflict, "所选商品已不在闲鱼在售列表")
			return
		}
		listings, err = filterOfflineCenterListingsByProfile(request.Context(), serviceContext, profile.ID, members, body.CategoryIDs, listings)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "校验下架商品归属失败")
			return
		}
		if len(listings) == 0 {
			writeError(responseWriter, http.StatusConflict, "所选商品不属于当前品牌或品类")
			return
		}
		batch, err := appendOfflineCenterTasks(request.Context(), serviceContext, body, profile, listings)
		if err != nil {
			writeError(responseWriter, http.StatusConflict, err.Error())
			return
		}
		writeJSON(responseWriter, http.StatusAccepted, buildPublishBatchResponse(request.Context(), serviceContext, batch))
	}
}

// resolveOfflineCenterBrand 统一解析聚合品牌或单独地区品牌。
func resolveOfflineCenterBrand(ctx context.Context, serviceContext *svc.ServiceContext, profileID, regionID, distributorID, brandName string) (catalog.BrandProfile, []catalog.BrandProfileMember, error) {
	if profileID != "" {
		return serviceContext.InventoryRepository.GetBrandProfile(ctx, profileID)
	}
	profile := catalog.BrandProfile{Name: brandName, DefaultRegionID: regionID}
	members := []catalog.BrandProfileMember{{ID: regionID + ":" + distributorID, RegionID: regionID, DistributorID: distributorID, SourceName: brandName}}
	return profile, members, nil
}

// filterOfflineCenterListingsByProfile 防止客户端把其他品牌商品混入下架队列。
func filterOfflineCenterListingsByProfile(ctx context.Context, serviceContext *svc.ServiceContext, profileID string, members []catalog.BrandProfileMember, categoryIDs []string, listings []model.MarketplaceListing) ([]model.MarketplaceListing, error) {
	brandStoreIDs := make([]string, 0, len(members))
	for _, member := range members {
		brandStoreIDs = append(brandStoreIDs, catalog.BrandStoreIDForSource(member.RegionID, member.DistributorID))
	}
	bindings, err := serviceContext.InventoryRepository.ListSKUCategoryBindings(ctx, profileID, brandStoreIDs, categoryIDs)
	if err != nil {
		return nil, err
	}
	boundItemNos := make(map[string]struct{}, len(bindings))
	for _, binding := range bindings {
		boundItemNos[strings.ToUpper(strings.TrimSpace(binding.ItemNo))] = struct{}{}
	}
	existingTasks, err := serviceContext.PublishRepository.FindByXianyuItemIDs(ctx, listings[0].AccountID, marketplacePlatformItemIDs(listings))
	if err != nil {
		return nil, err
	}
	activeOfflineItemIDs := make(map[string]struct{})
	for _, task := range existingTasks {
		if task.Action == "offline" && (task.Status == model.PublishTaskQueued || task.Status == model.PublishTaskPreparing || task.Status == model.PublishTaskPublishing) {
			activeOfflineItemIDs[task.XianyuItemID] = struct{}{}
		}
	}
	filteredListings := make([]model.MarketplaceListing, 0, len(listings))
	for _, listing := range listings {
		if _, duplicated := activeOfflineItemIDs[listing.PlatformItemID]; duplicated {
			continue
		}
		_, hasBinding := boundItemNos[strings.ToUpper(strings.TrimSpace(listing.ItemNo))]
		matchesProfile := profileID != "" && listing.BrandProfileID == profileID && len(categoryIDs) == 0
		if matchesProfile || hasBinding {
			filteredListings = append(filteredListings, listing)
		}
	}
	return filteredListings, nil
}

// marketplacePlatformItemIDs 提取闲鱼商品 ID 列表。
func marketplacePlatformItemIDs(listings []model.MarketplaceListing) []string {
	itemIDs := make([]string, 0, len(listings))
	for _, listing := range listings {
		itemIDs = append(itemIDs, listing.PlatformItemID)
	}
	return itemIDs
}

// collectProfileCategories 合并品牌成员门店品类并按名称排序。
func collectProfileCategories(ctx context.Context, serviceContext *svc.ServiceContext, members []catalog.BrandProfileMember) []catalog.BrandCategory {
	categoryByID := make(map[string]catalog.BrandCategory)
	var categoryMutex sync.Mutex
	var categoryWaitGroup sync.WaitGroup
	for _, member := range members {
		member := member
		categoryWaitGroup.Add(1)
		go func() {
			defer categoryWaitGroup.Done()
			categories, err := serviceContext.CatalogService.ListSourceCategories(ctx, member.RegionID, member.DistributorID)
			if err != nil {
				return
			}
			categoryMutex.Lock()
			defer categoryMutex.Unlock()
			for _, category := range categories {
				categoryByID[category.ID] = category
			}
		}()
	}
	categoryWaitGroup.Wait()
	categories := make([]catalog.BrandCategory, 0, len(categoryByID))
	for _, category := range categoryByID {
		categories = append(categories, category)
	}
	sort.Slice(categories, func(leftIndex, rightIndex int) bool { return categories[leftIndex].Name < categories[rightIndex].Name })
	return categories
}

// refreshOfflineCenterBindings 拉取小程序当前商品，并把当前及历史 SKU 品类归属写入关联表。
func refreshOfflineCenterBindings(ctx context.Context, serviceContext *svc.ServiceContext, profile catalog.BrandProfile, members []catalog.BrandProfileMember, categoryIDs []string) error {
	categoryNameByID := make(map[string]string)
	for _, category := range collectProfileCategories(ctx, serviceContext, members) {
		categoryNameByID[category.ID] = category.Name
	}
	type memberResult struct {
		member   catalog.BrandProfileMember
		products []map[string]any
		err      error
	}
	results := make([]memberResult, len(members))
	var waitGroup sync.WaitGroup
	for memberIndex, member := range members {
		memberIndex, member := memberIndex, member
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			results[memberIndex].member = member
			results[memberIndex].products, results[memberIndex].err = serviceContext.CatalogService.ListLiveBrandOffers(ctx, member.RegionID, member.DistributorID, categoryIDs)
		}()
	}
	waitGroup.Wait()
	for _, result := range results {
		if result.err != nil {
			return result.err
		}
		brandStoreID := catalog.BrandStoreIDForSource(result.member.RegionID, result.member.DistributorID)
		for _, product := range result.products {
			categoryID, categoryName := offlineProductCategory(product)
			if categoryID == "" && len(categoryIDs) == 1 {
				categoryID = categoryIDs[0]
			}
			if categoryName == "" {
				categoryName = categoryNameByID[categoryID]
			}
			binding := catalog.SKUCategoryBinding{ItemNo: firstProductString(product, "item_no"), BrandProfileID: profile.ID, BrandStoreID: brandStoreID, BrandName: profile.Name, RegionID: result.member.RegionID, DistributorID: result.member.DistributorID, SourceItemID: firstProductString(product, "default_item_id", "item_id", "goods_id"), CategoryID: categoryID, CategoryName: categoryName, MarketPriceCents: productNumber(product, "market_price"), LastSeenAt: time.Now()}
			if err := serviceContext.InventoryRepository.UpsertSKUCategoryBinding(ctx, binding); err != nil {
				return err
			}
		}
	}
	brandStoreIDs := make([]string, 0, len(members))
	for _, member := range members {
		brandStoreIDs = append(brandStoreIDs, catalog.BrandStoreIDForSource(member.RegionID, member.DistributorID))
	}
	offers, err := serviceContext.InventoryRepository.ListOffersByBrandStores(ctx, brandStoreIDs)
	if err != nil {
		return err
	}
	for _, offer := range offers {
		categoryID, categoryName := offlineProductCategory(offer.SourceData)
		if categoryName == "" {
			categoryName = categoryNameByID[categoryID]
		}
		binding := catalog.SKUCategoryBinding{ItemNo: offer.ItemNo, BrandProfileID: profile.ID, BrandStoreID: offer.BrandStoreID, BrandName: profile.Name, RegionID: offer.RegionID, DistributorID: offer.DistributorID, SourceItemID: offer.SourceItemID, CategoryID: categoryID, CategoryName: categoryName, MarketPriceCents: offer.MarketCents, FirstSeenAt: offer.FirstSeenAt, LastSeenAt: offer.LastSeenAt}
		if err := serviceContext.InventoryRepository.UpsertSKUCategoryBinding(ctx, binding); err != nil {
			return err
		}
	}
	return nil
}

// buildOfflineCenterCandidates 匹配当前账号闲鱼在售商品并应用筛选条件。
func buildOfflineCenterCandidates(ctx context.Context, serviceContext *svc.ServiceContext, body types.OfflineCenterPreviewRequest, profile catalog.BrandProfile, members []catalog.BrandProfileMember) ([]types.OfflineCenterCandidate, error) {
	brandStoreIDs := make([]string, 0, len(members))
	for _, member := range members {
		brandStoreIDs = append(brandStoreIDs, catalog.BrandStoreIDForSource(member.RegionID, member.DistributorID))
	}
	bindings, err := serviceContext.InventoryRepository.ListSKUCategoryBindings(ctx, profile.ID, brandStoreIDs, body.CategoryIDs)
	if err != nil {
		return nil, err
	}
	bindingsByItemNo := make(map[string][]catalog.SKUCategoryBinding)
	itemNos := make([]string, 0)
	for _, binding := range bindings {
		itemNo := strings.ToUpper(strings.TrimSpace(binding.ItemNo))
		if _, exists := bindingsByItemNo[itemNo]; !exists {
			itemNos = append(itemNos, itemNo)
		}
		bindingsByItemNo[itemNo] = append(bindingsByItemNo[itemNo], binding)
	}
	profileListings := make([]model.MarketplaceListing, 0)
	if profile.ID != "" {
		profileListings, err = serviceContext.ListingRepository.ListByBrandProfileID(ctx, body.AccountID, model.XianyuPlatform, profile.ID)
		if err != nil {
			return nil, err
		}
	}
	legacyListings, err := serviceContext.ListingRepository.ListByItemNos(ctx, body.AccountID, model.XianyuPlatform, itemNos)
	if err != nil {
		return nil, err
	}
	listingByID := make(map[string]model.MarketplaceListing)
	for _, listing := range append(profileListings, legacyListings...) {
		if profile.ID != "" && listing.BrandProfileID != "" && listing.BrandProfileID != profile.ID {
			continue
		}
		itemNo := strings.ToUpper(strings.TrimSpace(listing.ItemNo))
		if len(body.CategoryIDs) > 0 && len(bindingsByItemNo[itemNo]) == 0 {
			continue
		}
		listingByID[listing.PlatformItemID] = listing
	}
	candidates := make([]types.OfflineCenterCandidate, 0, len(listingByID))
	for _, listing := range listingByID {
		itemBindings := bindingsByItemNo[strings.ToUpper(strings.TrimSpace(listing.ItemNo))]
		marketPriceCents := int64(0)
		categoryIDs := make([]string, 0)
		categoryNames := make([]string, 0)
		regions := append([]string{}, listing.SourceRegions...)
		for _, binding := range itemBindings {
			if binding.MarketPriceCents > marketPriceCents {
				marketPriceCents = binding.MarketPriceCents
			}
			categoryIDs = appendUniqueText(categoryIDs, binding.CategoryID)
			categoryNames = appendUniqueText(categoryNames, binding.CategoryName)
			regions = appendUniqueText(regions, binding.RegionID)
		}
		discountRate := 0
		if marketPriceCents > 0 {
			discountRate = int((listing.PriceCents*100 + marketPriceCents/2) / marketPriceCents)
		}
		if !matchesOfflineCenterRange(listing.PriceCents, discountRate, body) {
			continue
		}
		candidates = append(candidates, types.OfflineCenterCandidate{PlatformItemID: listing.PlatformItemID, ItemNo: listing.ItemNo, Title: listing.Title, PriceCents: listing.PriceCents, MarketPriceCents: marketPriceCents, DiscountRate: discountRate, ImageURL: listing.ImageURL, ItemURL: listing.ItemURL, CategoryIDs: categoryIDs, CategoryNames: categoryNames, SourceRegions: regions})
	}
	sort.Slice(candidates, func(leftIndex, rightIndex int) bool {
		return candidates[leftIndex].ItemNo < candidates[rightIndex].ItemNo
	})
	return candidates, nil
}

// appendOfflineCenterTasks 创建或追加下架任务到当前账号运行队列。
func appendOfflineCenterTasks(ctx context.Context, serviceContext *svc.ServiceContext, body types.CreateOfflineCenterOperationRequest, profile catalog.BrandProfile, listings []model.MarketplaceListing) (model.PublishBatch, error) {
	now := time.Now()
	batch, activeErr := serviceContext.PublishBatchRepository.FindActive(ctx, body.AccountID)
	if activeErr == repository.ErrPublishBatchNotFound {
		batch = model.PublishBatch{ID: primitive.NewObjectID().Hex(), AccountID: body.AccountID, BrandName: profile.Name, Limit: 0, MinDelaySeconds: 1, MaxDelaySeconds: 2, TaskIDs: []string{}, Skipped: []model.PublishBatchSkip{}, Segments: []model.PublishBatchSegment{}, Status: model.PublishBatchPreparing, CreatedAt: now, UpdatedAt: now}
		if err := serviceContext.PublishBatchRepository.Create(ctx, batch); err != nil {
			return model.PublishBatch{}, err
		}
	} else if activeErr != nil {
		return model.PublishBatch{}, activeErr
	}
	if batch.Limit+len(listings) > 3000 {
		return model.PublishBatch{}, fmt.Errorf("当前队列剩余容量不足")
	}
	segmentID := uuid.NewString()
	segment := model.PublishBatchSegment{ID: segmentID, SourceType: "offline_center", BrandProfileID: profile.ID, DistributorID: body.DistributorID, RegionID: body.RegionID, BrandName: "下架 · " + profile.Name, Requested: len(listings), AddedAt: now}
	if err := serviceContext.PublishBatchRepository.AppendSegment(ctx, batch.ID, segment); err != nil {
		return model.PublishBatch{}, err
	}
	taskIDs := make([]string, 0, len(listings))
	for listingIndex, listing := range listings {
		regionID := ""
		if len(listing.SourceRegions) > 0 {
			regionID = listing.SourceRegions[0]
		}
		taskBrandProfileID := profile.ID
		if taskBrandProfileID == "" {
			taskBrandProfileID = listing.BrandProfileID
		}
		task := model.PublishTask{ID: primitive.NewObjectID().Hex(), AccountID: body.AccountID, BatchID: batch.ID, SegmentID: segmentID, Action: "offline", ItemNo: listing.ItemNo, Title: listing.Title, Brand: profile.Name, BrandProfileID: taskBrandProfileID, SourceItemID: listing.SourceItemID, SourceType: listing.SourceType, SourceRegions: listing.SourceRegions, SourceMemberIDs: listing.SourceMemberIDs, SourceItemIDs: listing.SourceItemIDs, RegionID: regionID, PriceCents: listing.PriceCents, ImageURLs: []string{listing.ImageURL}, XianyuItemID: listing.PlatformItemID, XianyuURL: listing.ItemURL, ChangeReasons: []string{"下架中心手动筛选"}, MinDelaySeconds: 1, MaxDelaySeconds: 2, Status: model.PublishTaskQueued, CreatedAt: now.Add(time.Duration(listingIndex) * time.Millisecond), UpdatedAt: now}
		if err := serviceContext.PublishRepository.Create(ctx, task); err != nil {
			return model.PublishBatch{}, err
		}
		taskIDs = append(taskIDs, task.ID)
	}
	if err := serviceContext.PublishBatchRepository.CompletePreparation(ctx, batch.ID, taskIDs, []model.PublishBatchSkip{}); err != nil {
		_, _ = serviceContext.PublishRepository.CancelByBatchID(context.Background(), batch.ID)
		return model.PublishBatch{}, err
	}
	for _, taskID := range taskIDs {
		if err := serviceContext.PublishService.Enqueue(taskID); err != nil {
			_ = serviceContext.PublishRepository.UpdateStatus(context.Background(), taskID, model.PublishTaskFailed, "发布队列已满", "", "")
		}
	}
	return serviceContext.PublishBatchRepository.Get(ctx, batch.ID)
}

// validOfflineCenterRange 校验售价和折扣筛选区间。
func validOfflineCenterRange(body types.OfflineCenterPreviewRequest) bool {
	if body.MinPriceCents < 0 || body.MaxPriceCents < 0 || (body.MinPriceCents > 0 && body.MaxPriceCents > 0 && body.MinPriceCents > body.MaxPriceCents) {
		return false
	}
	return body.MinDiscountRate >= 0 && body.MinDiscountRate <= 100 && body.MaxDiscountRate >= 0 && body.MaxDiscountRate <= 100 && (body.MinDiscountRate == 0 || body.MaxDiscountRate == 0 || body.MinDiscountRate <= body.MaxDiscountRate)
}

// matchesOfflineCenterRange 判断一件闲鱼商品是否满足下架筛选条件。
func matchesOfflineCenterRange(priceCents int64, discountRate int, body types.OfflineCenterPreviewRequest) bool {
	if body.MinPriceCents > 0 && priceCents < body.MinPriceCents || body.MaxPriceCents > 0 && priceCents > body.MaxPriceCents {
		return false
	}
	if body.MinDiscountRate > 0 && discountRate < body.MinDiscountRate {
		return false
	}
	if body.MaxDiscountRate > 0 && (discountRate == 0 || discountRate > body.MaxDiscountRate) {
		return false
	}
	return true
}

// offlineProductCategory 读取小程序商品主品类。
func offlineProductCategory(product map[string]any) (string, string) {
	categoryValue := product["item_category_main"]
	category, validCategory := categoryValue.(map[string]any)
	if !validCategory {
		if bsonCategory, validBSONCategory := categoryValue.(bson.M); validBSONCategory {
			category = map[string]any(bsonCategory)
		}
	}
	if category == nil {
		return "", ""
	}
	return firstProductString(category, "category_id", "id"), firstProductString(category, "category_name", "name")
}
