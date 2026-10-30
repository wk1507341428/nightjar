package handler

import (
	"context"
	"net/http"

	"github.com/zeromicro/go-zero/rest"

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
)

// RegisterHandlers 注册 SideJob API 路由。
func RegisterHandlers(server *rest.Server, serviceContext *svc.ServiceContext) {
	serviceContext.PublishService.RefreshReconcile = func(ctx context.Context, task model.PublishTask) (model.PublishTask, error) {
		return refreshReconcileTask(ctx, serviceContext, task)
	}
	serviceContext.PublishService.PrepareRetry = func(ctx context.Context, task model.PublishTask) (model.PublishTask, error) {
		return prepareRetryContent(ctx, serviceContext, task)
	}
	serviceContext.PublishService.PrepareOfflineBatch = func(ctx context.Context, tasks []model.PublishTask) map[string]error {
		return prepareOfflineBatch(ctx, serviceContext, tasks)
	}
	serviceContext.PublishService.Start()
	server.AddRoutes([]rest.Route{
		{Method: http.MethodGet, Path: "/api/catalog/sync-center/profiles", Handler: syncCenterProfilesHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/sync-center/profiles/:id/metadata", Handler: syncCenterMetadataHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/sync-center/brands", Handler: listSyncCenterBrandsHandler(serviceContext)},
		{Method: http.MethodDelete, Path: "/api/catalog/sync-center/brands/:id", Handler: deleteSyncCenterBrandHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/sync-center/runs", Handler: listSyncCenterRunsHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/catalog/sync-center/runs", Handler: startSyncCenterRunsHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/sync-center/skus", Handler: searchSyncedSKUsHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/source-categories", Handler: syncedSourceCategoriesHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/finance/ledger", Handler: financeLedgerHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/finance/orders/sync", Handler: financeSyncHandler(serviceContext)},
		{Method: http.MethodPut, Path: "/api/finance/orders/:id", Handler: saveOrderFinanceHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/finance/expenses", Handler: saveFinanceExpenseHandler(serviceContext, true)},
		{Method: http.MethodPut, Path: "/api/finance/expenses/:id", Handler: saveFinanceExpenseHandler(serviceContext, false)},
		{Method: http.MethodDelete, Path: "/api/finance/expenses/:id", Handler: deleteFinanceExpenseHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu/accounts", Handler: listXianyuAccountsHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/accounts", Handler: createXianyuAccountHandler(serviceContext)},
		{Method: http.MethodPatch, Path: "/api/xianyu/accounts/:accountId", Handler: updateXianyuAccountHandler(serviceContext)},
		{Method: http.MethodPut, Path: "/api/xianyu/accounts/:accountId/sessions/:kind", Handler: saveXianyuAccountSessionHandler(serviceContext)},
		{Method: http.MethodDelete, Path: "/api/xianyu/accounts/:accountId/sessions/:kind", Handler: deleteXianyuAccountSessionHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/accounts/:accountId/verify", Handler: verifyXianyuAccountHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-operations/:id/retry-failed", Handler: retryFailedOperationHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-operations/:id/cancel", Handler: cancelPublishOperationHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/brand-profiles/:id/categories", Handler: listOfflineCenterCategoriesHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/offline-center/preview", Handler: previewOfflineCenterHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/offline-center/operations", Handler: createOfflineCenterOperationHandler(serviceContext)},
		{
			Method:  http.MethodGet,
			Path:    "/api/healthz",
			Handler: healthHandler(),
		},
		{Method: http.MethodGet, Path: "/api/catalog/brand-stores", Handler: listCatalogBrandStoresHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/brand-stores/:id/categories", Handler: listCatalogBrandCategoriesHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/brand-maintenance", Handler: getBrandMaintenanceHandler(serviceContext)},
		{Method: http.MethodPut, Path: "/api/catalog/brand-profiles", Handler: saveBrandProfileHandler(serviceContext)},
		{Method: http.MethodDelete, Path: "/api/catalog/brand-profiles/:id", Handler: deleteBrandProfileHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/offers", Handler: listCatalogOffersHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/offers/:id", Handler: getCatalogOfferHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/catalog/offers/:id/price-history", Handler: getCatalogOfferPriceHistoryHandler(serviceContext)},
		{
			Method:  http.MethodGet,
			Path:    "/api/marketplace/listings",
			Handler: listMarketplaceListingsHandler(serviceContext),
		},
		{Method: http.MethodPost, Path: "/api/marketplace/listings/offline", Handler: offlineMarketplaceListingsHandler(serviceContext)},
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
			Path:    "/api/xianyu/publish-tasks",
			Handler: createPublishTaskHandler(serviceContext),
		},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-batches/preview", Handler: previewPublishBatchHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-batches", Handler: createPublishBatchHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu/publish-batches/:id", Handler: getPublishBatchHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu/publish-operations", Handler: listPublishOperationsHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu/publish-operations/:id", Handler: getPublishBatchHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-operations/preview", Handler: previewPublishBatchHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-operations", Handler: createPublishBatchHandler(serviceContext)},
		{Method: http.MethodGet, Path: "/api/xianyu/publish-presets", Handler: listPublishPresetsHandler(serviceContext)},
		{Method: http.MethodPost, Path: "/api/xianyu/publish-presets", Handler: createPublishPresetHandler(serviceContext)},
		{Method: http.MethodPut, Path: "/api/xianyu/publish-presets/:id", Handler: updatePublishPresetHandler(serviceContext)},
		{Method: http.MethodDelete, Path: "/api/xianyu/publish-presets/:id", Handler: deletePublishPresetHandler(serviceContext)},
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
