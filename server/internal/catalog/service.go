// Package catalog 负责读取奥莱商品和营销活动的只读数据。
package catalog

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"sidejob-server/internal/config"
	"sidejob-server/internal/repository"
)

// allRegionIDs 是平台支持的实际仓库地区。
var allRegionIDs = []string{"2", "3", "4", "5", "6", "7"}

// Service 提供活动商品查询能力。
type Service struct {
	config              config.CatalogConfig
	httpClient          *http.Client
	inventoryRepository *InventoryRepository
	listingRepository   *repository.MarketplaceListingRepository
}

// SeckillActivity 是前端展示所需的秒杀场次信息。
type SeckillActivity struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Status         string `json:"status"`
	StartTime      int64  `json:"startTime"`
	EndTime        int64  `json:"endTime"`
	RegionID       string `json:"regionId"`
	PageTemplateID string `json:"-"`
}

// SeckillProductsResult 是聚合后的秒杀专区数据。
type SeckillProductsResult struct {
	RegionID   string            `json:"regionId"`
	Activities []SeckillActivity `json:"activities"`
	List       []map[string]any  `json:"list"`
	Total      int64             `json:"total"`
}

// seckillCustomPageID 是小程序“限时秒杀 天天享补贴”页面配置 ID。
const seckillCustomPageID = "156"

// customPageResponse 是小程序自定义页配置接口响应。
type customPageResponse struct {
	Data struct {
		Config []any `json:"config"`
	} `json:"data"`
}

// promotionCollection 是自定义页面配置中的秒杀商品合集。
type promotionCollection struct {
	ID             string
	Name           string
	RegionID       string
	PageTemplateID string
}

// activityItemsResponse 是秒杀商品接口响应。
type activityItemsResponse struct {
	Data struct {
		StartTime int64 `json:"start_time"`
		EndTime   int64 `json:"end_time"`
		Items     struct {
			List       []map[string]any `json:"list"`
			TotalCount int64            `json:"total_count"`
		} `json:"items"`
	} `json:"data"`
}

// regionSeckillResult 是单个地区的内部查询结果。
type regionSeckillResult struct {
	Activities []SeckillActivity
	List       []map[string]any
	Total      int64
}

// NewService 创建秒杀数据服务。
func NewService(serviceConfig config.CatalogConfig, inventoryRepository *InventoryRepository, listingRepository *repository.MarketplaceListingRepository) *Service {
	// 外部接口超时时间。
	timeoutSeconds := serviceConfig.RequestTimeout
	if timeoutSeconds <= 0 {
		timeoutSeconds = 15
	}

	return &Service{
		config:              serviceConfig,
		inventoryRepository: inventoryRepository,
		listingRepository:   listingRepository,
		httpClient: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}
}

// ListSeckillProducts 返回指定地区当前或即将开始的秒杀商品。
func (service *Service) ListSeckillProducts(
	requestContext context.Context,
	regionID string,
	page int,
	pageSize int,
) (SeckillProductsResult, error) {
	// 规范化后的地区 ID。
	normalizedRegionID := strings.TrimSpace(regionID)
	if normalizedRegionID == "" {
		normalizedRegionID = "3"
	}
	// 安全的页码。
	if page < 1 {
		page = 1
	}
	// 安全的单页数量。
	if pageSize < 1 {
		pageSize = 24
	}
	if pageSize > 60 {
		pageSize = 60
	}

	// 需要聚合的仓库地区。
	regionIDs := []string{normalizedRegionID}
	if normalizedRegionID == "all" {
		regionIDs = allRegionIDs
	}

	// 各仓库查询结果。
	regionResults := make([]regionSeckillResult, len(regionIDs))
	// 各仓库查询错误。
	regionErrors := make([]error, len(regionIDs))
	// 并发等待器。
	var waitGroup sync.WaitGroup

	for regionIndex, currentRegionID := range regionIDs {
		waitGroup.Add(1)
		go func(resultIndex int, targetRegionID string) {
			defer waitGroup.Done()
			regionResults[resultIndex], regionErrors[resultIndex] = service.listRegionSeckillProducts(
				requestContext,
				targetRegionID,
				page,
				pageSize,
			)
		}(regionIndex, currentRegionID)
	}
	waitGroup.Wait()

	// 聚合场次。
	activities := make([]SeckillActivity, 0)
	// 聚合商品。
	products := make([]map[string]any, 0, pageSize)
	// 聚合商品总数。
	var total int64
	// 首个错误，用于所有仓库请求失败时返回。
	var firstError error

	for resultIndex, result := range regionResults {
		if regionErrors[resultIndex] != nil && firstError == nil {
			firstError = regionErrors[resultIndex]
		}
		activities = append(activities, result.Activities...)
		products = append(products, result.List...)
		total += result.Total
	}

	if len(activities) == 0 && firstError != nil {
		return SeckillProductsResult{}, firstError
	}
	if len(products) > pageSize {
		products = products[:pageSize]
	}

	return SeckillProductsResult{
		RegionID:   normalizedRegionID,
		Activities: activities,
		List:       products,
		Total:      total,
	}, nil
}

// listRegionSeckillProducts 获取单个仓库的有效场次与活动商品。
func (service *Service) listRegionSeckillProducts(
	requestContext context.Context,
	regionID string,
	page int,
	pageSize int,
) (regionSeckillResult, error) {
	// 小程序秒杀页配置中的商品合集。
	collections, err := service.getPromotionCollections(requestContext, regionID)
	if err != nil {
		return regionSeckillResult{}, err
	}
	// 可展示的秒杀场次。
	activities := make([]SeckillActivity, 0, len(collections))
	for _, collection := range collections {
		activities = append(activities, SeckillActivity{
			ID:             collection.ID,
			Name:           collection.Name,
			Status:         "ongoing",
			RegionID:       collection.RegionID,
			PageTemplateID: collection.PageTemplateID,
		})
	}
	if len(activities) == 0 {
		return regionSeckillResult{}, nil
	}

	// 每个场次请求的数量，合并后保持页面数量稳定。
	itemsPerActivity := int(math.Ceil(float64(pageSize) / float64(len(activities))))
	// 场次商品列表。
	productLists := make([][]map[string]any, len(activities))
	// 场次商品总数。
	totals := make([]int64, len(activities))
	// 场次开始时间。
	startTimes := make([]int64, len(activities))
	// 场次结束时间。
	endTimes := make([]int64, len(activities))
	// 场次请求错误。
	activityErrors := make([]error, len(activities))
	// 场次并发等待器。
	var waitGroup sync.WaitGroup

	for activityIndex, activity := range activities {
		waitGroup.Add(1)
		go func(resultIndex int, targetActivity SeckillActivity) {
			defer waitGroup.Done()
			productLists[resultIndex], totals[resultIndex], startTimes[resultIndex], endTimes[resultIndex], activityErrors[resultIndex] = service.listActivityItems(
				requestContext,
				targetActivity,
				page,
				itemsPerActivity,
			)
		}(activityIndex, activity)
	}
	waitGroup.Wait()

	// 聚合场次商品。
	products := make([]map[string]any, 0, pageSize)
	// 聚合商品总数。
	var total int64
	// 首个活动请求错误。
	var firstError error

	for activityIndex := range activities {
		if activityErrors[activityIndex] != nil && firstError == nil {
			firstError = activityErrors[activityIndex]
		}
		products = append(products, productLists[activityIndex]...)
		total += totals[activityIndex]
		activities[activityIndex].StartTime = startTimes[activityIndex]
		activities[activityIndex].EndTime = endTimes[activityIndex]
	}

	if len(products) == 0 && firstError != nil {
		return regionSeckillResult{}, firstError
	}

	return regionSeckillResult{Activities: activities, List: products, Total: total}, nil
}

// listActivityItems 获取一个秒杀场次的商品并附加活动上下文。
func (service *Service) listActivityItems(
	requestContext context.Context,
	activity SeckillActivity,
	page int,
	pageSize int,
) ([]map[string]any, int64, int64, int64, error) {
	// 活动商品响应。
	var itemsResponse activityItemsResponse
	if err := service.getJSON(requestContext, "/promotion/collection/get_activity_items", url.Values{
		"collection_id":     {activity.ID},
		"pages_template_id": {activity.PageTemplateID},
		"regionauth_id":     {activity.RegionID},
	}, &itemsResponse); err != nil {
		return nil, 0, 0, 0, err
	}
	// 当前页商品起始位置。
	startIndex := (page - 1) * pageSize
	// 当前页商品结束位置。
	endIndex := startIndex + pageSize
	// 活动全部商品。
	activityProducts := itemsResponse.Data.Items.List
	if startIndex >= len(activityProducts) {
		return nil, itemsResponse.Data.Items.TotalCount, itemsResponse.Data.StartTime, itemsResponse.Data.EndTime, nil
	}
	if endIndex > len(activityProducts) {
		endIndex = len(activityProducts)
	}
	activityProducts = activityProducts[startIndex:endIndex]

	for _, product := range activityProducts {
		if _, exists := product["regionauth_id"]; !exists {
			product["regionauth_id"] = activity.RegionID
		}
		product["activity_type"] = "limited_time_sale"
		product["promotion_end_time"] = itemsResponse.Data.EndTime
		product["seckill_collection_id"] = activity.ID
	}

	return activityProducts, itemsResponse.Data.Items.TotalCount, itemsResponse.Data.StartTime, itemsResponse.Data.EndTime, nil
}

// getPromotionCollections 从小程序秒杀自定义页中提取商品合集配置。
func (service *Service) getPromotionCollections(requestContext context.Context, regionID string) ([]promotionCollection, error) {
	// 小程序秒杀页配置响应。
	var pageResponse customPageResponse
	if err := service.getJSON(requestContext, "/pageparams/setting", url.Values{
		"template_name":  {"yykweishop"},
		"version":        {"v1.0.1"},
		"page_name":      {"custom_" + seckillCustomPageID},
		"distributor_id": {"0"},
		"regionauth_id":  {regionID},
	}, &pageResponse); err != nil {
		return nil, err
	}

	// 去重后的秒杀合集。
	collections := make([]promotionCollection, 0)
	// 已发现合集 ID。
	seenCollectionIDs := make(map[string]struct{})
	for _, configItem := range pageResponse.Data.Config {
		collectPromotionCollections(configItem, regionID, &collections, seenCollectionIDs)
	}

	return collections, nil
}

// collectPromotionCollections 递归解析自定义页嵌套组件中的 promotion 筛选条件。
func collectPromotionCollections(
	value any,
	regionID string,
	collections *[]promotionCollection,
	seenCollectionIDs map[string]struct{},
) {
	switch currentValue := value.(type) {
	case []any:
		for _, childValue := range currentValue {
			collectPromotionCollections(childValue, regionID, collections, seenCollectionIDs)
		}
	case map[string]any:
		filters, hasFilters := currentValue["filters"].([]any)
		if hasFilters {
			title := readNestedString(currentValue, "titleText", "text")
			for _, rawFilter := range filters {
				filter, isFilter := rawFilter.(map[string]any)
				if !isFilter || readString(filter["dataType"]) != "promotion" {
					continue
				}
				filterData, isFilterData := filter["data"].(map[string]any)
				if !isFilterData {
					continue
				}
				collectionID := readString(filterData["id"])
				if collectionID == "" {
					continue
				}
				if _, exists := seenCollectionIDs[collectionID]; exists {
					continue
				}
				seenCollectionIDs[collectionID] = struct{}{}
				collectionRegionID := readNestedString(filterData, "info", "regionauth_id")
				if collectionRegionID == "" {
					collectionRegionID = regionID
				}
				collectionName := title
				if collectionName == "" {
					collectionName = readNestedString(filterData, "info", "name")
				}
				*collections = append(*collections, promotionCollection{
					ID:             collectionID,
					Name:           collectionName,
					RegionID:       collectionRegionID,
					PageTemplateID: seckillCustomPageID,
				})
			}
		}

		for _, childValue := range currentValue {
			collectPromotionCollections(childValue, regionID, collections, seenCollectionIDs)
		}
	}
}

// readNestedString 读取嵌套对象中的字符串字段。
func readNestedString(source map[string]any, parentKey string, childKey string) string {
	parent, exists := source[parentKey].(map[string]any)
	if !exists {
		return ""
	}
	return readString(parent[childKey])
}

// readString 安全读取接口中的字符串或数字字段。
func readString(value any) string {
	switch typedValue := value.(type) {
	case string:
		return strings.TrimSpace(typedValue)
	case float64:
		return strconv.FormatInt(int64(typedValue), 10)
	default:
		return ""
	}
}

// getJSON 调用奥莱只读接口并解码响应。
func (service *Service) getJSON(
	requestContext context.Context,
	path string,
	query url.Values,
	target any,
) error {
	// 请求地址。
	requestURL, err := url.Parse(strings.TrimRight(service.config.APIBase, "/") + path)
	if err != nil {
		return fmt.Errorf("parse catalog URL: %w", err)
	}
	query.Set("company_id", service.config.CompanyID)
	requestURL.RawQuery = query.Encode()

	request, err := http.NewRequestWithContext(requestContext, http.MethodGet, requestURL.String(), nil)
	if err != nil {
		return fmt.Errorf("create catalog request: %w", err)
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("authorizer-appid", service.config.AuthorizerAppID)

	response, err := service.httpClient.Do(request)
	if err != nil {
		return fmt.Errorf("request catalog API: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("catalog API returned HTTP %d", response.StatusCode)
	}
	if err := json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode catalog response: %w", err)
	}

	return nil
}
