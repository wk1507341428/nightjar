package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/google/uuid"
	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
)

var brandMaintenanceRegionIDs = []string{"2", "3", "4", "5", "6", "7"}

// getBrandMaintenanceHandler 拉取各地区最新品牌并合并本地配置关系。
func getBrandMaintenanceHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		profiles, members, err := serviceContext.InventoryRepository.ListBrandProfiles(request.Context())
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "读取品牌档案失败")
			return
		}
		profileIDByMember := make(map[string]string, len(members))
		for _, member := range members {
			profileIDByMember[member.RegionID+":"+member.DistributorID] = member.ProfileID
		}
		sources := make([]types.BrandMaintenanceSourceResponse, 0)
		for _, regionID := range brandMaintenanceRegionIDs {
			candidates, discoverErr := serviceContext.CatalogService.DiscoverBrandStores(request.Context(), regionID)
			if discoverErr != nil {
				logx.Errorf("discover brand maintenance region %s: %v", regionID, discoverErr)
				writeError(responseWriter, http.StatusBadGateway, "实时品牌数据暂时无法读取")
				return
			}
			for _, candidate := range candidates {
				sources = append(sources, types.BrandMaintenanceSourceResponse{RegionID: regionID, DistributorID: candidate.DistributorID, Name: candidate.BrandName, LogoURL: candidate.LogoURL, OnlineGoodsCount: candidate.OnlineGoodsCount, ProfileID: profileIDByMember[regionID+":"+candidate.DistributorID]})
			}
		}
		writeJSON(responseWriter, http.StatusOK, types.BrandMaintenanceResponse{Profiles: brandProfileResponses(profiles, members), Sources: sources})
	}
}

// saveBrandProfileHandler 创建或更新品牌档案和成员。
func saveBrandProfileHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var body types.SaveBrandProfileRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
			writeError(responseWriter, http.StatusBadRequest, "品牌配置格式错误")
			return
		}
		body.Name = strings.TrimSpace(body.Name)
		if body.Name == "" || len(body.Members) == 0 {
			writeError(responseWriter, http.StatusBadRequest, "品牌名称和成员不能为空")
			return
		}
		profileID := strings.TrimSpace(body.ID)
		if profileID == "" {
			profileID = uuid.NewString()
		}
		now := time.Now()
		profile := catalog.BrandProfile{ID: profileID, Name: body.Name, DefaultRegionID: strings.TrimSpace(body.DefaultRegionID), CreatedAt: now, UpdatedAt: now}
		members := make([]catalog.BrandProfileMember, 0, len(body.Members))
		for _, member := range body.Members {
			regionID := strings.TrimSpace(member.RegionID)
			distributorID := strings.TrimSpace(member.DistributorID)
			if regionID == "" || distributorID == "" {
				continue
			}
			members = append(members, catalog.BrandProfileMember{ID: regionID + ":" + distributorID, ProfileID: profileID, RegionID: regionID, DistributorID: distributorID, SourceName: strings.TrimSpace(member.SourceName)})
		}
		if len(members) == 0 {
			writeError(responseWriter, http.StatusBadRequest, "请选择至少一个地区品牌")
			return
		}
		conflicted, err := serviceContext.InventoryRepository.HasBrandProfileMemberConflict(request.Context(), profileID, members)
		if err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "校验品牌成员失败")
			return
		}
		if conflicted {
			writeError(responseWriter, http.StatusConflict, "所选地区品牌已经属于其他品牌档案")
			return
		}
		if err := serviceContext.InventoryRepository.SaveBrandProfile(request.Context(), profile, members); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "保存品牌档案失败")
			return
		}
		if err := backfillBrandProfileListings(request.Context(), serviceContext, profile, members); err != nil {
			logx.Errorf("backfill brand profile listings %s: %v", profile.ID, err)
		}
		writeJSON(responseWriter, http.StatusOK, brandProfileResponses([]catalog.BrandProfile{profile}, members)[0])
	}
}

// backfillBrandProfileListings 用历史发布任务补齐现有闲鱼商品的品牌来源。
func backfillBrandProfileListings(ctx context.Context, serviceContext *svc.ServiceContext, profile catalog.BrandProfile, members []catalog.BrandProfileMember) error {
	regionIDs := make([]string, 0)
	memberIDByRegion := make(map[string][]string)
	brandNames := []string{profile.Name}
	for _, member := range members {
		regionIDs = appendUniqueString(regionIDs, member.RegionID)
		memberIDByRegion[member.RegionID] = append(memberIDByRegion[member.RegionID], member.ID)
		brandNames = append(brandNames, member.SourceName)
	}
	tasks, err := serviceContext.PublishRepository.ListSucceededByRegions(ctx, regionIDs)
	if err != nil {
		return err
	}
	for _, task := range tasks {
		if !matchesBrandProfile(task.Brand, brandNames) {
			continue
		}
		sourceItemIDs := task.SourceItemIDs
		if len(sourceItemIDs) == 0 && task.SourceItemID != "" {
			sourceItemIDs = []string{task.SourceItemID}
		}
		if err := serviceContext.ListingRepository.BindBrandProfile(ctx, task.XianyuItemID, profile.ID, "legacy", []string{task.RegionID}, memberIDByRegion[task.RegionID], sourceItemIDs); err != nil {
			return err
		}
	}
	return nil
}

// matchesBrandProfile 判断发布任务品牌是否属于档案名称集合。
func matchesBrandProfile(taskBrand string, brandNames []string) bool {
	normalizedTaskBrand := normalizeBrandText(taskBrand)
	if normalizedTaskBrand == "" {
		return false
	}
	for _, brandName := range brandNames {
		normalizedName := normalizeBrandText(brandName)
		if normalizedName != "" && (strings.Contains(normalizedName, normalizedTaskBrand) || strings.Contains(normalizedTaskBrand, normalizedName)) {
			return true
		}
	}
	return false
}

// normalizeBrandText 清理品牌比较中的空格与符号。
func normalizeBrandText(value string) string {
	return strings.Map(func(character rune) rune {
		if unicode.IsLetter(character) || unicode.IsDigit(character) {
			return unicode.ToUpper(character)
		}
		return -1
	}, value)
}

// appendUniqueString 追加非空且未出现的字符串。
func appendUniqueString(values []string, value string) []string {
	for _, currentValue := range values {
		if currentValue == value {
			return values
		}
	}
	return append(values, value)
}

// deleteBrandProfileHandler 删除一个品牌档案配置。
func deleteBrandProfileHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		profileID := catalogRouteID(request, "/api/catalog/brand-profiles/", "")
		if err := serviceContext.InventoryRepository.DeleteBrandProfile(request.Context(), profileID); err != nil {
			writeError(responseWriter, http.StatusInternalServerError, "删除品牌档案失败")
			return
		}
		writeJSON(responseWriter, http.StatusOK, map[string]bool{"deleted": true})
	}
}

// syncBrandProfileHandler 顺序同步品牌档案下的全部地区成员。
func syncBrandProfileHandler(serviceContext *svc.ServiceContext) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		profileID := catalogRouteID(request, "/api/catalog/brand-profiles/", "/sync")
		profile, members, err := serviceContext.InventoryRepository.GetBrandProfile(request.Context(), profileID)
		if err != nil {
			writeError(responseWriter, http.StatusNotFound, "品牌档案不存在")
			return
		}
		go func() {
			syncContext, cancel := context.WithTimeout(context.Background(), 3*time.Hour)
			defer cancel()
			for _, member := range members {
				brandStore, saveErr := serviceContext.CatalogService.SaveBrandStore(syncContext, catalog.BrandStoreCandidate{RegionID: member.RegionID, DistributorID: member.DistributorID, BrandName: member.SourceName}, true)
				if saveErr != nil {
					logx.Errorf("save brand profile member %s: %v", member.ID, saveErr)
					continue
				}
				if _, syncErr := serviceContext.CatalogService.SyncBrandStore(syncContext, brandStore.ID); syncErr != nil {
					logx.Errorf("sync brand profile member %s: %v", member.ID, syncErr)
				}
			}
		}()
		writeJSON(responseWriter, http.StatusAccepted, map[string]any{"profileId": profile.ID, "profileName": profile.Name, "memberCount": len(members), "status": "running"})
	}
}

// brandProfileResponses 组装品牌档案及成员响应。
func brandProfileResponses(profiles []catalog.BrandProfile, members []catalog.BrandProfileMember) []types.BrandProfileResponse {
	membersByProfile := make(map[string][]types.BrandProfileMemberRequest)
	for _, member := range members {
		membersByProfile[member.ProfileID] = append(membersByProfile[member.ProfileID], types.BrandProfileMemberRequest{RegionID: member.RegionID, DistributorID: member.DistributorID, SourceName: member.SourceName})
	}
	responses := make([]types.BrandProfileResponse, 0, len(profiles))
	for _, profile := range profiles {
		responses = append(responses, types.BrandProfileResponse{ID: profile.ID, Name: profile.Name, DefaultRegionID: profile.DefaultRegionID, Members: membersByProfile[profile.ID], UpdatedAt: profile.UpdatedAt.Format(time.RFC3339)})
	}
	return responses
}
