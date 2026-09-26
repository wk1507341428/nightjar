package marketplace

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestRetrySnapshotReusesAndForcesRefresh(t *testing.T) {
	service := &Service{}
	var calls atomic.Int32
	refresh := func() (int, error) { calls.Add(1); return 42, nil }
	var group sync.WaitGroup
	for i := 0; i < 20; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			if _, err := service.ensureRetrySnapshot(context.Background(), false, refresh); err != nil {
				t.Error(err)
			}
		}()
	}
	group.Wait()
	if calls.Load() != 1 {
		t.Fatalf("duplicate full sync: %d", calls.Load())
	}
	_, _ = service.ensureRetrySnapshot(context.Background(), true, refresh)
	if calls.Load() != 2 {
		t.Fatal("uncertain publish did not force refresh")
	}
	service.lastFullSync = time.Now().Add(-61 * time.Second)
	_, _ = service.ensureRetrySnapshot(context.Background(), false, refresh)
	if calls.Load() != 3 {
		t.Fatal("expired snapshot reused")
	}
}

func TestFailedSnapshotDoesNotBecomeFresh(t *testing.T) {
	service := &Service{}
	_, err := service.ensureRetrySnapshot(context.Background(), false, func() (int, error) { return 0, fmt.Errorf("network failed") })
	if err == nil || !service.lastFullSync.IsZero() {
		t.Fatal("failure cached as successful snapshot")
	}
}
