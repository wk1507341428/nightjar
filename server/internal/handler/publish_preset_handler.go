package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
)

type savePublishPresetRequest struct {
	AccountID string                    `json:"accountId"`
	Name      string                    `json:"name"`
	Rules     []model.PublishPresetRule `json:"rules"`
}

func listPublishPresetsHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accountID := strings.TrimSpace(request.URL.Query().Get("accountId"))
		if accountID == "" {
			accountID = model.DefaultXianyuAccountID
		}
		presets, err := serviceContext.PublishPresetRepository.List(request.Context(), accountID)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取常用发布方案失败")
			return
		}
		if presets == nil {
			presets = []model.PublishPreset{}
		}
		writeJSON(responseWriter, http.StatusOK, presets)
	}
}

func createPublishPresetHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		body, ok := decodePublishPresetRequest(responseWriter, request)
		if !ok {
			return
		}
		now := time.Now()
		preset := model.PublishPreset{ID: primitive.NewObjectID().Hex(), AccountID: body.AccountID, Name: body.Name, Rules: body.Rules, CreatedAt: now, UpdatedAt: now}
		if err := serviceContext.PublishPresetRepository.Create(request.Context(), preset); err != nil {
			if mongo.IsDuplicateKeyError(err) {
				writeError(responseWriter, http.StatusConflict, "当前账号已存在同名方案")
				return
			}
			writeError(responseWriter, http.StatusInternalServerError, "保存常用发布方案失败")
			return
		}
		writeJSON(responseWriter, http.StatusCreated, preset)
	}
}

func updatePublishPresetHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		body, ok := decodePublishPresetRequest(responseWriter, request)
		if !ok {
			return
		}
		presetID := strings.TrimSpace(pathvar.Vars(request)["id"])
		presets, err := serviceContext.PublishPresetRepository.List(request.Context(), body.AccountID)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取常用发布方案失败")
			return
		}
		createdAt := time.Now()
		for _, existingPreset := range presets {
			if existingPreset.ID == presetID {
				createdAt = existingPreset.CreatedAt
				break
			}
		}
		preset := model.PublishPreset{ID: presetID, AccountID: body.AccountID, Name: body.Name, Rules: body.Rules, CreatedAt: createdAt, UpdatedAt: time.Now()}
		if err := serviceContext.PublishPresetRepository.Update(request.Context(), preset); err != nil {
			if errors.Is(err, repository.ErrPublishPresetNotFound) {
				writeError(responseWriter, http.StatusNotFound, "常用发布方案不存在")
				return
			}
			if mongo.IsDuplicateKeyError(err) {
				writeError(responseWriter, http.StatusConflict, "当前账号已存在同名方案")
				return
			}
			writeError(responseWriter, http.StatusInternalServerError, "更新常用发布方案失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, preset)
	}
}

func deletePublishPresetHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		accountID := strings.TrimSpace(request.URL.Query().Get("accountId"))
		if accountID == "" {
			accountID = model.DefaultXianyuAccountID
		}
		if err := serviceContext.PublishPresetRepository.Delete(request.Context(), accountID, pathvar.Vars(request)["id"]); err != nil {
			if errors.Is(err, repository.ErrPublishPresetNotFound) {
				writeError(responseWriter, http.StatusNotFound, "常用发布方案不存在")
				return
			}
			writeError(responseWriter, http.StatusInternalServerError, "删除常用发布方案失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, map[string]any{"deleted": true})
	}
}

func decodePublishPresetRequest(responseWriter http.ResponseWriter, request *http.Request) (savePublishPresetRequest, bool) {
	var body savePublishPresetRequest
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		writeError(responseWriter, http.StatusBadRequest, "常用发布方案格式错误")
		return body, false
	}
	body.AccountID = strings.TrimSpace(body.AccountID)
	if body.AccountID == "" {
		body.AccountID = model.DefaultXianyuAccountID
	}
	body.Name = strings.TrimSpace(body.Name)
	if body.Name == "" || len([]rune(body.Name)) > 40 || len(body.Rules) == 0 || len(body.Rules) > 12 {
		writeError(responseWriter, http.StatusBadRequest, "方案名称或品牌规则数量无效")
		return body, false
	}
	for ruleIndex := range body.Rules {
		rule := &body.Rules[ruleIndex]
		rule.ID = strings.TrimSpace(rule.ID)
		if rule.ID == "" {
			rule.ID = primitive.NewObjectID().Hex()
		}
		rule.SourceType = strings.TrimSpace(rule.SourceType)
		if rule.SourceType == "" {
			rule.SourceType = "live"
		}
		rule.BrandName = strings.TrimSpace(rule.BrandName)
		rule.ActionMode = strings.TrimSpace(rule.ActionMode)
		if rule.ActionMode == "" {
			rule.ActionMode = model.PublishPresetUpdateOnly
		}
		if rule.Limit == 0 {
			rule.Limit = 500
		}
		if rule.MinDelaySeconds == 0 {
			rule.MinDelaySeconds = 1
		}
		if rule.MaxDelaySeconds == 0 {
			rule.MaxDelaySeconds = 2
		}
		validSource := rule.BrandProfileID != "" || rule.BrandStoreID != "" || (rule.RegionID != "" && rule.DistributorID != "")
		validSourceType := rule.SourceType == "live" || rule.SourceType == "local"
		validMode := rule.ActionMode == model.PublishPresetUpdateOnly || rule.ActionMode == model.PublishPresetPublishUpdate || rule.ActionMode == model.PublishPresetFull
		validRange := rule.Limit > 0 && rule.Limit <= 3000 && rule.MinDelaySeconds > 0 && rule.MaxDelaySeconds <= 60 && rule.MinDelaySeconds <= rule.MaxDelaySeconds
		validPriceRange := rule.MinPriceCents >= 0 && rule.MaxPriceCents >= 0 && (rule.MinPriceCents == 0 || rule.MaxPriceCents == 0 || rule.MinPriceCents <= rule.MaxPriceCents)
		validDiscountRange := rule.MinDiscountRate >= 0 && rule.MinDiscountRate <= 100 && rule.MaxDiscountRate >= 0 && rule.MaxDiscountRate <= 100 && (rule.MinDiscountRate == 0 || rule.MaxDiscountRate == 0 || rule.MinDiscountRate <= rule.MaxDiscountRate)
		if rule.BrandName == "" || !validSource || !validSourceType || !validMode || !validRange || !validPriceRange || !validDiscountRange {
			writeError(responseWriter, http.StatusBadRequest, "第 "+strconv.Itoa(ruleIndex+1)+" 条品牌规则无效")
			return body, false
		}
	}
	return body, true
}
