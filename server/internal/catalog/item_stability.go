package catalog

import (
	"context"
	"sort"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const stabilityWindowDays = 10

var stabilityTimezone = time.FixedZone("Asia/Shanghai", 8*60*60)

// stabilityScopeSnapshot 是一次可安全参与评分的完整品牌货源观察。
type stabilityScopeSnapshot struct {
	ScopeID          string
	BrandProfileID   string
	SourceMemberIDs  []string
	AvailableItemNos map[string]struct{}
}

// recordItemStabilitySnapshots 在完整发布货源快照落库后更新商品稳定度。
func (service *Service) recordItemStabilitySnapshots(ctx context.Context, snapshots []PublishSourceSnapshot) error {
	scopeSnapshots, err := service.buildStabilityScopeSnapshots(ctx, snapshots)
	if err != nil {
		return err
	}
	for _, scopeSnapshot := range scopeSnapshots {
		if err := service.inventoryRepository.RecordItemStabilityObservation(ctx, scopeSnapshot); err != nil {
			return err
		}
	}
	return nil
}

// buildStabilityScopeSnapshots 将多地区门店快照合并成聚合品牌级观察。
func (service *Service) buildStabilityScopeSnapshots(ctx context.Context, snapshots []PublishSourceSnapshot) ([]stabilityScopeSnapshot, error) {
	profileSnapshots := make(map[string][]PublishSourceSnapshot)
	standaloneSnapshots := make([]PublishSourceSnapshot, 0)
	for _, snapshot := range snapshots {
		if !snapshot.Complete {
			continue
		}
		if snapshot.BrandProfileID == "" {
			standaloneSnapshots = append(standaloneSnapshots, snapshot)
			continue
		}
		profileSnapshots[snapshot.BrandProfileID] = append(profileSnapshots[snapshot.BrandProfileID], snapshot)
	}

	scopeSnapshots := make([]stabilityScopeSnapshot, 0, len(profileSnapshots)+len(standaloneSnapshots))
	for profileID, groupedSnapshots := range profileSnapshots {
		_, members, err := service.inventoryRepository.GetBrandProfile(ctx, profileID)
		if err != nil {
			return nil, err
		}
		expectedMemberIDs := make([]string, 0, len(members))
		for _, member := range members {
			expectedMemberIDs = append(expectedMemberIDs, member.RegionID+":"+member.DistributorID)
		}
		providedMemberIDs := snapshotMemberIDs(groupedSnapshots)
		if !sameStringSet(expectedMemberIDs, providedMemberIDs) {
			continue
		}
		scopeSnapshots = append(scopeSnapshots, stabilityScopeSnapshot{ScopeID: profileID, BrandProfileID: profileID, SourceMemberIDs: providedMemberIDs, AvailableItemNos: snapshotAvailableItemNos(groupedSnapshots)})
	}
	for _, snapshot := range standaloneSnapshots {
		brandStoreID := BrandStoreIDForSource(snapshot.RegionID, snapshot.DistributorID)
		memberID := snapshot.RegionID + ":" + snapshot.DistributorID
		scopeSnapshots = append(scopeSnapshots, stabilityScopeSnapshot{ScopeID: "store:" + brandStoreID, SourceMemberIDs: []string{memberID}, AvailableItemNos: snapshotAvailableItemNos([]PublishSourceSnapshot{snapshot})})
	}
	return scopeSnapshots, nil
}

// snapshotMemberIDs 返回本次完整观察覆盖的来源门店。
func snapshotMemberIDs(snapshots []PublishSourceSnapshot) []string {
	memberSet := make(map[string]struct{}, len(snapshots))
	for _, snapshot := range snapshots {
		memberSet[snapshot.RegionID+":"+snapshot.DistributorID] = struct{}{}
	}
	memberIDs := make([]string, 0, len(memberSet))
	for memberID := range memberSet {
		memberIDs = append(memberIDs, memberID)
	}
	sort.Strings(memberIDs)
	return memberIDs
}

// snapshotAvailableItemNos 返回任一来源当前仍存在的标准化货号集合。
func snapshotAvailableItemNos(snapshots []PublishSourceSnapshot) map[string]struct{} {
	itemNos := make(map[string]struct{})
	for _, snapshot := range snapshots {
		for _, product := range snapshot.Products {
			itemNo := strings.ToUpper(strings.TrimSpace(mapString(product, "item_no")))
			if itemNo != "" {
				itemNos[itemNo] = struct{}{}
			}
		}
	}
	return itemNos
}

// sameStringSet 判断两组来源门店是否完全一致。
func sameStringSet(expectedValues, actualValues []string) bool {
	if len(expectedValues) != len(actualValues) {
		return false
	}
	actualSet := make(map[string]struct{}, len(actualValues))
	for _, value := range actualValues {
		actualSet[value] = struct{}{}
	}
	for _, expectedValue := range expectedValues {
		if _, exists := actualSet[expectedValue]; !exists {
			return false
		}
	}
	return true
}

// RecordItemStabilityObservation 保存一次完整品牌观察，持续缺失只算一次下架事件。
func (repository *InventoryRepository) RecordItemStabilityObservation(ctx context.Context, snapshot stabilityScopeSnapshot) error {
	if snapshot.ScopeID == "" {
		return nil
	}
	boundItemNos, err := repository.listStabilityBoundItemNos(ctx, snapshot)
	if err != nil {
		return err
	}
	for itemNo := range snapshot.AvailableItemNos {
		boundItemNos[itemNo] = struct{}{}
	}

	existingStabilities, err := repository.ListItemStabilitiesByScope(ctx, snapshot.ScopeID)
	if err != nil {
		return err
	}
	existingByItemNo := make(map[string]ItemStability, len(existingStabilities))
	for _, stability := range existingStabilities {
		existingByItemNo[stability.ItemNo] = stability
	}

	now := time.Now()
	writes := make([]mongo.WriteModel, 0, len(boundItemNos))
	for itemNo := range boundItemNos {
		_, available := snapshot.AvailableItemNos[itemNo]
		nextStability := applyDailyAvailabilityObservation(existingByItemNo[itemNo], snapshot, itemNo, available, now)
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": nextStability.ID}).SetUpdate(bson.M{"$set": nextStability, "$unset": legacyStabilityFields()}).SetUpsert(true))
	}
	if len(writes) == 0 {
		return nil
	}
	_, err = repository.itemStabilities.BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false))
	return err
}

// listStabilityBoundItemNos 返回当前品牌历史出现过的全部货号。
func (repository *InventoryRepository) listStabilityBoundItemNos(ctx context.Context, snapshot stabilityScopeSnapshot) (map[string]struct{}, error) {
	filter := bson.M{"brandProfileId": snapshot.BrandProfileID}
	if snapshot.BrandProfileID == "" {
		memberID := strings.TrimPrefix(snapshot.SourceMemberIDs[0], "store:")
		parts := strings.SplitN(memberID, ":", 2)
		if len(parts) != 2 {
			return map[string]struct{}{}, nil
		}
		filter = bson.M{"regionId": parts[0], "distributorId": parts[1]}
	}
	values, err := repository.skuCategoryBindings.Distinct(ctx, "itemNo", filter)
	if err != nil {
		return nil, err
	}
	itemNos := make(map[string]struct{}, len(values))
	for _, value := range values {
		itemNo, isString := value.(string)
		if !isString {
			continue
		}
		normalizedItemNo := strings.ToUpper(strings.TrimSpace(itemNo))
		if normalizedItemNo != "" {
			itemNos[normalizedItemNo] = struct{}{}
		}
	}
	return itemNos, nil
}

// applyDailyAvailabilityObservation 合并当天观察并重新计算最近十天得分。
func applyDailyAvailabilityObservation(existing ItemStability, snapshot stabilityScopeSnapshot, itemNo string, available bool, observedAt time.Time) ItemStability {
	if existing.ID == "" {
		existing = ItemStability{ID: hashID(snapshot.ScopeID, itemNo), ScopeID: snapshot.ScopeID, BrandProfileID: snapshot.BrandProfileID, ItemNo: itemNo, FirstObservedAt: observedAt}
	}
	dayKey := stabilityDayKey(observedAt)
	dayMatched := false
	for dayIndex := range existing.DailyObservations {
		if existing.DailyObservations[dayIndex].Date != dayKey {
			continue
		}
		// 同一天只要出现一次完整缺货，该天就保持为不稳定。
		existing.DailyObservations[dayIndex].Available = existing.DailyObservations[dayIndex].Available && available
		existing.DailyObservations[dayIndex].LastObservedAt = observedAt
		dayMatched = true
		break
	}
	if !dayMatched {
		existing.DailyObservations = append(existing.DailyObservations, ItemStabilityDay{Date: dayKey, Available: available, LastObservedAt: observedAt})
	}
	existing.CurrentAvailable = available
	existing.SourceMemberIDs = append([]string{}, snapshot.SourceMemberIDs...)
	existing.LastObservedAt = observedAt
	if available {
		existing.LastAvailableAt = observedAt
	} else {
		existing.LastUnavailableAt = observedAt
	}
	return recalculateStabilityWindow(existing, observedAt)
}

// recalculateStabilityWindow 清理窗口外观察并计算最近十天得分。
func recalculateStabilityWindow(stability ItemStability, observedAt time.Time) ItemStability {
	windowStartKey := stabilityDayKey(observedAt.In(stabilityTimezone).AddDate(0, 0, -(stabilityWindowDays - 1)))
	windowEndKey := stabilityDayKey(observedAt)
	windowDays := make([]ItemStabilityDay, 0, stabilityWindowDays)
	for _, dailyObservation := range stability.DailyObservations {
		if dailyObservation.Date < windowStartKey || dailyObservation.Date > windowEndKey {
			continue
		}
		windowDays = append(windowDays, dailyObservation)
	}
	sort.Slice(windowDays, func(leftIndex, rightIndex int) bool { return windowDays[leftIndex].Date < windowDays[rightIndex].Date })
	availableDayCount := 0
	lastUnavailableAt := time.Time{}
	for _, dailyObservation := range windowDays {
		if dailyObservation.Available {
			availableDayCount++
			continue
		}
		if dailyObservation.LastObservedAt.After(lastUnavailableAt) {
			lastUnavailableAt = dailyObservation.LastObservedAt
		}
	}
	stability.DailyObservations = windowDays
	stability.ObservedDayCount = len(windowDays)
	stability.AvailableDayCount = availableDayCount
	stability.UnavailableDayCount = len(windowDays) - availableDayCount
	stability.LastUnavailableAt = lastUnavailableAt
	stability.Score = 10 - stability.UnavailableDayCount
	if stability.Score < 1 {
		stability.Score = 1
	}
	return stability
}

// stabilityDayKey 返回上海时区自然日键。
func stabilityDayKey(observedAt time.Time) string {
	return observedAt.In(stabilityTimezone).Format("2006-01-02")
}

// legacyStabilityFields 返回上一版累计模型遗留字段。
func legacyStabilityFields() bson.M {
	return bson.M{"observationCount": "", "availableObservationCount": "", "offlineEpisodeCount": "", "lastOfflineAt": ""}
}

// ListItemStabilitiesByScope 返回一个统计范围的全部稳定度记录。
func (repository *InventoryRepository) ListItemStabilitiesByScope(ctx context.Context, scopeID string) ([]ItemStability, error) {
	cursor, err := repository.itemStabilities.Find(ctx, bson.M{"scopeId": scopeID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	stabilities := make([]ItemStability, 0)
	if err := cursor.All(ctx, &stabilities); err != nil {
		return nil, err
	}
	now := time.Now()
	for stabilityIndex := range stabilities {
		stabilities[stabilityIndex] = recalculateStabilityWindow(stabilities[stabilityIndex], now)
	}
	return stabilities, nil
}

// ListItemStabilities 批量返回多个品牌和货号对应的稳定度记录。
func (repository *InventoryRepository) ListItemStabilities(ctx context.Context, itemNosByScope map[string][]string) ([]ItemStability, error) {
	filters := make(bson.A, 0, len(itemNosByScope))
	for scopeID, itemNos := range itemNosByScope {
		if scopeID == "" || len(itemNos) == 0 {
			continue
		}
		filters = append(filters, bson.M{"scopeId": scopeID, "itemNo": bson.M{"$in": itemNos}})
	}
	if len(filters) == 0 {
		return []ItemStability{}, nil
	}
	cursor, err := repository.itemStabilities.Find(ctx, bson.M{"$or": filters})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	stabilities := make([]ItemStability, 0)
	if err := cursor.All(ctx, &stabilities); err != nil {
		return nil, err
	}
	now := time.Now()
	for stabilityIndex := range stabilities {
		stabilities[stabilityIndex] = recalculateStabilityWindow(stabilities[stabilityIndex], now)
	}
	return stabilities, nil
}

// InitializeItemStabilityBaselines 使用现有商品库建立一次可重复执行的稳定度基线。
func (repository *InventoryRepository) InitializeItemStabilityBaselines(ctx context.Context) error {
	existingCount, err := repository.itemStabilities.CountDocuments(ctx, bson.M{}, options.Count().SetLimit(1))
	if err != nil {
		return err
	}
	if existingCount > 0 {
		return repository.migrateLegacyItemStabilities(ctx)
	}

	activeCursor, err := repository.offers.Find(ctx, bson.M{"inactiveAt": bson.M{"$exists": false}, "saleStatus": bson.M{"$nin": bson.A{"off_shelf", "offsale"}}}, options.Find().SetProjection(bson.M{"brandStoreId": 1, "itemNo": 1}))
	if err != nil {
		return err
	}
	defer activeCursor.Close(ctx)
	activeOffers := make([]CatalogOffer, 0)
	if err := activeCursor.All(ctx, &activeOffers); err != nil {
		return err
	}
	activeStoreItems := make(map[string]struct{}, len(activeOffers))
	for _, offer := range activeOffers {
		activeStoreItems[stabilityStoreItemKey(offer.BrandStoreID, offer.ItemNo)] = struct{}{}
	}

	bindingCursor, err := repository.skuCategoryBindings.Find(ctx, bson.M{"brandProfileId": bson.M{"$exists": true, "$ne": ""}}, options.Find().SetProjection(bson.M{"brandProfileId": 1, "brandStoreId": 1, "regionId": 1, "distributorId": 1, "itemNo": 1}))
	if err != nil {
		return err
	}
	defer bindingCursor.Close(ctx)
	bindings := make([]SKUCategoryBinding, 0)
	if err := bindingCursor.All(ctx, &bindings); err != nil {
		return err
	}

	type baselineItem struct {
		available      bool
		sourceMemberID map[string]struct{}
	}
	baselineByKey := make(map[string]*baselineItem)
	for _, binding := range bindings {
		itemNo := strings.ToUpper(strings.TrimSpace(binding.ItemNo))
		if itemNo == "" || binding.BrandProfileID == "" {
			continue
		}
		baselineKey := stabilityItemKey(binding.BrandProfileID, itemNo)
		baseline := baselineByKey[baselineKey]
		if baseline == nil {
			baseline = &baselineItem{sourceMemberID: make(map[string]struct{})}
			baselineByKey[baselineKey] = baseline
		}
		if _, available := activeStoreItems[stabilityStoreItemKey(binding.BrandStoreID, itemNo)]; available {
			baseline.available = true
		}
		baseline.sourceMemberID[binding.RegionID+":"+binding.DistributorID] = struct{}{}
	}

	observedAt := time.Now()
	writes := make([]mongo.WriteModel, 0, len(baselineByKey))
	for baselineKey, baseline := range baselineByKey {
		parts := strings.SplitN(baselineKey, "\x00", 2)
		if len(parts) != 2 {
			continue
		}
		memberIDs := make([]string, 0, len(baseline.sourceMemberID))
		for memberID := range baseline.sourceMemberID {
			memberIDs = append(memberIDs, memberID)
		}
		sort.Strings(memberIDs)
		snapshot := stabilityScopeSnapshot{ScopeID: parts[0], BrandProfileID: parts[0], SourceMemberIDs: memberIDs}
		stability := applyDailyAvailabilityObservation(ItemStability{}, snapshot, parts[1], baseline.available, observedAt)
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": stability.ID}).SetUpdate(bson.M{"$setOnInsert": stability}).SetUpsert(true))
	}
	for startIndex := 0; startIndex < len(writes); startIndex += 1000 {
		endIndex := startIndex + 1000
		if endIndex > len(writes) {
			endIndex = len(writes)
		}
		if _, err := repository.itemStabilities.BulkWrite(ctx, writes[startIndex:endIndex], options.BulkWrite().SetOrdered(false)); err != nil {
			return err
		}
	}
	return nil
}

// migrateLegacyItemStabilities 把累计下架模型转换为最近十天的每日观察模型。
func (repository *InventoryRepository) migrateLegacyItemStabilities(ctx context.Context) error {
	cursor, err := repository.itemStabilities.Find(ctx, bson.M{"$or": bson.A{bson.M{"dailyObservations": bson.M{"$exists": false}}, bson.M{"dailyObservations": bson.M{"$size": 0}}}})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	legacyStabilities := make([]ItemStability, 0)
	if err := cursor.All(ctx, &legacyStabilities); err != nil {
		return err
	}
	writes := make([]mongo.WriteModel, 0, len(legacyStabilities))
	for _, legacyStability := range legacyStabilities {
		observedAt := legacyStability.LastObservedAt
		if observedAt.IsZero() {
			observedAt = legacyStability.FirstObservedAt
		}
		if observedAt.IsZero() {
			observedAt = time.Now()
		}
		snapshot := stabilityScopeSnapshot{ScopeID: legacyStability.ScopeID, BrandProfileID: legacyStability.BrandProfileID, SourceMemberIDs: legacyStability.SourceMemberIDs}
		migratedStability := applyDailyAvailabilityObservation(legacyStability, snapshot, legacyStability.ItemNo, legacyStability.CurrentAvailable, observedAt)
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": migratedStability.ID}).SetUpdate(bson.M{"$set": migratedStability, "$unset": legacyStabilityFields()}))
	}
	for startIndex := 0; startIndex < len(writes); startIndex += 1000 {
		endIndex := startIndex + 1000
		if endIndex > len(writes) {
			endIndex = len(writes)
		}
		if _, err := repository.itemStabilities.BulkWrite(ctx, writes[startIndex:endIndex], options.BulkWrite().SetOrdered(false)); err != nil {
			return err
		}
	}
	return nil
}

// stabilityStoreItemKey 生成来源门店货号键。
func stabilityStoreItemKey(brandStoreID, itemNo string) string {
	return strings.TrimSpace(brandStoreID) + "\x00" + strings.ToUpper(strings.TrimSpace(itemNo))
}

// stabilityItemKey 生成聚合品牌货号键。
func stabilityItemKey(scopeID, itemNo string) string {
	return strings.TrimSpace(scopeID) + "\x00" + strings.ToUpper(strings.TrimSpace(itemNo))
}
