package handler

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"sidejob-server/internal/model"
)

func TestOfflineCandidateResponseRetainsActualStockOutReason(t *testing.T) {
	plan := publishBatchPlan{OfflineListings: []model.MarketplaceListing{{PlatformItemID: "stock-out", ItemNo: "OUT"}}}
	rows := publishBatchOfflineCandidateResponses(plan)
	encoded, err := json.Marshal(rows)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || len(rows[0].ChangeReasons) != 1 || rows[0].ChangeReasons[0] != sourceStockOutReason || !strings.Contains(string(encoded), `"changeReasons"`) {
		t.Fatalf("reason lost in API contract: %s", encoded)
	}
}

func TestCurrentPreviewPolicyRejectsOldPlansForReadAndSubmit(t *testing.T) {
	for _, profile := range []string{"", "coach"} {
		data, err := encodePreviewPlan(publishBatchPlan{BrandProfileID: profile, SourceSnapshotVersion: "synced_source_stock_v4"})
		if err != nil {
			t.Fatal(err)
		}
		var plan publishBatchPlan
		if err := decodeCurrentPreviewPlan(data, &plan); !errors.Is(err, errPreviewPolicyChanged) {
			t.Fatalf("old policy admitted for profile %q: %v", profile, err)
		}
	}
	data, err := encodePreviewPlan(publishBatchPlan{SourceSnapshotVersion: aggregateSnapshotVersion})
	if err != nil {
		t.Fatal(err)
	}
	var current publishBatchPlan
	if err := decodeCurrentPreviewPlan(data, &current); err != nil {
		t.Fatal(err)
	}
}
