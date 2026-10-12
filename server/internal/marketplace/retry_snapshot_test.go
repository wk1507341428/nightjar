package marketplace

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"sidejob-server/internal/model"
)

func TestRetrySnapshotReusesAndForcesRefresh(t *testing.T) {
	service := &Service{accountStates: make(map[string]*accountSyncState)}
	var calls atomic.Int32
	refresh := func() (int, error) { calls.Add(1); return 42, nil }
	var group sync.WaitGroup
	for i := 0; i < 20; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			if _, err := service.ensureRetrySnapshot(context.Background(), model.DefaultXianyuAccountID, false, refresh); err != nil {
				t.Error(err)
			}
		}()
	}
	group.Wait()
	if calls.Load() != 1 {
		t.Fatalf("duplicate full sync: %d", calls.Load())
	}
	_, _ = service.ensureRetrySnapshot(context.Background(), model.DefaultXianyuAccountID, true, refresh)
	if calls.Load() != 2 {
		t.Fatal("uncertain publish did not force refresh")
	}
	service.stateForAccount(model.DefaultXianyuAccountID).lastFullSync = time.Now().Add(-61 * time.Second)
	_, _ = service.ensureRetrySnapshot(context.Background(), model.DefaultXianyuAccountID, false, refresh)
	if calls.Load() != 3 {
		t.Fatal("expired snapshot reused")
	}
}

func TestFailedSnapshotDoesNotBecomeFresh(t *testing.T) {
	service := &Service{accountStates: make(map[string]*accountSyncState)}
	_, err := service.ensureRetrySnapshot(context.Background(), model.DefaultXianyuAccountID, false, func() (int, error) { return 0, fmt.Errorf("network failed") })
	if err == nil || !service.stateForAccount(model.DefaultXianyuAccountID).lastFullSync.IsZero() {
		t.Fatal("failure cached as successful snapshot")
	}
}

func TestRetrySnapshotCacheIsolatedByAccount(t *testing.T) {
	service := &Service{accountStates: make(map[string]*accountSyncState)}
	var firstAccountCalls atomic.Int32
	var secondAccountCalls atomic.Int32
	firstRefresh := func() (int, error) { firstAccountCalls.Add(1); return 11, nil }
	secondRefresh := func() (int, error) { secondAccountCalls.Add(1); return 22, nil }
	firstCount, firstErr := service.ensureRetrySnapshot(context.Background(), "account-a", false, firstRefresh)
	secondCount, secondErr := service.ensureRetrySnapshot(context.Background(), "account-b", false, secondRefresh)
	_, _ = service.ensureRetrySnapshot(context.Background(), "account-a", false, firstRefresh)
	_, _ = service.ensureRetrySnapshot(context.Background(), "account-b", false, secondRefresh)
	if firstErr != nil || secondErr != nil || firstCount != 11 || secondCount != 22 {
		t.Fatalf("unexpected account snapshot results: %d/%v, %d/%v", firstCount, firstErr, secondCount, secondErr)
	}
	if firstAccountCalls.Load() != 1 || secondAccountCalls.Load() != 1 {
		t.Fatalf("account caches crossed: account-a=%d account-b=%d", firstAccountCalls.Load(), secondAccountCalls.Load())
	}
}

func TestMergeLinkedTaskMetadataFillsOfflineTaskPresentation(t *testing.T) {
	latestOfflineTask := model.PublishTask{ID: "offline", Action: "offline", ItemNo: "HV6891-010", XianyuItemID: "1085680973385", CreatedAt: time.Date(2026, 10, 3, 12, 0, 0, 0, time.UTC)}
	originalPublishTask := model.PublishTask{ID: "publish", ItemNo: "HV6891-010", XianyuItemID: "1085680973385", PriceCents: 16000, ImageURLs: []string{"https://example.com/hv6891.png"}, BrandProfileID: "profile-1", PublishedAt: time.Date(2026, 9, 20, 11, 0, 0, 0, time.UTC), CreatedAt: time.Date(2026, 9, 20, 12, 0, 0, 0, time.UTC)}

	mergedTask := mergeLinkedTaskMetadata(latestOfflineTask, originalPublishTask)
	if mergedTask.PriceCents != 16000 || len(mergedTask.ImageURLs) != 1 || mergedTask.ImageURLs[0] != originalPublishTask.ImageURLs[0] {
		t.Fatalf("linked task presentation was not restored: %#v", mergedTask)
	}
	if mergedTask.BrandProfileID != "profile-1" || !mergedTask.CreatedAt.Equal(originalPublishTask.CreatedAt) || !mergedTask.PublishedAt.Equal(originalPublishTask.PublishedAt) {
		t.Fatalf("linked task metadata was not restored: %#v", mergedTask)
	}
}

func TestLockMarketplaceStateRespectsContextCancellation(t *testing.T) {
	var mutex sync.Mutex
	mutex.Lock()
	defer mutex.Unlock()
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()
	if err := lockMarketplaceState(ctx, &mutex); err == nil {
		t.Fatal("locked marketplace state ignored context cancellation")
	}
}

func TestTaskPublishDatePrefersPersistedFirstPublishDate(t *testing.T) {
	publishedAt := time.Date(2026, 9, 20, 12, 0, 0, 0, time.UTC)
	createdAt := time.Date(2026, 10, 10, 12, 0, 0, 0, time.UTC)
	fallback := time.Date(2026, 10, 11, 12, 0, 0, 0, time.UTC)
	task := model.PublishTask{PublishedAt: publishedAt, CreatedAt: createdAt}
	if actual := taskPublishDate(task, fallback); !actual.Equal(publishedAt) {
		t.Fatalf("unexpected publish date: %v", actual)
	}
}
