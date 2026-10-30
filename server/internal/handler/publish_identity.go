package handler

import (
	"context"
	"errors"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/svc"
)

const duplicateActivationSkipReason = "确认时同货号已在售、已有任务或重复入选，已阻止重复发布"

type preparedPublishTasks struct {
	taskIDs       []string
	queuedTaskIDs []string
	skipped       []model.PublishBatchSkip
}

// persist 把并发创建冲突记为跳过，不中止同批其它商品或留下未入队记录。
func (prepared *preparedPublishTasks) persist(ctx context.Context, repo *repository.PublishTaskRepository, task model.PublishTask) error {
	err := repo.Create(ctx, task)
	if errors.Is(err, repository.ErrActivePublishTaskExists) {
		prepared.skipped = append(prepared.skipped, model.PublishBatchSkip{ItemNo: task.ItemNo, Title: task.Title, Reason: err.Error()})
		return nil
	}
	if err != nil {
		return err
	}
	prepared.taskIDs = append(prepared.taskIDs, task.ID)
	if task.Status == model.PublishTaskQueued {
		prepared.queuedTaskIDs = append(prepared.queuedTaskIDs, task.ID)
	}
	return nil
}

func prepareBatchChanges(batchID string, plan publishBatchPlan) []model.PublishTask {
	changes := make([]model.PublishTask, 0, len(plan.OfflineListings)+len(plan.Updates)+len(plan.Relists))
	for _, listing := range plan.OfflineListings {
		changes = append(changes, buildReconcileOfflineTask(plan, listing, time.Now()))
	}
	changes = append(changes, plan.Updates...)
	changes = append(changes, plan.Relists...)
	for index := range changes {
		task := &changes[index]
		task.SourceSyncVersion = plan.SourceSyncVersion
		task.ReconcileMode = plan.ActionMode
		task.MinDelaySeconds, task.MaxDelaySeconds = plan.MinDelaySeconds, plan.MaxDelaySeconds
		task.BatchID, task.Status = batchID, model.PublishTaskQueued
		task.CreatedAt = time.Now()
		task.UpdatedAt = task.CreatedAt
	}
	return changes
}

func prepareBatchSourceTask(ctx context.Context, sc *svc.ServiceContext, batch model.PublishBatch, plan publishBatchPlan, product map[string]any, taskIndex int) (model.PublishTask, error) {
	// 此商品已通过后台准备阶段的新鲜商详复核，不再用30分钟缓存覆盖已确认的价格和库存。
	createdAt := batch.CreatedAt.Add(time.Duration(taskIndex) * time.Millisecond)
	return buildBatchPublishTask(batch.ID, plan, product, createdAt)
}

// recheckPreviewActivations 旧预览提交时批量核对，不按商品逐件拉取远端列表。
func recheckPreviewActivations(ctx context.Context, sc *svc.ServiceContext, plan *publishBatchPlan) error {
	filterPreviewPriceCeiling(plan)
	itemNos := make([]string, 0, len(plan.Candidates)+len(plan.Relists))
	for _, product := range plan.Candidates {
		itemNos = append(itemNos, productString(product, "item_no"))
	}
	for _, task := range plan.Relists {
		itemNos = append(itemNos, task.ItemNo)
	}
	if len(itemNos) == 0 {
		return nil
	}
	listings, err := sc.ListingRepository.ListActivationConflictsByItemNos(ctx, plan.AccountID, model.XianyuPlatform, itemNos)
	if err != nil {
		return err
	}
	busy, err := sc.PublishRepository.ExistingItemNos(ctx, plan.AccountID, itemNos)
	if err != nil {
		return err
	}
	filterPreviewActivations(plan, listings, busy)
	return nil
}

func filterPreviewActivations(plan *publishBatchPlan, listings []model.MarketplaceListing, busy map[string]struct{}) {
	seen := make(map[string]bool, len(listings)+len(busy))
	for _, listing := range listings {
		seen[model.ItemNoKey(listing.ItemNo)] = true
	}
	for key := range busy {
		seen[model.ItemNoKey(key)] = true
	}
	candidates := make([]map[string]any, 0, len(plan.Candidates))
	for _, product := range plan.Candidates {
		itemNo := productString(product, "item_no")
		if seen[model.ItemNoKey(itemNo)] {
			plan.Skipped = append(plan.Skipped, model.PublishBatchSkip{ItemNo: itemNo, Title: productString(product, "item_name"), Reason: duplicateActivationSkipReason})
			continue
		}
		seen[model.ItemNoKey(itemNo)] = true
		candidates = append(candidates, product)
	}
	plan.Candidates = candidates
	relists := make([]model.PublishTask, 0, len(plan.Relists))
	for _, task := range plan.Relists {
		if seen[model.ItemNoKey(task.ItemNo)] {
			plan.Skipped = append(plan.Skipped, model.PublishBatchSkip{ItemNo: task.ItemNo, Title: task.Title, Reason: duplicateActivationSkipReason})
			continue
		}
		seen[model.ItemNoKey(task.ItemNo)] = true
		relists = append(relists, task)
	}
	plan.Relists = relists
}
