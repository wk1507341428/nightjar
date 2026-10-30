package handler

import (
	"context"
	"fmt"

	"sidejob-server/internal/svc"
)

// loadReconcileSources reads activated local snapshots; fresh is retained only for loader compatibility.
// Snapshot completeness is validated before absent articles can be interpreted as out of stock.
func loadReconcileSources(ctx context.Context, sc *svc.ServiceContext, keys []string, _ bool) ([]map[string]any, error) {
	rows := make([]map[string]any, 0)
	for _, key := range keys {
		region, store, ok := splitSourceMember(key)
		if !ok {
			return nil, fmt.Errorf("门店来源无效")
		}
		snapshot, err := readSyncedSource(ctx, sc, "", region, store)
		if err != nil {
			return nil, err
		}
		rows = append(rows, syncedSnapshotProducts(snapshot, nil)...)
	}
	return rows, nil
}
