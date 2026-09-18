package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// createPriceComparisonHandler 查询各接入渠道的同款商品价格。
func createPriceComparisonHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		// 统一比价请求。
		var comparisonRequest types.CreatePriceComparisonRequest
		if err := json.NewDecoder(request.Body).Decode(&comparisonRequest); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "比价请求格式不正确")
			return
		}
		comparisonRequest.Product.Name = strings.TrimSpace(comparisonRequest.Product.Name)
		comparisonRequest.Product.ItemNo = strings.TrimSpace(comparisonRequest.Product.ItemNo)
		if comparisonRequest.Product.Name == "" && comparisonRequest.Product.ItemNo == "" {
			writeError(responseWriter, http.StatusBadRequest, "请提供商品名称或货号")
			return
		}

		// 远端搜索最多等待 30 秒，避免页面长期卡住。
		comparisonContext, cancel := context.WithTimeout(request.Context(), 30*time.Second)
		defer cancel()
		comparisonResponse, err := serviceContext.PriceCompareService.Compare(comparisonContext, comparisonRequest)
		if err != nil {
			logx.Errorf("create price comparison: %v", err)
			writeError(responseWriter, http.StatusBadGateway, "比价查询失败，请检查平台连接状态后重试")
			return
		}
		writeJSON(responseWriter, http.StatusOK, comparisonResponse)
	}
}
