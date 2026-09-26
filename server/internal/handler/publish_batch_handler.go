package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

var detailImagePattern = regexp.MustCompile(`(?i)<img[^>]+src=["'](https?://[^"']+)["']`)

const maxBatchPublishCount = 3000

const brandProfileFetchConcurrency = 10

const (
	defaultMinPublishDelaySeconds = 1
	defaultMaxPublishDelaySeconds = 2
	maxPublishDelaySeconds        = 60
)

// publishBatchPlan 是创建批次前重新计算的品牌商品计划。
type publishBatchPlan struct {
	SourceType      string
	BrandProfileID  string
	BrandStoreID    string
	DistributorID   string
	BrandName       string
	RegionID        string
	CategoryIDs     []string
	CategoryNames   []string
	SourceRegions   []string
	SourceMemberIDs []string
	MinDelaySeconds int
	MaxDelaySeconds int
	Total           int
	Candidates      []map[string]any
	Skipped         []model.PublishBatchSkip
	OfflineListings []model.MarketplaceListing
	Updates         []model.PublishTask
	Unchanged       int
}

// previewPublishBatchHandler 返回当前品牌的发布计划预览。
func previewPublishBatchHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		requestBody, ok := decodePublishBatchRequest(responseWriter, request)
		if !ok {
			return
		}
		servePreviewJob(responseWriter, request, serviceContext, requestBody)
	}
}

// createPublishBatchHandler 创建当前品牌的串行发布任务。
func createPublishBatchHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		requestBody, ok := decodePublishBatchRequest(responseWriter, request)
		if !ok {
			return
		}
		if requestBody.PreviewID == "" {
			writeError(responseWriter, 400, "请先生成预览再确认")
			return
		}
		plan, err := consumePreview(request.Context(), serviceContext, requestBody)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "生成品牌发布计划失败")
			return
		}
		selectedProducts := plan.Candidates[:minInt(requestBody.Limit, len(plan.Candidates))]
		if len(selectedProducts)+len(plan.Updates)+len(plan.OfflineListings) == 0 {
			writeError(responseWriter, http.StatusConflict, "当前品牌没有可发布商品")
			return
		}
		plan.MinDelaySeconds = requestBody.MinDelaySeconds
		plan.MaxDelaySeconds = requestBody.MaxDelaySeconds

		now := time.Now()
		batch, activeErr := serviceContext.PublishBatchRepository.FindActive(request.Context())
		if activeErr == nil {
			activeResponse := buildPublishBatchResponse(request.Context(), serviceContext, batch)
			if activeResponse.Status == model.PublishBatchCompleted || activeResponse.Status == model.PublishBatchFailed {
				_ = serviceContext.PublishBatchRepository.MarkStatus(request.Context(), batch.ID, activeResponse.Status)
				activeErr = repository.ErrPublishBatchNotFound
			}
		}
		if activeErr != nil && activeErr != repository.ErrPublishBatchNotFound {
			writeError(responseWriter, http.StatusInternalServerError, "读取当前发布队列失败")
			return
		}
		if activeErr == repository.ErrPublishBatchNotFound {
			batch = model.PublishBatch{ID: primitive.NewObjectID().Hex(), BrandStoreID: plan.BrandStoreID, BrandName: plan.BrandName, RegionID: plan.RegionID, CategoryIDs: plan.CategoryIDs, CategoryNames: plan.CategoryNames, Limit: 0, MinDelaySeconds: requestBody.MinDelaySeconds, MaxDelaySeconds: requestBody.MaxDelaySeconds, TaskIDs: []string{}, Skipped: []model.PublishBatchSkip{}, Segments: []model.PublishBatchSegment{}, Status: model.PublishBatchPreparing, CreatedAt: now, UpdatedAt: now}
			if err := serviceContext.PublishBatchRepository.Create(request.Context(), batch); err != nil {
				writeError(responseWriter, http.StatusInternalServerError, "保存发布操作失败")
				return
			}
		}
		operationCount := len(selectedProducts) + len(plan.Updates) + len(plan.OfflineListings)
		if batch.Limit+operationCount > maxBatchPublishCount {
			writeError(responseWriter, http.StatusConflict, fmt.Sprintf("当前队列还可追加 %d 件，操作记录上限为 3000 件", maxBatchPublishCount-batch.Limit))
			return
		}
		segment := model.PublishBatchSegment{ID: primitive.NewObjectID().Hex(), SourceType: plan.SourceType, BrandProfileID: plan.BrandProfileID, BrandStoreID: plan.BrandStoreID, DistributorID: plan.DistributorID, BrandName: plan.BrandName, RegionID: plan.RegionID, Requested: operationCount, AddedAt: now}
		if err := serviceContext.PublishBatchRepository.AppendSegment(request.Context(), batch.ID, segment); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "追加品牌到发布队列失败")
			return
		}
		batch.Limit += operationCount
		batch.Segments = append(batch.Segments, segment)
		go preparePublishBatch(serviceContext, batch, plan, selectedProducts)
		response := buildPublishBatchResponse(request.Context(), serviceContext, batch)
		writeJSON(responseWriter, http.StatusAccepted, response)
	}
}

// preparePublishBatch 在后台逐件读取实时商详并创建发布任务。
func preparePublishBatch(serviceContext *svc.ServiceContext, batch model.PublishBatch, plan publishBatchPlan, selectedProducts []map[string]any) {
	prepareContext, cancel := context.WithTimeout(context.Background(), 20*time.Minute)
	defer cancel()
	taskIDs := make([]string, 0, len(selectedProducts))
	skipped := append([]model.PublishBatchSkip{}, plan.Skipped...)
	// 修改和下架也持久化为普通队列任务，按商品记录错误并参与整体进度。
	changes := []model.PublishTask{}
	for _, listing := range plan.OfflineListings {
		changes = append(changes, model.PublishTask{ID: primitive.NewObjectID().Hex(), Action: "offline", ItemNo: listing.ItemNo, Title: listing.Title, Brand: plan.BrandName, BrandProfileID: plan.BrandProfileID, SourceMemberIDs: plan.SourceMemberIDs, RegionID: plan.RegionID, XianyuItemID: listing.PlatformItemID, XianyuURL: listing.ItemURL, PlannedAt: time.Now(), ChangeReasons: []string{"全部来源已无可售库存"}})
	}
	changes = append(changes, plan.Updates...)
	for _, task := range changes {
		task.MinDelaySeconds = plan.MinDelaySeconds
		task.MaxDelaySeconds = plan.MaxDelaySeconds
		task.BatchID = batch.ID
		task.Status = model.PublishTaskQueued
		task.CreatedAt = time.Now()
		task.UpdatedAt = task.CreatedAt
		if err := serviceContext.PublishRepository.Create(prepareContext, task); err != nil {
			_ = serviceContext.PublishBatchRepository.FailPreparation(context.Background(), batch.ID, err.Error())
			return
		}
		taskIDs = append(taskIDs, task.ID)
	}
	for _, sourceProduct := range selectedProducts {
		detailRegionID := firstProductString(sourceProduct, "_primary_region")
		if detailRegionID == "" {
			detailRegionID = plan.RegionID
		}
		detailProduct, detailErr := serviceContext.CatalogService.GetLiveProductDetail(prepareContext, sourceProduct, detailRegionID)
		if detailErr != nil {
			skipped = append(skipped, model.PublishBatchSkip{ItemNo: productString(sourceProduct, "item_no"), Title: productString(sourceProduct, "item_name"), Reason: "实时商详读取失败"})
			continue
		}
		if mergedSpecItems, exists := sourceProduct["_merged_spec_items"]; exists {
			detailProduct["spec_items"] = mergedSpecItems
		}
		task, taskErr := buildBatchPublishTask(batch.ID, plan, detailProduct, batch.CreatedAt.Add(time.Duration(len(taskIDs))*time.Millisecond))
		if taskErr != nil {
			skipped = append(skipped, model.PublishBatchSkip{ItemNo: productString(sourceProduct, "item_no"), Title: productString(sourceProduct, "item_name"), Reason: taskErr.Error()})
			continue
		}
		if err := serviceContext.PublishRepository.Create(prepareContext, task); err != nil {
			_ = serviceContext.PublishBatchRepository.FailPreparation(context.Background(), batch.ID, "创建单商品发布任务失败")
			return
		}
		taskIDs = append(taskIDs, task.ID)
	}
	if err := serviceContext.PublishBatchRepository.CompletePreparation(prepareContext, batch.ID, taskIDs, skipped); err != nil {
		_ = serviceContext.PublishBatchRepository.FailPreparation(context.Background(), batch.ID, "保存任务准备结果失败")
		return
	}
	for _, taskID := range taskIDs {
		if err := serviceContext.PublishService.Enqueue(taskID); err != nil {
			_ = serviceContext.PublishRepository.UpdateStatus(context.Background(), taskID, model.PublishTaskFailed, "发布队列已满", "", "")
		}
	}
}

// getPublishBatchHandler 返回批量发布实时进度。
func getPublishBatchHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		batch, err := serviceContext.PublishBatchRepository.Get(request.Context(), pathvar.Vars(request)["id"])
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "批量发布计划不存在")
			return
		}
		writeJSON(responseWriter, http.StatusOK, buildPublishBatchResponse(request.Context(), serviceContext, batch))
	}
}

// listPublishOperationsHandler 返回发布中心操作记录列表。
func listPublishOperationsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		page := parsePositiveInt(request.URL.Query().Get("page"), 1)
		pageSize := parsePositiveInt(request.URL.Query().Get("pageSize"), 20)
		if pageSize > 100 {
			pageSize = 100
		}
		batches, total, err := serviceContext.PublishBatchRepository.List(request.Context(), page, pageSize)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取发布操作记录失败")
			return
		}
		responses := make([]types.PublishBatchResponse, 0, len(batches))
		for _, batch := range batches {
			response := buildPublishBatchResponse(request.Context(), serviceContext, batch)
			if (response.Status == model.PublishBatchCompleted || response.Status == model.PublishBatchFailed) && batch.Status != response.Status {
				_ = serviceContext.PublishBatchRepository.MarkStatus(request.Context(), batch.ID, response.Status)
			}
			response.Tasks = []types.PublishTaskResponse{}
			response.Skipped = []types.PublishBatchSkipResponse{}
			responses = append(responses, response)
		}
		writeJSON(responseWriter, http.StatusOK, types.PublishBatchListResponse{List: responses, Total: total})
	}
}

// decodePublishBatchRequest 校验批量发布请求。
func decodePublishBatchRequest(responseWriter http.ResponseWriter, request *http.Request) (types.CreatePublishBatchRequest, bool) {
	var requestBody types.CreatePublishBatchRequest
	if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
		writeError(responseWriter, http.StatusBadRequest, "批量发布参数格式错误")
		return requestBody, false
	}
	requestBody.BrandStoreID = strings.TrimSpace(requestBody.BrandStoreID)
	requestBody.BrandProfileID = strings.TrimSpace(requestBody.BrandProfileID)
	requestBody.SourceType = strings.TrimSpace(requestBody.SourceType)
	requestBody.DistributorID = strings.TrimSpace(requestBody.DistributorID)
	requestBody.BrandName = strings.TrimSpace(requestBody.BrandName)
	requestBody.RegionID = strings.TrimSpace(requestBody.RegionID)
	if requestBody.SourceType == "" {
		requestBody.SourceType = "local"
	}
	if requestBody.PreviewID != "" {
		if requestBody.Limit == 0 {
			requestBody.Limit = 3000
		}
		if requestBody.MinDelaySeconds == 0 {
			requestBody.MinDelaySeconds = defaultMinPublishDelaySeconds
		}
		if requestBody.MaxDelaySeconds == 0 {
			requestBody.MaxDelaySeconds = defaultMaxPublishDelaySeconds
		}
		if requestBody.MinDelaySeconds < 1 || requestBody.MaxDelaySeconds > 60 || requestBody.MinDelaySeconds > requestBody.MaxDelaySeconds {
			writeError(responseWriter, 400, "处理间隔无效")
			return requestBody, false
		}
		return requestBody, true
	}
	requestBody.CategoryIDs = uniqueStrings(requestBody.CategoryIDs)
	requestBody.CategoryNames = uniqueStrings(requestBody.CategoryNames)
	requestBody.ItemNos = normalizeItemNos(requestBody.ItemNos)
	if requestBody.BrandProfileID == "" && requestBody.SourceType == "local" && requestBody.BrandStoreID == "" {
		writeError(responseWriter, http.StatusBadRequest, "请选择具体品牌")
		return requestBody, false
	}
	if requestBody.BrandProfileID == "" && requestBody.SourceType == "live" && (requestBody.DistributorID == "" || requestBody.BrandName == "" || requestBody.RegionID == "") {
		writeError(responseWriter, http.StatusBadRequest, "实时品牌信息不完整")
		return requestBody, false
	}
	if requestBody.Limit == 0 {
		requestBody.Limit = 20
	}
	if requestBody.Limit < 1 || requestBody.Limit > maxBatchPublishCount {
		writeError(responseWriter, http.StatusBadRequest, "发布数量必须在 1 到 3000 之间")
		return requestBody, false
	}
	if requestBody.MinDelaySeconds == 0 {
		requestBody.MinDelaySeconds = defaultMinPublishDelaySeconds
	}
	if requestBody.MaxDelaySeconds == 0 {
		requestBody.MaxDelaySeconds = defaultMaxPublishDelaySeconds
	}
	if requestBody.MinDelaySeconds < 1 || requestBody.MaxDelaySeconds > maxPublishDelaySeconds || requestBody.MinDelaySeconds > requestBody.MaxDelaySeconds {
		writeError(responseWriter, http.StatusBadRequest, "发布间隔必须在 1 到 60 秒之间，且最小值不能大于最大值")
		return requestBody, false
	}
	return requestBody, true
}

// buildPublishBatchPlan 计算候选商品与自动跳过项。
func buildPublishBatchPlan(ctx context.Context, serviceContext *svc.ServiceContext, requestBody types.CreatePublishBatchRequest) (publishBatchPlan, error) {
	var products []map[string]any
	plan := publishBatchPlan{SourceType: requestBody.SourceType, BrandProfileID: requestBody.BrandProfileID, BrandStoreID: requestBody.BrandStoreID, DistributorID: requestBody.DistributorID, BrandName: requestBody.BrandName, RegionID: requestBody.RegionID, CategoryIDs: requestBody.CategoryIDs, CategoryNames: requestBody.CategoryNames, Candidates: []map[string]any{}, Skipped: []model.PublishBatchSkip{}}
	if requestBody.BrandProfileID != "" {
		profile, members, err := serviceContext.InventoryRepository.GetBrandProfile(ctx, requestBody.BrandProfileID)
		if err != nil {
			return publishBatchPlan{}, err
		}
		plan.BrandName = profile.Name
		plan.RegionID = profile.DefaultRegionID
		if plan.RegionID == "" && len(members) > 0 {
			plan.RegionID = members[0].RegionID
		}
		type memberProductResult struct {
			products []map[string]any
			err      error
		}
		memberResults := make([]memberProductResult, len(members))
		fetchSemaphore := make(chan struct{}, brandProfileFetchConcurrency)
		var fetchWaitGroup sync.WaitGroup
		for memberIndex, member := range members {
			memberKey := member.RegionID + ":" + member.DistributorID
			plan.SourceRegions = appendUniqueText(plan.SourceRegions, member.RegionID)
			plan.SourceMemberIDs = appendUniqueText(plan.SourceMemberIDs, memberKey)
			fetchWaitGroup.Add(1)
			go func(resultIndex int, regionID, distributorID string) {
				defer fetchWaitGroup.Done()
				select {
				case fetchSemaphore <- struct{}{}:
					defer func() { <-fetchSemaphore }()
				case <-ctx.Done():
					memberResults[resultIndex].err = ctx.Err()
					return
				}
				memberResults[resultIndex].products, memberResults[resultIndex].err = serviceContext.CatalogService.ListLiveBrandOffers(ctx, regionID, distributorID, requestBody.CategoryIDs)
			}(memberIndex, member.RegionID, member.DistributorID)
		}
		fetchWaitGroup.Wait()
		for memberIndex, member := range members {
			memberResult := memberResults[memberIndex]
			if memberResult.err != nil {
				return publishBatchPlan{}, memberResult.err
			}
			memberKey := member.RegionID + ":" + member.DistributorID
			for _, product := range memberResult.products {
				product["_source_regions"] = []string{member.RegionID}
				product["_source_member_ids"] = []string{memberKey}
				product["_source_item_ids"] = []string{firstProductString(product, "default_item_id", "item_id", "goods_id")}
				product["_primary_region"] = member.RegionID
				products = append(products, product)
			}
		}
		products = mergePublishProductsByItemNo(products)
	} else if requestBody.SourceType == "live" {
		liveProducts, err := serviceContext.CatalogService.ListLiveBrandOffers(ctx, requestBody.RegionID, requestBody.DistributorID, requestBody.CategoryIDs)
		if err != nil {
			return publishBatchPlan{}, err
		}
		products = liveProducts
	} else {
		brandStore, err := serviceContext.CatalogService.GetBrandStore(ctx, requestBody.BrandStoreID)
		if err != nil {
			return publishBatchPlan{}, err
		}
		plan.BrandName = brandStore.BrandName
		plan.RegionID = brandStore.RegionID
		plan.DistributorID = brandStore.DistributorID
		categoryFilter := strings.Join(requestBody.CategoryIDs, ",")
		result, err := serviceContext.CatalogService.ListOffers(ctx, brandStore.RegionID, requestBody.BrandStoreID, categoryFilter, "", 1, 60, false, "")
		if err != nil {
			return publishBatchPlan{}, err
		}
		products = append([]map[string]any{}, result.List...)
		for page := 2; len(products) < int(result.Total); page++ {
			pageResult, pageErr := serviceContext.CatalogService.ListOffers(ctx, brandStore.RegionID, requestBody.BrandStoreID, categoryFilter, "", page, 60, false, "")
			if pageErr != nil {
				return publishBatchPlan{}, pageErr
			}
			products = append(products, pageResult.List...)
			if len(pageResult.List) == 0 {
				break
			}
		}
	}
	if plan.BrandProfileID == "" {
		plan.SourceRegions = []string{plan.RegionID}
		plan.SourceMemberIDs = []string{plan.RegionID + ":" + plan.DistributorID}
		for _, p := range products {
			p["_source_regions"] = plan.SourceRegions
			p["_source_member_ids"] = plan.SourceMemberIDs
		}
		products = mergePublishProductsByItemNo(products)
	}
	if len(requestBody.ItemNos) > 0 {
		requestedItemNos := make(map[string]struct{}, len(requestBody.ItemNos))
		for _, itemNo := range requestBody.ItemNos {
			requestedItemNos[itemNo] = struct{}{}
		}
		filteredProducts := make([]map[string]any, 0, len(products))
		for _, product := range products {
			if _, exists := requestedItemNos[strings.ToUpper(productString(product, "item_no"))]; exists {
				filteredProducts = append(filteredProducts, product)
			}
		}
		products = filteredProducts
	}
	itemNos := make([]string, 0, len(products))
	for _, product := range products {
		itemNos = append(itemNos, productString(product, "item_no"))
	}
	existingTaskNos, err := serviceContext.PublishRepository.ExistingItemNos(ctx, itemNos)
	if err != nil {
		return publishBatchPlan{}, err
	}
	listings, err := serviceContext.ListingRepository.List(ctx, model.XianyuPlatform, 5000)
	if err != nil {
		return publishBatchPlan{}, err
	}
	listedItemNos := make(map[string]struct{}, len(listings))
	listingNos := []string{}
	for _, listing := range listings {
		listingNos = append(listingNos, listing.ItemNo)
	}
	busyListings, busyErr := serviceContext.PublishRepository.ExistingItemNos(ctx, listingNos)
	if busyErr != nil {
		return publishBatchPlan{}, busyErr
	}
	for _, listing := range listings {
		listedItemNos[strings.ToUpper(strings.TrimSpace(listing.ItemNo))] = struct{}{}
	}
	plan.Total = len(products)
	// 指定货号是单品发布，不执行整品牌缺失商品对账，避免误下架其他商品。
	if len(requestBody.ItemNos) == 0 && len(requestBody.CategoryIDs) == 0 {
		currentItemNos := make(map[string]struct{}, len(products))
		for _, product := range products {
			currentItemNos[strings.ToUpper(productString(product, "item_no"))] = struct{}{}
		}
		for _, listing := range listings {
			if !listingBelongsToPlan(listing, plan) {
				continue
			}
			if _, busy := busyListings[strings.ToUpper(strings.TrimSpace(listing.ItemNo))]; busy {
				continue
			}
			if _, exists := currentItemNos[strings.ToUpper(strings.TrimSpace(listing.ItemNo))]; !exists {
				plan.OfflineListings = append(plan.OfflineListings, listing)
			}
		}
	}
	// 当前计划中已经收录的货号，避免同品牌重复商品进入队列。
	selectedItemNos := make(map[string]struct{}, len(products))
	for _, product := range products {
		itemNo := strings.ToUpper(productString(product, "item_no"))
		title := productString(product, "item_name")
		reason := ""
		if itemNo == "" || title == "" || productString(product, "main_img") == "" {
			reason = "商品信息不完整"
		} else if productNumber(product, "item_total_store") <= 0 && productNumber(product, "store") <= 0 {
			reason = "库存为 0"
		} else if _, exists := existingTaskNos[itemNo]; exists {
			reason = "已有进行中的发布任务"
		} else if _, exists := listedItemNos[itemNo]; exists {
			matched := false
			for _, listing := range listings {
				if strings.EqualFold(listing.ItemNo, itemNo) && listingBelongsToPlan(listing, plan) {
					matched = true
					updated, changed, editErr := planListingUpdate(ctx, serviceContext, plan, product, listing)
					if editErr != nil {
						return publishBatchPlan{}, editErr
					}
					if changed {
						plan.Updates = append(plan.Updates, updated)
					} else {
						plan.Unchanged++
					}
				}
			}
			if matched {
				continue
			}
			reason = "已在售但来源未关联，请先确认品牌归属"
		} else if _, exists := selectedItemNos[itemNo]; exists {
			reason = "当前品牌存在重复货号"
		}
		if reason != "" {
			plan.Skipped = append(plan.Skipped, model.PublishBatchSkip{ItemNo: itemNo, Title: title, Reason: reason})
			continue
		}
		selectedItemNos[itemNo] = struct{}{}
		plan.Candidates = append(plan.Candidates, product)
	}
	return plan, nil
}

// buildBatchPublishTask 将实时商详转换为单商品发布任务。
func buildBatchPublishTask(batchID string, plan publishBatchPlan, product map[string]any, createdAt time.Time) (model.PublishTask, error) {
	itemNo := productString(product, "item_no")
	title := productString(product, "item_name")
	brandName := firstProductString(product, "goods_brand")
	if brandName == "" {
		brandName = plan.BrandName
	}
	images := productImages(product)
	if itemNo == "" || title == "" || len(images) == 0 {
		return model.PublishTask{}, fmt.Errorf("实时商详缺少货号、标题或图片")
	}
	sizes := productSizes(product)
	shippingRegionNames := make([]string, 0)
	for _, sourceRegionID := range productStringSlice(product, "_source_regions", plan.SourceRegions) {
		shippingRegionNames = appendUniqueText(shippingRegionNames, publishRegionName(sourceRegionID))
	}
	shippingRegionName := publishRegionName(plan.RegionID)
	if len(shippingRegionNames) > 0 {
		shippingRegionName = strings.Join(shippingRegionNames, "、")
	}
	description := buildPublishDescription(title, itemNo, sizes, shippingRegionName)
	priceCents := batchPriceCents(productNumber(product, "activity_price"), productNumber(product, "price"))
	lowerTitle := strings.ToLower(title)
	isFootwear := strings.Contains(title, "鞋") || strings.Contains(title, "靴") || strings.Contains(lowerTitle, "sneaker") || strings.Contains(lowerTitle, "loafer") || strings.Contains(lowerTitle, "boot")
	availableSizes := []string{}
	if isFootwear {
		availableSizes = sizes
	}
	variants := productPublishVariants(product, isFootwear, priceCents)
	if len(variants) > 0 {
		priceCents = variants[0].PriceCents
		for _, v := range variants {
			if v.PriceCents < priceCents {
				priceCents = v.PriceCents
			}
		}
	}
	minDelaySeconds := plan.MinDelaySeconds
	maxDelaySeconds := plan.MaxDelaySeconds
	if minDelaySeconds == 0 {
		minDelaySeconds = defaultMinPublishDelaySeconds
	}
	if maxDelaySeconds == 0 {
		maxDelaySeconds = defaultMaxPublishDelaySeconds
	}
	return model.PublishTask{ID: primitive.NewObjectID().Hex(), BatchID: batchID, SourceItemID: firstProductString(product, "default_item_id", "item_id", "goods_id"), ItemNo: itemNo, Title: buildPublishTitle(title, itemNo), Description: truncateText(description, 1500), PriceCents: priceCents, OriginalPriceCents: productNumber(product, "market_price"), ImageURLs: images, RegionID: plan.RegionID, Brand: brandName, BrandProfileID: plan.BrandProfileID, SourceType: plan.SourceType, SourceRegions: productStringSlice(product, "_source_regions", plan.SourceRegions), SourceMemberIDs: productStringSlice(product, "_source_member_ids", plan.SourceMemberIDs), SourceItemIDs: productStringSlice(product, "_source_item_ids", []string{firstProductString(product, "default_item_id", "item_id", "goods_id")}), Condition: "全新", AvailableSizes: availableSizes, Variants: variants, IsFootwear: isFootwear, MinDelaySeconds: minDelaySeconds, MaxDelaySeconds: maxDelaySeconds, Status: model.PublishTaskQueued, CreatedAt: createdAt, UpdatedAt: createdAt}, nil
}

// buildPublishTitle 将货号固定放在标题末尾，并优先截断过长的商品名称。
func buildPublishTitle(title, itemNo string) string {
	cleanTitle := cleanPublishSourceTitle(title, itemNo)
	const maxTitleLength = 30
	prefix := "全新"
	fixedLength := len([]rune(prefix))
	if itemNo != "" {
		fixedLength += len([]rune(itemNo)) + 1
	}
	nameLimit := maxTitleLength - fixedLength - 1
	if nameLimit < 0 {
		nameLimit = 0
	}
	cleanTitle = truncatePublishTitleName(cleanTitle, nameLimit)
	return strings.TrimSpace(strings.Join([]string{prefix, cleanTitle, itemNo}, " "))
}

// truncatePublishTitleName 截断商品名称，并避免保留被截断的半个英文单词。
func truncatePublishTitleName(value string, maxLength int) string {
	runes := []rune(strings.TrimSpace(value))
	if len(runes) <= maxLength {
		return string(runes)
	}
	truncatedRunes := runes[:maxLength]
	if maxLength > 0 && isASCIIWordRune(truncatedRunes[maxLength-1]) && isASCIIWordRune(runes[maxLength]) {
		lastSpaceIndex := strings.LastIndex(string(truncatedRunes), " ")
		if lastSpaceIndex >= 0 {
			return strings.TrimSpace(string(truncatedRunes)[:lastSpaceIndex])
		}
	}
	return strings.TrimSpace(string(truncatedRunes))
}

// isASCIIWordRune 判断字符是否属于英文或数字单词。
func isASCIIWordRune(value rune) bool {
	return value >= '0' && value <= '9' || value >= 'A' && value <= 'Z' || value >= 'a' && value <= 'z'
}

// cleanPublishSourceTitle 清理旧模板前缀及标题末尾重复货号。
func cleanPublishSourceTitle(title, itemNo string) string {
	cleanTitle := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(title), "【全新】"))
	cleanTitle = strings.TrimSpace(strings.TrimPrefix(cleanTitle, "全新"))
	if itemNo != "" && strings.HasSuffix(strings.ToUpper(cleanTitle), strings.ToUpper(itemNo)) {
		cleanTitle = strings.TrimSpace(cleanTitle[:len(cleanTitle)-len(itemNo)])
	}
	if itemNo != "" && strings.HasPrefix(strings.ToUpper(cleanTitle), strings.ToUpper(itemNo)) {
		cleanTitle = strings.TrimSpace(cleanTitle[len(itemNo):])
	}
	return cleanTitle
}

// buildPublishDescription 生成所有 SKU 发布共用的唯一商品描述模板。
func buildPublishDescription(title, itemNo string, sizes []string, shippingRegionName string) string {
	descriptionLines := []string{
		"货号：" + itemNo,
	}
	if len(sizes) > 0 {
		descriptionLines = append(descriptionLines, "有货尺码/型号："+strings.Join(uniqueStrings(sizes), "、"))
	}
	descriptionLines = append(descriptionLines,
		"发货地区："+shippingRegionName,
		"奥莱正品，支持验货。库存实时变化，下单前请先确认。",
		" ",
		"购买说明",
		"下单即表示已阅读并接受以下说明：",
		"",
		"1. 正品保障",
		"商品均来自奥特莱斯正规渠道，全新未穿，支持验货及正规平台鉴定。如需查看购买凭证，请提前联系。",
		"",
		"2. 库存说明",
		"奥莱库存变化较快，下单前请先确认尺码和库存。部分商品需要到店采购，如遇临时缺货会及时联系处理。",
		"",
		"3. 发货时效",
		"现货商品一般在下单后24小时内发出，代购商品通常在24—48小时内发出。如遇门店调货或库存变化，发货时间可能顺延，急用请提前确认。",
		"",
		"4. 快递说明",
		"默认普通快递包邮，新疆、西藏及其他偏远地区请提前咨询。商品默认使用纸箱加固包装，如需顺丰可补差价升级。",
		"",
		"5. 价格说明",
		"商品售价可能随奥莱活动、库存及不同尺码的采购价格调整。订单成交后不提供保价或补差价服务。",
		"",
		"6. 尺码与售后",
		"可以根据脚长和日常穿着习惯协助推荐尺码，具体请以自己常穿的同品牌尺码为主要参考。售后按照闲鱼平台规则处理；如有质量问题或商品与描述明显不符，请保留商品及完整包装并及时联系。",
		"",
		"购买前如需查看鞋标、鞋盒、购买凭证或其他商品细节，欢迎私聊。感谢理解，祝购物愉快！",
	)
	return truncateText(strings.Join(descriptionLines, "\n"), 1500)
}

// publishRegionName 返回单个发布表单使用的发货地区简称。
func publishRegionName(regionID string) string {
	regionNames := map[string]string{"2": "京津", "3": "上海", "4": "广佛", "5": "成都", "6": "武汉", "7": "重庆"}
	if regionName := regionNames[regionID]; regionName != "" {
		return regionName
	}
	return "对应仓库"
}

// buildPublishBatchResponse 汇总批次任务状态。
func buildPublishBatchResponse(ctx context.Context, serviceContext *svc.ServiceContext, batch model.PublishBatch) types.PublishBatchResponse {
	tasks, _ := serviceContext.PublishRepository.ListByBatchID(ctx, batch.ID)
	minDelaySeconds := batch.MinDelaySeconds
	maxDelaySeconds := batch.MaxDelaySeconds
	if minDelaySeconds == 0 {
		minDelaySeconds = defaultMinPublishDelaySeconds
	}
	if maxDelaySeconds == 0 {
		maxDelaySeconds = defaultMaxPublishDelaySeconds
	}
	response := types.PublishBatchResponse{ID: batch.ID, BrandName: batch.BrandName, CategoryIDs: batch.CategoryIDs, CategoryNames: batch.CategoryNames, Status: batch.Status, ErrorMessage: batch.ErrorMessage, Limit: batch.Limit, MinDelaySeconds: minDelaySeconds, MaxDelaySeconds: maxDelaySeconds, Total: len(tasks) + len(batch.Skipped), Skipped: publishBatchSkipResponses(batch.Skipped), SkippedCount: len(batch.Skipped), Tasks: []types.PublishTaskResponse{}, CreatedAt: batch.CreatedAt.Format(time.RFC3339), OfflineRequested: batch.OfflineRequested, OfflineSucceeded: batch.OfflineSucceeded, OfflineFailed: batch.OfflineFailed}
	response.Segments = make([]types.PublishBatchSegmentResponse, 0, len(batch.Segments))
	for _, segment := range batch.Segments {
		response.Segments = append(response.Segments, types.PublishBatchSegmentResponse{ID: segment.ID, SourceType: segment.SourceType, BrandProfileID: segment.BrandProfileID, BrandStoreID: segment.BrandStoreID, DistributorID: segment.DistributorID, BrandName: segment.BrandName, RegionID: segment.RegionID, Requested: segment.Requested, AddedAt: segment.AddedAt.Format(time.RFC3339)})
	}
	allFinished := len(tasks) > 0 && batch.Status != model.PublishBatchPreparing
	for _, task := range tasks {
		response.Tasks = append(response.Tasks, publishTaskToResponse(task))
		if task.Action == "offline" {
			response.OfflineRequested++
			if task.Status == model.PublishTaskSucceeded {
				response.OfflineSucceeded++
			}
			if task.Status == model.PublishTaskFailed {
				response.OfflineFailed++
			}
		}
		switch task.Status {
		case model.PublishTaskQueued:
			response.Queued++
			allFinished = false
		case model.PublishTaskPreparing, model.PublishTaskPublishing:
			response.Running++
			allFinished = false
		case model.PublishTaskSucceeded:
			response.Succeeded++
		case model.PublishTaskNeedsLogin:
			response.Failed++
		case model.PublishTaskFailed:
			response.Failed++
		}
	}
	if allFinished {
		response.Status = model.PublishBatchCompleted
		if response.Failed > 0 {
			response.Status = model.PublishBatchFailed
		}
	}
	return response
}

func publishBatchSkipResponses(skips []model.PublishBatchSkip) []types.PublishBatchSkipResponse {
	result := make([]types.PublishBatchSkipResponse, 0, len(skips))
	for _, skip := range skips {
		result = append(result, types.PublishBatchSkipResponse{ItemNo: skip.ItemNo, Title: skip.Title, Reason: skip.Reason})
	}
	return result
}

// publishBatchOfflineCandidateResponses 转换品牌对账产生的待下架商品。
func publishBatchOfflineCandidateResponses(listings []model.MarketplaceListing) []types.PublishBatchOfflineCandidateResponse {
	responses := make([]types.PublishBatchOfflineCandidateResponse, 0, len(listings))
	for _, listing := range listings {
		responses = append(responses, types.PublishBatchOfflineCandidateResponse{PlatformItemID: listing.PlatformItemID, ItemNo: listing.ItemNo, Title: listing.Title, PriceCents: listing.PriceCents, ItemURL: listing.ItemURL})
	}
	return responses
}

// offlinePublishBatchListings 分批执行品牌对账产生的闲鱼下架任务。
func offlinePublishBatchListings(serviceContext *svc.ServiceContext, batchID string, listings []model.MarketplaceListing) {
	itemIDs := make([]string, 0, len(listings))
	for _, listing := range listings {
		itemIDs = appendUniqueText(itemIDs, listing.PlatformItemID)
	}
	succeededCount := 0
	failedCount := 0
	for startIndex := 0; startIndex < len(itemIDs); startIndex += 100 {
		endIndex := minInt(startIndex+100, len(itemIDs))
		result, err := serviceContext.MarketplaceService.OfflineXianyuListings(context.Background(), itemIDs[startIndex:endIndex])
		if err != nil {
			failedCount += endIndex - startIndex
			continue
		}
		succeededCount += len(result.SucceededItemIDs)
		failedCount += len(result.FailedItemIDs)
	}
	_ = serviceContext.PublishBatchRepository.AddOfflineResult(context.Background(), batchID, len(itemIDs), succeededCount, failedCount)
}

func productString(product map[string]any, key string) string {
	value, exists := product[key]
	if !exists || value == nil {
		return ""
	}
	return strings.TrimSpace(fmt.Sprint(value))
}

// normalizeItemNos 标准化用户指定的货号筛选。
func normalizeItemNos(itemNos []string) []string {
	values := make([]string, 0, len(itemNos))
	seen := make(map[string]struct{}, len(itemNos))
	for _, itemNo := range itemNos {
		normalized := strings.ToUpper(strings.TrimSpace(itemNo))
		if normalized == "" {
			continue
		}
		if _, exists := seen[normalized]; exists {
			continue
		}
		seen[normalized] = struct{}{}
		values = append(values, normalized)
	}
	return values
}
func firstProductString(product map[string]any, keys ...string) string {
	for _, key := range keys {
		if value := productString(product, key); value != "" && value != "<nil>" {
			return value
		}
	}
	return ""
}

// appendUniqueText 追加非空且未出现的文本。
func appendUniqueText(values []string, value string) []string {
	value = strings.TrimSpace(value)
	if value == "" {
		return values
	}
	for _, currentValue := range values {
		if currentValue == value {
			return values
		}
	}
	return append(values, value)
}

// productStringSlice 读取商品中保存的来源数组并提供默认值。
func productStringSlice(product map[string]any, key string, fallback []string) []string {
	result := make([]string, 0)
	switch values := product[key].(type) {
	case []string:
		for _, value := range values {
			result = appendUniqueText(result, value)
		}
	case []any:
		for _, value := range values {
			result = appendUniqueText(result, fmt.Sprint(value))
		}
	}
	if len(result) == 0 {
		return append([]string{}, fallback...)
	}
	return result
}

// mergePublishProductsByItemNo 合并不同地区的同货号商品并保留最低有效采购价来源。
func mergePublishProductsByItemNo(products []map[string]any) []map[string]any {
	productsByItemNo := make(map[string]map[string]any)
	orderedItemNos := make([]string, 0)
	for _, source := range products {
		// 统一 Mongo 和 HTTP 的数组类型，并避免合并时修改上游原快照。
		encoded, err := json.Marshal(source)
		if err != nil {
			continue
		}
		var product map[string]any
		if json.Unmarshal(encoded, &product) != nil {
			continue
		}
		itemNo := strings.ToUpper(productString(product, "item_no"))
		if itemNo == "" {
			continue
		}
		// 无货来源不参与最低价格和地区合并；保留在原集合用于完整性核对。
		if productNumber(product, "item_total_store") <= 0 && productNumber(product, "store") <= 0 {
			continue
		}
		existing := productsByItemNo[itemNo]
		if existing == nil {
			product["_merged_spec_items"] = mergeProductSpecItems(nil, product["spec_items"])
			productsByItemNo[itemNo] = product
			orderedItemNos = append(orderedItemNos, itemNo)
			continue
		}
		regions := productStringSlice(existing, "_source_regions", nil)
		for _, regionID := range productStringSlice(product, "_source_regions", nil) {
			regions = appendUniqueText(regions, regionID)
		}
		memberIDs := productStringSlice(existing, "_source_member_ids", nil)
		for _, memberID := range productStringSlice(product, "_source_member_ids", nil) {
			memberIDs = appendUniqueText(memberIDs, memberID)
		}
		itemIDs := productStringSlice(existing, "_source_item_ids", nil)
		for _, itemID := range productStringSlice(product, "_source_item_ids", nil) {
			itemIDs = appendUniqueText(itemIDs, itemID)
		}
		mergedSpecItems := mergeProductSpecItems(existing["_merged_spec_items"], product["spec_items"])
		selected := existing
		if batchPriceCents(productNumber(product, "activity_price"), productNumber(product, "price")) < batchPriceCents(productNumber(existing, "activity_price"), productNumber(existing, "price")) {
			selected = product
			productsByItemNo[itemNo] = selected
		}
		selected["_source_regions"] = regions
		selected["_source_member_ids"] = memberIDs
		selected["_source_item_ids"] = itemIDs
		selected["_merged_spec_items"] = mergedSpecItems
	}
	result := make([]map[string]any, 0, len(orderedItemNos))
	for _, itemNo := range orderedItemNos {
		product := productsByItemNo[itemNo]
		var total int64
		if specs, ok := product["_merged_spec_items"].([]any); ok && len(specs) > 0 {
			for _, v := range specs {
				sku, _ := v.(map[string]any)
				total += productNumber(sku, "store")
			}
			product["spec_items"] = specs
		} else {
			total = productNumber(product, "item_total_store")
			if total <= 0 {
				total = productNumber(product, "store")
			}
		}
		product["item_total_store"] = total
		product["store"] = total
		result = append(result, productsByItemNo[itemNo])
	}
	return result
}

// mergeProductSpecItems 按规格值去重合并多个地区的 SKU，并累加库存。
func mergeProductSpecItems(existingValue, nextValue any) []any {
	mergedByLabel := make(map[string]map[string]any)
	orderedLabels := make([]string, 0)
	appendItems := func(value any) {
		items, _ := value.([]any)
		for _, rawItem := range items {
			item, ok := rawItem.(map[string]any)
			if !ok {
				continue
			}
			if productNumber(item, "store") <= 0 || productString(item, "approve_status") == "offsale" {
				continue
			}
			labelParts := make([]string, 0)
			if specs, ok := item["item_spec"].([]any); ok {
				for _, rawSpec := range specs {
					if spec, specOK := rawSpec.(map[string]any); specOK {
						name := productString(spec, "spec_name")
						value := canonicalSpecValue(name, productString(spec, "spec_value_name"))
						spec["spec_value_name"] = value
						labelParts = append(labelParts, name+"="+value)
					}
				}
			}
			label := strings.ToUpper(strings.Join(labelParts, "/"))
			if label == "" {
				label = firstProductString(item, "erp_sku_code", "item_id")
			}
			existingItem := mergedByLabel[label]
			if existingItem == nil {
				mergedByLabel[label] = item
				orderedLabels = append(orderedLabels, label)
				continue
			}
			combinedStock := productNumber(existingItem, "store") + productNumber(item, "store")
			selectedItem := existingItem
			if batchPriceCents(productNumber(item, "activity_price"), productNumber(item, "price")) < batchPriceCents(productNumber(existingItem, "activity_price"), productNumber(existingItem, "price")) {
				selectedItem = item
				mergedByLabel[label] = selectedItem
			}
			selectedItem["store"] = combinedStock
		}
	}
	appendItems(existingValue)
	appendItems(nextValue)
	result := make([]any, 0, len(orderedLabels))
	for _, label := range orderedLabels {
		result = append(result, mergedByLabel[label])
	}
	return result
}
func productNumber(product map[string]any, key string) int64 {
	switch value := product[key].(type) {
	case float64:
		return int64(value)
	case int64:
		return value
	case string:
		var parsed int64
		_, _ = fmt.Sscan(value, &parsed)
		return parsed
	default:
		return 0
	}
}
func productImages(product map[string]any) []string {
	images := []string{}
	seen := map[string]struct{}{}
	appendImage := func(imageURL string) {
		imageURL = strings.TrimSpace(imageURL)
		if imageURL == "" || len(images) >= 9 {
			return
		}
		if _, exists := seen[imageURL]; exists {
			return
		}
		seen[imageURL] = struct{}{}
		images = append(images, imageURL)
	}
	appendImage(productString(product, "main_img"))
	if values, ok := product["pics"].([]any); ok {
		for _, value := range values {
			appendImage(fmt.Sprint(value))
		}
	}
	for _, match := range detailImagePattern.FindAllStringSubmatch(productString(product, "intro"), -1) {
		if len(match) > 1 {
			appendImage(match[1])
		}
	}
	return images
}
func productSizes(product map[string]any) []string {
	sizes := []string{}
	seen := map[string]struct{}{}
	values, _ := product["spec_items"].([]any)
	for _, rawSKU := range values {
		sku, _ := rawSKU.(map[string]any)
		if productNumber(sku, "store") <= 0 || productString(sku, "approve_status") == "offsale" {
			continue
		}
		specs, _ := sku["item_spec"].([]any)
		variantLabel := ""
		fallbackLabels := []string{}
		for _, rawSpec := range specs {
			spec, _ := rawSpec.(map[string]any)
			name := productString(spec, "spec_name")
			value := productString(spec, "spec_value_name")
			if value == "" {
				continue
			}
			fallbackLabels = append(fallbackLabels, value)
			if variantLabel == "" && (strings.Contains(name, "尺码") || strings.Contains(name, "鞋码") || strings.Contains(name, "型号") || strings.Contains(name, "规格")) {
				variantLabel = value
			}
		}
		if variantLabel == "" {
			variantLabel = strings.Join(fallbackLabels, " / ")
		}
		if variantLabel != "" {
			if _, exists := seen[variantLabel]; !exists {
				seen[variantLabel] = struct{}{}
				sizes = append(sizes, variantLabel)
			}
		}
	}
	return sizes
}

// productPublishVariants 将实时 SKU 转换为闲鱼卖家工作台的多规格库存。
func productPublishVariants(product map[string]any, isFootwear bool, fallbackPriceCents int64) []model.PublishVariant {
	rawItems, _ := product["spec_items"].([]any)
	if len(rawItems) == 0 {
		return nil
	}

	type variantCandidate struct {
		priceCents int64
		quantity   int64
		properties map[string]string
	}
	candidates := make([]variantCandidate, 0, len(rawItems))
	propertyValues := make(map[string]map[string]struct{})
	propertyOrder := make([]string, 0, 2)
	for _, rawItem := range rawItems {
		item, _ := rawItem.(map[string]any)
		quantity := productNumber(item, "store")
		if quantity <= 0 || productString(item, "approve_status") == "offsale" {
			continue
		}
		properties := make(map[string]string)
		rawSpecs, _ := item["item_spec"].([]any)
		for _, rawSpec := range rawSpecs {
			spec, _ := rawSpec.(map[string]any)
			name := normalizePublishVariantName(productString(spec, "spec_name"), isFootwear)
			value := productString(spec, "spec_value_name")
			if name == "" || value == "" {
				continue
			}
			properties[name] = value
			if propertyValues[name] == nil {
				propertyValues[name] = make(map[string]struct{})
				propertyOrder = append(propertyOrder, name)
			}
			propertyValues[name][value] = struct{}{}
		}
		activityPrice := productNumber(item, "activity_price")
		sourcePrice := productNumber(item, "price")
		priceCents := fallbackPriceCents
		if activityPrice > 0 || sourcePrice > 0 {
			priceCents = batchPriceCents(activityPrice, sourcePrice)
		}
		candidates = append(candidates, variantCandidate{priceCents: priceCents, quantity: quantity, properties: properties})
	}

	varyingProperties := make([]string, 0, 2)
	for _, propertyName := range propertyOrder {
		if len(propertyValues[propertyName]) > 1 || strings.Contains(propertyName, "码") {
			varyingProperties = append(varyingProperties, propertyName)
		}
		if len(varyingProperties) == 2 {
			break
		}
	}
	if len(varyingProperties) == 0 || len(candidates) == 0 {
		return nil
	}

	variants := make([]model.PublishVariant, 0, len(candidates))
	for _, candidate := range candidates {
		properties := make([]model.PublishVariantProperty, 0, len(varyingProperties))
		for _, propertyName := range varyingProperties {
			propertyValue := candidate.properties[propertyName]
			if propertyValue == "" {
				properties = nil
				break
			}
			properties = append(properties, model.PublishVariantProperty{Name: propertyName, Value: propertyValue})
		}
		if len(properties) == 0 {
			continue
		}
		variants = append(variants, model.PublishVariant{PriceCents: candidate.priceCents, Quantity: candidate.quantity, Properties: properties})
	}
	if len(variants) == 0 {
		return nil
	}
	return variants
}

// normalizePublishVariantName 统一买家端展示的规格名称。
func normalizePublishVariantName(name string, isFootwear bool) string {
	name = strings.TrimSpace(name)
	if isFootwear && (strings.Contains(name, "尺码") || strings.Contains(name, "鞋码")) {
		return "鞋码"
	}
	return name
}
func batchPriceCents(activityPrice, price int64) int64 {
	sourcePrice := price
	if activityPrice > 0 {
		sourcePrice = activityPrice
	}
	markup := int64(12000)
	if sourcePrice < 50000 {
		markup = 4000
	} else if sourcePrice < 100000 {
		markup = 8000
	}
	result := sourcePrice + markup
	if result%100 != 0 {
		result = result/100*100 + 90
	}
	return result
}
func minInt(left, right int) int {
	if left < right {
		return left
	}
	return right
}

// truncateText 按字符数量截断文本。
func truncateText(value string, maxLength int) string {
	runes := []rune(value)
	if len(runes) <= maxLength {
		return value
	}
	return string(runes[:maxLength])
}
