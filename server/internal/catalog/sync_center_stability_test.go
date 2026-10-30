package catalog

import (
	"context"
	"reflect"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func seedStabilitySourceHead(t *testing.T, ctx context.Context, center *SyncCenter, observed time.Time) {
	t.Helper()
	_, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	head := SyncCenterSnapshot{ProfileID: "brand", Generation: "authority", Members: members, SyncedAt: observed, ProductCount: 2, SKUCount: 2}
	if _, err = center.heads.InsertOne(ctx, head); err != nil {
		t.Fatal(err)
	}
	products := []any{SyncCenterProduct{ItemID: "available", ID: "available", ProfileID: "brand", Generation: "authority", ItemNo: "A B", ItemNoKey: "AB", Stock: 3}, SyncCenterProduct{ItemID: "unavailable", ID: "unavailable", ProfileID: "brand", Generation: "authority", ItemNo: "OUT", ItemNoKey: "OUT", Stock: 0}}
	if _, err = center.products.InsertMany(ctx, products); err != nil {
		t.Fatal(err)
	}
	skus := []any{SyncCenterSKU{ID: "sku-available", ProfileID: "brand", Generation: "authority", ProductID: "available", ItemNo: "A B", Stock: 3, AvailableStock: 3}, SyncCenterSKU{ID: "sku-out", ProfileID: "brand", Generation: "authority", ProductID: "unavailable", ItemNo: "OUT", Stock: 8, AvailableStock: 0}}
	if _, err = center.skus.InsertMany(ctx, skus); err != nil {
		t.Fatal(err)
	}
}

func TestSyncCenterCurrentAvailabilityAuthoritativeBatchAndUnknown(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	observed := time.Now().Add(-time.Hour).Truncate(time.Millisecond)
	seedStabilitySourceHead(t, ctx, center, observed)
	states, err := center.CurrentAvailability(ctx, "brand", []string{" a b ", "OUT", "MISSING"})
	if err != nil {
		t.Fatal(err)
	}
	if !states["AB"].Known || !states["AB"].Available || states["AB"].Stock != 3 || !states["AB"].ObservedAt.Equal(observed) {
		t.Fatalf("wrong canonical source inventory: %#v", states)
	}
	if !states["OUT"].Known || states["OUT"].Available || !states["MISSING"].Known || states["MISSING"].Available {
		t.Fatalf("complete head absence was not known unavailable: %#v", states)
	}
	unknown, err := center.CurrentAvailability(ctx, "missing-profile", []string{"AB"})
	if err == nil || unknown["AB"].Known {
		t.Fatal("missing head became confirmed availability")
	}
	if err = center.source.inventoryRepository.SaveBrandProfile(ctx, BrandProfile{ID: "brand", Name: "Brand"}, []BrandProfileMember{{ID: "changed", RegionID: "2", DistributorID: "other"}}); err != nil {
		t.Fatal(err)
	}
	unknown, err = center.CurrentAvailability(ctx, "brand", []string{"AB"})
	if err == nil || unknown["AB"].Known {
		t.Fatal("changed member configuration used an old head as current stock")
	}
}

func TestSyncCenterDailyObservationUsesHeadDayAndPreservesTrueHistory(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	observed := time.Now().Add(-24 * time.Hour).Truncate(time.Millisecond)
	seedStabilitySourceHead(t, ctx, center, observed)
	collection := center.products.Database().Collection("catalog_item_stability")
	prior := observed.Add(-24 * time.Hour)
	existing := ItemStability{ID: "historical-ab", ScopeID: "brand", BrandProfileID: "brand", ItemNo: "A B", CurrentAvailable: true, FirstObservedAt: prior, LastObservedAt: prior, DailyObservations: []ItemStabilityDay{{Date: stabilityDayKey(prior), Available: true, LastObservedAt: prior}}}
	newer := ItemStability{ID: "newer", ScopeID: "brand", ItemNo: "FUTURE", CurrentAvailable: true, LastObservedAt: observed.Add(time.Hour), DailyObservations: []ItemStabilityDay{{Date: stabilityDayKey(observed.Add(time.Hour)), Available: true, LastObservedAt: observed.Add(time.Hour)}}}
	if _, err := collection.InsertMany(ctx, []any{existing, newer}); err != nil {
		t.Fatal(err)
	}
	var beforeNewer ItemStability
	if err := collection.FindOne(ctx, bson.M{"_id": newer.ID}).Decode(&beforeNewer); err != nil {
		t.Fatal(err)
	}
	observation, err := center.RecordActiveStability(ctx, "brand")
	if err != nil || observation.Articles != 2 || observation.AvailableArticles != 1 || observation.SkippedNewer != 1 {
		t.Fatalf("unexpected observation: %#v %v", observation, err)
	}
	var history, out ItemStability
	if err = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&history); err != nil {
		t.Fatal(err)
	}
	if err = collection.FindOne(ctx, bson.M{"scopeId": "brand", "itemNo": "OUT"}).Decode(&out); err != nil {
		t.Fatal(err)
	}
	if len(history.DailyObservations) != 2 || history.DailyObservations[0].Date != stabilityDayKey(prior) || history.DailyObservations[1].Date != stabilityDayKey(observed) || !history.LastObservedAt.Equal(observed) {
		t.Fatalf("history lost or backfill invented today's observation: %#v", history)
	}
	if out.CurrentAvailable || out.ObservedDayCount != 1 || out.DailyObservations[0].Date != stabilityDayKey(observed) {
		t.Fatalf("unavailable physical-only SKU recorded available: %#v", out)
	}
	var afterNewer ItemStability
	if err = collection.FindOne(ctx, bson.M{"_id": newer.ID}).Decode(&afterNewer); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(beforeNewer, afterNewer) {
		t.Fatalf("old head overwrote newer real history: %#v", afterNewer)
	}
	again, err := center.RecordActiveStability(ctx, "brand")
	if err != nil || again.Modified != 0 {
		t.Fatalf("same head repeated observation changed history: %#v %v", again, err)
	}
}

func TestSyncCenterStabilityFailureDoesNotUndoSuccessfulSourceHead(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	observed := time.Now().Truncate(time.Millisecond)
	seedStabilitySourceHead(t, ctx, center, observed)
	if _, err := center.skus.DeleteOne(ctx, bson.M{"_id": "sku-out"}); err != nil {
		t.Fatal(err)
	}
	run := SyncCenterRun{ID: "authority", ProfileID: "brand", Status: SyncCenterComplete}
	center.recordCompletedStability(&run)
	if run.Status != SyncCenterComplete || run.StabilityError == "" {
		t.Fatalf("secondary projection failure undid source completion: %#v", run)
	}
	head, err := center.readHead(ctx, "brand")
	if err != nil || head.Generation != "authority" {
		t.Fatalf("secondary projection failure changed authoritative head: %#v %v", head, err)
	}
	count, err := center.products.Database().Collection("catalog_item_stability").CountDocuments(ctx, bson.M{})
	if err != nil || count != 0 {
		t.Fatal("incomplete SKU coverage generated daily history")
	}
}
