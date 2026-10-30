package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

const aggregateSnapshotVersion = "synced_source_stock_v5"

// refreshAggregatePreview 后台入队前重新对账；动作变化须重新展示，不能静默追加未预览的下架。
func refreshAggregatePreview(ctx context.Context, sc *svc.ServiceContext, request types.CreatePublishBatchRequest, previous publishBatchPlan, preserved []string) (publishBatchPlan, error) {
	if previous.SourceSnapshotVersion != aggregateSnapshotVersion {
		return previous, fmt.Errorf("聚合品牌对账规则已更新，请重新生成预览")
	}
	if previous.SourceSyncVersion == "" {
		return previous, fmt.Errorf("旧预览缺少同步版本，请重新生成预览")
	}
	if previous.BrandProfileID != "" {
		if sc == nil || sc.SyncCenter == nil {
			return previous, fmt.Errorf(syncedSourceRequired)
		}
		if err := sc.SyncCenter.ValidateVersion(ctx, previous.BrandProfileID, previous.SourceSyncVersion); err != nil {
			return previous, err
		}
	} else {
		snapshot, err := readSyncedSource(ctx, sc, "", previous.RegionID, previous.DistributorID)
		if err != nil {
			return previous, err
		}
		if snapshot.Generation != previous.SourceSyncVersion {
			return previous, fmt.Errorf("货源同步版本已更新，请重新生成预览")
		}
	}
	return previous, nil
}

func selectPreviewActions(plan *publishBatchPlan, limit int, preserved []string) {
	plan.Relists = plan.Relists[:minInt(limit, len(plan.Relists))]
	remaining := max(0, limit-len(plan.Relists))
	plan.Candidates = plan.Candidates[:minInt(remaining, len(plan.Candidates))]
	plan.OfflineListings = excludePreservedOfflineListings(plan.OfflineListings, preserved)
}

// aggregateActionSnapshot 忽略任务ID和生成时间，比较用户已预览的实际操作和内容。
func aggregateActionSnapshot(plan publishBatchPlan) (string, error) {
	states := make(map[string]any)
	for _, product := range plan.Candidates {
		task, err := buildBatchPublishTask("", plan, product, time.Time{})
		if err != nil {
			return "", err
		}
		task.Action = model.PublishActionPublish
		addAggregateActionState(states, task)
	}
	for _, task := range append(append([]model.PublishTask{}, plan.Relists...), plan.Updates...) {
		addAggregateActionState(states, task)
	}
	for _, listing := range plan.OfflineListings {
		states[model.PublishActionOffline+":"+listing.PlatformItemID] = offlineListingReasons(plan, listing)
	}
	data, err := json.Marshal(states)
	return string(data), err
}

func addAggregateActionState(states map[string]any, task model.PublishTask) {
	key := task.Action + ":" + model.ItemNoKey(task.ItemNo) + ":" + task.XianyuItemID
	states[key] = struct {
		Title                     string
		Price, Original, Quantity int64
		Images                    []string
		Variants                  []model.PublishVariant
	}{task.Title, task.PriceCents, task.OriginalPriceCents, task.Quantity, task.ImageURLs, task.Variants}
}
