package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
	"sidejob-server/internal/xianyu"
)

// listXianyuAccountsHandler 返回全部闲鱼账号。
func listXianyuAccountsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accounts, err := serviceContext.XianyuAccountRepository.List(request.Context())
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取闲鱼账号失败")
			return
		}
		responses := make([]types.XianyuAccountResponse, 0, len(accounts))
		for _, account := range accounts {
			responses = append(responses, xianyuAccountToResponse(account))
		}
		writeJSON(responseWriter, http.StatusOK, types.XianyuAccountListResponse{List: responses})
	}
}

// createXianyuAccountHandler 新建一个闲鱼账号槽位。
func createXianyuAccountHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var requestBody types.CreateXianyuAccountRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "账号参数格式错误")
			return
		}
		requestBody.Name = strings.TrimSpace(requestBody.Name)
		if requestBody.Name == "" {
			writeError(responseWriter, http.StatusBadRequest, "请填写账号备注")
			return
		}
		now := time.Now()
		account := model.XianyuAccount{ID: primitive.NewObjectID().Hex(), Name: requestBody.Name, Status: model.XianyuAccountActive, CreatedAt: now, UpdatedAt: now}
		if err := serviceContext.XianyuAccountRepository.Create(request.Context(), account); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "创建闲鱼账号失败")
			return
		}
		writeJSON(responseWriter, http.StatusCreated, xianyuAccountToResponse(account))
	}
}

// updateXianyuAccountHandler 更新账号备注或队列状态。
func updateXianyuAccountHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accountID := strings.TrimSpace(pathvar.Vars(request)["accountId"])
		var requestBody types.UpdateXianyuAccountRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "账号参数格式错误")
			return
		}
		requestBody.Name = strings.TrimSpace(requestBody.Name)
		requestBody.Status = strings.TrimSpace(requestBody.Status)
		if requestBody.Status != "" && requestBody.Status != model.XianyuAccountActive && requestBody.Status != model.XianyuAccountPaused && requestBody.Status != model.XianyuAccountDisabled {
			writeError(responseWriter, http.StatusBadRequest, "账号状态无效")
			return
		}
		if err := serviceContext.XianyuAccountRepository.Update(request.Context(), accountID, requestBody.Name, requestBody.Status); err != nil {
			if errors.Is(err, repository.ErrXianyuAccountNotFound) {
				writeError(responseWriter, http.StatusNotFound, "闲鱼账号不存在")
				return
			}
			writeError(responseWriter, http.StatusInternalServerError, "更新闲鱼账号失败")
			return
		}
		account, _ := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
		writeJSON(responseWriter, http.StatusOK, xianyuAccountToResponse(account))
	}
}

// saveXianyuAccountSessionHandler 校验并保存指定账号的一类凭证。
func saveXianyuAccountSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accountID := strings.TrimSpace(pathvar.Vars(request)["accountId"])
		kind := strings.TrimSpace(pathvar.Vars(request)["kind"])
		if kind != "session" && kind != "seller" {
			writeError(responseWriter, http.StatusBadRequest, "凭证类型无效")
			return
		}
		account, err := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "闲鱼账号不存在")
			return
		}
		var requestBody types.SaveXianyuSessionRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "Cookie 参数格式错误")
			return
		}
		rawCredential := strings.TrimSpace(requestBody.Credential)
		if rawCredential == "" {
			rawCredential = strings.TrimSpace(requestBody.Cookie)
		}
		credentialUserID, identityErr := xianyu.PlatformUserIDFromCredential(rawCredential)
		if identityErr != nil {
			writeError(responseWriter, http.StatusBadRequest, identityErr.Error())
			return
		}
		if account.PlatformUserID != "" && credentialUserID != "" && credentialUserID != account.PlatformUserID {
			writeError(responseWriter, http.StatusConflict, "当前凭证属于另一个闲鱼账号，请新增账号后再连接")
			return
		}
		if credentialUserID != "" {
			boundAccount, boundErr := serviceContext.XianyuAccountRepository.FindByPlatformUserID(request.Context(), credentialUserID)
			if boundErr == nil && boundAccount.ID != accountID {
				writeError(responseWriter, http.StatusConflict, "这个闲鱼号已经绑定到账号“"+boundAccount.Name+"”")
				return
			}
		}
		if rawCredential == "" {
			writeError(responseWriter, http.StatusBadRequest, "请粘贴完整 cURL 或 Cookie")
			return
		}
		accountService := serviceContext.XianyuService.ForAccount(accountID)
		sessionRepository := serviceContext.SessionRepository.ForAccount(accountID)
		if kind == "seller" {
			accountService = serviceContext.SellerXianyuService.ForAccount(accountID)
			sessionRepository = serviceContext.SellerSessionRepository.ForAccount(accountID)
		}
		previousSession, previousSessionErr := sessionRepository.Get(request.Context())
		displayName, platformUserID, searchReady, err := accountService.ConnectWithIdentity(request.Context(), rawCredential, account.PlatformUserID)
		if err != nil {
			writeError(responseWriter, http.StatusUnauthorized, err.Error())
			return
		}
		if platformUserID == "" && account.ID != model.DefaultXianyuAccountID {
			_ = accountService.Disconnect(request.Context())
			if previousSessionErr == nil {
				_ = sessionRepository.Save(request.Context(), previousSession)
			}
			writeError(responseWriter, http.StatusConflict, "凭证中无法识别稳定的闲鱼用户 ID，请复制包含 unb 的完整 Cookie")
			return
		}
		if err := serviceContext.XianyuAccountRepository.UpdateConnection(request.Context(), accountID, kind, displayName, platformUserID, true, searchReady); err != nil {
			_ = accountService.Disconnect(request.Context())
			if previousSessionErr == nil {
				_ = sessionRepository.Save(request.Context(), previousSession)
			}
			if mongo.IsDuplicateKeyError(err) {
				writeError(responseWriter, http.StatusConflict, "这个闲鱼号已经绑定到其他账号")
				return
			}
			writeError(responseWriter, http.StatusInternalServerError, "保存账号连接状态失败")
			return
		}
		updated, _ := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
		writeJSON(responseWriter, http.StatusOK, xianyuAccountToResponse(updated))
	}
}

// deleteXianyuAccountSessionHandler 断开指定账号的一类凭证。
func deleteXianyuAccountSessionHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accountID := strings.TrimSpace(pathvar.Vars(request)["accountId"])
		kind := strings.TrimSpace(pathvar.Vars(request)["kind"])
		accountService := serviceContext.XianyuService.ForAccount(accountID)
		if kind == "seller" {
			accountService = serviceContext.SellerXianyuService.ForAccount(accountID)
		} else if kind != "session" {
			writeError(responseWriter, http.StatusBadRequest, "凭证类型无效")
			return
		}
		if err := accountService.Disconnect(request.Context()); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "断开闲鱼凭证失败")
			return
		}
		account, err := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "闲鱼账号不存在")
			return
		}
		if kind == "seller" {
			account.SellerConnected = false
		} else {
			account.SessionConnected = false
			account.SearchReady = false
		}
		_ = serviceContext.XianyuAccountRepository.UpdateConnection(request.Context(), accountID, kind, account.DisplayName, account.PlatformUserID, false, false)
		writeJSON(responseWriter, http.StatusOK, xianyuAccountToResponse(account))
	}
}

// verifyXianyuAccountHandler 实时验证指定账号的两类连接。
func verifyXianyuAccountHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accountID := strings.TrimSpace(pathvar.Vars(request)["accountId"])
		account, err := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "闲鱼账号不存在")
			return
		}
		if session, sessionErr := serviceContext.XianyuService.ForAccount(accountID).Connection(request.Context()); sessionErr == nil {
			account.SessionConnected = true
			account.SearchReady = session.EncryptedSearchCredential != ""
		} else if errors.Is(sessionErr, repository.ErrSessionNotFound) {
			account.SessionConnected = false
		} else {
			writeError(responseWriter, http.StatusBadGateway, "普通闲鱼连接暂时无法验证："+sessionErr.Error())
			return
		}
		if _, sellerErr := serviceContext.SellerXianyuService.ForAccount(accountID).Connection(request.Context()); sellerErr == nil {
			account.SellerConnected = true
		} else if errors.Is(sellerErr, repository.ErrSessionNotFound) || errors.Is(sellerErr, xianyu.ErrSessionExpired) {
			account.SellerConnected = false
		} else {
			writeError(responseWriter, http.StatusBadGateway, "卖家后台暂时无法验证："+sellerErr.Error())
			return
		}
		_ = serviceContext.XianyuAccountRepository.UpdateConnection(request.Context(), accountID, "session", account.DisplayName, account.PlatformUserID, account.SessionConnected, account.SearchReady)
		_ = serviceContext.XianyuAccountRepository.UpdateConnection(request.Context(), accountID, "seller", account.DisplayName, account.PlatformUserID, account.SellerConnected, false)
		updated, _ := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
		writeJSON(responseWriter, http.StatusOK, xianyuAccountToResponse(updated))
	}
}

// xianyuAccountToResponse 转换账号公开字段。
func xianyuAccountToResponse(account model.XianyuAccount) types.XianyuAccountResponse {
	response := types.XianyuAccountResponse{ID: account.ID, Name: account.Name, DisplayName: account.DisplayName, PlatformUserID: account.PlatformUserID, Status: account.Status, IsDefault: account.IsDefault, SessionConnected: account.SessionConnected, SellerConnected: account.SellerConnected, SearchReady: account.SearchReady, CreatedAt: account.CreatedAt.Format(time.RFC3339), UpdatedAt: account.UpdatedAt.Format(time.RFC3339)}
	if account.LastVerifiedAt != nil {
		response.LastVerifiedAt = account.LastVerifiedAt.Format(time.RFC3339)
	}
	if account.LastSellerVerified != nil {
		response.LastSellerVerifiedAt = account.LastSellerVerified.Format(time.RFC3339)
	}
	if account.LastSyncedAt != nil {
		response.LastSyncedAt = account.LastSyncedAt.Format(time.RFC3339)
	}
	return response
}

// requireActiveSellerAccount 校验商品操作目标账号可用。
func requireActiveSellerAccount(responseWriter http.ResponseWriter, request *http.Request, serviceContext *svc.ServiceContext, accountID string) bool {
	account, err := serviceContext.XianyuAccountRepository.Get(request.Context(), accountID)
	if err != nil {
		writeError(responseWriter, http.StatusNotFound, "闲鱼账号不存在")
		return false
	}
	if account.Status != model.XianyuAccountActive {
		writeError(responseWriter, http.StatusConflict, "闲鱼账号队列已暂停或停用")
		return false
	}
	if !account.SellerConnected {
		writeError(responseWriter, http.StatusConflict, "闲鱼卖家后台尚未连接")
		return false
	}
	return true
}
