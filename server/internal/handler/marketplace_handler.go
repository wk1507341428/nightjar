package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// offlineMarketplaceListingsHandler 下架当前闲鱼在售商品。
func offlineMarketplaceListingsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var body types.MarketplaceOfflineRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "下架请求格式不正确")
			return
		}
		if len(body.ItemIDs) == 0 {
			writeError(responseWriter, http.StatusBadRequest, "请选择至少一件闲鱼商品")
			return
		}
		if len(body.ItemIDs) > 100 {
			writeError(responseWriter, http.StatusBadRequest, "单次最多下架 100 件商品")
			return
		}
		accountID := strings.TrimSpace(request.URL.Query().Get("accountId"))
		if accountID == "" {
			accountID = model.DefaultXianyuAccountID
		}
		if !requireActiveSellerAccount(responseWriter, request, serviceContext, accountID) {
			return
		}

		result, err := serviceContext.MarketplaceService.OfflineXianyuListings(request.Context(), accountID, body.ItemIDs)
		if err != nil {
			logx.Errorf("offline xianyu listings: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "闲鱼商品下架失败："+err.Error())
			return
		}
		if result.SucceededItemIDs == nil {
			result.SucceededItemIDs = []string{}
		}
		if result.FailedItemIDs == nil {
			result.FailedItemIDs = []string{}
		}
		writeJSON(responseWriter, http.StatusOK, types.MarketplaceOfflineResponse{
			SucceededItemIDs: result.SucceededItemIDs,
			FailedItemIDs:    result.FailedItemIDs,
		})
	}
}

// listMarketplaceListingsHandler 返回第三方渠道当前在售商品。
func listMarketplaceListingsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		// 请求渠道。
		platform := strings.ToLower(strings.TrimSpace(request.URL.Query().Get("platform")))
		accountID := strings.TrimSpace(request.URL.Query().Get("accountId"))
		if accountID == "" {
			accountID = model.DefaultXianyuAccountID
		}
		if platform == "" {
			platform = "all"
		}

		itemNos := uniqueStrings(strings.Split(request.URL.Query().Get("itemNos"), ","))
		var listings []model.MarketplaceListing
		var err error
		if len(itemNos) > 0 {
			listings, err = serviceContext.ListingRepository.ListByItemNos(request.Context(), accountID, platform, itemNos)
		} else {
			listings, err = serviceContext.ListingRepository.List(request.Context(), accountID, platform, 5000)
		}
		if err != nil {
			logx.Errorf("list marketplace listings: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取渠道在售商品失败")
			return
		}

		responses := marketplaceListingResponses(request.Context(), serviceContext, listings)

		lastSyncedAt := ""
		if platform != "all" {
			latestSyncTime, syncTimeErr := serviceContext.ListingRepository.LatestSyncTime(request.Context(), accountID, platform)
			if syncTimeErr != nil {
				logx.Errorf("read marketplace sync time: %v", syncTimeErr)
			} else if !latestSyncTime.IsZero() {
				lastSyncedAt = latestSyncTime.Format(time.RFC3339)
			}
		}

		writeJSON(responseWriter, http.StatusOK, types.MarketplaceListingListResponse{
			List:         responses,
			Total:        len(responses),
			LastSyncedAt: lastSyncedAt,
		})
	}
}

// marketplaceListingResponses 为当前账号的在售快照补充本地稳定度和品牌名称。
func marketplaceListingResponses(ctx context.Context, serviceContext *svc.ServiceContext, listings []model.MarketplaceListing) []types.MarketplaceListingResponse {
	itemNosByScope := make(map[string][]string)
	for _, listing := range listings {
		scopeID := strings.TrimSpace(listing.BrandProfileID)
		itemNo := strings.ToUpper(strings.TrimSpace(listing.ItemNo))
		if scopeID == "" || itemNo == "" {
			continue
		}
		itemNosByScope[scopeID] = appendUniqueText(itemNosByScope[scopeID], itemNo)
	}
	stabilityByKey := make(map[string]catalog.ItemStability)
	stabilities, stabilityErr := serviceContext.InventoryRepository.ListItemStabilities(ctx, itemNosByScope)
	if stabilityErr != nil {
		logx.Errorf("list marketplace stability: %v", stabilityErr)
	} else {
		for _, stability := range stabilities {
			stabilityByKey[marketplaceStabilityKey(stability.ScopeID, stability.ItemNo)] = stability
		}
	}

	responses := make([]types.MarketplaceListingResponse, 0, len(listings))
	for _, listing := range listings {
		stability, hasStability := stabilityByKey[marketplaceStabilityKey(listing.BrandProfileID, listing.ItemNo)]
		responses = append(responses, marketplaceListingToResponse(listing, stability, hasStability))
	}
	var loadAvailability marketplaceAvailabilityLoader
	if serviceContext.SyncCenter != nil {
		loadAvailability = serviceContext.SyncCenter.CurrentAvailability
	}
	overlayMarketplaceAvailability(ctx, responses, loadAvailability)

	enrichMarketplaceListingBrands(ctx, serviceContext, responses)
	return responses
}

// syncMarketplaceListingsHandler 手动同步指定渠道当前在售商品。
func syncMarketplaceListingsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		// 请求渠道，当前仅支持闲鱼。
		platform := strings.ToLower(strings.TrimSpace(request.URL.Query().Get("platform")))
		if platform == "" {
			platform = "xianyu"
		}
		if platform != "xianyu" {
			writeError(responseWriter, http.StatusNotImplemented, "该渠道暂未接入同步")
			return
		}
		accountID := strings.TrimSpace(request.URL.Query().Get("accountId"))
		if accountID == "" {
			accountID = model.DefaultXianyuAccountID
		}
		if !requireActiveSellerAccount(responseWriter, request, serviceContext, accountID) {
			return
		}

		// 手动同步最多等待 90 秒，避免请求无限占用连接。
		syncContext, cancel := context.WithTimeout(request.Context(), 90*time.Second)
		defer cancel()
		syncedCount, err := serviceContext.MarketplaceService.SyncXianyu(syncContext, accountID)
		if err != nil {
			logx.Errorf("sync xianyu listings: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "同步闲鱼在售状态失败，请检查登录状态后重试")
			return
		}

		lastSyncedAt, syncTimeErr := serviceContext.ListingRepository.LatestSyncTime(request.Context(), accountID, platform)
		if syncTimeErr != nil {
			logx.Errorf("read xianyu sync time: %v", syncTimeErr)
		}
		writeJSON(responseWriter, http.StatusOK, types.MarketplaceSyncResponse{
			Platform:     platform,
			SyncedCount:  syncedCount,
			LastSyncedAt: lastSyncedAt.Format(time.RFC3339),
		})
	}
}

// marketplaceListingToResponse 转换渠道商品响应。
func marketplaceListingToResponse(listing model.MarketplaceListing, stability catalog.ItemStability, hasStability bool) types.MarketplaceListingResponse {
	response := types.MarketplaceListingResponse{
		ID:             listing.ID,
		AccountID:      listing.AccountID,
		Platform:       listing.Platform,
		PlatformItemID: listing.PlatformItemID,
		SourceItemID:   listing.SourceItemID,
		BrandProfileID: listing.BrandProfileID,
		ItemNo:         listing.ItemNo,
		Title:          listing.Title,
		PriceCents:     listing.PriceCents,
		ImageURL:       listing.ImageURL,
		ItemURL:        listing.ItemURL,
		ListedAt:       listing.ListedAt.Format(time.RFC3339),
		LastSyncedAt:   listing.LastSyncedAt.Format(time.RFC3339),
	}
	if hasStability {
		response.Stability = marketplaceListingStabilityToResponse(stability)
	}
	return response
}

// enrichMarketplaceListingBrands 只读本地品牌档案，不为展示标签请求小程序或猜测标题品牌。
func enrichMarketplaceListingBrands(ctx context.Context, serviceContext *svc.ServiceContext, responses []types.MarketplaceListingResponse) {
	if len(responses) == 0 {
		return
	}
	profiles, _, err := serviceContext.InventoryRepository.ListBrandProfiles(ctx)
	if err != nil {
		logx.Errorf("read marketplace brand names: %v", err)
		return
	}
	names := make(map[string]string, len(profiles))
	for _, profile := range profiles {
		names[profile.ID] = profile.Name
	}
	for index := range responses {
		responses[index].BrandProfileName = names[responses[index].BrandProfileID]
	}
}

// marketplaceStabilityKey 生成品牌货号稳定度的内存索引键。
func marketplaceStabilityKey(scopeID, itemNo string) string {
	return strings.TrimSpace(scopeID) + "\x00" + strings.ToUpper(strings.TrimSpace(itemNo))
}

// marketplaceListingStabilityToResponse 转换渠道商品稳定度响应。
func marketplaceListingStabilityToResponse(stability catalog.ItemStability) *types.MarketplaceListingStabilityResponse {
	response := &types.MarketplaceListingStabilityResponse{Score: stability.Score, ObservedDayCount: stability.ObservedDayCount, AvailableDayCount: stability.AvailableDayCount, UnavailableDayCount: stability.UnavailableDayCount, CurrentAvailable: stability.CurrentAvailable}
	if !stability.LastUnavailableAt.IsZero() {
		response.LastUnavailableAt = stability.LastUnavailableAt.Format(time.RFC3339)
	}
	return response
}
