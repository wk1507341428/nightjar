package marketplace

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"sidejob-server/internal/model"
)

func TestActivationBatchSharesOneRemoteReadAndInvalidatesUnknownResult(t *testing.T) {
	service := &Service{accountStates: make(map[string]*accountSyncState)}
	var calls atomic.Int32
	refresh := func() (int, error) { calls.Add(1); return 2833, nil }
	var group sync.WaitGroup
	for i := 0; i < 30; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			if err := service.ensureActivationSnapshot(context.Background(), "a", "batch-a", refresh); err != nil {
				t.Error(err)
			}
		}()
	}
	group.Wait()
	state := service.stateForAccount("a")
	state.lastFullSync = time.Now().Add(-10 * time.Minute)
	for i := 0; i < 1000; i++ {
		if err := service.ensureActivationSnapshot(context.Background(), "a", "batch-a", refresh); err != nil {
			t.Fatal(err)
		}
	}
	if calls.Load() != 1 {
		t.Fatalf("same batch caused %d full remote reads", calls.Load())
	}
	if err := service.ensureActivationSnapshot(context.Background(), "a", "batch-b", refresh); err != nil {
		t.Fatal(err)
	}
	if err := service.ensureActivationSnapshot(context.Background(), "b", "batch-a", refresh); err != nil {
		t.Fatal(err)
	}
	service.InvalidateActivationSnapshot("a")
	if err := service.ensureActivationSnapshot(context.Background(), "a", "batch-b", refresh); err != nil {
		t.Fatal(err)
	}
	if calls.Load() != 4 {
		t.Fatalf("new batch/account/uncertain outcome did not refresh: %d", calls.Load())
	}
}

func TestActivationSnapshotFailureAndCancelledContextAreNotCached(t *testing.T) {
	service := &Service{accountStates: make(map[string]*accountSyncState)}
	refresh := func() (int, error) { return 0, errors.New("network failed") }
	if err := service.ensureActivationSnapshot(context.Background(), "a", "batch", refresh); err == nil {
		t.Fatal("failed remote read was accepted")
	}
	if !service.stateForAccount("a").lastFullSync.IsZero() {
		t.Fatal("failed remote read became a valid baseline")
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := service.ensureActivationSnapshot(ctx, "a", "batch", refresh); err == nil {
		t.Fatal("cancelled activation continued")
	}
}

func TestActivationConflictHandlesAliasesColorsAndRelistIdentity(t *testing.T) {
	listings := []model.MarketplaceListing{{PlatformItemID: "retained", ItemNo: "310128 02"}}
	if err := activationConflict(model.PublishTask{ItemNo: "31012802"}, listings); err == nil {
		t.Fatal("existing whitespace alias was treated as a new product")
	}
	if err := activationConflict(model.PublishTask{ItemNo: "31012803"}, listings); err != nil {
		t.Fatal("a different color was blocked")
	}
	if err := activationConflict(model.PublishTask{Action: model.PublishActionRelist, ItemNo: "31012802", XianyuItemID: "another"}, listings); err == nil {
		t.Fatal("another old link could be restored beside an on-sale product")
	}
	if err := activationConflict(model.PublishTask{Action: model.PublishActionRelist, ItemNo: "31012802", XianyuItemID: "retained"}, listings); err != nil {
		t.Fatal("idempotent restore of the same link was blocked")
	}
}

func TestPriceCeilingBlocksFirstPublishAndRestoreBeforeAnyRemoteRead(t *testing.T) {
	service := &Service{}
	for _, action := range []string{"", model.PublishActionPublish, model.PublishActionRelist} {
		err := service.CheckListingActivation(context.Background(), model.PublishTask{Action: action, ItemNo: "NO-PROFIT", OriginalPriceCents: 10000, PriceCents: 14000})
		if !errors.Is(err, model.ErrListingAboveOriginal) {
			t.Fatalf("unsafe price reached remote or database dependencies: %v", err)
		}
	}
}

// Equal source/original and missing retail may not reach any remote dependency.
func TestActivationRejectsFullPriceMarkupAndUnknownOriginalBeforeRemoteRead(t *testing.T) {
	service := &Service{}
	for _, action := range []string{"", model.PublishActionPublish, model.PublishActionRelist} {
		for _, original := range []int64{0, 265000} {
			task := model.PublishTask{Action: action, ItemNo: "CU068 B4MPL", SourcePriceCents: 265000, OriginalPriceCents: original, PriceCents: 277000}
			err := service.CheckListingActivation(context.Background(), task)
			expected := model.ErrListingAboveOriginal
			if original == 0 {
				expected = model.ErrListingOriginalUnknown
			}
			if !errors.Is(err, expected) {
				t.Fatalf("unsafe activation reached dependencies: action=%q original=%d error=%v", action, original, err)
			}
		}
	}
}
