package handler

import (
	"fmt"
	"net/http"
	"sort"
	"strings"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// sourceSearchQuery resolves stable local store IDs from aggregate-brand configuration only.
func sourceSearchQuery(sc *svc.ServiceContext, r *http.Request) (catalog.SyncCenterProductSearch, error) {
	query := syncedSearchQuery(r)
	storeID := strings.TrimSpace(r.URL.Query().Get("brandStoreId"))
	if storeID != "" && storeID != "all" {
		_, members, err := sc.InventoryRepository.ListBrandProfiles(r.Context())
		if err != nil {
			return query, err
		}
		matched := false
		for _, member := range members {
			if catalog.BrandStoreIDForSource(member.RegionID, member.DistributorID) == storeID || member.DistributorID == strings.TrimPrefix(storeID, "live:") {
				if query.RegionID != "" && query.RegionID != member.RegionID {
					continue
				}
				query.RegionID = member.RegionID
				query.DistributorID = member.DistributorID
				matched = true
				break
			}
		}
		if !matched {
			return query, fmt.Errorf("品牌门店未配置，请先在品牌维护中配置聚合品牌")
		}
	}
	switch query.Sort {
	case "priceAsc":
		query.Sort = "price_asc"
	case "priceDesc":
		query.Sort = "price_desc"
	}
	return query, nil
}

func syncedProductMap(product catalog.SyncCenterProduct) map[string]any {
	row := product.Data
	row["catalog_offer_id"] = product.ID
	row["regionauth_id"] = product.RegionID
	row["item_no"] = product.ItemNo
	row["item_name"] = product.Name
	row["_sync_generation"] = product.Generation
	row["brand_profile_id"] = product.ProfileID
	row["last_synced_at"] = product.SyncedAt.Format("2006-01-02T15:04:05Z07:00")
	return row
}

func syncedSourceCategoriesHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		categories, err := sc.SyncCenter.ReadCategories(r.Context(), r.URL.Query().Get("brandProfileId"), r.URL.Query().Get("regionId"), r.URL.Query().Get("distributorId"))
		if err != nil {
			writeError(w, 409, err.Error())
			return
		}
		writeJSON(w, 200, categories)
	}
}

func localSourceCategories(products []catalog.SyncCenterProduct) []catalog.BrandCategory {
	byID := make(map[string]catalog.BrandCategory)
	for _, product := range products {
		for _, category := range sourceProductCategoryRows(product.Data) {
			id := firstProductString(category, "category_id", "id")
			name := firstProductString(category, "category_name", "name")
			if id != "" && name != "" {
				// 使用同步原始详情中的品类图片，空图片不覆盖同品类已读到的图片。
				imageURL := productString(category, "image_url")
				if imageURL == "" {
					imageURL = byID[id].ImageURL
				}
				byID[id] = catalog.BrandCategory{ID: id, Name: name, ImageURL: imageURL}
			}
		}
	}
	rows := make([]catalog.BrandCategory, 0, len(byID))
	for _, category := range byID {
		rows = append(rows, category)
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].Name < rows[j].Name })
	return rows
}

// sourceBrandStores exposes configured source stores and their latest successful sync time.
func sourceBrandStores(sc *svc.ServiceContext, r *http.Request) ([]types.CatalogBrandStoreResponse, error) {
	_, members, err := sc.InventoryRepository.ListBrandProfiles(r.Context())
	if err != nil {
		return nil, err
	}
	heads, err := sc.SyncCenter.ListSnapshots(r.Context())
	if err != nil {
		return nil, err
	}
	byID := make(map[string]catalog.SyncCenterSnapshot)
	for _, head := range heads {
		byID[head.ProfileID] = head
	}
	region := r.URL.Query().Get("regionId")
	rows := make([]types.CatalogBrandStoreResponse, 0, len(members))
	for _, member := range members {
		if region != "" && region != "all" && member.RegionID != region {
			continue
		}
		row := types.CatalogBrandStoreResponse{ID: catalog.BrandStoreIDForSource(member.RegionID, member.DistributorID), RegionID: member.RegionID, DistributorID: member.DistributorID, BrandName: member.SourceName, SyncEnabled: true}
		if head, ok := byID[member.ProfileID]; ok {
			row.LastSyncedAt = head.SyncedAt.Format("2006-01-02T15:04:05Z07:00")
		}
		rows = append(rows, row)
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].BrandName < rows[j].BrandName })
	return rows, nil
}
