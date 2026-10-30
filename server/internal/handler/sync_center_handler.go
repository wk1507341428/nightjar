package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

type syncCenterProfileResponse struct {
	LogoURL          string `json:"logoUrl,omitempty"`
	OnlineGoodsCount int    `json:"onlineGoodsCount"`
	MetadataReady    bool   `json:"metadataReady"`
	types.BrandProfileResponse
	Ready        bool       `json:"ready"`
	Generation   string     `json:"generation,omitempty"`
	LastSyncedAt *time.Time `json:"lastSyncedAt,omitempty"`
	ProductCount int        `json:"productCount"`
	SKUCount     int        `json:"skuCount"`
}

func syncCenterProfilesHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		profiles, members, err := sc.InventoryRepository.ListBrandProfiles(r.Context())
		if err != nil {
			writeError(w, 500, "读取聚合品牌失败")
			return
		}
		heads, err := sc.SyncCenter.ListSnapshots(r.Context())
		if err != nil {
			writeError(w, 500, "读取同步版本失败")
			return
		}
		byProfile := make(map[string]catalog.SyncCenterSnapshot)
		for _, head := range heads {
			byProfile[head.ProfileID] = head
		}
		rows := make([]syncCenterProfileResponse, 0, len(profiles))
		for _, profile := range brandProfileResponses(profiles, members) {
			row := syncCenterProfileResponse{BrandProfileResponse: profile}
			if head, ok := byProfile[profile.ID]; ok {
				row.Generation = head.Generation
				row.LastSyncedAt = &head.SyncedAt
				row.ProductCount = head.ProductCount
				row.SKUCount = head.SKUCount
				row.Ready = syncProfileMembersMatch(profile.Members, head.Members)
			}
			if row.Ready {
				brand, stores, metadataErr := sc.SyncCenter.ReadDirectory(r.Context(), profile.ID)
				if metadataErr == nil {
					row.MetadataReady = true
					row.LogoURL = brand.LogoURL
					for _, store := range stores {
						row.OnlineGoodsCount += store.OnlineGoodsCount
					}
				}
			}
			rows = append(rows, row)
		}
		writeJSON(w, 200, rows)
	}
}

func syncProfileMembersMatch(config []types.BrandProfileMemberRequest, snapshot []catalog.BrandProfileMember) bool {
	if len(config) == 0 || len(config) != len(snapshot) {
		return false
	}
	keys := make(map[string]bool)
	for _, member := range snapshot {
		keys[member.RegionID+":"+member.DistributorID] = true
	}
	for _, member := range config {
		if !keys[member.RegionID+":"+member.DistributorID] {
			return false
		}
	}
	return true
}

func listSyncCenterRunsHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := sc.SyncCenter.ListRuns(r.Context())
		if err != nil {
			writeError(w, 500, "读取同步任务失败")
			return
		}
		writeJSON(w, 200, map[string]any{"list": rows})
	}
}

func startSyncCenterRunsHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			BrandProfileIDs []string `json:"brandProfileIds"`
		}
		if json.NewDecoder(r.Body).Decode(&body) != nil {
			writeError(w, 400, "同步参数无效")
			return
		}
		ids := uniqueStrings(body.BrandProfileIDs)
		if len(ids) == 0 || len(ids) > 30 {
			writeError(w, 400, "请选择1到30个聚合品牌")
			return
		}
		// 在创建任何任务前验证所有目标，避免半组品牌被隐式启动。
		for _, id := range ids {
			_, members, err := sc.InventoryRepository.GetBrandProfile(r.Context(), id)
			if err != nil || len(members) == 0 {
				writeError(w, 400, "聚合品牌不存在或尚未配置门店")
				return
			}
		}
		runs := make([]catalog.SyncCenterRun, 0, len(ids))
		for _, id := range ids {
			run, err := sc.SyncCenter.Start(r.Context(), id)
			if err != nil {
				writeError(w, 500, fmt.Sprintf("启动同步失败：%v", err))
				return
			}
			runs = append(runs, run)
		}
		writeJSON(w, http.StatusAccepted, map[string]any{"list": runs})
	}
}

func searchSyncedSKUsHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := syncedSearchQuery(r)
		rows, err := sc.SyncCenter.SearchSKUs(r.Context(), query)
		if err != nil {
			writeError(w, 500, "读取本地SKU数据失败")
			return
		}
		writeJSON(w, 200, rows)
	}
}

func syncedSearchQuery(r *http.Request) catalog.SyncCenterProductSearch {
	q := r.URL.Query()
	region := strings.TrimSpace(q.Get("regionId"))
	if region == "all" {
		region = ""
	}
	return catalog.SyncCenterProductSearch{AccountID: strings.TrimSpace(q.Get("accountId")), ProfileID: strings.TrimSpace(q.Get("brandProfileId")), Keyword: strings.TrimSpace(q.Get("keyword")), RegionID: region, DistributorID: strings.TrimSpace(q.Get("distributorId")), CategoryIDs: splitSyncedCategories(q.Get("categoryId")), StockOnly: q.Get("stockOnly") == "true", Page: parsePositiveInt(q.Get("page"), 1), PageSize: parsePositiveInt(q.Get("pageSize"), 30), Sort: q.Get("sort")}
}

func splitSyncedCategories(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	return uniqueStrings(strings.Split(raw, ","))
}

// syncCenterMetadataHandler exposes only the current complete local brand/store/taxonomy generation.
func syncCenterMetadataHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := catalogRouteID(r, "/api/catalog/sync-center/profiles/", "/metadata")
		metadata, err := sc.SyncCenter.ReadMetadata(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusConflict, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, metadata)
	}
}
