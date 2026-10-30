package handler

import (
	"context"
	"errors"
	"fmt"
	"reflect"
	"testing"

	"sidejob-server/internal/catalog"
)

func TestOfflinePreviewReadsAggregateOnlyOnceForTenStores(t *testing.T) {
	members := make([]catalog.BrandProfileMember, 10)
	for i := range members {
		members[i] = catalog.BrandProfileMember{RegionID: fmt.Sprint(i), DistributorID: fmt.Sprint(i + 100)}
	}
	calls := 0
	expected := catalog.SyncCenterSnapshot{ProfileID: "brand", Generation: "complete-version", Members: members}
	read := func(_ context.Context, p, r, d string) (catalog.SyncCenterSnapshot, error) {
		calls++
		if p != "brand" || r != "" || d != "" {
			t.Fatalf("per-store read reintroduced: %s/%s/%s", p, r, d)
		}
		return expected, nil
	}
	actual, err := readOfflineCenterSnapshot(context.Background(), "brand", members, read)
	if err != nil || calls != 1 || actual.Generation != expected.Generation {
		t.Fatalf("calls=%d snapshot=%#v error=%v", calls, actual, err)
	}
}

func TestOfflinePreviewSingleStoreAndIncompleteSource(t *testing.T) {
	ctx := context.Background()
	members := []catalog.BrandProfileMember{{RegionID: "3", DistributorID: "183"}}
	calls := 0
	_, err := readOfflineCenterSnapshot(ctx, "", members, func(_ context.Context, p, r, d string) (catalog.SyncCenterSnapshot, error) {
		calls++
		if p != "" || r != "3" || d != "183" {
			t.Fatal("wrong store scope")
		}
		return catalog.SyncCenterSnapshot{}, errors.New("generation incomplete")
	})
	if err == nil || calls != 1 {
		t.Fatal("incomplete generation accepted")
	}
	_, err = readOfflineCenterSnapshot(ctx, "brand", nil, func(context.Context, string, string, string) (catalog.SyncCenterSnapshot, error) {
		t.Fatal("empty scope read")
		return catalog.SyncCenterSnapshot{}, nil
	})
	if err == nil {
		t.Fatal("empty scope accepted")
	}
}

func TestOfflinePreviewKeepsAllRegionalSizesAndCategoryScopeWithoutMutation(t *testing.T) {
	profile := catalog.BrandProfile{ID: "brand", Name: "ADIDAS"}
	members := []catalog.BrandProfileMember{{RegionID: "3", DistributorID: "183"}, {RegionID: "4", DistributorID: "904"}}
	makeProduct := func(region, store, id, category string, stock int) catalog.SyncCenterProduct {
		return catalog.SyncCenterProduct{RegionID: region, DistributorID: store, ItemID: id, CategoryIDs: []string{category}, Data: map[string]any{"item_no": "SAME-001", "default_item_id": id, "market_price": "20000", "price": "10000", "item_category_main": []any{map[string]any{"category_id": category, "category_name": "运动鞋靴", "category_level": "2"}}, "spec_items": []any{map[string]any{"item_id": id + "-40", "store": stock, "approve_status": "onsale", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "40"}}}, map[string]any{"item_id": id + "-41", "store": 0, "approve_status": "onsale", "item_spec": []any{map[string]any{"spec_name": "尺码", "spec_value_name": "41"}}}}}}
	}
	snapshot := catalog.SyncCenterSnapshot{ProfileID: "brand", Generation: "version", Products: []catalog.SyncCenterProduct{makeProduct("3", "183", "one", "shoe", 3), makeProduct("4", "904", "two", "shoe", 2), makeProduct("3", "183", "other-category", "bag", 1), makeProduct("5", "foreign", "foreign", "shoe", 8)}}
	original := cloneSyncedMap(snapshot.Products[0].Data)
	sources, bindings := offlineSourcesFromSnapshot(snapshot, profile, members, []string{"shoe"}, nil)
	if len(bindings) != 2 || len(sources.productsByItemNo["SAME-001"]) != 2 || len(sources.activeBindingKeys) != 2 {
		t.Fatalf("regional or category scope changed: %#v", bindings)
	}
	if !reflect.DeepEqual(original, snapshot.Products[0].Data) {
		t.Fatal("snapshot mutated")
	}
	if len(sources.productsByItemNo["SAME-001"][0]["spec_items"].([]any)) != 2 {
		t.Fatal("zero-stock size discarded")
	}
	if bindings[0].SourcePriceCents != 10000 || bindings[0].MarketPriceCents != 20000 || bindings[1].RegionID != "4" {
		t.Fatal("price or identity changed")
	}
}
