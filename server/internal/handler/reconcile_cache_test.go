package handler

import (
	"context"
	"sidejob-server/internal/svc"
	"testing"
)

func TestReconcileSourcesNeverFallbackWhenUnsynced(t *testing.T) {
	for _, fresh := range []bool{false, true} {
		_, err := loadReconcileSources(context.Background(), &svc.ServiceContext{}, []string{"5:278"}, fresh)
		if err == nil {
			t.Fatal("unsynced source must fail closed rather than query mini program")
		}
	}
}
