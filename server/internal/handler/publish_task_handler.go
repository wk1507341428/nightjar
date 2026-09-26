package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// createPublishTaskHandler 校验并创建闲鱼自动发布任务。
func createPublishTaskHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var requestBody types.CreatePublishTaskRequest
		if err := json.NewDecoder(request.Body).Decode(&requestBody); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "发布参数格式错误")
			return
		}
		if validationMessage := validatePublishTaskRequest(requestBody); validationMessage != "" {
			writeError(responseWriter, http.StatusBadRequest, validationMessage)
			return
		}

		now := time.Now()
		itemNo := strings.TrimSpace(requestBody.ItemNo)
		sourceTitle := cleanPublishSourceTitle(requestBody.Title, itemNo)
		availableSizes := uniqueStrings(requestBody.AvailableSizes)
		sourceRegions := uniqueStrings(requestBody.SourceRegions)
		regionName := publishRegionName(strings.TrimSpace(requestBody.RegionID))
		if len(sourceRegions) > 0 {
			regionNames := make([]string, 0, len(sourceRegions))
			for _, sourceRegion := range sourceRegions {
				regionNames = appendUniqueText(regionNames, publishRegionName(sourceRegion))
			}
			regionName = strings.Join(regionNames, "、")
		}
		variants := publishVariantsFromRequest(requestBody.Variants)
		if len(variants) == 0 {
			variants = publishVariantsFromSizes(availableSizes, requestBody.PriceCents, requestBody.IsFootwear)
		}
		task := model.PublishTask{
			ID:                 primitive.NewObjectID().Hex(),
			SourceItemID:       strings.TrimSpace(requestBody.SourceItemID),
			ItemNo:             itemNo,
			Title:              buildPublishTitle(sourceTitle, itemNo),
			Description:        buildPublishDescription(sourceTitle, itemNo, availableSizes, regionName),
			PriceCents:         requestBody.PriceCents,
			OriginalPriceCents: requestBody.OriginalPriceCents,
			ImageURLs:          uniqueImageURLs(requestBody.ImageURLs),
			RegionID:           strings.TrimSpace(requestBody.RegionID),
			Brand:              strings.TrimSpace(requestBody.Brand),
			BrandProfileID:     strings.TrimSpace(requestBody.BrandProfileID),
			SourceRegions:      sourceRegions,
			Condition:          strings.TrimSpace(requestBody.Condition),
			AvailableSizes:     availableSizes,
			Variants:           variants,
			IsFootwear:         requestBody.IsFootwear,
			Status:             model.PublishTaskQueued,
			CreatedAt:          now,
			UpdatedAt:          now,
		}

		if err := serviceContext.PublishRepository.Create(request.Context(), task); err != nil {
			logx.Errorf("create publish task: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "创建发布任务失败")
			return
		}
		if err := serviceContext.PublishService.Enqueue(task.ID); err != nil {
			_ = serviceContext.PublishRepository.UpdateStatus(request.Context(), task.ID, model.PublishTaskFailed, "发布队列已满", "", "")
			writeError(responseWriter, http.StatusServiceUnavailable, "发布队列繁忙，请稍后重试")
			return
		}

		writeJSON(responseWriter, http.StatusAccepted, publishTaskToResponse(task))
	}
}

// publishVariantsFromRequest 清理 API 传入的逐规格库存和价格。
func publishVariantsFromRequest(requestVariants []types.CreatePublishVariantRequest) []model.PublishVariant {
	variants := make([]model.PublishVariant, 0, len(requestVariants))
	for _, requestVariant := range requestVariants {
		if requestVariant.PriceCents <= 0 || requestVariant.Quantity <= 0 {
			continue
		}
		properties := make([]model.PublishVariantProperty, 0, len(requestVariant.Properties))
		for _, requestProperty := range requestVariant.Properties {
			name := strings.TrimSpace(requestProperty.Name)
			value := strings.TrimSpace(requestProperty.Value)
			if name == "" || value == "" {
				continue
			}
			properties = append(properties, model.PublishVariantProperty{Name: name, Value: value})
		}
		if len(properties) == 0 {
			continue
		}
		variants = append(variants, model.PublishVariant{PriceCents: requestVariant.PriceCents, Quantity: requestVariant.Quantity, Properties: properties})
	}
	if len(variants) < 2 {
		return nil
	}
	return variants
}

// publishVariantsFromSizes 为单件发布生成基础鞋码规格；批量发布会使用实时库存覆盖。
func publishVariantsFromSizes(sizes []string, priceCents int64, isFootwear bool) []model.PublishVariant {
	if !isFootwear || len(sizes) < 2 {
		return nil
	}
	variants := make([]model.PublishVariant, 0, len(sizes))
	for _, size := range sizes {
		variants = append(variants, model.PublishVariant{PriceCents: priceCents, Quantity: 1, Properties: []model.PublishVariantProperty{{Name: "鞋码", Value: size}}})
	}
	return variants
}

// getPublishTaskHandler 查询单个发布任务状态。
func getPublishTaskHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		taskID := pathvar.Vars(request)["id"]
		task, err := serviceContext.PublishRepository.Get(request.Context(), taskID)
		if errors.Is(err, repository.ErrPublishTaskNotFound) {
			writeError(responseWriter, http.StatusNotFound, "发布任务不存在")
			return
		}
		if err != nil {
			logx.Errorf("get publish task %s: %v", taskID, err)
			writeError(responseWriter, http.StatusInternalServerError, "读取发布任务失败")
			return
		}

		writeJSON(responseWriter, http.StatusOK, publishTaskToResponse(task))
	}
}

// retryPublishTaskHandler 重新排队失败或等待登录的发布任务。
func retryPublishTaskHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		taskID := pathvar.Vars(request)["id"]
		task, err := serviceContext.PublishRepository.Get(request.Context(), taskID)
		if errors.Is(err, repository.ErrPublishTaskNotFound) {
			writeError(responseWriter, http.StatusNotFound, "发布任务不存在")
			return
		}
		if err != nil {
			logx.Errorf("load publish task %s for retry: %v", taskID, err)
			writeError(responseWriter, http.StatusInternalServerError, "读取发布任务失败")
			return
		}
		if task.Status != model.PublishTaskFailed && task.Status != model.PublishTaskNeedsLogin {
			writeError(responseWriter, http.StatusConflict, "当前任务状态不能重试")
			return
		}

		if err := queueFailedTask(request.Context(), serviceContext, task); err != nil {
			writeError(responseWriter, http.StatusConflict, err.Error())
			return
		}
		task.Status = model.PublishTaskQueued
		task.ErrorMessage = ""
		task.UpdatedAt = time.Now()

		writeJSON(responseWriter, http.StatusAccepted, publishTaskToResponse(task))
	}
}

// listPublishTasksHandler 返回最近 50 条发布任务。
func listPublishTasksHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		tasks, err := serviceContext.PublishRepository.List(request.Context(), 50)
		if err != nil {
			logx.Errorf("list publish tasks: %v", err)
			writeError(responseWriter, http.StatusInternalServerError, "读取发布记录失败")
			return
		}

		responses := make([]types.PublishTaskResponse, 0, len(tasks))
		for _, task := range tasks {
			responses = append(responses, publishTaskToResponse(task))
		}
		writeJSON(responseWriter, http.StatusOK, types.PublishTaskListResponse{List: responses})
	}
}

// validatePublishTaskRequest 返回首个用户可读校验错误。
func validatePublishTaskRequest(requestBody types.CreatePublishTaskRequest) string {
	if strings.TrimSpace(requestBody.Title) == "" {
		return "商品标题不能为空"
	}
	if len([]rune(requestBody.Title)) > 120 {
		return "商品标题不能超过 120 个字符"
	}
	if len([]rune(requestBody.Description)) > 1500 {
		return "商品描述不能超过 1500 个字符"
	}
	if requestBody.PriceCents <= 0 {
		return "售价必须大于 0"
	}
	if requestBody.OriginalPriceCents < 0 {
		return "原价不能小于 0"
	}
	imageURLs := uniqueImageURLs(requestBody.ImageURLs)
	if len(imageURLs) == 0 {
		return "至少需要一张商品图片"
	}
	if len(imageURLs) > 9 {
		return "商品图片不能超过 9 张"
	}
	return ""
}

// uniqueStrings 清理并去重字符串列表。
func uniqueStrings(values []string) []string {
	uniqueValues := make([]string, 0, len(values))
	seenValues := make(map[string]struct{}, len(values))
	for _, value := range values {
		trimmedValue := strings.TrimSpace(value)
		if trimmedValue == "" {
			continue
		}
		if _, exists := seenValues[trimmedValue]; exists {
			continue
		}
		seenValues[trimmedValue] = struct{}{}
		uniqueValues = append(uniqueValues, trimmedValue)
	}
	return uniqueValues
}

// uniqueImageURLs 清理并去重商品图片地址。
func uniqueImageURLs(imageURLs []string) []string {
	uniqueURLs := make([]string, 0, len(imageURLs))
	seenURLs := make(map[string]struct{}, len(imageURLs))
	for _, imageURL := range imageURLs {
		trimmedURL := strings.TrimSpace(imageURL)
		if trimmedURL == "" {
			continue
		}
		if _, exists := seenURLs[trimmedURL]; exists {
			continue
		}
		seenURLs[trimmedURL] = struct{}{}
		uniqueURLs = append(uniqueURLs, trimmedURL)
	}
	return uniqueURLs
}

// publishTaskToResponse 将数据库任务转换为精简响应。
func publishTaskToResponse(task model.PublishTask) types.PublishTaskResponse {
	return types.PublishTaskResponse{
		Action:        task.Action,
		ChangeReasons: task.ChangeReasons,
		ID:            task.ID,
		Status:        task.Status,
		ItemNo:        task.ItemNo,
		Title:         task.Title,
		Brand:         task.Brand,
		PriceCents:    task.PriceCents,
		XianyuItemID:  task.XianyuItemID,
		XianyuURL:     task.XianyuURL,
		ErrorMessage:  task.ErrorMessage,
		CreatedAt:     task.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     task.UpdatedAt.Format(time.RFC3339),
	}
}
