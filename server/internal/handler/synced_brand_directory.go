package handler

import (
	"net/http"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

// localMaintenanceSources never discovers the mini program during page reads.
func localMaintenanceSources(sc *svc.ServiceContext, r *http.Request, _ []catalog.BrandProfile, members []catalog.BrandProfileMember, profileByMember map[string]string) ([]types.BrandMaintenanceSourceResponse, error) {
	rows := make([]types.BrandMaintenanceSourceResponse, 0, len(members))
	stores, err := sc.CatalogService.ListBrandStores(r.Context(), "")
	if err != nil {
		return nil, err
	}
	seen := make(map[string]bool)
	for _, store := range stores {
		key := store.RegionID + ":" + store.DistributorID
		seen[key] = true
		rows = append(rows, types.BrandMaintenanceSourceResponse{RegionID: store.RegionID, DistributorID: store.DistributorID, Name: store.BrandName, ProfileID: profileByMember[key]})
	}
	for _, member := range members {
		if seen[member.RegionID+":"+member.DistributorID] {
			continue
		}
		rows = append(rows, types.BrandMaintenanceSourceResponse{RegionID: member.RegionID, DistributorID: member.DistributorID, Name: member.SourceName, ProfileID: profileByMember[member.RegionID+":"+member.DistributorID]})
	}
	return rows, nil
}
