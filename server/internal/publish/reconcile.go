package publish

import (
	"context"
	"fmt"
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
)

// processReconcileTask 与发布共用串行 worker，并持久保存每个商品的执行结果。
func (service *Service) processReconcileTask(ctx context.Context, task model.PublishTask) {
	if service.RefreshReconcile == nil {
		service.failTask(ctx, task.ID, "对账服务未就绪")
		return
	}
	refreshed, refreshErr := service.RefreshReconcile(ctx, task)
	if refreshErr != nil {
		service.failTask(ctx, task.ID, refreshErr.Error())
		return
	}
	task = refreshed
	if task.Action == "update" {
		if err := service.repository.UpdateContent(ctx, task); err != nil {
			service.failTask(ctx, task.ID, err.Error())
			return
		}
	}
	if err := service.repository.UpdateStatus(ctx, task.ID, model.PublishTaskPublishing, "", "", ""); err != nil {
		return
	}
	var err error
	if task.Action == "offline" {
		result, callErr := service.marketplace.OfflineXianyuListings(ctx, []string{task.XianyuItemID})
		err = callErr
		if err == nil && len(result.SucceededItemIDs) != 1 {
			err = fmt.Errorf("闲鱼未确认下架成功")
		}
	} else {
		err = service.xianyuService.EditManagedItem(ctx, task.XianyuItemID, xianyu.PublishInput{Quantity: task.Quantity, Title: task.Title, Description: task.Description, PriceCents: task.PriceCents, OriginalPriceCents: task.OriginalPriceCents, Variants: xianyuPublishVariants(task.Variants)}, task.Before)
		if err == nil {
			err = service.marketplace.MarkXianyuPublished(ctx, task, xianyu.PublishResult{ItemID: task.XianyuItemID, URL: task.XianyuURL})
		}
	}
	if err != nil {
		service.failTask(ctx, task.ID, err.Error())
		return
	}
	_ = service.repository.UpdateStatus(ctx, task.ID, model.PublishTaskSucceeded, "", task.XianyuItemID, task.XianyuURL)
}
