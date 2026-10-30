package handler

import (
	"context"
	"fmt"
	"strings"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
)

const syncedSourceRequired = "货源尚未完整同步，请先到同步中心同步聚合品牌"

// readSyncedSource accepts only an activated complete generation. It never falls back to the mini program.
func readSyncedSource(ctx context.Context, sc *svc.ServiceContext, profileID, regionID, distributorID string) (catalog.SyncCenterSnapshot, error) {
	if sc == nil || sc.SyncCenter == nil {
		return catalog.SyncCenterSnapshot{}, fmt.Errorf(syncedSourceRequired)
	}
	if profileID != "" {
		return sc.SyncCenter.ReadProfile(ctx, profileID)
	}
	return sc.SyncCenter.ReadStore(ctx, regionID, distributorID)
}

func syncedSnapshotProducts(snapshot catalog.SyncCenterSnapshot, categories []string) []map[string]any {
	selected := make(map[string]bool, len(categories))
	for _, id := range categories {
		selected[id] = true
	}
	rows := make([]map[string]any, 0, len(snapshot.Products))
	for _, product := range snapshot.Products {
		if !sourceMatchesCategories(product.Data, product.CategoryIDs, selected) {
			continue
		}
		row := cloneSyncedMap(product.Data)
		row["_primary_region"] = product.RegionID
		row["_source_regions"] = []string{product.RegionID}
		row["_source_member_ids"] = []string{product.RegionID + ":" + product.DistributorID}
		row["_source_item_ids"] = []string{product.ItemID}
		row["_sync_generation"] = snapshot.Generation
		rows = append(rows, row)
	}
	return rows
}

// syncedSourceDetail uses the already loaded full source document, avoiding one database query per SKU.
func syncedSourceDetail(_ context.Context, source map[string]any, _ string) (map[string]any, error) {
	if firstProductString(source, "_sync_generation") == "" {
		return nil, fmt.Errorf(syncedSourceRequired)
	}
	return source, nil
}

func validateTaskSourceVersion(ctx context.Context, sc *svc.ServiceContext, task model.PublishTask) error {
	if task.SourceSyncVersion == "" {
		return fmt.Errorf("任务使用旧版货源，请重新生成预览")
	}
	if task.BrandProfileID != "" {
		if sc == nil || sc.SyncCenter == nil {
			return fmt.Errorf(syncedSourceRequired)
		}
		return sc.SyncCenter.ValidateVersion(ctx, task.BrandProfileID, task.SourceSyncVersion)
	}
	distributorID := ""
	if len(task.SourceMemberIDs) > 0 {
		for _, key := range task.SourceMemberIDs {
			region, store, ok := splitSourceMember(key)
			if ok && (task.RegionID == "" || task.RegionID == region) {
				distributorID = store
				break
			}
		}
	}
	snapshot, err := readSyncedSource(ctx, sc, task.BrandProfileID, task.RegionID, distributorID)
	if err != nil {
		return err
	}
	if snapshot.Generation != task.SourceSyncVersion {
		return fmt.Errorf("货源同步版本已更新，请重新生成预览")
	}
	return nil
}

func splitSourceMember(key string) (string, string, bool) {
	region, store, ok := strings.Cut(key, ":")
	return region, store, ok && region != "" && store != ""
}

func syncedSnapshotCategories(snapshot catalog.SyncCenterSnapshot) []catalog.BrandCategory {
	return localSourceCategories(snapshot.Products)
}

func cloneSyncedMap(source map[string]any) map[string]any {
	result := make(map[string]any, len(source))
	for key, value := range source {
		result[key] = cloneSyncedValue(value)
	}
	return result
}
func cloneSyncedValue(value any) any {
	switch value := value.(type) {
	case map[string]any:
		return cloneSyncedMap(value)
	case []any:
		result := make([]any, len(value))
		for index, item := range value {
			result[index] = cloneSyncedValue(item)
		}
		return result
	default:
		return value
	}
}
