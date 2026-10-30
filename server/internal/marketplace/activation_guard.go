package marketplace

import (
	"context"
	"fmt"
	"time"

	"sidejob-server/internal/model"
)

const publishSnapshotLifetime = time.Minute

// EnsureActivationSnapshot 同一账号同批次只刷新一次完整在售，随后复用即时登记的本地结果。
// 单件发布仍使用短期缓存；失败/不确定提交会显式失效，不能继续沿用旧快照。
func (service *Service) EnsureActivationSnapshot(ctx context.Context, accountID, batchID string) error {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	return service.ensureActivationSnapshot(ctx, accountID, batchID, func() (int, error) {
		return service.syncXianyuSnapshot(ctx, accountID)
	})
}

func (service *Service) ensureActivationSnapshot(ctx context.Context, accountID, batchID string, refresh func() (int, error)) error {
	state := service.stateForAccount(accountID)
	if err := lockMarketplaceState(ctx, &state.mutex); err != nil {
		return err
	}
	defer state.mutex.Unlock()
	if err := ctx.Err(); err != nil {
		return err
	}
	if batchID != "" && state.activationBatchID == batchID && !state.lastFullSync.IsZero() {
		return nil
	}
	if !state.lastFullSync.IsZero() && time.Since(state.lastFullSync) < publishSnapshotLifetime {
		state.activationBatchID = batchID
		return nil
	}
	started := time.Now()
	count, err := refresh()
	if err != nil {
		state.activationBatchID = ""
		state.lastFullSync = time.Time{}
		return err
	}
	state.lastFullSync, state.lastFullSyncCount = started, count
	state.activationBatchID = batchID
	return nil
}

// InvalidateActivationSnapshot 任何可能已提交但未确认的结果，都要求下一次重新回查。
func (service *Service) InvalidateActivationSnapshot(accountID string) {
	state := service.stateForAccount(accountID)
	state.mutex.Lock()
	defer state.mutex.Unlock()
	state.activationBatchID = ""
	state.lastFullSync = time.Time{}
}

// CheckListingActivation 是所有新建/恢复入口及 worker 共用的最后防重检查。
func (service *Service) CheckListingActivation(ctx context.Context, task model.PublishTask) error {
	if !model.IsListingActivationAction(task.Action) {
		return nil
	}
	if err := model.ValidateListingSourcePriceCeiling(task.SourcePriceCents, task.OriginalPriceCents, task.PriceCents, task.Variants); err != nil {
		return err
	}
	if model.ItemNoKey(task.ItemNo) == "" {
		return fmt.Errorf("缺少货号，不能安全检查重复发布")
	}
	if err := service.EnsureActivationSnapshot(ctx, task.AccountID, task.BatchID); err != nil {
		return fmt.Errorf("发布前核对闲鱼在售失败，未提交：%w", err)
	}
	listings, err := service.listingRepository.ListActivationConflictsByItemNos(ctx, task.AccountID, model.XianyuPlatform, []string{task.ItemNo})
	if err != nil {
		return err
	}
	return activationConflict(task, listings)
}

func activationConflict(task model.PublishTask, listings []model.MarketplaceListing) error {
	for _, listing := range listings {
		if model.ItemNoKey(listing.ItemNo) != model.ItemNoKey(task.ItemNo) {
			continue
		}
		if listing.SaleStatus == model.MarketplaceStatusUnknown {
			return fmt.Errorf("货号%s状态待核验，未重复发布/恢复", task.ItemNo)
		}
		if task.Action == model.PublishActionRelist && listing.PlatformItemID == task.XianyuItemID {
			continue
		}
		return fmt.Errorf("货号%s已有在售链接%s，已阻止重复新建或恢复", task.ItemNo, listing.PlatformItemID)
	}
	return nil
}
