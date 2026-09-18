package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// savePinduoduoSessionHandler 验证并加密保存用户填写的拼多多凭证。
func savePinduoduoSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var requestBody types.SavePinduoduoSessionRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "拼多多凭证格式不正确")
			return
		}
		rawCredential := requestBody.Credential
		if rawCredential == "" {
			rawCredential = requestBody.Cookie
		}
		if err := serviceContext.PinduoduoService.Connect(request.Context(), rawCredential); err != nil {
			logx.Errorf("connect pinduoduo API session: %v", err)
			writeError(responseWriter, http.StatusUnauthorized, err.Error())
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
			Platform:       model.PinduoduoPlatform,
			Status:         "connected",
			Authenticated:  true,
			SearchReady:    true,
			LastVerifiedAt: time.Now().Format(time.RFC3339),
			Message:        "拼多多商家后台已连接",
		})
	}
}

// getPinduoduoConnectionHandler 返回拼多多凭证连接状态。
func getPinduoduoConnectionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		session, err := serviceContext.PinduoduoService.Connection(request.Context())
		if errors.Is(err, repository.ErrPinduoduoSessionNotFound) {
			writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
				Platform: model.PinduoduoPlatform,
				Status:   "not_connected",
				Message:  "尚未连接拼多多商家后台",
			})
			return
		}
		if err != nil {
			logx.Errorf("load pinduoduo API session: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取拼多多连接状态失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
			Platform:       model.PinduoduoPlatform,
			Status:         "connected",
			Authenticated:  true,
			SearchReady:    true,
			LastVerifiedAt: session.UpdatedAt.Format(time.RFC3339),
			Message:        "拼多多商家后台已连接",
		})
	}
}

// deletePinduoduoSessionHandler 删除拼多多凭证。
func deletePinduoduoSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		if err := serviceContext.PinduoduoService.Disconnect(request.Context()); err != nil {
			logx.Errorf("delete pinduoduo API session: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "断开拼多多失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, types.ConnectionResponse{
			Platform: model.PinduoduoPlatform,
			Status:   "not_connected",
			Message:  "拼多多商家后台已断开",
		})
	}
}
