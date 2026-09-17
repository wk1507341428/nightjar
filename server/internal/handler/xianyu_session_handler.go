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

// saveXianyuSessionHandler 校验、加密并保存闲鱼 Cookie。
func saveXianyuSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var requestBody types.SaveXianyuSessionRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "Cookie 参数格式错误")
			return
		}
		if strings.TrimSpace(requestBody.Cookie) == "" {
			writeError(responseWriter, http.StatusBadRequest, "请粘贴闲鱼请求中的完整 Cookie")
			return
		}

		displayName, err := serviceContext.XianyuService.Connect(request.Context(), requestBody.Cookie)
		if err != nil {
			logx.Errorf("connect xianyu API session: %v", err)
			writeError(responseWriter, http.StatusUnauthorized, err.Error())
			return
		}

		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
			Platform:       model.XianyuPlatform,
			Status:         "connected",
			Authenticated:  true,
			LastVerifiedAt: time.Now().Format(time.RFC3339),
			Message:        "已连接 " + displayName,
		})
	}
}

// getXianyuConnectionHandler 返回本地保存的闲鱼 API 会话状态。
func getXianyuConnectionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		session, err := serviceContext.XianyuService.Connection(request.Context())
		if errors.Is(err, repository.ErrSessionNotFound) {
			writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
				Platform: model.XianyuPlatform,
				Status:   "not_connected",
				Message:  "尚未连接闲鱼 API",
			})
			return
		}
		if err != nil {
			logx.Errorf("load xianyu API session: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取闲鱼连接状态失败")
			return
		}

		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
			Platform:       model.XianyuPlatform,
			Status:         "connected",
			Authenticated:  true,
			LastVerifiedAt: session.UpdatedAt.Format(time.RFC3339),
			Message:        "已连接 " + session.DisplayName,
		})
	}
}

// deleteXianyuSessionHandler 删除本地加密 Cookie。
func deleteXianyuSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		if err := serviceContext.XianyuService.Disconnect(request.Context()); err != nil {
			logx.Errorf("delete xianyu API session: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "断开闲鱼失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
			Platform: model.XianyuPlatform,
			Status:   "not_connected",
			Message:  "闲鱼 API 已断开",
		})
	}
}
