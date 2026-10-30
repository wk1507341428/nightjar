package catalog

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"sidejob-server/internal/config"
)

func TestLiveBrandRejectsIncompleteSinglePage(t *testing.T) {
	for _, sample := range []struct{ total, returned int }{{0, 0}, {2, 2}, {2, 1}, {0, 1}} {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			rows := make([]map[string]any, sample.returned)
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{"list": rows, "total_count": sample.total}})
		}))
		service := &Service{config: config.CatalogConfig{APIBase: server.URL}, httpClient: server.Client(), liveOfferSemaphore: make(chan struct{}, 1)}
		_, err := service.ListLiveBrandOffers(context.Background(), "4", "4769", nil)
		server.Close()
		if (err != nil) != (sample.total != sample.returned) {
			t.Fatalf("total=%d returned=%d err=%v", sample.total, sample.returned, err)
		}
	}
}

func TestFreshDetailMissingIdentityDoesNotReuseListArticle(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"data":{"store":0}}`))
	}))
	defer server.Close()
	service := freshDetailTestService(server, 1)
	detail, err := service.GetFreshProductDetail(context.Background(), map[string]any{"item_id": "one", "item_no": "MT51205"}, "4")
	if err != nil || detail["item_no"] != nil {
		t.Fatalf("missing source identity was replaced by stale list data: %#v %v", detail, err)
	}
}
