package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/svc"
)

// listSeckillProductsHandler 返回当前参与或即将参与秒杀的商品。
func listSeckillProductsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		// 请求地区。
		regionID := strings.TrimSpace(request.URL.Query().Get("regionId"))
		// 请求页码。
		page := parsePositiveInt(request.URL.Query().Get("page"), 1)
		// 请求单页数量。
		pageSize := parsePositiveInt(request.URL.Query().Get("pageSize"), 24)

		result, err := serviceContext.CatalogService.ListSeckillProducts(
			request.Context(),
			regionID,
			page,
			pageSize,
		)
		if err != nil {
			logx.Errorf("list seckill products: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "秒杀数据暂时无法读取")
			return
		}

		writeJSON(responseWriter, http.StatusOK, result)
	}
}

// parsePositiveInt 将查询参数解析为正整数。
func parsePositiveInt(rawValue string, fallback int) int {
	parsedValue, err := strconv.Atoi(rawValue)
	if err != nil || parsedValue < 1 {
		return fallback
	}
	return parsedValue
}
