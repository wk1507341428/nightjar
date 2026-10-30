package handler

import (
	"context"
	"sidejob-server/internal/catalog"
	"testing"
)

func TestSyncedProductsMatchParentCategoriesAndIsolateMaps(t *testing.T) {
	product := aggregateFixtureProduct(2, sourceStatusOnSale)
	product["main_category"] = "leaf"
	snapshot := catalog.SyncCenterSnapshot{Generation: "one", Products: []catalog.SyncCenterProduct{{RegionID: "5", DistributorID: "278", ItemID: "source", CategoryIDs: []string{"2", "leaf"}, Data: product}}}
	selected := syncedSnapshotProducts(snapshot, []string{"2"})
	if len(selected) != 1 {
		t.Fatal("parent category lost")
	}
	selected[0]["spec_items"].([]any)[0].(map[string]any)["store"] = 999
	second := syncedSnapshotProducts(snapshot, nil)
	if productNumber(second[0]["spec_items"].([]any)[0].(map[string]any), "store") != 2 {
		t.Fatal("mutable plan changed authoritative snapshot")
	}
	if _, err := syncedSourceDetail(context.Background(), second[0], "5"); err != nil {
		t.Fatal(err)
	}
	if _, err := syncedSourceDetail(context.Background(), map[string]any{}, "5"); err == nil {
		t.Fatal("unversioned product accepted")
	}
}
