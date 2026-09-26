package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/config"
	"sidejob-server/internal/svc"
)

// TestReconcileCacheReuseAndFreshOffline 验证复用快照、拷贝隔离、下架强制复核及错误不降级。
func TestReconcileCacheReuseAndFreshOffline(t *testing.T) {
	var calls atomic.Int32
	var fail atomic.Bool
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		if fail.Load() {
			http.Error(w, "failed", 502)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"data":{"total_count":1,"list":[{"item_no":"123","store":2}]}}`))
	}))
	defer upstream.Close()
	sc := &svc.ServiceContext{CatalogService: catalog.NewService(config.CatalogConfig{APIBase: upstream.URL}, nil, nil)}
	keys := []string{"test-region:test-store"}
	reconcileSourceCache.Lock()
	delete(reconcileSourceCache.entries, keys[0])
	reconcileSourceCache.Unlock()
	first, err := loadReconcileSources(context.Background(), sc, keys, false)
	if err != nil {
		t.Fatal(err)
	}
	first[0]["store"] = 999
	second, err := loadReconcileSources(context.Background(), sc, keys, false)
	if err != nil {
		t.Fatal(err)
	}
	if calls.Load() != 1 || productNumber(second[0], "store") != 2 {
		t.Fatal("cache was not reused or mutation leaked")
	}
	if _, err = loadReconcileSources(context.Background(), sc, keys, true); err != nil {
		t.Fatal(err)
	}
	if calls.Load() != 2 {
		t.Fatal("offline check reused cache")
	}
	fail.Store(true)
	if _, err = loadReconcileSources(context.Background(), sc, keys, true); err == nil {
		t.Fatal("failed fresh check silently used cached data")
	}
	reconcileSourceCache.Lock()
	delete(reconcileSourceCache.entries, keys[0])
	reconcileSourceCache.Unlock()
}
