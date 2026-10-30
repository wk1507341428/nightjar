package catalog

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	redisclient "github.com/redis/go-redis/v9"
	"sidejob-server/internal/config"
)

func freshDetailTestService(server *httptest.Server, concurrency int) *Service {
	return &Service{config: config.CatalogConfig{APIBase: server.URL}, httpClient: server.Client(), detailSemaphore: make(chan struct{}, concurrency)}
}

func TestFreshProductDetailBypassesCacheAndDoesNotReuseSourceStock(t *testing.T) {
	var requests, cacheCalls atomic.Int64
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests.Add(1)
		fmt.Fprint(w, `{"data":{"item_no":"MT51205","spec_items":[{"store":0,"approve_status":"instock"}],"item_total_store":0}}`)
	}))
	defer server.Close()
	service := freshDetailTestService(server, 2)
	service.detailCache = redisclient.NewClient(&redisclient.Options{MaxRetries: -1, Dialer: func(context.Context, string, string) (net.Conn, error) {
		cacheCalls.Add(1)
		return nil, errors.New("cache must not be used")
	}})
	defer service.detailCache.Close()
	source := map[string]any{"item_id": "item", "item_no": "MT51205", "store": int64(24), "approve_status": "onsale", "_primary_region": "region", "_merged_spec_items": []any{map[string]any{"store": 24}}}
	for range 2 {
		detail, err := service.GetFreshProductDetail(context.Background(), source, "region")
		if err != nil {
			t.Fatal(err)
		}
		if mapInt64(detail, "item_total_store") != 0 || detail["store"] != nil || detail["_merged_spec_items"] != nil || detail["approve_status"] != nil {
			t.Fatalf("stale stock/status leaked into fresh detail: %#v", detail)
		}
		if detail["_primary_region"] != "region" || len(detail["spec_items"].([]any)) != 1 {
			t.Fatalf("fresh detail lost source identity or actual specs: %#v", detail)
		}
	}
	if requests.Load() != 2 || cacheCalls.Load() != 0 || source["store"] != int64(24) {
		t.Fatalf("requests=%d cache calls=%d source=%#v", requests.Load(), cacheCalls.Load(), source)
	}
}

func TestFreshProductDetailDoesNotJoinCachedSingleflight(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"data":{"item_no":"item","item_total_store":0}}`)
	}))
	defer server.Close()
	service := freshDetailTestService(server, 1)
	cachedStarted, releaseCached := make(chan struct{}), make(chan struct{})
	cached := service.detailGroup.DoChan("sidejob:catalog:detail:v2:region:item", func() (any, error) {
		close(cachedStarted)
		<-releaseCached
		return map[string]any{"item_total_store": 24}, nil
	})
	defer func() { close(releaseCached); <-cached }()
	<-cachedStarted
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	detail, err := service.GetFreshProductDetail(ctx, map[string]any{"item_id": "item"}, "region")
	if err != nil || mapInt64(detail, "item_total_store") != 0 {
		t.Fatalf("fresh call joined cached result: detail=%#v error=%v", detail, err)
	}
}

func TestFreshProductDetailRespectsSharedConcurrencyLimit(t *testing.T) {
	var active, peak atomic.Int64
	entered, release := make(chan struct{}, 5), make(chan struct{})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		count := active.Add(1)
		defer active.Add(-1)
		for previous := peak.Load(); count > previous && !peak.CompareAndSwap(previous, count); previous = peak.Load() {
		}
		entered <- struct{}{}
		<-release
		fmt.Fprint(w, `{"data":{"item_no":"item","item_total_store":0}}`)
	}))
	defer server.Close()
	service := freshDetailTestService(server, 2)
	var group sync.WaitGroup
	errors := make(chan error, 5)
	for index := range 5 {
		group.Add(1)
		go func(index int) {
			defer group.Done()
			_, err := service.GetFreshProductDetail(context.Background(), map[string]any{"item_id": fmt.Sprint(index)}, "region")
			errors <- err
		}(index)
	}
	// 先等到两个HTTP请求真正进入，再释放，验证限流没有退化为串行或超过上限。
	for range 2 {
		select {
		case <-entered:
		case <-time.After(2 * time.Second):
			close(release)
			group.Wait()
			t.Fatal("fresh detail requests did not use the expected concurrency")
		}
	}
	close(release)
	group.Wait()
	close(errors)
	for err := range errors {
		if err != nil {
			t.Fatal(err)
		}
	}
	if peak.Load() != 2 {
		t.Fatalf("HTTP peak concurrency=%d, want 2", peak.Load())
	}
}

func TestFreshProductDetailReturnsFailureWithoutStockFallback(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "unavailable", http.StatusServiceUnavailable)
	}))
	defer server.Close()
	service := freshDetailTestService(server, 1)
	detail, err := service.GetFreshProductDetail(context.Background(), map[string]any{"item_id": "item", "store": 24}, "region")
	if err == nil || detail != nil {
		t.Fatalf("failed request must not return source inventory: detail=%#v error=%v", detail, err)
	}
	cancelled, cancel := context.WithCancel(context.Background())
	cancel()
	service.detailSemaphore <- struct{}{}
	detail, err = service.GetFreshProductDetail(cancelled, map[string]any{"item_id": "other"}, "region")
	<-service.detailSemaphore
	if !errors.Is(err, context.Canceled) || detail != nil {
		t.Fatalf("cancelled semaphore wait: detail=%#v error=%v", detail, err)
	}
}

func TestFreshProductDetailDoesNotFillMissingInventoryFromSource(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"data":{"item_no":"item"}}`)
	}))
	defer server.Close()
	service := freshDetailTestService(server, 1)
	specs := []any{map[string]any{"store": 24}}
	source := map[string]any{"item_id": "item", "spec_items": specs, "_merged_spec_items": specs, "item_total_store": 24, "store": 24}
	detail, err := service.GetFreshProductDetail(context.Background(), source, "region")
	if err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"spec_items", "_merged_spec_items", "item_total_store", "store"} {
		if _, exists := detail[key]; exists {
			t.Fatalf("source inventory field %s filled incomplete fresh detail: %#v", key, detail)
		}
	}
}
