package catalog

import (
	"testing"
	"time"
)

func TestItemStabilityUsesDailyWorstState(t *testing.T) {
	observedAt := time.Date(2026, 10, 2, 4, 0, 0, 0, time.UTC)
	snapshot := stabilityScopeSnapshot{ScopeID: "profile-1", BrandProfileID: "profile-1", SourceMemberIDs: []string{"4:4175"}}

	stability := applyDailyAvailabilityObservation(ItemStability{}, snapshot, "ABC-1", true, observedAt)
	if stability.Score != 10 || stability.ObservedDayCount != 1 || stability.AvailableDayCount != 1 || !stability.CurrentAvailable {
		t.Fatalf("unexpected initial stability: %#v", stability)
	}

	stability = applyDailyAvailabilityObservation(stability, snapshot, "ABC-1", false, observedAt.Add(time.Hour))
	if stability.Score != 9 || stability.UnavailableDayCount != 1 || stability.CurrentAvailable {
		t.Fatalf("same-day unavailable observation was not counted: %#v", stability)
	}

	stability = applyDailyAvailabilityObservation(stability, snapshot, "ABC-1", true, observedAt.Add(2*time.Hour))
	if stability.Score != 9 || stability.ObservedDayCount != 1 || stability.AvailableDayCount != 0 || !stability.CurrentAvailable {
		t.Fatalf("same-day recovery incorrectly erased unstable day: %#v", stability)
	}
}

func TestItemStabilityCountsDistinctDays(t *testing.T) {
	observedAt := time.Date(2026, 10, 1, 4, 0, 0, 0, time.UTC)
	snapshot := stabilityScopeSnapshot{ScopeID: "profile-1", BrandProfileID: "profile-1", SourceMemberIDs: []string{"4:4175"}}
	stability := ItemStability{}
	for dayOffset := 0; dayOffset < 10; dayOffset++ {
		available := dayOffset != 3
		stability = applyDailyAvailabilityObservation(stability, snapshot, "ABC-1", available, observedAt.AddDate(0, 0, dayOffset))
	}
	if stability.Score != 9 || stability.ObservedDayCount != 10 || stability.AvailableDayCount != 9 || stability.UnavailableDayCount != 1 {
		t.Fatalf("unexpected ten-day score: %#v", stability)
	}
}

func TestItemStabilityDropsExpiredDays(t *testing.T) {
	observedAt := time.Date(2026, 10, 1, 4, 0, 0, 0, time.UTC)
	snapshot := stabilityScopeSnapshot{ScopeID: "profile-1", BrandProfileID: "profile-1", SourceMemberIDs: []string{"4:4175"}}
	stability := applyDailyAvailabilityObservation(ItemStability{}, snapshot, "ABC-1", false, observedAt)
	for dayOffset := 1; dayOffset <= 10; dayOffset++ {
		stability = applyDailyAvailabilityObservation(stability, snapshot, "ABC-1", true, observedAt.AddDate(0, 0, dayOffset))
	}
	if stability.Score != 10 || stability.ObservedDayCount != 10 || stability.UnavailableDayCount != 0 || !stability.LastUnavailableAt.IsZero() {
		t.Fatalf("expired unavailable day still affects score: %#v", stability)
	}
}

func TestSnapshotAvailableItemNosMergesRegions(t *testing.T) {
	snapshots := []PublishSourceSnapshot{
		{RegionID: "4", DistributorID: "4175", Products: []map[string]any{{"item_no": "ABC-1"}}, Complete: true},
		{RegionID: "5", DistributorID: "3636", Products: []map[string]any{{"item_no": "ABC-2"}, {"item_no": "abc-1"}}, Complete: true},
	}

	itemNos := snapshotAvailableItemNos(snapshots)
	if len(itemNos) != 2 {
		t.Fatalf("unexpected merged item nos: %#v", itemNos)
	}
	if _, exists := itemNos["ABC-1"]; !exists {
		t.Fatal("normalized shared item number is missing")
	}
}

func TestItemStabilityScoreStopsAtOne(t *testing.T) {
	observedAt := time.Date(2026, 10, 1, 4, 0, 0, 0, time.UTC)
	snapshot := stabilityScopeSnapshot{ScopeID: "profile-1", BrandProfileID: "profile-1", SourceMemberIDs: []string{"4:4175"}}
	stability := ItemStability{}
	for dayOffset := 0; dayOffset < 10; dayOffset++ {
		stability = applyDailyAvailabilityObservation(stability, snapshot, "ABC-1", false, observedAt.AddDate(0, 0, dayOffset))
	}
	if stability.Score != 1 || stability.UnavailableDayCount != 10 {
		t.Fatalf("unexpected score floor: %#v", stability)
	}
}
