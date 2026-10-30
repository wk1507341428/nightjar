package handler

import (
	"errors"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
)

// syncCenterBrandResponse uses a stable profile ID; latest-run progress and active data coverage are separate.
type syncCenterBrandResponse struct {
	catalog.SyncCenterRun
	ID                   string     `json:"id"`
	RunID                string     `json:"runId,omitempty"`
	LastSyncedAt         *time.Time `json:"lastSyncedAt,omitempty"`
	SnapshotProductCount int        `json:"snapshotProductCount"`
	SnapshotSKUCount     int        `json:"snapshotSKUCount"`
}

func syncBrandResponse(state catalog.SyncCenterBrandState) syncCenterBrandResponse {
	row := syncCenterBrandResponse{ID: state.ProfileID, SyncCenterRun: catalog.SyncCenterRun{ProfileID: state.ProfileID, ProfileName: state.ProfileName, Status: catalog.SyncCenterFailed, StartedAt: state.CreatedAt, UpdatedAt: state.UpdatedAt, Error: "同步任务尚未创建，请重试"}}
	if state.LatestRun != nil {
		row.SyncCenterRun = *state.LatestRun
		row.RunID = state.LatestRun.ID
	}
	if state.Snapshot != nil {
		row.LastSyncedAt = &state.Snapshot.SyncedAt
		row.SnapshotProductCount = state.Snapshot.ProductCount
		row.SnapshotSKUCount = state.Snapshot.SKUCount
		if state.LatestRun == nil {
			row.Status = catalog.SyncCenterComplete
			row.Stage = catalog.SyncCenterStageActivate
			row.Processed = state.Snapshot.ProductCount
			row.Total = state.Snapshot.ProductCount
			row.ProductCount = state.Snapshot.ProductCount
			row.SKUCount = state.Snapshot.SKUCount
			row.UpdatedAt = state.Snapshot.SyncedAt
			row.Error = ""
		}
	}
	row.ProfileID = state.ProfileID
	if state.ProfileName != "" {
		row.ProfileName = state.ProfileName
	}
	return row
}

func listSyncCenterBrandsHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		states, err := sc.SyncCenter.ListBrands(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, "读取同步品牌失败")
			return
		}
		rows := make([]syncCenterBrandResponse, 0, len(states))
		for _, state := range states {
			rows = append(rows, syncBrandResponse(state))
		}
		writeJSON(w, http.StatusOK, map[string]any{"list": rows})
	}
}

// deleteSyncCenterBrandHandler deletes local source data only, never configured profiles or marketplace goods.
func deleteSyncCenterBrandHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := catalogRouteID(r, "/api/catalog/sync-center/brands/", "")
		// A worker already using this source snapshot must finish before its backing data can be removed.
		active, err := sc.MongoClient.Database(sc.Config.Mongo.Database).Collection("publish_tasks").CountDocuments(r.Context(), bson.M{"brandProfileId": id, "status": bson.M{"$in": []string{model.PublishTaskQueued, model.PublishTaskPreparing, model.PublishTaskPublishing}}})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "检查品牌使用状态失败")
			return
		}
		if active > 0 {
			writeError(w, http.StatusConflict, "该品牌仍有发布任务使用本地数据，请任务结束后再删除")
			return
		}
		result, err := sc.SyncCenter.DeleteBrand(r.Context(), id)
		if err != nil {
			if errors.Is(err, catalog.ErrSyncCenterBusy) {
				writeError(w, http.StatusConflict, err.Error())
				return
			}
			if errors.Is(err, catalog.ErrSyncCenterBrandNotFound) {
				writeError(w, http.StatusNotFound, err.Error())
				return
			}
			writeError(w, http.StatusInternalServerError, "删除本地同步品牌失败，请重试")
			return
		}
		writeJSON(w, http.StatusOK, result)
	}
}
