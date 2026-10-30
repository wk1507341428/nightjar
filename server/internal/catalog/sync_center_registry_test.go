package catalog

import (
	"context"
	"errors"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func TestSyncRegistryInvalidProfileDoesNotAddBrand(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	if _, err := center.Start(ctx, "missing-profile"); err == nil {
		t.Fatal("nonexistent profile accepted")
	}
	count, err := center.registry().CountDocuments(ctx, bson.M{})
	if err != nil || count != 0 {
		t.Fatalf("invalid start created registry: %d %v", count, err)
	}
}

func TestSyncRegistryExpiredLeaseCanRecoverWithoutOldOwnerUnlock(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	first, err := center.lockRegistry(ctx, "brand", syncRegistryStarting, true)
	if err != nil {
		t.Fatal(err)
	}
	if _, err = center.lockRegistry(ctx, "brand", syncRegistryDeleting, false); !errors.Is(err, ErrSyncCenterBusy) {
		t.Fatalf("live lease was not exclusive: %v", err)
	}
	if _, err = center.registry().UpdateOne(ctx, bson.M{"_id": "brand"}, bson.M{"$set": bson.M{"operationExpiresAt": time.Now().Add(-time.Minute)}}); err != nil {
		t.Fatal(err)
	}
	second, err := center.lockRegistry(ctx, "brand", syncRegistryDeleting, false)
	if err != nil {
		t.Fatalf("expired lease stuck: %v", err)
	}
	defer second.close()
	first.close()
	var state bson.M
	if err = center.registry().FindOne(ctx, bson.M{"_id": "brand"}).Decode(&state); err != nil {
		t.Fatal(err)
	}
	if state["operationOwner"] != second.owner || state["operation"] != syncRegistryDeleting {
		t.Fatalf("old owner cleared newer lease: %#v", state)
	}
}

func TestSyncMetadataBackfillDoesNotRecreateDeletedRegistry(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	run, err := center.Start(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if finished := waitSyncTestRun(t, ctx, center, run.ID); finished.Status != SyncCenterComplete {
		t.Fatal(finished.Error)
	}
	head, err := center.readHead(ctx, "brand")
	if err != nil {
		t.Fatal(err)
	}
	if _, err = center.DeleteBrand(ctx, "brand"); err != nil {
		t.Fatal(err)
	}
	if _, err = center.backfillMetadataHead(ctx, head, syncMetadataDiscovery{}, false); err == nil {
		t.Fatal("captured stale head was allowed to recreate source metadata")
	}
	count, err := center.registry().CountDocuments(context.Background(), bson.M{"active": bson.M{"$ne": false}})
	if err != nil || count != 0 {
		t.Fatalf("deleted registry revived: %d %v", count, err)
	}
}

func TestSyncRegistryResumedRunTakesPriorityOverNewerStartedHistory(t *testing.T) {
	ctx, center, _, _, _ := newSyncCenterIntegrationFixture(t)
	now := time.Now().Truncate(time.Millisecond)
	old := SyncCenterRun{ID: "resumed-old", ProfileID: "brand", Status: SyncCenterRunning, StartedAt: now.Add(-time.Hour), UpdatedAt: now}
	newer := SyncCenterRun{ID: "newer-complete", ProfileID: "brand", Status: SyncCenterComplete, StartedAt: now.Add(-time.Minute), UpdatedAt: now.Add(-time.Minute)}
	other := SyncCenterRun{ID: "other-brand", ProfileID: "other", Status: SyncCenterComplete, StartedAt: now.Add(time.Hour), UpdatedAt: now.Add(time.Hour)}
	for _, run := range []SyncCenterRun{old, newer, other} {
		if _, err := center.runs.InsertOne(ctx, run); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := center.registry().InsertOne(ctx, SyncCenterBrandState{ProfileID: "brand", ProfileName: "Brand", Active: true, LastRunID: newer.ID}); err != nil {
		t.Fatal(err)
	}
	assertRun := func(want string) {
		t.Helper()
		rows, err := center.ListBrands(ctx)
		if err != nil || len(rows) != 1 || rows[0].LatestRun == nil || rows[0].LatestRun.ID != want {
			t.Fatalf("wrong current brand run: %#v %v", rows, err)
		}
	}
	assertRun(old.ID)
	if _, err := center.runs.UpdateOne(ctx, bson.M{"_id": old.ID}, bson.M{"$set": bson.M{"status": SyncCenterFailed}}); err != nil {
		t.Fatal(err)
	}
	if _, err := center.registry().UpdateOne(ctx, bson.M{"_id": "brand"}, bson.M{"$set": bson.M{"lastRunId": old.ID}}); err != nil {
		t.Fatal(err)
	}
	assertRun(old.ID)
	// A stale or cross-brand pointer falls back to updatedAt ordering within this profile only.
	if _, err := center.registry().UpdateOne(ctx, bson.M{"_id": "brand"}, bson.M{"$set": bson.M{"lastRunId": other.ID}}); err != nil {
		t.Fatal(err)
	}
	assertRun(old.ID)
}
