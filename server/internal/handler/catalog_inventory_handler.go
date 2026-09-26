package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// discoverCatalogBrandStoresHandler 读取上游地区的可配置品牌门店。
func discoverCatalogBrandStoresHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		regionID := strings.TrimSpace(request.URL.Query().Get("regionId"))
		if regionID == "" || regionID == "all" {
			writeError(responseWriter, http.StatusBadRequest, "请选择一个仓库地区")
			return
		}
		brandStores, err := serviceContext.CatalogService.DiscoverBrandStores(request.Context(), regionID)
		if err != nil {
			logx.Errorf("discover catalog brand stores: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "品牌门店列表暂时无法读取")
			return
		}
		writeJSON(responseWriter, http.StatusOK, brandStores)
	}
}

// listCatalogBrandStoresHandler 返回本地品牌同步配置。
func listCatalogBrandStoresHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		brandStores, err := serviceContext.CatalogService.ListBrandStores(request.Context(), strings.TrimSpace(request.URL.Query().Get("regionId")))
		if err != nil {
			logx.Errorf("list catalog brand stores: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取品牌同步配置失败")
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

// saveCatalogBrandStoreHandler 保存一项品牌门店同步开关。
func saveCatalogBrandStoreHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var body types.SaveCatalogBrandStoreRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "品牌同步配置格式不正确")
			return
		}
		candidate := catalog.BrandStoreCandidate{RegionID: strings.TrimSpace(body.RegionID), DistributorID: strings.TrimSpace(body.DistributorID), BrandName: strings.TrimSpace(body.BrandName), ShopCode: strings.TrimSpace(body.ShopCode), StoreName: strings.TrimSpace(body.StoreName)}
		if candidate.RegionID == "" || candidate.DistributorID == "" || candidate.BrandName == "" {
			writeError(responseWriter, http.StatusBadRequest, "品牌门店信息不完整")
			return
		}
		brandStore, err := serviceContext.CatalogService.SaveBrandStore(request.Context(), candidate, body.SyncEnabled)
		if err != nil {
			logx.Errorf("save catalog brand store: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "保存品牌同步配置失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, brandStoreResponse(brandStore))
	}
}

// listCatalogOffersHandler 查询本地商品库。
func listCatalogOffersHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		query := request.URL.Query()
		result, err := serviceContext.CatalogService.ListOffers(request.Context(), strings.TrimSpace(query.Get("regionId")), strings.TrimSpace(query.Get("brandStoreId")), strings.TrimSpace(query.Get("categoryId")), strings.TrimSpace(query.Get("keyword")), parsePositiveInt(query.Get("page"), 1), parsePositiveInt(query.Get("pageSize"), 24), query.Get("stockOnly") != "false", strings.TrimSpace(query.Get("sort")))
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

// syncCatalogBrandStoreHandler 同步一家品牌门店的全部商品。
func syncCatalogBrandStoreHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		result, err := serviceContext.CatalogService.StartBrandStoreSync(request.Context(), catalogRouteID(request, "/api/catalog/brand-stores/", "/sync"))
		if err != nil {
			logx.Errorf("sync catalog brand store: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "品牌同步失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, syncResponse(result.Run))
	}
}

// getCatalogSyncRunHandler 返回后台同步任务状态。
func getCatalogSyncRunHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		run, err := serviceContext.CatalogService.GetSyncRun(request.Context(), catalogRouteID(request, "/api/catalog/sync-runs/", ""))
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "同步任务不存在")
			return
		}
		writeJSON(responseWriter, http.StatusOK, syncResponse(run))
	}
}

// listCatalogSyncRunsHandler 返回可回看的品牌同步历史。
func listCatalogSyncRunsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		query := request.URL.Query()
		page := parsePositiveInt(query.Get("page"), 1)
		pageSize := parsePositiveInt(query.Get("pageSize"), 20)
		if pageSize > 100 {
			pageSize = 100
		}
		runs, total, err := serviceContext.InventoryRepository.ListSyncRuns(request.Context(), strings.TrimSpace(query.Get("brandStoreId")), strings.TrimSpace(query.Get("regionId")), page, pageSize)
		if err != nil {
			logx.Errorf("list catalog sync runs: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取同步历史失败")
			return
		}
		responses := make([]types.CatalogSyncResponse, 0, len(runs))
		for _, run := range runs {
			if run.BrandName == "" && run.BrandStoreID != "" {
				if brandStore, brandStoreErr := serviceContext.CatalogService.GetBrandStore(request.Context(), run.BrandStoreID); brandStoreErr == nil {
					run.BrandName = brandStore.BrandName
					run.RegionID = brandStore.RegionID
				}
			}
			responses = append(responses, syncResponse(run))
		}
		writeJSON(responseWriter, http.StatusOK, types.CatalogSyncRunListResponse{List: responses, Total: total})
	}
}

// listCatalogSyncChangesHandler 返回一次同步的 SKU 变更和闲鱼在售关联。
func listCatalogSyncChangesHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		runID := catalogRouteID(request, "/api/catalog/sync-runs/", "/changes")
		run, err := serviceContext.CatalogService.GetSyncRun(request.Context(), runID)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "同步任务不存在")
			return
		}
		if run.BrandName == "" && run.BrandStoreID != "" {
			if brandStore, brandStoreErr := serviceContext.CatalogService.GetBrandStore(request.Context(), run.BrandStoreID); brandStoreErr == nil {
				run.BrandName = brandStore.BrandName
				run.RegionID = brandStore.RegionID
			}
		}
		query := request.URL.Query()
		page := parsePositiveInt(query.Get("page"), 1)
		pageSize := parsePositiveInt(query.Get("pageSize"), 50)
		if pageSize > 100 {
			pageSize = 100
		}
		changes, total, err := serviceContext.InventoryRepository.ListSyncChanges(request.Context(), runID, strings.TrimSpace(query.Get("type")), strings.TrimSpace(query.Get("keyword")), page, pageSize)
		if err != nil {
			logx.Errorf("list catalog sync changes: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取同步变更明细失败")
			return
		}
		itemNos := make([]string, 0, len(changes))
		for _, change := range changes {
			itemNos = append(itemNos, change.ItemNo)
		}
		listings, err := serviceContext.ListingRepository.ListByItemNos(request.Context(), "xianyu", itemNos)
		if err != nil {
			logx.Errorf("list xianyu listings for sync changes: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取闲鱼在售状态失败")
			return
		}
		listingsByItemNo := make(map[string][]types.MarketplaceListingResponse)
		for _, listing := range listings {
			normalizedItemNo := strings.ToUpper(strings.TrimSpace(listing.ItemNo))
			listingsByItemNo[normalizedItemNo] = append(listingsByItemNo[normalizedItemNo], marketplaceListingToResponse(listing))
		}
		responses := make([]types.CatalogSyncChangeResponse, 0, len(changes))
		for _, change := range changes {
			responses = append(responses, syncChangeResponse(change, listingsByItemNo[strings.ToUpper(strings.TrimSpace(change.ItemNo))]))
		}
		writeJSON(responseWriter, http.StatusOK, types.CatalogSyncChangeListResponse{Run: syncResponse(run), List: responses, Total: total})
	}
}

// refreshCatalogOfferHandler 实时刷新本地的一件商品。
func refreshCatalogOfferHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		result, err := serviceContext.CatalogService.RefreshOffer(request.Context(), catalogRouteID(request, "/api/catalog/offers/", "/refresh"))
		if err != nil {
			logx.Errorf("refresh catalog offer: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "商品实时刷新失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, syncResponse(result.Run))
	}
}

func brandStoreResponse(brandStore catalog.BrandStore) types.CatalogBrandStoreResponse {
	return types.CatalogBrandStoreResponse{ID: brandStore.ID, RegionID: brandStore.RegionID, DistributorID: brandStore.DistributorID, BrandID: brandStore.BrandID, BrandName: brandStore.BrandName, ShopCode: brandStore.ShopCode, StoreName: brandStore.StoreName, SyncEnabled: brandStore.SyncEnabled, LastSyncedAt: brandStore.LastSyncedAt.Format("2006-01-02T15:04:05Z07:00")}
}
func syncResponse(run catalog.SyncRun) types.CatalogSyncResponse {
	return types.CatalogSyncResponse{ID: run.ID, ScopeType: run.ScopeType, BrandStoreID: run.BrandStoreID, BrandName: run.BrandName, RegionID: run.RegionID, OfferID: run.OfferID, Status: run.Status, TotalCount: run.TotalCount, ProcessedCount: run.ProcessedCount, CreatedCount: run.CreatedCount, UpdatedCount: run.UpdatedCount, InactiveCount: run.InactiveCount, SuspectedCount: run.SuspectedCount, ErrorMessage: run.ErrorMessage, StartedAt: run.StartedAt.Format("2006-01-02T15:04:05Z07:00"), FinishedAt: run.FinishedAt.Format("2006-01-02T15:04:05Z07:00")}
}

// syncChangeResponse 转换同步变更并附带当前闲鱼在售商品。
func syncChangeResponse(change catalog.SyncChange, listings []types.MarketplaceListingResponse) types.CatalogSyncChangeResponse {
	return types.CatalogSyncChangeResponse{
		ID: change.ID, RunID: change.RunID, OfferID: change.OfferID, ItemNo: change.ItemNo, ProductName: change.ProductName, ImageURL: change.ImageURL,
		SKUID: change.SKUID, SKUCode: change.SKUCode, VariantLabel: change.VariantLabel, ChangeType: change.ChangeType,
		Before:    types.CatalogSyncChangeValueResponse{PriceCents: change.Before.PriceCents, SourcePriceCents: change.Before.SourcePriceCents, ActivityPriceCents: change.Before.ActivityPriceCents, MarketPriceCents: change.Before.MarketPriceCents, Stock: change.Before.Stock, Status: change.Before.Status},
		After:     types.CatalogSyncChangeValueResponse{PriceCents: change.After.PriceCents, SourcePriceCents: change.After.SourcePriceCents, ActivityPriceCents: change.After.ActivityPriceCents, MarketPriceCents: change.After.MarketPriceCents, Stock: change.After.Stock, Status: change.After.Status},
		ChangedAt: change.ChangedAt.Format(time.RFC3339), XianyuListings: listings,
	}
}

// catalogRouteID 提取 GoZero 路由末尾的资源 ID。
func catalogRouteID(request *http.Request, prefix, suffix string) string {
	resourceID := strings.TrimPrefix(request.URL.Path, prefix)
	if suffix != "" {
		resourceID = strings.TrimSuffix(resourceID, suffix)
	}
	return strings.Trim(resourceID, "/")
}
