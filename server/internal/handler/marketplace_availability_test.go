package handler

import (
	"context"
	"errors"
	"reflect"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/types"
	"testing"
)

func TestMarketplaceAvailabilityUsesSyncedTruthAndPreservesHistory(t *testing.T) {
	history := &types.MarketplaceListingStabilityResponse{Score: 9, ObservedDayCount: 10, AvailableDayCount: 9, UnavailableDayCount: 1, CurrentAvailable: true, LastUnavailableAt: "2026-10-22"}
	rows := []types.MarketplaceListingResponse{{BrandProfileID: "one", ItemNo: "310128 02", Stability: history}, {BrandProfileID: "one", ItemNo: "31012802", Stability: history}, {BrandProfileID: "two", ItemNo: "UNKNOWN", Stability: history}, {BrandProfileID: "error", ItemNo: "READ-FAIL", Stability: history}, {ItemNo: "UNSCOPED", Stability: history}}
	calls := map[string][]string{}
	load := func(_ context.Context, profile string, itemNos []string) (map[string]catalog.SyncCenterAvailability, error) {
		calls[profile] = itemNos
		if profile == "error" {
			return nil, errors.New("database unavailable")
		}
		if profile == "one" {
			return map[string]catalog.SyncCenterAvailability{"31012802": {Known: true, Available: false}}, nil
		}
		return map[string]catalog.SyncCenterAvailability{"UNKNOWN": {Known: false}}, nil
	}
	overlayMarketplaceAvailability(context.Background(), rows, load)
	if len(calls) != 3 || !reflect.DeepEqual(calls["one"], []string{"31012802"}) {
		t.Fatalf("queries were not grouped/canonical: %#v", calls)
	}
	for _, row := range rows[:2] {
		if row.Stability == nil || row.Stability.CurrentAvailable || row.Stability.Score != 9 || row.Stability.ObservedDayCount != 10 || row.Stability.AvailableDayCount != 9 || row.Stability.LastUnavailableAt != "2026-10-22" {
			t.Fatalf("history modified or stale current truth retained: %#v", row.Stability)
		}
	}
	if !history.CurrentAvailable {
		t.Fatal("overlay mutated shared historical input")
	}
	for _, row := range rows[2:] {
		if row.Stability != nil {
			t.Fatal("unknown/read failure retained an old stock assertion")
		}
	}
}
func TestMarketplaceAvailabilityKnownStockAndMissingHistoryRemainHonest(t *testing.T) {
	rows := []types.MarketplaceListingResponse{{BrandProfileID: "one", ItemNo: "A", Stability: &types.MarketplaceListingStabilityResponse{CurrentAvailable: false, ObservedDayCount: 2, Score: 5}}, {BrandProfileID: "one", ItemNo: "B"}}
	overlayMarketplaceAvailability(context.Background(), rows, func(context.Context, string, []string) (map[string]catalog.SyncCenterAvailability, error) {
		return map[string]catalog.SyncCenterAvailability{"A": {Known: true, Available: true}, "B": {Known: true, Available: true}}, nil
	})
	if !rows[0].Stability.CurrentAvailable || rows[0].Stability.Score != 5 {
		t.Fatal("synchronized availability did not override old false value")
	}
	if rows[1].Stability != nil {
		t.Fatal("history-free source fabricated stability statistics")
	}
	overlayMarketplaceAvailability(context.Background(), rows, nil)
	if rows[0].Stability != nil {
		t.Fatal("unavailable sync reader retained an availability assertion")
	}
}
