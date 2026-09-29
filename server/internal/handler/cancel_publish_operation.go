package handler

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/pathvar"

	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
)

// cancelPublishOperationHandler 取消当前发布批次中尚未执行的任务。
func cancelPublishOperationHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		operationID := pathvar.Vars(request)["id"]
		if _, err := serviceContext.PublishBatchRepository.Cancel(request.Context(), operationID); err != nil {
			if err == repository.ErrPublishBatchNotFound {
				writeError(responseWriter, http.StatusConflict, "队列已完成、已取消或不存在")
				return
			}
			writeError(responseWriter, http.StatusInternalServerError, "取消队列失败")
			return
		}
		if _, err := serviceContext.PublishRepository.CancelByBatchID(request.Context(), operationID); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "取消队列任务失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, map[string]any{"id": operationID, "status": "cancelled", "message": "队列已取消，已完成任务保留"})
	}
}
