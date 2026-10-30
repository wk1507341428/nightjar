package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

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
		rows, err := sourceBrandStores(serviceContext, request)
		if err != nil {
			writeError(responseWriter, 500, "读取本地品牌配置失败")
			return
		}
		writeJSON(responseWriter, 200, rows)
	}
}

// listCatalogBrandCategoriesHandler 返回一家本地品牌门店的小程序品类。
func listCatalogBrandCategoriesHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		query := request.URL.Query()
		query.Set("brandStoreId", catalogRouteID(request, "/api/catalog/brand-stores/", "/categories"))
		request.URL.RawQuery = query.Encode()
		params, err := sourceSearchQuery(serviceContext, request)
		if err != nil {
			writeError(responseWriter, 409, err.Error())
			return
		}
		categories, err := serviceContext.SyncCenter.ReadCategories(request.Context(), params.ProfileID, params.RegionID, params.DistributorID)
		if err != nil {
			writeError(responseWriter, 409, err.Error())
			return
		}
		writeJSON(responseWriter, 200, categories)
	}
}

// listCatalogOffersHandler 查询本地商品库。
func listCatalogOffersHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		query, err := sourceSearchQuery(serviceContext, request)
		if err != nil {
			writeError(responseWriter, 400, err.Error())
			return
		}
		result, err := serviceContext.SyncCenter.SearchProducts(request.Context(), query)
		if err != nil {
			writeError(responseWriter, 500, "读取同步商品库失败")
			return
		}
		products := make([]map[string]any, 0, len(result.List))
		for _, product := range result.List {
			products = append(products, syncedProductMap(product))
		}
		writeJSON(responseWriter, 200, types.CatalogOfferListResponse{List: products, Total: result.Total})
	}
}

// getCatalogOfferHandler 返回本地商品详情。
func getCatalogOfferHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		product, err := serviceContext.SyncCenter.FindProduct(request.Context(), request.URL.Query().Get("regionId"), catalogRouteID(request, "/api/catalog/offers/", ""))
		if err != nil {
			writeError(responseWriter, 404, err.Error())
			return
		}
		writeJSON(responseWriter, 200, product)
	}
}

// getCatalogOfferPriceHistoryHandler 返回一件商品的 SKU 价格走势。
func getCatalogOfferPriceHistoryHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		product, snapshots, err := serviceContext.SyncCenter.ProductHistory(request.Context(), catalogRouteID(request, "/api/catalog/offers/", "/price-history"))
		if err != nil {
			writeError(responseWriter, 404, "同步商品价格历史不存在")
			return
		}
		responses := make([]types.CatalogSKUPriceSnapshotResponse, 0, len(snapshots))
		for _, snapshot := range snapshots {
			sourcePrice := productNumber(snapshot.Raw, "price")
			if sourcePrice == 0 {
				sourcePrice = snapshot.PriceCents
			}
			responses = append(responses, types.CatalogSKUPriceSnapshotResponse{ID: snapshot.ID, SKUID: snapshot.SourceSKUID, SKUCode: snapshot.SKUCode, VariantLabel: snapshot.Label, PriceCents: snapshot.PriceCents, SourcePriceCents: sourcePrice, ActivityPriceCents: snapshot.ActivityPriceCents, MarketPriceCents: snapshot.MarketCents, Stock: snapshot.Stock, ObservedAt: snapshot.SyncedAt.Format(time.RFC3339)})
		}
		writeJSON(responseWriter, 200, types.CatalogOfferPriceHistoryResponse{OfferID: product.ID, ItemNo: product.ItemNo, Name: product.Name, BrandName: productString(product.Data, "goods_brand"), RegionID: product.RegionID, ImageURL: productString(product.Data, "main_img"), LastSyncedAt: product.SyncedAt.Format(time.RFC3339), Snapshots: responses})
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
