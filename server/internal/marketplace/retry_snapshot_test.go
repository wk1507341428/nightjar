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
