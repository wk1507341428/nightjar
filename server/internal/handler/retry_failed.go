package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/zeromicro/go-zero/rest/pathvar"
	"net/http"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/xianyu"
	"strings"
	"time"
)

// queueFailedTask 与单条重试共享原子领取逻辑，成功和运行任务不会重新入队。
func queueFailedTask(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) error {
	claimed, err := sc.PublishRepository.ClaimRetry(ctx, task.ID)
	if err != nil {
		return err
	}
	if !claimed {
		return fmt.Errorf("任务已入队、非失败状态或已由用户取消")
	}
	if err = sc.PublishService.Enqueue(task.ID); err != nil {
		_ = sc.PublishRepository.UpdateStatus(ctx, task.ID, model.PublishTaskFailed, "队列容量不足，请稍后重试", "", "")
		return err
	}
	if task.BatchID != "" {
		_ = sc.PublishBatchRepository.MarkStatus(ctx, task.BatchID, model.PublishBatchRunning)
	}
	return nil
}

func retryFailedOperationHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Action  string   `json:"action"`
			TaskIDs []string `json:"taskIds"`
		}
		if json.NewDecoder(r.Body).Decode(&body) != nil {
			writeError(w, 400, "重试参数无效")
			return
		}
		if body.Action != "" && body.Action != "publish" && body.Action != "update" && body.Action != "offline" {
			writeError(w, 400, "任务类型无效")
			return
		}
		tasks, err := sc.PublishRepository.ListByBatchID(r.Context(), pathvar.Vars(r)["id"])
		if err != nil {
			writeError(w, 500, "读取任务失败")
			return
		}
		requested := map[string]bool{}
		for _, id := range body.TaskIDs {
			requested[id] = true
		}
		selected := []model.PublishTask{}
		for _, task := range tasks {
			action := task.Action
			if action == "" {
				action = "publish"
			}
			if len(requested) > 0 && !requested[task.ID] {
				continue
			}
			if body.Action != "" && action != body.Action {
				continue
			}
			if task.Status == model.PublishTaskFailed || task.Status == model.PublishTaskNeedsLogin {
				selected = append(selected, task)
			}
		}
		queued := []string{}
		rejected := []map[string]string{}
		for _, task := range selected {
			if err := queueFailedTask(r.Context(), sc, task); err != nil {
				rejected = append(rejected, map[string]string{"itemNo": task.ItemNo, "reason": err.Error()})
			} else {
				queued = append(queued, task.ID)
			}
		}
		writeJSON(w, 200, map[string]any{"queued": queued, "rejected": rejected})
	}
}

// prepareRetryContent 重新读取货源和远端状态，避免用旧 SKU 内容重试。
func prepareRetryContent(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) (model.PublishTask, error) {
	if task.Action == "offline" {
		return task, nil
	} // 下架 worker 自身会再次实时核对全部来源。
	if task.Action == "update" {
		detail, err := sc.SellerXianyuService.GetSellerEditDetail(ctx, task.XianyuItemID)
		if err != nil {
			return task, err
		}
		task.Before = xianyu.ManagedState(detail)
		return task, nil
	}
	// 同步渠道快照后去重：网络不确定的上一次发布可能已经成功。
	if err := sc.MarketplaceService.EnsureRetrySnapshot(ctx, retryRequiresFreshSnapshot(task.ErrorMessage)); err != nil {
		return task, fmt.Errorf("重试前核对闲鱼在售状态失败：%w", err)
	}
	listed, err := sc.ListingRepository.ListByItemNos(ctx, "xianyu", []string{task.ItemNo})
	if err != nil {
		return task, err
	}
	if len(listed) > 0 {
		return task, fmt.Errorf("货号%s已在闲鱼在售，已阻止重复发布，请同步渠道记录", task.ItemNo)
	}
	if task.BrandProfileID != "" || len(task.SourceMemberIDs) > 0 {
		return refreshReconcileTask(ctx, sc, task)
	}
	product, err := sc.CatalogService.GetLiveProductDetail(ctx, map[string]any{"default_item_id": task.SourceItemID, "item_no": task.ItemNo}, task.RegionID)
	if err != nil {
		return task, err
	}
	updated, err := buildBatchPublishTask(task.BatchID, publishBatchPlan{RegionID: task.RegionID, BrandName: task.Brand, MinDelaySeconds: task.MinDelaySeconds, MaxDelaySeconds: task.MaxDelaySeconds}, product, time.Now())
	if err != nil {
		return task, err
	}
	updated.ID = task.ID
	return updated, nil
}

// 对发布结果可能不确定的错误强制刷新，避免超时后重复发布；已知准备失败可复用快照。
func retryRequiresFreshSnapshot(message string) bool {
	if strings.Contains(message, "发布接口失败") || strings.Contains(message, "发布成功响应缺少") || strings.Contains(message, "中断") {
		return true
	}
	for _, known := range []string{"准备商品图片失败", "图片上传失败", "登录已失效", "读取实时商品详情失败", "读取完整商详失败", "货源", "图片不完整"} {
		if strings.Contains(message, known) {
			return false
		}
	}
	return true
}
