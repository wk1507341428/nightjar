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
