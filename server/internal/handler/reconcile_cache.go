package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"sidejob-server/internal/svc"
	"sort"
	"strings"
	"sync"
	"time"
)

// 只缓存完整成功的货源快照30秒；下架复核始终绕过缓存。
var reconcileSourceCache = struct {
	sync.Mutex
	entries map[string]reconcileSourceSnapshot
}{entries: make(map[string]reconcileSourceSnapshot)}

type reconcileSourceSnapshot struct {
	at   time.Time
	rows []byte
}

func loadReconcileSources(ctx context.Context, sc *svc.ServiceContext, keys []string, fresh bool) ([]map[string]any, error) {
	ordered := append([]string{}, keys...)
	sort.Strings(ordered)
	cacheKey := strings.Join(ordered, "|")
	reconcileSourceCache.Lock()
	snapshot, ok := reconcileSourceCache.entries[cacheKey]
	reconcileSourceCache.Unlock()
	if !fresh && ok && time.Since(snapshot.at) < 30*time.Second {
		var rows []map[string]any
		if json.Unmarshal(snapshot.rows, &rows) == nil {
			return rows, nil
		}
	}
	// 门店并行读取，实际网络并发仍受 CatalogService 全局信号量限制。
	started := time.Now()
	results := make([][]map[string]any, len(ordered))
	errs := make([]error, len(ordered))
	var group sync.WaitGroup
	for i, key := range ordered {
		group.Add(1)
		go func(i int, key string) {
			defer group.Done()
			parts := strings.SplitN(key, ":", 2)
			if len(parts) != 2 {
				errs[i] = fmt.Errorf("门店来源无效")
				return
			}
			rows, err := sc.CatalogService.ListLiveBrandOffers(ctx, parts[0], parts[1], nil)
			if err != nil {
				errs[i] = err
				return
			}
			for _, p := range rows {
				p["_source_regions"] = []string{parts[0]}
				p["_source_member_ids"] = []string{key}
				p["_primary_region"] = parts[0]
			}
			results[i] = rows
		}(i, key)
	}
	group.Wait()
	rows := []map[string]any{}
	for i, result := range results {
		if errs[i] != nil {
			return nil, errs[i]
		}
		rows = append(rows, result...)
	}
	encoded, err := json.Marshal(rows)
	if err != nil {
		return nil, err
	}
	reconcileSourceCache.Lock()
	for key, entry := range reconcileSourceCache.entries {
		if time.Since(entry.at) >= 30*time.Second {
			delete(reconcileSourceCache.entries, key)
		}
	}
	reconcileSourceCache.entries[cacheKey] = reconcileSourceSnapshot{at: started, rows: encoded}
	reconcileSourceCache.Unlock()
	return rows, nil
}
