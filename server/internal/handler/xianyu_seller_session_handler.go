package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// saveXianyuSellerSessionHandler 保存卖家工作台专用凭证。
func saveXianyuSellerSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var requestBody types.SaveXianyuSessionRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "Cookie 参数格式错误")
			return
		}
		rawCredential := strings.TrimSpace(requestBody.Credential)
		if rawCredential == "" {
			rawCredential = strings.TrimSpace(requestBody.Cookie)
		}
		if rawCredential == "" {
			writeError(responseWriter, http.StatusBadRequest, "请粘贴卖家工作台请求 cURL 或完整 Cookie")
			return
		}
		displayName, _, err := serviceContext.SellerXianyuService.Connect(request.Context(), rawCredential)
		if err != nil {
			logx.Errorf("connect xianyu seller session: %v", err)
			writeError(responseWriter, http.StatusUnauthorized, err.Error())
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{Platform: model.XianyuSellerPlatform, Status: "connected", Authenticated: true, LastVerifiedAt: time.Now().Format(time.RFC3339), Message: "已连接 " + displayName})
	}
}

// getXianyuSellerConnectionHandler 返回卖家工作台连接状态。
func getXianyuSellerConnectionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		session, err := serviceContext.SellerXianyuService.Connection(request.Context())
		if errors.Is(err, repository.ErrSessionNotFound) {
			writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{Platform: model.XianyuSellerPlatform, Status: "not_connected", Message: "尚未连接闲鱼卖家后台"})
			return
		}
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取闲鱼卖家后台连接状态失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{Platform: model.XianyuSellerPlatform, Status: "connected", Authenticated: true, LastVerifiedAt: session.UpdatedAt.Format(time.RFC3339), Message: "已连接 " + session.DisplayName})
	}
}

// deleteXianyuSellerSessionHandler 删除卖家工作台专用凭证。
func deleteXianyuSellerSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		if err := serviceContext.SellerXianyuService.Disconnect(request.Context()); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "断开闲鱼卖家后台失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{Platform: model.XianyuSellerPlatform, Status: "not_connected", Message: "闲鱼卖家后台已断开"})
	}
}
