package handler

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest"

	"sidejob-server/internal/svc"
)

// RegisterHandlers 注册 SideJob API 路由。
func RegisterHandlers(server *rest.Server, serviceContext *svc.ServiceContext) {
	server.AddRoutes([]rest.Route{
		{
			Method:  http.MethodGet,
			Path:    "/api/healthz",
			Handler: healthHandler(),
		},
		{
			Method:  http.MethodGet,
			Path:    "/api/catalog/seckill",
			Handler: listSeckillProductsHandler(serviceContext),
		},
		{Method: http.MethodGet, Path: "/api/catalog/brand-stores/discover", Handler: discoverCatalogBrandStoresHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/brand-stores", Handler: listCatalogBrandStoresHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/brand-stores/:id/categories", Handler: listCatalogBrandCategoriesHandler(serviceContext)},
		{Method: http.MethodPut, Path: "/api/catalog/brand-stores", Handler: saveCatalogBrandStoreHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/offers", Handler: listCatalogOffersHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/offers/:id", Handler: getCatalogOfferHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/offers/:id/price-history", Handler: getCatalogOfferPriceHistoryHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/catalog/brand-stores/:id/sync", Handler: syncCatalogBrandStoreHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/sync-runs/:id", Handler: getCatalogSyncRunHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/catalog/offers/:id/refresh", Handler: refreshCatalogOfferHandler(serviceContext)},
		{
			Method:  http.MethodGet,
			Path:    "/api/marketplace/listings",
			Handler: listMarketplaceListingsHandler(serviceContext),
		},
		{
			Method:  http.MethodPost,
			Path:    "/api/marketplace/sync",
			Handler: syncMarketplaceListingsHandler(serviceContext),
		},
		{
			Method:  http.MethodPost,
			Path:    "/api/price-comparisons",
			Handler: createPriceComparisonHandler(serviceContext),
		},
		{
			Method:  http.MethodPost,
			Path:    "/api/xianyu/session",
			Handler: saveXianyuSessionHandler(serviceContext),
		},
		{
			Method:  http.MethodGet,
			Path:    "/api/xianyu/connection",
			Handler: getXianyuConnectionHandler(serviceContext),
		},
		{
			Method:  http.MethodDelete,
			Path:    "/api/xianyu/session",
			Handler: deleteXianyuSessionHandler(serviceContext),
		},
		{Method: http.MethodPost, Path: "/api/xianyu-seller/session", Handler: saveXianyuSellerSessionHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu-seller/connection", Handler: getXianyuSellerConnectionHandler(serviceContext)},
		{Method: http.MethodDelete, Path: "/api/xianyu-seller/session", Handler: deleteXianyuSellerSessionHandler(serviceContext)},
		{
			Method:  http.MethodPost,
			Path:    "/api/pinduoduo/session",
			Handler: savePinduoduoSessionHandler(serviceContext),
		},
		{
			Method:  http.MethodGet,
			Path:    "/api/pinduoduo/connection",
			Handler: getPinduoduoConnectionHandler(serviceContext),
		},
		{
			Method:  http.MethodDelete,
			Path:    "/api/pinduoduo/session",
			Handler: deletePinduoduoSessionHandler(serviceContext),
		},
		{
			Method:  http.MethodPost,
			Path:    "/api/xianyu/publish-tasks",
			Handler: createPublishTaskHandler(serviceContext),
		},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-batches/preview", Handler: previewPublishBatchHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-batches", Handler: createPublishBatchHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu/publish-batches/:id", Handler: getPublishBatchHandler(serviceContext)},
		{
			Method:  http.MethodGet,
			Path:    "/api/xianyu/publish-tasks",
			Handler: listPublishTasksHandler(serviceContext),
		},
		{
			Method:  http.MethodGet,
			Path:    "/api/xianyu/publish-tasks/:id",
			Handler: getPublishTaskHandler(serviceContext),
		},
		{
			Method:  http.MethodPost,
			Path:    "/api/xianyu/publish-tasks/:id/retry",
			Handler: retryPublishTaskHandler(serviceContext),
		},
	})
}
