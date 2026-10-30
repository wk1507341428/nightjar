package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/types"
)

// Expired and previously submitted previews are user conflicts, never generic 500s.
func TestPreviewSubmissionConflictReturnsActionable409(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 6, false)
	fixture.sc.MongoClient = fixture.db.Client()
	fixture.sc.Config.Mongo.Database = fixture.db.Name()
	for _, status := range []string{"submitted", "ready"} {
		job := previewJob{ID: status, Status: status, CreatedAt: time.Now().Add(-time.Hour), Request: types.CreatePublishBatchRequest{AccountID: "default"}}
		if _, err := fixture.db.Collection("publish_previews").InsertOne(fixture.ctx, job); err != nil {
			t.Fatal(err)
		}
		request := httptest.NewRequest(http.MethodPost, "/api/xianyu/publish-operations", strings.NewReader(`{"accountId":"default","previewId":"`+status+`"}`))
		response := httptest.NewRecorder()
		createPublishBatchHandler(fixture.sc)(response, request)
		if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), errPreviewUnavailable.Error()) {
			t.Fatalf("unexpected response: %d %s", response.Code, response.Body.String())
		}
	}
}

// Preview serialization must retain the same duplicate protection as confirmation.
func TestPreviewActivationRecheckKeepsUnknownAndBusyOutOfDisplayedPlan(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 6, false)
	_, err := fixture.db.Collection("marketplace_listings").InsertOne(fixture.ctx, model.MarketplaceListing{ID: "unknown", AccountID: "default", Platform: "xianyu", PlatformItemID: "unknown", ItemNo: "UNKNOWN", ItemNoKey: "UNKNOWN", SaleStatus: model.MarketplaceStatusUnknown})
	if err != nil {
		t.Fatal(err)
	}
	if err := fixture.sc.PublishRepository.Create(fixture.ctx, model.PublishTask{ID: "busy", AccountID: "default", ItemNo: "BUSY", Status: model.PublishTaskQueued}); err != nil {
		t.Fatal(err)
	}
	plan := publishBatchPlan{AccountID: "default", Candidates: []map[string]any{{"item_no": "UNKNOWN"}, {"item_no": "BUSY"}, {"item_no": "NEW"}}}
	if err := recheckPreviewActivations(fixture.ctx, fixture.sc, &plan); err != nil {
		t.Fatal(err)
	}
	encoded, err := encodePreviewPlan(plan)
	if err != nil {
		t.Fatal(err)
	}
	var actual publishBatchPlan
	if err := decodePreviewPlan(encoded, &actual); err != nil {
		t.Fatal(err)
	}
	if len(actual.Candidates) != 1 || productString(actual.Candidates[0], "item_no") != "NEW" || len(actual.Skipped) != 2 {
		data, _ := json.Marshal(actual)
		t.Fatalf("unsafe displayed preview: %s", data)
	}
}
