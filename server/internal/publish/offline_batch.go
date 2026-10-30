package publish

import (
	"context"
	"errors"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/marketplace"
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
)

func (service *Service) claimOfflineBatchTasks(ctx context.Context, tasks []model.PublishTask) []model.PublishTask {
	executable := make([]model.PublishTask, 0, len(tasks))
	for _, task := range tasks {
		claimed, err := service.repository.MarkPublishingIfExecutable(ctx, task.ID)
		if err != nil {
			logx.Errorf("claim offline task %s: %v", task.ID, err)
			continue
		}
		if !claimed {
			continue
		}
		freshTask, err := service.repository.Get(ctx, task.ID)
		if err != nil {
			logx.Errorf("reload offline task %s: %v", task.ID, err)
			continue
		}
		executable = append(executable, freshTask)
	}
	return executable
}

func (service *Service) prepareOfflineBatchRetries(ctx context.Context, tasks []model.PublishTask) []model.PublishTask {
	needsSourceCheck := false
	for _, task := range tasks {
		needsSourceCheck = needsSourceCheck || task.RetryRequested || automaticSourceOffline(task)
	}
	if !needsSourceCheck {
		return tasks
	}
	if service.PrepareOfflineBatch == nil {
		eligible := make([]model.PublishTask, 0, len(tasks))
		for _, task := range tasks {
			if automaticSourceOffline(task) {
				service.failTask(ctx, task.ID, "缺货下架复核服务未就绪")
				continue
			}
			eligible = append(eligible, task)
		}
		return eligible
	}
	checks := service.PrepareOfflineBatch(ctx, tasks)
	eligible := make([]model.PublishTask, 0, len(tasks))
	for _, task := range tasks {
		if task.RetryRequested || automaticSourceOffline(task) {
			if err := checks[task.ID]; err != nil {
				_ = service.repository.UpdateStatus(ctx, task.ID, model.PublishTaskFailed, err.Error(), "", "")
				continue
			}
			if task.RetryRequested {
				_ = service.repository.FinishRetryPreparation(ctx, task)
			}
		}
		eligible = append(eligible, task)
	}
	return eligible
}

// automaticSourceOffline 包含旧版筛选下架任务，确保首次执行也经过新策略核验。
func automaticSourceOffline(task model.PublishTask) bool {
	return task.StockOutOffline || task.SourceSyncVersion != "" || (task.BrandProfileID != "" && task.ReconcileMode != "")
}

func offlineBatchItemIDs(tasks []model.PublishTask) []string {
	ids := make([]string, 0, len(tasks))
	seen := make(map[string]struct{}, len(tasks))
	for _, task := range tasks {
		if _, exists := seen[task.XianyuItemID]; exists {
			continue
		}
		seen[task.XianyuItemID] = struct{}{}
		ids = append(ids, task.XianyuItemID)
	}
	return ids
}

func (service *Service) failOfflineBatch(ctx context.Context, tasks []model.PublishTask, err error) {
	status, message := model.PublishTaskFailed, err.Error()
	if len(tasks) > 0 {
		service.stopOnPublishCountLimit(tasks[0], err)
	}
	if errors.Is(err, xianyu.ErrSessionExpired) {
		accountID := tasks[0].AccountID
		if account, accountErr := service.accountRepository.Get(ctx, accountID); accountErr == nil {
			_ = service.accountRepository.UpdateConnection(ctx, accountID, "seller", account.DisplayName, account.PlatformUserID, false, false)
		}
		_ = service.accountRepository.Update(ctx, accountID, "", model.XianyuAccountPaused)
		status, message = model.PublishTaskNeedsLogin, "闲鱼登录已失效，请重新连接该账号"
	}
	for _, task := range tasks {
		_ = service.repository.UpdateStatus(ctx, task.ID, status, message, "", "")
	}
}

type offlineBatchResults struct {
	succeeded map[string]struct{}
	failed    map[string]struct{}
	errors    map[string]string
}

func (service *Service) resolveOfflineBatchResults(ctx context.Context, accountID string, result marketplace.OfflineResult) offlineBatchResults {
	resolved := offlineBatchResults{make(map[string]struct{}), make(map[string]struct{}), make(map[string]string)}
	for _, id := range result.SucceededItemIDs {
		resolved.succeeded[id] = struct{}{}
	}
	for _, id := range result.FailedItemIDs {
		resolved.failed[id] = struct{}{}
	}
	// 保留原有逐件兜底：仅重试渠道明确返回失败的商品。
	for id := range resolved.failed {
		single, err := service.marketplace.OfflineXianyuListings(ctx, accountID, []string{id})
		if err != nil {
			resolved.errors[id] = err.Error()
			if service.stopOnPublishCountLimit(model.PublishTask{AccountID: accountID}, err) {
				break
			}
			continue
		}
		if len(single.SucceededItemIDs) == 1 {
			resolved.succeeded[id] = struct{}{}
			delete(resolved.failed, id)
			continue
		}
		resolved.errors[id] = "闲鱼单件下架未成功"
	}
	return resolved
}

// finishOfflineBatchTasks 按任务 ID 回写，同一商品的重复任务也必须全部结束。
func (service *Service) finishOfflineBatchTasks(ctx context.Context, tasks []model.PublishTask, results offlineBatchResults) {
	for _, task := range tasks {
		status, message := results.taskStatus(task.XianyuItemID)
		if err := service.repository.UpdateStatus(ctx, task.ID, status, message, task.XianyuItemID, task.XianyuURL); err != nil {
			logx.Errorf("save offline task %s result: %v", task.ID, err)
		}
	}
}

func (result offlineBatchResults) taskStatus(itemID string) (string, string) {
	if _, ok := result.succeeded[itemID]; ok {
		return model.PublishTaskSucceeded, ""
	}
	if _, ok := result.failed[itemID]; ok {
		message := result.errors[itemID]
		if message == "" {
			message = "闲鱼批量下架失败"
		}
		return model.PublishTaskFailed, message
	}
	return model.PublishTaskFailed, "闲鱼未返回下架结果"
}
