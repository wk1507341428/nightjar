// Package pricecompare 提供可扩展的多平台商品比价能力。
package pricecompare

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"sidejob-server/internal/pinduoduo"
	"sidejob-server/internal/types"
	"sidejob-server/internal/xianyu"
)

const (
	// xianyuPlatform 是闲鱼平台标识。
	xianyuPlatform = "xianyu"
	// pinduoduoPlatform 是拼多多平台标识。
	pinduoduoPlatform = "pinduoduo"
	// defaultResultLimit 是每个平台默认返回的候选数。
	defaultResultLimit = 10
	// maximumResultLimit 限制单平台返回数量，控制页面与上游请求成本。
	maximumResultLimit = 10
)

// Service 编排各平台适配器；新增渠道时只需增加对应 Adapter。
type Service struct {
	adapters map[string]Adapter
}

// Adapter 定义一个第三方比价渠道的统一边界。
type Adapter interface {
	Platform() string
	Compare(context.Context, types.PriceComparisonProduct, types.PriceComparisonFilters) (types.PriceComparisonPlatformResult, error)
}

// NewService 创建当前可用的比价适配器集合。
func NewService(xianyuService *xianyu.Service, pinduoduoService *pinduoduo.Service) *Service {
	xianyuAdapter := NewXianyuAdapter(xianyuService)
	pinduoduoAdapter := NewPinduoduoAdapter(pinduoduoService)
	return &Service{
		adapters: map[string]Adapter{
			xianyuAdapter.Platform():    xianyuAdapter,
			pinduoduoAdapter.Platform(): pinduoduoAdapter,
		},
	}
}

// Compare 执行指定平台的同款商品搜索，并统一返回结构。
func (service *Service) Compare(
	ctx context.Context,
	request types.CreatePriceComparisonRequest,
) (types.PriceComparisonResponse, error) {
	// 规范化后的平台清单。
	platforms := normalizePlatforms(request.Platforms)
	if len(platforms) == 0 {
		platforms = []string{xianyuPlatform, pinduoduoPlatform}
	}
	// 限制每个平台返回十条，保证各平台展示一致。
	request.Filters.MaxResultsPerPlatform = normalizeResultLimit(request.Filters.MaxResultsPerPlatform)
	if len(request.Filters.Condition) == 0 {
		request.Filters.Condition = []string{"new"}
	}
	if request.Filters.Shipping == "" {
		request.Filters.Shipping = "free"
	}

	results := make([]types.PriceComparisonPlatformResult, len(platforms))
	var comparisonGroup sync.WaitGroup
	for platformIndex, platform := range platforms {
		adapter := service.adapters[platform]
		if adapter == nil {
			results[platformIndex] = types.PriceComparisonPlatformResult{
				Platform:   platform,
				Status:     "not_configured",
				Message:    "该平台适配器尚未接入",
				Candidates: []types.PriceComparisonCandidate{},
			}
			continue
		}
		comparisonGroup.Add(1)
		go func(resultIndex int, platformName string, platformAdapter Adapter) {
			defer comparisonGroup.Done()
			result, err := platformAdapter.Compare(ctx, request.Product, request.Filters)
			if err != nil {
				results[resultIndex] = types.PriceComparisonPlatformResult{
					Platform:   platformName,
					Status:     "failed",
					Message:    err.Error(),
					Candidates: []types.PriceComparisonCandidate{},
				}
				return
			}
			results[resultIndex] = result
		}(platformIndex, platform, adapter)
	}
	comparisonGroup.Wait()

	return types.PriceComparisonResponse{
		ID:              uuid.NewString(),
		Status:          comparisonStatus(results),
		Product:         request.Product,
		PlatformResults: results,
		CreatedAt:       time.Now().Format(time.RFC3339),
	}, nil
}

// PinduoduoAdapter 将拼多多搜索结果映射为统一候选结构。
type PinduoduoAdapter struct {
	pinduoduoService *pinduoduo.Service
}

// NewPinduoduoAdapter 创建拼多多比价适配器。
func NewPinduoduoAdapter(pinduoduoService *pinduoduo.Service) *PinduoduoAdapter {
	return &PinduoduoAdapter{pinduoduoService: pinduoduoService}
}

// Platform 返回拼多多平台标识。
func (adapter *PinduoduoAdapter) Platform() string {
	return pinduoduoPlatform
}

// Compare 搜索拼多多并转换为统一候选结构。
func (adapter *PinduoduoAdapter) Compare(
	ctx context.Context,
	product types.PriceComparisonProduct,
	filters types.PriceComparisonFilters,
) (types.PriceComparisonPlatformResult, error) {
	keyword := strings.TrimSpace(product.ItemNo)
	if keyword == "" {
		keyword = strings.TrimSpace(product.Name)
	}
	if keyword == "" {
		return types.PriceComparisonPlatformResult{}, fmt.Errorf("拼多多比价缺少商品关键词")
	}
	remoteItems, err := adapter.pinduoduoService.SearchItems(ctx, pinduoduo.SearchInput{
		Keyword: keyword,
		Page:    1,
		Size:    20,
	})
	if err != nil {
		return types.PriceComparisonPlatformResult{}, err
	}
	candidates := make([]types.PriceComparisonCandidate, 0, len(remoteItems))
	for _, remoteItem := range remoteItems {
		candidates = append(candidates, types.PriceComparisonCandidate{
			Platform:       pinduoduoPlatform,
			PlatformItemID: remoteItem.ChanceID,
			Title:          remoteItem.Title,
			PriceCents:     remoteItem.PriceCents,
			ImageURL:       remoteItem.ImageURL,
			ItemURL:        remoteItem.ItemURL,
			MatchScore:     scoreCandidate(product, remoteItem.Title),
			MatchReason:    matchReason(product, remoteItem.Title),
			Attributes:     map[string]string{"hotIndex": remoteItem.HotIndex, "priceType": "商家后台参考价"},
		})
	}
	sort.SliceStable(candidates, func(leftIndex, rightIndex int) bool {
		return candidates[leftIndex].MatchScore > candidates[rightIndex].MatchScore
	})
	if len(candidates) > filters.MaxResultsPerPlatform {
		candidates = candidates[:filters.MaxResultsPerPlatform]
	}
	return types.PriceComparisonPlatformResult{
		Platform:   pinduoduoPlatform,
		Status:     "completed",
		Candidates: candidates,
	}, nil
}

// normalizePlatforms 过滤空值并去重，保持客户端指定的平台顺序。
func normalizePlatforms(platforms []string) []string {
	seen := make(map[string]struct{}, len(platforms))
	result := make([]string, 0, len(platforms))
	for _, platform := range platforms {
		normalizedPlatform := strings.ToLower(strings.TrimSpace(platform))
		if normalizedPlatform == "" {
			continue
		}
		if _, exists := seen[normalizedPlatform]; exists {
			continue
		}
		seen[normalizedPlatform] = struct{}{}
		result = append(result, normalizedPlatform)
	}
	return result
}

// normalizeResultLimit 保证每个平台最多展示十个候选。
func normalizeResultLimit(resultLimit int) int {
	if resultLimit <= 0 {
		return defaultResultLimit
	}
	if resultLimit > maximumResultLimit {
		return maximumResultLimit
	}
	return resultLimit
}

// comparisonStatus 汇总所有平台请求的最终状态。
func comparisonStatus(results []types.PriceComparisonPlatformResult) string {
	for _, result := range results {
		if result.Status == "completed" {
			return "completed"
		}
	}
	return "failed"
}

// XianyuAdapter 将闲鱼搜索结果映射为统一候选结构。
type XianyuAdapter struct {
	xianyuService *xianyu.Service
}

// NewXianyuAdapter 创建闲鱼比价适配器。
func NewXianyuAdapter(xianyuService *xianyu.Service) *XianyuAdapter {
	return &XianyuAdapter{xianyuService: xianyuService}
}

// Platform 返回适配器的平台标识。
func (adapter *XianyuAdapter) Platform() string {
	return xianyuPlatform
}

// Compare 搜索闲鱼，并将全新、包邮作为远端检索偏好传入。
func (adapter *XianyuAdapter) Compare(
	ctx context.Context,
	product types.PriceComparisonProduct,
	filters types.PriceComparisonFilters,
) (types.PriceComparisonPlatformResult, error) {
	// 优先用货号检索，商品名称作为兜底关键词。
	keyword := strings.TrimSpace(product.ItemNo)
	if keyword == "" {
		keyword = strings.TrimSpace(product.Name)
	}
	if keyword == "" {
		return types.PriceComparisonPlatformResult{}, fmt.Errorf("闲鱼比价缺少商品关键词")
	}

	remoteItems, err := adapter.xianyuService.SearchItems(ctx, xianyu.SearchInput{
		Keyword:     keyword,
		RowsPerPage: 20,
		Condition:   filters.Condition,
		Shipping:    filters.Shipping,
	})
	if err != nil {
		return types.PriceComparisonPlatformResult{}, err
	}

	candidates := make([]types.PriceComparisonCandidate, 0, len(remoteItems))
	for _, remoteItem := range remoteItems {
		candidates = append(candidates, types.PriceComparisonCandidate{
			Platform:           xianyuPlatform,
			PlatformItemID:     remoteItem.ItemID,
			Title:              remoteItem.Title,
			PriceCents:         remoteItem.PriceCents,
			OriginalPriceCents: remoteItem.OriginalPriceCents,
			ImageURL:           remoteItem.ImageURL,
			ItemURL:            remoteItem.ItemURL,
			MatchScore:         scoreCandidate(product, remoteItem.Title),
			MatchReason:        matchReason(product, remoteItem.Title),
			Attributes:         remoteItem.Attributes,
		})
	}
	sort.SliceStable(candidates, func(leftIndex, rightIndex int) bool {
		return candidates[leftIndex].MatchScore > candidates[rightIndex].MatchScore
	})
	if len(candidates) > filters.MaxResultsPerPlatform {
		candidates = candidates[:filters.MaxResultsPerPlatform]
	}
	return types.PriceComparisonPlatformResult{
		Platform:   xianyuPlatform,
		Status:     "completed",
		Candidates: candidates,
	}, nil
}

// scoreCandidate 按货号、品牌和名称命中度给候选结果排序。
func scoreCandidate(product types.PriceComparisonProduct, title string) int {
	normalizedTitle := strings.ToUpper(strings.TrimSpace(title))
	normalizedItemNo := strings.ToUpper(strings.TrimSpace(product.ItemNo))
	if normalizedItemNo != "" && strings.Contains(normalizedTitle, normalizedItemNo) {
		return 100
	}
	normalizedBrand := strings.ToUpper(strings.TrimSpace(product.Brand))
	if normalizedBrand != "" && strings.Contains(normalizedTitle, normalizedBrand) {
		return 70
	}
	return 40
}

// matchReason 生成便于判断的候选匹配说明。
func matchReason(product types.PriceComparisonProduct, title string) string {
	normalizedTitle := strings.ToUpper(strings.TrimSpace(title))
	normalizedItemNo := strings.ToUpper(strings.TrimSpace(product.ItemNo))
	if normalizedItemNo != "" && strings.Contains(normalizedTitle, normalizedItemNo) {
		return "货号匹配"
	}
	normalizedBrand := strings.ToUpper(strings.TrimSpace(product.Brand))
	if normalizedBrand != "" && strings.Contains(normalizedTitle, normalizedBrand) {
		return "品牌匹配"
	}
	return "关键词匹配"
}
