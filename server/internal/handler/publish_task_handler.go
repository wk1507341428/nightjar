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
		task := model.PublishTask{
			ID:                 primitive.NewObjectID().Hex(),
			SourceItemID:       strings.TrimSpace(requestBody.SourceItemID),
			ItemNo:             strings.TrimSpace(requestBody.ItemNo),
			Title:              strings.TrimSpace(requestBody.Title),
			Description:        strings.TrimSpace(requestBody.Description),
			PriceCents:         requestBody.PriceCents,
			OriginalPriceCents: requestBody.OriginalPriceCents,
			ImageURLs:          uniqueImageURLs(requestBody.ImageURLs),
			RegionID:           strings.TrimSpace(requestBody.RegionID),
			Brand:              strings.TrimSpace(requestBody.Brand),
			Condition:          strings.TrimSpace(requestBody.Condition),
			AvailableSizes:     uniqueStrings(requestBody.AvailableSizes),
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
		if task.BatchID != "" {
			batch, batchErr := serviceContext.PublishBatchRepository.Get(request.Context(), task.BatchID)
			if batchErr != nil {
				writeError(responseWriter, http.StatusInternalServerError, "读取批量发布计划失败")
				return
			}
			sourceProduct := map[string]any{"default_item_id": task.SourceItemID, "item_no": task.ItemNo, "item_name": strings.TrimPrefix(task.Title, "【全新】"), "goods_brand": task.Brand}
			detailProduct, detailErr := serviceContext.CatalogService.GetLiveProductDetail(request.Context(), sourceProduct, task.RegionID)
			if detailErr != nil {
				writeError(responseWriter, http.StatusBadGateway, "重试前读取实时商品详情失败")
				return
			}
			rebuiltTask, rebuildErr := buildBatchPublishTask(task.BatchID, publishBatchPlan{BrandStoreID: batch.BrandStoreID, BrandName: batch.BrandName, RegionID: batch.RegionID, CategoryIDs: batch.CategoryIDs, CategoryNames: batch.CategoryNames, MinDelaySeconds: batch.MinDelaySeconds, MaxDelaySeconds: batch.MaxDelaySeconds}, detailProduct, task.CreatedAt)
			if rebuildErr != nil {
				writeError(responseWriter, http.StatusBadGateway, rebuildErr.Error())
				return
			}
			rebuiltTask.ID = task.ID
			if err := serviceContext.PublishRepository.UpdateContent(request.Context(), rebuiltTask); err != nil {
				writeError(responseWriter, http.StatusInternalServerError, "更新批量发布任务内容失败")
				return
			}
			task = rebuiltTask
		}

		now := time.Now()
		if err := serviceContext.PublishRepository.UpdateStatus(request.Context(), taskID, model.PublishTaskQueued, "", "", ""); err != nil {
			logx.Errorf("queue publish task %s for retry: %v", taskID, err)
			writeError(responseWriter, http.StatusInternalServerError, "重新排队失败")
			return
		}
		if err := serviceContext.PublishService.Enqueue(taskID); err != nil {
			_ = serviceContext.PublishRepository.UpdateStatus(request.Context(), taskID, model.PublishTaskFailed, "发布队列已满", "", "")
			writeError(responseWriter, http.StatusServiceUnavailable, "发布队列繁忙，请稍后重试")
			return
		}

		task.Status = model.PublishTaskQueued
		task.ErrorMessage = ""
		task.UpdatedAt = now
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
		ID:           task.ID,
		Status:       task.Status,
		ItemNo:       task.ItemNo,
		Title:        task.Title,
		PriceCents:   task.PriceCents,
		XianyuItemID: task.XianyuItemID,
		XianyuURL:    task.XianyuURL,
		ErrorMessage: task.ErrorMessage,
		CreatedAt:    task.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    task.UpdatedAt.Format(time.RFC3339),
	}
}
