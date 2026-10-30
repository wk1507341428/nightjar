package publish

import (
	"context"
	"strings"
	"testing"

	"sidejob-server/internal/model"
)

// Even a retried update must stop before image preparation or a remote edit.
func TestUpdateWorkerRejectsFullPriceMarkupAndMissingOriginal(t *testing.T) {
	service := newStockOutTestService(t)
	ctx := context.Background()
	for _, tc := range []struct {
		name     string
		original int64
		reason   string
	}{
		{"full-price", 265000, "高于商品原价"},
		{"unknown-original", 0, "原价未知"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			task := model.PublishTask{ID: tc.name, Action: model.PublishActionUpdate, SourcePriceCents: 265000, OriginalPriceCents: tc.original, PriceCents: 277000, Status: model.PublishTaskPreparing, RetryRequested: true}
			if err := service.repository.Create(ctx, task); err != nil {
				t.Fatal(err)
			}
			service.RefreshReconcile = func(_ context.Context, incoming model.PublishTask) (model.PublishTask, error) { return incoming, nil }
			service.processReconcileTask(ctx, task)
			saved, err := service.repository.Get(ctx, task.ID)
			if err != nil {
				t.Fatal(err)
			}
			if saved.Status != model.PublishTaskFailed || !strings.Contains(saved.ErrorMessage, tc.reason) {
				t.Fatalf("unsafe update was not stopped before remote work: %#v", saved)
			}
			if saved.PriceCents != task.PriceCents || saved.Action != task.Action {
				t.Fatal("price rejection changed user price or action")
			}
		})
	}
}
