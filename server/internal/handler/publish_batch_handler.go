package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

var detailImagePattern = regexp.MustCompile(`(?i)<img[^>]+src=["'](https?://[^"']+)["']`)

const maxBatchPublishCount = 500

const (
	defaultMinPublishDelaySeconds = 4
	defaultMaxPublishDelaySeconds = 7
	maxPublishDelaySeconds        = 60
)

// publishBatchPlan 是创建批次前重新计算的品牌商品计划。
type publishBatchPlan struct {
	BrandStoreID    string
	BrandName       string
	RegionID        string
	CategoryIDs     []string
	CategoryNames   []string
	MinDelaySeconds int
	MaxDelaySeconds int
	Total           int
	Candidates      []map[string]any
	Skipped         []model.PublishBatchSkip
}

// previewPublishBatchHandler 返回当前品牌的发布计划预览。
func previewPublishBatchHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		requestBody, ok := decodePublishBatchRequest(responseWriter, request)
		if !ok {
			return
		}
		if _, err := serviceContext.MarketplaceService.SyncXianyu(request.Context()); err != nil {
			logx.Errorf("sync xianyu listings before batch preview: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "同步闲鱼实时在售状态失败，请检查登录状态后重试")
			return
		}
		plan, err := buildPublishBatchPlan(request.Context(), serviceContext, requestBody.BrandStoreID, requestBody.CategoryIDs, requestBody.CategoryNames)
		if err != nil {
			logx.Errorf("preview publish batch: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "生成品牌发布计划失败")
			return
		}
		selectedCount := minInt(requestBody.Limit, len(plan.Candidates))
		writeJSON(responseWriter, http.StatusOK, types.PublishBatchPreviewResponse{BrandStoreID: plan.BrandStoreID, BrandName: plan.BrandName, CategoryIDs: plan.CategoryIDs, CategoryNames: plan.CategoryNames, Total: plan.Total, Publishable: len(plan.Candidates), Selected: selectedCount, Skipped: publishBatchSkipResponses(plan.Skipped)})
	}
}

// createPublishBatchHandler 创建当前品牌的串行发布任务。
func createPublishBatchHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		requestBody, ok := decodePublishBatchRequest(responseWriter, request)
		if !ok {
			return
		}
		if _, err := serviceContext.MarketplaceService.SyncXianyu(request.Context()); err != nil {
			logx.Errorf("sync xianyu listings before batch create: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "同步闲鱼实时在售状态失败，请检查登录状态后重试")
			return
		}
		plan, err := buildPublishBatchPlan(request.Context(), serviceContext, requestBody.BrandStoreID, requestBody.CategoryIDs, requestBody.CategoryNames)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "生成品牌发布计划失败")
			return
		}
		selectedProducts := plan.Candidates[:minInt(requestBody.Limit, len(plan.Candidates))]
		if len(selectedProducts) == 0 {
			writeError(responseWriter, http.StatusConflict, "当前品牌没有可发布商品")
			return
		}
		plan.MinDelaySeconds = requestBody.MinDelaySeconds
		plan.MaxDelaySeconds = requestBody.MaxDelaySeconds

		now := time.Now()
		batch := model.PublishBatch{ID: primitive.NewObjectID().Hex(), BrandStoreID: plan.BrandStoreID, BrandName: plan.BrandName, RegionID: plan.RegionID, CategoryIDs: plan.CategoryIDs, CategoryNames: plan.CategoryNames, Limit: requestBody.Limit, MinDelaySeconds: requestBody.MinDelaySeconds, MaxDelaySeconds: requestBody.MaxDelaySeconds, TaskIDs: []string{}, Skipped: plan.Skipped, Status: model.PublishBatchPreparing, CreatedAt: now, UpdatedAt: now}
		if err := serviceContext.PublishBatchRepository.Create(request.Context(), batch); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "保存批量发布计划失败")
			return
		}
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
	skipped := append([]model.PublishBatchSkip{}, batch.Skipped...)
	for _, sourceProduct := range selectedProducts {
		detailProduct, detailErr := serviceContext.CatalogService.GetLiveProductDetail(prepareContext, sourceProduct, plan.RegionID)
		if detailErr != nil {
			skipped = append(skipped, model.PublishBatchSkip{ItemNo: productString(sourceProduct, "item_no"), Title: productString(sourceProduct, "item_name"), Reason: "实时商详读取失败"})
			continue
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
	if len(taskIDs) == 0 {
		_ = serviceContext.PublishBatchRepository.FailPreparation(context.Background(), batch.ID, "实时校验后没有可发布任务")
		return
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

// decodePublishBatchRequest 校验批量发布请求。
func decodePublishBatchRequest(responseWriter http.ResponseWriter, request *http.Request) (types.CreatePublishBatchRequest, bool) {
	var requestBody types.CreatePublishBatchRequest
	if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
		writeError(responseWriter, http.StatusBadRequest, "批量发布参数格式错误")
		return requestBody, false
	}
	requestBody.BrandStoreID = strings.TrimSpace(requestBody.BrandStoreID)
	requestBody.CategoryIDs = uniqueStrings(requestBody.CategoryIDs)
	requestBody.CategoryNames = uniqueStrings(requestBody.CategoryNames)
	if requestBody.BrandStoreID == "" {
		writeError(responseWriter, http.StatusBadRequest, "请选择具体品牌")
		return requestBody, false
	}
	if requestBody.Limit == 0 {
		requestBody.Limit = 20
	}
	if requestBody.Limit < 1 || requestBody.Limit > maxBatchPublishCount {
		writeError(responseWriter, http.StatusBadRequest, "单次发布数量必须在 1 到 500 之间")
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
func buildPublishBatchPlan(ctx context.Context, serviceContext *svc.ServiceContext, brandStoreID string, categoryIDs, categoryNames []string) (publishBatchPlan, error) {
	brandStore, err := serviceContext.CatalogService.GetBrandStore(ctx, brandStoreID)
	if err != nil {
		return publishBatchPlan{}, err
	}
	categoryFilter := strings.Join(categoryIDs, ",")
	result, err := serviceContext.CatalogService.ListOffers(ctx, brandStore.RegionID, brandStoreID, categoryFilter, "", 1, 60, false, "")
	if err != nil {
		return publishBatchPlan{}, err
	}
	products := append([]map[string]any{}, result.List...)
	for page := 2; len(products) < int(result.Total); page++ {
		pageResult, pageErr := serviceContext.CatalogService.ListOffers(ctx, brandStore.RegionID, brandStoreID, categoryFilter, "", page, 60, false, "")
		if pageErr != nil {
			return publishBatchPlan{}, pageErr
		}
		products = append(products, pageResult.List...)
		if len(pageResult.List) == 0 {
			break
		}
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
	for _, listing := range listings {
		listedItemNos[strings.ToUpper(strings.TrimSpace(listing.ItemNo))] = struct{}{}
	}
	plan := publishBatchPlan{BrandStoreID: brandStore.ID, BrandName: brandStore.BrandName, RegionID: brandStore.RegionID, CategoryIDs: categoryIDs, CategoryNames: categoryNames, Total: len(products), Candidates: []map[string]any{}, Skipped: []model.PublishBatchSkip{}}
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
		} else if _, exists := listedItemNos[itemNo]; exists {
			reason = "闲鱼已在售"
		} else if _, exists := existingTaskNos[itemNo]; exists {
			reason = "已有进行中的发布任务"
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
	descriptionLines := []string{
		"全新 " + title,
		"货号：" + itemNo,
	}
	if len(sizes) > 0 {
		descriptionLines = append(descriptionLines, "有货尺码/型号："+strings.Join(sizes, "、"))
	}
	descriptionLines = append(descriptionLines,
		"发货地区："+publishRegionName(plan.RegionID),
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
	description := strings.Join(descriptionLines, "\n")
	priceCents := batchPriceCents(productNumber(product, "activity_price"), productNumber(product, "price"))
	lowerTitle := strings.ToLower(title)
	isFootwear := strings.Contains(title, "鞋") || strings.Contains(title, "靴") || strings.Contains(lowerTitle, "sneaker") || strings.Contains(lowerTitle, "loafer") || strings.Contains(lowerTitle, "boot")
	availableSizes := []string{}
	if isFootwear {
		availableSizes = sizes
	}
	minDelaySeconds := plan.MinDelaySeconds
	maxDelaySeconds := plan.MaxDelaySeconds
	if minDelaySeconds == 0 {
		minDelaySeconds = defaultMinPublishDelaySeconds
	}
	if maxDelaySeconds == 0 {
		maxDelaySeconds = defaultMaxPublishDelaySeconds
	}
	return model.PublishTask{ID: primitive.NewObjectID().Hex(), BatchID: batchID, SourceItemID: firstProductString(product, "default_item_id", "item_id", "goods_id"), ItemNo: itemNo, Title: truncateText("【全新】"+title, 120), Description: truncateText(description, 1500), PriceCents: priceCents, OriginalPriceCents: productNumber(product, "market_price"), ImageURLs: images, RegionID: plan.RegionID, Brand: brandName, Condition: "全新", AvailableSizes: availableSizes, IsFootwear: isFootwear, MinDelaySeconds: minDelaySeconds, MaxDelaySeconds: maxDelaySeconds, Status: model.PublishTaskQueued, CreatedAt: createdAt, UpdatedAt: createdAt}, nil
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
	response := types.PublishBatchResponse{ID: batch.ID, BrandName: batch.BrandName, CategoryIDs: batch.CategoryIDs, CategoryNames: batch.CategoryNames, Status: batch.Status, ErrorMessage: batch.ErrorMessage, Limit: batch.Limit, MinDelaySeconds: minDelaySeconds, MaxDelaySeconds: maxDelaySeconds, Total: len(tasks) + len(batch.Skipped), Skipped: publishBatchSkipResponses(batch.Skipped), Tasks: []types.PublishTaskResponse{}, CreatedAt: batch.CreatedAt.Format(time.RFC3339)}
	allFinished := len(tasks) > 0
	for _, task := range tasks {
		response.Tasks = append(response.Tasks, publishTaskToResponse(task))
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
			response.NeedsLogin++
		case model.PublishTaskFailed:
			response.Failed++
		}
	}
	if allFinished {
		response.Status = model.PublishBatchCompleted
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

func productString(product map[string]any, key string) string {
	value, exists := product[key]
	if !exists || value == nil {
		return ""
	}
	return strings.TrimSpace(fmt.Sprint(value))
}
func firstProductString(product map[string]any, keys ...string) string {
	for _, key := range keys {
		if value := productString(product, key); value != "" && value != "<nil>" {
			return value
		}
	}
	return ""
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
