package handler

import (
	"context"
	"fmt"
	"sidejob-server/internal/model"
	"testing"
)

func TestRetryPublishLoadsFullDetailImages(t *testing.T) {
	source := map[string]any{"item_no": "123", "_primary_region": "6", "main_img": "https://example.com/main.jpg", "_merged_spec_items": []any{map[string]any{"store": int64(8)}}, "_source_regions": []string{"5", "6"}}
	task := model.PublishTask{ItemNo: "123", RegionID: "3", ImageURLs: []string{"old1", "old2"}}
	fetch := func(ctx context.Context, p map[string]any, region string) (map[string]any, error) {
		if region != "6" {
			t.Fatalf("wrong source region: %s", region)
		}
		return map[string]any{"item_no": "123", "main_img": "https://example.com/main.jpg", "pics": []any{"https://example.com/side.jpg"}, "intro": `<img src="https://example.com/detail.jpg">`}, nil
	}
	detail, err := retryPublishDetail(context.Background(), fetch, source, task)
	if err != nil {
		t.Fatal(err)
	}
	if len(productImages(detail)) != 3 {
		t.Fatal("detail images lost")
	}
	if len(productStringSlice(detail, "_source_regions", nil)) != 2 {
		t.Fatal("merged provenance lost")
	}
	if specs, ok := detail["spec_items"].([]any); !ok || len(specs) != 1 {
		t.Fatal("merged specs lost")
	}
	broken := func(context.Context, map[string]any, string) (map[string]any, error) {
		return nil, fmt.Errorf("unavailable")
	}
	if _, err = retryPublishDetail(context.Background(), broken, source, task); err == nil {
		t.Fatal("silently fell back to list image")
	}
	single := func(context.Context, map[string]any, string) (map[string]any, error) { return source, nil }
	if _, err = retryPublishDetail(context.Background(), single, source, task); err == nil {
		t.Fatal("silently downgraded multiple images")
	}
}
