package handler

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
)

const sourceStockOutReason = "全部来源已无可售库存"

// reconcileSourceKeys 每次按当前聚合品牌成员核对全部地区，不能只查上次有货门店。
func reconcileSourceKeys(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) ([]string, error) {
	keys := task.SourceMemberIDs
	if task.BrandProfileID != "" {
		_, members, err := sc.InventoryRepository.GetBrandProfile(ctx, task.BrandProfileID)
		if err != nil {
			return nil, err
		}
		keys = nil
		for _, member := range members {
			keys = append(keys, member.RegionID+":"+member.DistributorID)
		}
	}
	if len(keys) == 0 {
		return nil, fmt.Errorf("缺少可核对的货源门店，请重新关联")
	}
	return keys, nil
}

type reconcileRowsLoader func(context.Context, *svc.ServiceContext, []string, bool) ([]map[string]any, error)

func reconcileSourceProduct(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) (map[string]any, error) {
	if task.BrandProfileID == "" {
		return reconcileSourceProductWithLoader(ctx, sc, task, loadReconcileSources)
	}
	snapshot, err := sc.SyncCenter.ReadArticle(ctx, task.BrandProfileID, task.ItemNo)
	if err != nil {
		return nil, err
	}
	if snapshot.Generation != task.SourceSyncVersion {
		return nil, fmt.Errorf("货源同步版本已更新，请重新生成预览")
	}
	return reconcileArticleFromRows(ctx, sc, task.ItemNo, syncedSnapshotProducts(snapshot, nil))
}

func reconcileSourceProductWithLoader(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask, load reconcileRowsLoader) (map[string]any, error) {
	keys, err := reconcileSourceKeys(ctx, sc, task)
	if err != nil {
		return nil, err
	}
	rows, err := load(ctx, sc, keys, task.StockOutOffline)
	if err != nil {
		return nil, err
	}
	return reconcileArticleFromRows(ctx, sc, task.ItemNo, rows)
}

// reconcileStockOutTask 只有本次完整聚合对账授权的在售修改能转成缺货下架。
func reconcileStockOutTask(task model.PublishTask) (model.PublishTask, error) {
	if task.Action != model.PublishActionUpdate || task.ReconcileMode != model.PublishPresetFull || task.BrandProfileID == "" || task.XianyuItemID == "" {
		return task, fmt.Errorf("全部来源已无货，已停止发布或修改，请重新预览")
	}
	task.Action = model.PublishActionOffline
	task.StockOutOffline = true
	task.ChangeReasons = []string{sourceStockOutReason}
	return task, nil
}

func checkStockOutOffline(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) error {
	return checkStockOutOfflineWithLoader(ctx, sc, task, loadReconcileSources)
}

func checkStockOutOfflineWithLoader(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask, load reconcileRowsLoader) error {
	// 旧筛选下架任务不得在策略切换后继续执行；人工下架仍保留明确的用户意图。
	if automaticOfflineTask(task) && !task.StockOutOffline {
		return fmt.Errorf("下架规则已更新：仅全部地区无货允许自动下架，请重新生成预览")
	}
	if !task.StockOutOffline {
		return nil
	}
	if err := validateTaskSourceVersion(ctx, sc, task); err != nil {
		return err
	}
	var product map[string]any
	var err error
	if task.BrandProfileID != "" {
		product, err = reconcileSourceProduct(ctx, sc, task)
	} else {
		product, err = reconcileSourceProductWithLoader(ctx, sc, task, load)
	}
	if err != nil {
		return err
	}
	if product != nil {
		return fmt.Errorf("货源已恢复可售库存，已取消本次缺货下架，请重新预览")
	}
	return nil
}

func automaticOfflineTask(task model.PublishTask) bool {
	return task.StockOutOffline || task.SourceSyncVersion != "" || (task.BrandProfileID != "" && task.ReconcileMode != "")
}

func reconcileArticleFromRows(ctx context.Context, sc *svc.ServiceContext, itemNo string, rows []map[string]any) (map[string]any, error) {
	sources := make([]map[string]any, 0)
	for _, source := range rows {
		if model.ItemNoKey(productString(source, "item_no")) == model.ItemNoKey(itemNo) {
			sources = append(sources, source)
		}
	}
	product, validation := refreshPublishArticle(ctx, syncedSourceDetail, sources)
	return product, validation.err
}

// batchReconcileSourceLoader 仅在同一次下架批次复用刚读取的完整列表，避免逐件重复扫描整品牌。
func batchReconcileSourceLoader() reconcileRowsLoader {
	type snapshot struct {
		rows []map[string]any
		err  error
	}
	snapshots := make(map[string]snapshot)
	return func(ctx context.Context, sc *svc.ServiceContext, keys []string, fresh bool) ([]map[string]any, error) {
		ordered := append([]string{}, keys...)
		sort.Strings(ordered)
		key := strings.Join(ordered, "|")
		if cached, exists := snapshots[key]; exists {
			return cached.rows, cached.err
		}
		rows, err := loadReconcileSources(ctx, sc, ordered, fresh)
		snapshots[key] = snapshot{rows, err}
		return rows, err
	}
}
