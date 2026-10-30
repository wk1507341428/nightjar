package publish

import (
	"context"
	"errors"
	"fmt"
	"github.com/zeromicro/go-zero/core/logx"
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
)

// prepareTaskRetry 复核重试内容并持久化，不放宽原有动作权限。
func (service *Service) prepareTaskRetry(ctx context.Context, task model.PublishTask) (model.PublishTask, error) {
	if !task.RetryRequested {
		return task, nil
	}
	if service.PrepareRetry == nil {
		return task, fmt.Errorf("重试服务未就绪")
	}
	prepared, err := service.PrepareRetry(ctx, task)
	if err != nil {
		return task, err
	}
	if err = service.repository.UpdateContent(ctx, prepared); err == nil {
		err = service.repository.FinishRetryPreparation(ctx, prepared)
	}
	return prepared, err
}

// refreshActivationTask 新品/恢复执行前重新核验，确认无货只能阻止激活，不会生成下架。
func (service *Service) refreshActivationTask(ctx context.Context, task model.PublishTask) (model.PublishTask, error) {
	if !model.IsListingActivationAction(task.Action) {
		return task, nil
	}
	if task.SourceSyncVersion == "" {
		return task, fmt.Errorf("任务使用旧版货源，请重新生成预览")
	}
	if service.RefreshReconcile == nil {
		return task, fmt.Errorf("发布前商详核对服务未就绪")
	}
	refreshed, err := service.RefreshReconcile(ctx, task)
	if err != nil {
		return task, err
	}
	if !model.IsListingActivationAction(refreshed.Action) {
		return task, fmt.Errorf("发布复核返回了未授权动作，已停止执行")
	}
	return refreshed, service.repository.UpdateContent(ctx, refreshed)
}

// processRelistTask 复用历史链接，保留原有权限与登录失效处理。
func (service *Service) processRelistTask(runtimeContext context.Context, task model.PublishTask, account model.XianyuAccount, imagePaths []string, variantImagePaths map[string]string) {
	input := xianyu.PublishInput{Quantity: task.Quantity, Title: task.Title, Description: task.Description, PriceCents: task.PriceCents, OriginalPriceCents: task.OriginalPriceCents, ImagePaths: imagePaths, RegionID: task.RegionID, Brand: task.Brand, Condition: task.Condition, AvailableSizes: task.AvailableSizes, Variants: xianyuPublishVariants(task.Variants, variantImagePaths), IsFootwear: task.IsFootwear}
	if err := service.marketplace.RequireManagedItems(runtimeContext, task.AccountID, []string{task.XianyuItemID}); err != nil {
		service.failTask(runtimeContext, task.ID, err.Error())
		return
	}
	if err := service.xianyuService.ForAccount(task.AccountID).ReactivateManagedItem(runtimeContext, task.XianyuItemID, input, task.Before); err != nil {
		service.marketplace.InvalidateActivationSnapshot(task.AccountID)
		if service.stopOnPublishCountLimit(task, err) {
			return
		}
		if errors.Is(err, xianyu.ErrSessionExpired) {
			_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskNeedsLogin, "闲鱼登录已失效，请重新连接该账号", "", "")
			_ = service.accountRepository.UpdateConnection(runtimeContext, task.AccountID, "seller", account.DisplayName, account.PlatformUserID, false, false)
			_ = service.accountRepository.Update(runtimeContext, task.AccountID, "", model.XianyuAccountPaused)
			return
		}

		var unconfirmed *xianyu.UnconfirmedRelistError
		if errors.As(err, &unconfirmed) {
			if observeErr := service.marketplace.RecordObservedListingStatus(runtimeContext, task.AccountID, task.XianyuItemID, unconfirmed.Status); observeErr != nil {
				err = fmt.Errorf("%w；保存观察状态失败：%v", err, observeErr)
			}
			service.marketplace.InvalidateActivationSnapshot(task.AccountID)
		}
		service.failTask(runtimeContext, task.ID, "恢复历史商品失败："+err.Error())
		return
	}
	// 恢复只复用所选链接，不自动永久删除其它历史商品。
	if err := service.marketplace.MarkXianyuPublished(runtimeContext, task, xianyu.PublishResult{ItemID: task.XianyuItemID, URL: task.XianyuURL}); err != nil {
		service.marketplace.InvalidateActivationSnapshot(task.AccountID)
		logx.Errorf("mark relisted xianyu item %s: %v", task.XianyuItemID, err)
	}
	_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskSucceeded, "", task.XianyuItemID, task.XianyuURL)
	return

}
