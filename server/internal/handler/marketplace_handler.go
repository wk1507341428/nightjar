package handler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// listMarketplaceListingsHandler 返回第三方渠道当前在售商品。
func listMarketplaceListingsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		// 请求渠道。
		platform := strings.ToLower(strings.TrimSpace(request.URL.Query().Get("platform")))
		if platform == "" {
			platform = "all"
		}

		listings, err := serviceContext.ListingRepository.List(request.Context(), platform, 1000)
		if err != nil {
			logx.Errorf("list marketplace listings: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取渠道在售商品失败")
			return
		}

		responses := make([]types.MarketplaceListingResponse, 0, len(listings))
		for _, listing := range listings {
			responses = append(responses, marketplaceListingToResponse(listing))
		}

		lastSyncedAt := ""
		if platform != "all" {
			latestSyncTime, syncTimeErr := serviceContext.ListingRepository.LatestSyncTime(request.Context(), platform)
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

		// 手动同步最多等待 90 秒，避免请求无限占用连接。
		syncContext, cancel := context.WithTimeout(request.Context(), 90*time.Second)
		defer cancel()
		syncedCount, err := serviceContext.MarketplaceService.SyncXianyu(syncContext)
		if err != nil {
			logx.Errorf("sync xianyu listings: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "同步闲鱼在售状态失败，请检查登录状态后重试")
			return
		}

		lastSyncedAt, syncTimeErr := serviceContext.ListingRepository.LatestSyncTime(request.Context(), platform)
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
func marketplaceListingToResponse(listing model.MarketplaceListing) types.MarketplaceListingResponse {
	return types.MarketplaceListingResponse{
		ID:             listing.ID,
		Platform:       listing.Platform,
		PlatformItemID: listing.PlatformItemID,
		SourceItemID:   listing.SourceItemID,
		ItemNo:         listing.ItemNo,
		Title:          listing.Title,
		PriceCents:     listing.PriceCents,
		ImageURL:       listing.ImageURL,
		ItemURL:        listing.ItemURL,
		ListedAt:       listing.ListedAt.Format(time.RFC3339),
		LastSyncedAt:   listing.LastSyncedAt.Format(time.RFC3339),
	}
}
