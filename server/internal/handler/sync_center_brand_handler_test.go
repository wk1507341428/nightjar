package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
)

func TestSyncBrandResponseUsesStableBrandIDAndKeepsFailedProgressSeparateFromData(t *testing.T) {
	observed := time.Date(2026, 10, 28, 1, 0, 0, 0, time.UTC)
	row := syncBrandResponse(catalog.SyncCenterBrandState{ProfileID: "brand", ProfileName: "COACH", LatestRun: &catalog.SyncCenterRun{ID: "failed-run", ProfileID: "brand", Status: catalog.SyncCenterFailed, UpdatedAt: observed.Add(time.Hour)}, Snapshot: &catalog.SyncCenterSnapshot{ProfileID: "brand", Generation: "success", SyncedAt: observed, ProductCount: 1354, SKUCount: 2037}})
	data, err := json.Marshal(row)
	if err != nil {
		t.Fatal(err)
	}
	var value map[string]any
	if err = json.Unmarshal(data, &value); err != nil {
		t.Fatal(err)
	}
	if value["id"] != "brand" || value["runId"] != "failed-run" || value["status"] != catalog.SyncCenterFailed || value["snapshotProductCount"] != float64(1354) || value["snapshotSKUCount"] != float64(2037) || value["processed"] != float64(0) {
		t.Fatalf("brand identity/data coverage lost: %s", data)
	}
	if row.LastSyncedAt == nil || !row.LastSyncedAt.Equal(observed) {
		t.Fatal("source success time changed")
	}
}

func TestDeleteSourceBrandRejectsNativeWorkBeforeRemovingData(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 2, false)
	fixture.sc.MongoClient = fixture.db.Client()
	fixture.sc.Config.Mongo.Database = fixture.db.Name()
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{aggregateFixtureProduct(2, sourceStatusOnSale)})
	if err := fixture.sc.PublishRepository.Create(fixture.ctx, model.PublishTask{ID: "native-running", AccountID: "default", BrandProfileID: "adidas", ItemNo: aggregateFixtureItemNo, Status: model.PublishTaskPublishing}); err != nil {
		t.Fatal(err)
	}
	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodDelete, "/api/catalog/sync-center/brands/adidas", nil)
	deleteSyncCenterBrandHandler(fixture.sc)(response, request)
	if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), "发布任务") {
		t.Fatalf("native source use not protected: %d %s", response.Code, response.Body.String())
	}
	count, err := fixture.db.Collection("source_sync_heads").CountDocuments(fixture.ctx, map[string]any{})
	if err != nil || count != 1 {
		t.Fatalf("source snapshot changed: %d %v", count, err)
	}
}
