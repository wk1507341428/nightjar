package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// parsePositiveInt 将查询参数解析为正整数。
func parsePositiveInt(rawValue string, fallback int) int {
	parsedValue, err := strconv.Atoi(rawValue)
	if err != nil || parsedValue < 1 {
		return fallback
	}
	return parsedValue
}

// listCatalogBrandStoresHandler 返回发布中心已采集的品牌门店。
func listCatalogBrandStoresHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		brandStores, err := serviceContext.CatalogService.ListBrandStores(request.Context(), strings.TrimSpace(request.URL.Query().Get("regionId")))
		if err != nil {
			logx.Errorf("list catalog brand stores: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取品牌门店失败")
			return
		}
		response := make([]types.CatalogBrandStoreResponse, 0, len(brandStores))
		for _, brandStore := range brandStores {
			response = append(response, brandStoreResponse(brandStore))
		}
		writeJSON(responseWriter, http.StatusOK, response)
	}
}

// listCatalogBrandCategoriesHandler 返回一家本地品牌门店的小程序品类。
func listCatalogBrandCategoriesHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		categories, err := serviceContext.CatalogService.ListBrandCategories(request.Context(), catalogRouteID(request, "/api/catalog/brand-stores/", "/categories"))
		if err != nil {
			logx.Errorf("list catalog brand categories: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "品牌品类暂时无法读取")
			return
		}
		writeJSON(responseWriter, http.StatusOK, categories)
	}
}

// listCatalogOffersHandler 查询本地商品库。
func listCatalogOffersHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		query := request.URL.Query()
		result, err := serviceContext.CatalogService.ListOffers(request.Context(), strings.TrimSpace(query.Get("accountId")), strings.TrimSpace(query.Get("regionId")), strings.TrimSpace(query.Get("brandStoreId")), strings.TrimSpace(query.Get("categoryId")), strings.TrimSpace(query.Get("keyword")), parsePositiveInt(query.Get("page"), 1), parsePositiveInt(query.Get("pageSize"), 24), query.Get("stockOnly") != "false", strings.TrimSpace(query.Get("sort")))
		if err != nil {
			logx.Errorf("list catalog offers: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取本地商品库失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.CatalogOfferListResponse{List: result.List, Total: result.Total})
	}
}

// getCatalogOfferHandler 返回本地商品详情。
func getCatalogOfferHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		product, err := serviceContext.CatalogService.GetOffer(request.Context(), catalogRouteID(request, "/api/catalog/offers/", ""))
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "本地商品不存在")
			return
		}
		writeJSON(responseWriter, http.StatusOK, product)
	}
}

// getCatalogOfferPriceHistoryHandler 返回一件商品的 SKU 价格走势。
func getCatalogOfferPriceHistoryHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		offer, snapshots, err := serviceContext.CatalogService.GetOfferPriceHistory(request.Context(), catalogRouteID(request, "/api/catalog/offers/", "/price-history"))
		if err != nil {
			logx.Errorf("get catalog offer price history: %v", err)
			writeError(responseWriter, http.StatusNotFound, "商品价格历史不存在")
			return
		}
		responses := make([]types.CatalogSKUPriceSnapshotResponse, 0, len(snapshots))
		for _, snapshot := range snapshots {
			responses = append(responses, types.CatalogSKUPriceSnapshotResponse{ID: snapshot.ID, SKUID: snapshot.SKUID, SKUCode: snapshot.SKUCode, VariantLabel: snapshot.VariantLabel, PriceCents: snapshot.PriceCents, SourcePriceCents: snapshot.SourcePriceCents, ActivityPriceCents: snapshot.ActivityPriceCents, MarketPriceCents: snapshot.MarketPriceCents, Stock: snapshot.Stock, ObservedAt: snapshot.ObservedAt.Format(time.RFC3339)})
		}
		writeJSON(responseWriter, http.StatusOK, types.CatalogOfferPriceHistoryResponse{OfferID: offer.ID, ItemNo: offer.ItemNo, Name: offer.Name, BrandName: offer.BrandName, RegionID: offer.RegionID, ImageURL: strings.TrimSpace(fmt.Sprint(offer.SourceData["main_img"])), LastSyncedAt: offer.LastSyncedAt.Format(time.RFC3339), Snapshots: responses})
	}
}

func brandStoreResponse(brandStore catalog.BrandStore) types.CatalogBrandStoreResponse {
	return types.CatalogBrandStoreResponse{ID: brandStore.ID, RegionID: brandStore.RegionID, DistributorID: brandStore.DistributorID, BrandID: brandStore.BrandID, BrandName: brandStore.BrandName, ShopCode: brandStore.ShopCode, StoreName: brandStore.StoreName, SyncEnabled: brandStore.SyncEnabled, LastSyncedAt: brandStore.LastSyncedAt.Format("2006-01-02T15:04:05Z07:00")}
}

// catalogRouteID 提取 GoZero 路由末尾的资源 ID。
func catalogRouteID(request *http.Request, prefix, suffix string) string {
	resourceID := strings.TrimPrefix(request.URL.Path, prefix)
	if suffix != "" {
		resourceID = strings.TrimSuffix(resourceID, suffix)
	}
	return strings.Trim(resourceID, "/")
}
