// Package marketplace 管理第三方渠道当前在售商品快照。
package marketplace

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/xianyu"
)

// itemNoPattern 提取标题中同时包含字母、数字和连接符的商品货号。
var itemNoPattern = regexp.MustCompile(`(?i)[a-z][a-z0-9.]*-[a-z0-9.-]*[0-9][a-z0-9.-]*`)

// Service 编排渠道远程同步和发布成功后的即时标记。
type Service struct {
	listingRepository   *repository.MarketplaceListingRepository
	publishRepository   *repository.PublishTaskRepository
	accountRepository   *repository.XianyuAccountRepository
	xianyuService       *xianyu.Service
	sellerXianyuService *xianyu.Service
	stateMutex          sync.Mutex
	accountStates       map[string]*accountSyncState
}

// accountSyncState 隔离一个账号的在售同步锁和短期缓存。
type accountSyncState struct {
	mutex             sync.Mutex
	offShelfMutex     sync.Mutex
	lastFullSync      time.Time
	lastFullSyncCount int
	lastOffShelfSync  time.Time
	lastOffShelfCount int
	activationBatchID string
}

// OfflineResult 是渠道下架后的逐商品处理结果。
type OfflineResult struct {
	SucceededItemIDs []string
	FailedItemIDs    []string
}

// RequireManagedItems 将发布归属校验用于队列执行前的最后一道授权检查。
func (service *Service) RequireManagedItems(ctx context.Context, accountID string, itemIDs []string) error {
	return service.listingRepository.RequireManagedItems(ctx, accountID, itemIDs)
}

// DeleteXianyuHistory 删除重复下架商品并同步本地历史状态。
func (service *Service) DeleteXianyuHistory(ctx context.Context, accountID string, itemIDs []string) error {
	if err := service.listingRepository.RequireManagedItems(ctx, accountID, itemIDs); err != nil {
		return err
	}
	if err := service.sellerXianyuService.ForAccount(accountID).DeleteSellerItems(ctx, itemIDs); err != nil {
		return err
	}
	return service.listingRepository.MarkDeleted(ctx, accountID, itemIDs)
}

// NewService 创建渠道同步服务。
func NewService(
	listingRepository *repository.MarketplaceListingRepository,
	publishRepository *repository.PublishTaskRepository,
	accountRepository *repository.XianyuAccountRepository,
	xianyuService *xianyu.Service,
	sellerXianyuService *xianyu.Service,
) *Service {
	return &Service{
		listingRepository:   listingRepository,
		publishRepository:   publishRepository,
		accountRepository:   accountRepository,
		xianyuService:       xianyuService,
		sellerXianyuService: sellerXianyuService,
		accountStates:       make(map[string]*accountSyncState),
	}
}

// stateForAccount 返回账号独立的同步状态。
func (service *Service) stateForAccount(accountID string) *accountSyncState {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	service.stateMutex.Lock()
	defer service.stateMutex.Unlock()
	state := service.accountStates[accountID]
	if state == nil {
		state = &accountSyncState{}
		service.accountStates[accountID] = state
	}
	return state
}

// SyncXianyu 使用闲鱼当前在卖商品替换本地闲鱼在售快照。
func (service *Service) SyncXianyu(ctx context.Context, accountID string) (int, error) {
	return service.ensureRetrySnapshot(ctx, accountID, true, func() (int, error) { return service.syncXianyuSnapshot(ctx, accountID) })
}

// EnsureRetrySnapshot 同一会话内复用60秒的成功全量快照；不确定结果强制刷新。
func (service *Service) EnsureRetrySnapshot(ctx context.Context, accountID string, force bool) error {
	_, err := service.ensureRetrySnapshot(ctx, accountID, force, func() (int, error) { return service.syncXianyuSnapshot(ctx, accountID) })
	return err
}

// EnsureOffShelfSnapshot 仅在有新发布候选时刷新一次下架历史，并在五分钟内复用。
func (service *Service) EnsureOffShelfSnapshot(ctx context.Context, accountID string) error {
	state := service.stateForAccount(accountID)
	state.offShelfMutex.Lock()
	defer state.offShelfMutex.Unlock()
	if !state.lastOffShelfSync.IsZero() && time.Since(state.lastOffShelfSync) < 5*time.Minute {
		return nil
	}
	count, err := service.syncOffShelfSnapshot(ctx, accountID)
	if err != nil {
		return err
	}
	state.lastOffShelfSync = time.Now()
	state.lastOffShelfCount = count
	return nil
}

// syncOffShelfSnapshot 保存商家后台完整下架列表，供货号批量匹配。
func (service *Service) syncOffShelfSnapshot(ctx context.Context, accountID string) (int, error) {
	snapshotStartedAt := time.Now()
	previous, err := service.listingRepository.ListSnapshotCandidates(ctx, accountID, model.XianyuPlatform)
	if err != nil {
		return 0, err
	}

	remoteItems, err := service.sellerXianyuService.ForAccount(accountID).ListItemsByStatus(ctx, "-2,-12,-3,-11,1")
	if err != nil {
		return 0, err
	}
	remoteItems, verifiedConflicts, err := reconcileHistoryConflicts(ctx, previous, remoteItems, service.sellerXianyuService.ForAccount(accountID).GetSellerEditDetail)
	if err != nil {
		return 0, err
	}

	itemIDs := make([]string, 0, len(remoteItems))
	for _, item := range remoteItems {
		itemIDs = append(itemIDs, item.ItemID)
	}
	linkedTasks, err := service.publishRepository.FindByXianyuItemIDs(ctx, accountID, itemIDs)
	if err != nil {
		return 0, err
	}
	tasksByItemID := make(map[string]model.PublishTask, len(linkedTasks))
	for _, task := range linkedTasks {
		tasksByItemID[task.XianyuItemID] = task
	}
	syncedAt := time.Now()
	listings := make([]model.MarketplaceListing, 0, len(remoteItems))
	for _, remoteItem := range remoteItems {
		task := tasksByItemID[remoteItem.ItemID]
		itemNo := normalizeItemNo(task.ItemNo)
		if itemNo == "" {
			itemNo = extractItemNo(remoteItem.Title)
		}
		listedAt := taskPublishDate(task, syncedAt)
		offShelfAt := syncedAt
		listings = append(listings, model.MarketplaceListing{ID: model.XianyuPlatform + ":" + remoteItem.ItemID, AccountID: accountID, Platform: model.XianyuPlatform, PlatformItemID: remoteItem.ItemID, SourceItemID: task.SourceItemID, ItemNo: itemNo, Title: remoteItem.Title, PriceCents: remoteItem.PriceCents, ImageURL: remoteItem.ImageURL, ItemURL: "https://www.goofish.com/item?id=" + remoteItem.ItemID, ListedAt: listedAt, LastSyncedAt: syncedAt, LastSeenAt: syncedAt, SaleStatus: "off_shelf", RemoteStatus: remoteItem.Status, OffShelfAt: &offShelfAt, BrandProfileID: task.BrandProfileID, SourceType: task.SourceType, SourceRegions: task.SourceRegions, SourceMemberIDs: task.SourceMemberIDs, SourceItemIDs: task.SourceItemIDs})
	}
	listings = append(listings, verifiedConflicts...)

	if err := service.listingRepository.UpsertOffShelfSnapshot(ctx, accountID, listings, snapshotStartedAt); err != nil {
		return 0, err
	}
	return len(listings), nil
}

func (service *Service) ensureRetrySnapshot(ctx context.Context, accountID string, force bool, refresh func() (int, error)) (int, error) {
	state := service.stateForAccount(accountID)
	state.mutex.Lock()
	defer state.mutex.Unlock()
	if err := ctx.Err(); err != nil {
		return 0, err
	}
	if !force && !state.lastFullSync.IsZero() && time.Since(state.lastFullSync) < 60*time.Second {
		return state.lastFullSyncCount, nil
	}
	started := time.Now()
	count, err := refresh()
	if err != nil {
		return 0, err
	}
	state.lastFullSync = started
	state.lastFullSyncCount = count
	return count, nil
}

// syncXianyuSnapshot 必须在 syncMutex 内执行；仅完整同步成功才允许更新时间戳。
func (service *Service) syncXianyuSnapshot(ctx context.Context, accountID string) (int, error) {
	snapshotStartedAt := time.Now()
	previous, err := service.listingRepository.ListSnapshotCandidates(ctx, accountID, model.XianyuPlatform)
	if err != nil {
		return 0, err
	}

	// 在售商品属于卖家工作台能力，必须使用卖家工作台凭证；普通闲鱼凭证只负责发布和市场搜索。
	remoteItems, err := service.sellerXianyuService.ForAccount(accountID).ListOnSaleItems(ctx)
	if err != nil {
		if errors.Is(err, xianyu.ErrSessionExpired) {
			if account, accountErr := service.accountRepository.Get(ctx, accountID); accountErr == nil {
				_ = service.accountRepository.UpdateConnection(ctx, accountID, "seller", account.DisplayName, account.PlatformUserID, false, false)
				_ = service.accountRepository.Update(ctx, accountID, "", model.XianyuAccountPaused)
			}
		}
		return 0, err
	}

	remoteItems, verifiedMissing, err := reconcileMissingListings(ctx, previous, remoteItems, service.sellerXianyuService.ForAccount(accountID).GetSellerEditDetail)
	if err != nil {
		return 0, err
	}

	// 远程闲鱼商品 ID。
	itemIDs := make([]string, 0, len(remoteItems))
	for _, remoteItem := range remoteItems {
		itemIDs = append(itemIDs, remoteItem.ItemID)
	}
	linkedTasks, err := service.publishRepository.FindByXianyuItemIDs(ctx, accountID, itemIDs)
	if err != nil {
		return 0, err
	}
	// 按闲鱼商品 ID 索引的 SideJob 发布任务。
	tasksByItemID := make(map[string]model.PublishTask, len(linkedTasks))
	for _, task := range linkedTasks {
		if existingTask, exists := tasksByItemID[task.XianyuItemID]; exists {
			tasksByItemID[task.XianyuItemID] = mergeLinkedTaskMetadata(existingTask, task)
			continue
		}
		tasksByItemID[task.XianyuItemID] = task
	}

	// 当前完整同步时间。
	syncedAt := time.Now()
	// 本次在售快照。
	listings := make([]model.MarketplaceListing, 0, len(remoteItems))
	for _, remoteItem := range remoteItems {
		task := tasksByItemID[remoteItem.ItemID]
		itemNo := normalizeItemNo(task.ItemNo)
		if itemNo == "" {
			itemNo = extractItemNo(remoteItem.Title)
		}
		listedAt := taskPublishDate(task, syncedAt)
		priceCents := remoteItem.PriceCents
		if priceCents <= 0 {
			priceCents = task.PriceCents
		}
		imageURL := strings.TrimSpace(remoteItem.ImageURL)
		if imageURL == "" && len(task.ImageURLs) > 0 {
			imageURL = strings.TrimSpace(task.ImageURLs[0])
		}
		listings = append(listings, model.MarketplaceListing{
			ID:              model.XianyuPlatform + ":" + remoteItem.ItemID,
			AccountID:       accountID,
			Platform:        model.XianyuPlatform,
			PlatformItemID:  remoteItem.ItemID,
			SourceItemID:    task.SourceItemID,
			ItemNo:          itemNo,
			Title:           remoteItem.Title,
			PriceCents:      priceCents,
			ImageURL:        imageURL,
			ItemURL:         "https://www.goofish.com/item?id=" + remoteItem.ItemID,
			ListedAt:        listedAt,
			LastSyncedAt:    syncedAt,
			LastSeenAt:      syncedAt,
			SaleStatus:      "onsale",
			BrandProfileID:  task.BrandProfileID,
			SourceType:      task.SourceType,
			SourceRegions:   task.SourceRegions,
			SourceMemberIDs: task.SourceMemberIDs,
			SourceItemIDs:   task.SourceItemIDs,
		})
	}

	if err := service.listingRepository.ReplaceVerifiedPlatformSnapshot(ctx, accountID, model.XianyuPlatform, listings, verifiedMissing, snapshotStartedAt); err != nil {
		return 0, err
	}
	if err := service.publishRepository.BackfillOfflineTaskPresentation(ctx, accountID, listings); err != nil {
		return 0, fmt.Errorf("补齐历史下架任务展示信息失败：%w", err)
	}
	_ = service.accountRepository.MarkSynced(ctx, accountID)
	return len(listings), nil
}

// mergeLinkedTaskMetadata 用较早任务补齐最新任务缺失的发布快照字段。
func mergeLinkedTaskMetadata(primaryTask, fallbackTask model.PublishTask) model.PublishTask {
	if primaryTask.ItemNo == "" {
		primaryTask.ItemNo = fallbackTask.ItemNo
	}
	if primaryTask.SourceItemID == "" {
		primaryTask.SourceItemID = fallbackTask.SourceItemID
	}
	if primaryTask.PriceCents <= 0 {
		primaryTask.PriceCents = fallbackTask.PriceCents
	}
	if len(primaryTask.ImageURLs) == 0 {
		primaryTask.ImageURLs = fallbackTask.ImageURLs
	}
	if primaryTask.BrandProfileID == "" {
		primaryTask.BrandProfileID = fallbackTask.BrandProfileID
	}
	if primaryTask.SourceType == "" {
		primaryTask.SourceType = fallbackTask.SourceType
	}
	if len(primaryTask.SourceRegions) == 0 {
		primaryTask.SourceRegions = fallbackTask.SourceRegions
	}
	if len(primaryTask.SourceMemberIDs) == 0 {
		primaryTask.SourceMemberIDs = fallbackTask.SourceMemberIDs
	}
	if len(primaryTask.SourceItemIDs) == 0 {
		primaryTask.SourceItemIDs = fallbackTask.SourceItemIDs
	}
	if primaryTask.PublishedAt.IsZero() || (!fallbackTask.PublishedAt.IsZero() && fallbackTask.PublishedAt.Before(primaryTask.PublishedAt)) {
		primaryTask.PublishedAt = fallbackTask.PublishedAt
	}
	if primaryTask.CreatedAt.IsZero() || (!fallbackTask.CreatedAt.IsZero() && fallbackTask.CreatedAt.Before(primaryTask.CreatedAt)) {
		primaryTask.CreatedAt = fallbackTask.CreatedAt
	}
	return primaryTask
}

// MarkXianyuPublished 在 SideJob 发布成功后立即登记为闲鱼在售。
func (service *Service) MarkXianyuPublished(
	ctx context.Context,
	task model.PublishTask,
	result xianyu.PublishResult,
) error {
	accountID := task.AccountID
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	state := service.stateForAccount(accountID)
	state.mutex.Lock()
	defer state.mutex.Unlock()
	now := time.Now()
	imageURL := ""
	if len(task.ImageURLs) > 0 {
		imageURL = task.ImageURLs[0]
	}
	return service.listingRepository.Upsert(ctx, model.MarketplaceListing{
		ID:              model.XianyuPlatform + ":" + result.ItemID,
		AccountID:       accountID,
		Platform:        model.XianyuPlatform,
		PlatformItemID:  result.ItemID,
		SourceItemID:    task.SourceItemID,
		ItemNo:          normalizeItemNo(task.ItemNo),
		Title:           task.Title,
		PriceCents:      task.PriceCents,
		ImageURL:        imageURL,
		ItemURL:         result.URL,
		ListedAt:        taskPublishDate(task, now),
		LastSyncedAt:    now,
		LastSeenAt:      now,
		SaleStatus:      "onsale",
		BrandProfileID:  task.BrandProfileID,
		SourceType:      task.SourceType,
		SourceRegions:   task.SourceRegions,
		SourceMemberIDs: task.SourceMemberIDs,
		SourceItemIDs:   task.SourceItemIDs,
	})
}

// taskPublishDate 返回商品首次发布时间，历史任务回退到任务创建时间。
func taskPublishDate(task model.PublishTask, fallback time.Time) time.Time {
	if !task.PublishedAt.IsZero() {
		return task.PublishedAt
	}
	if !task.CreatedAt.IsZero() {
		return task.CreatedAt
	}
	return fallback
}

// OfflineXianyuListings 下架闲鱼商品并同步删除本地在售快照。
func (service *Service) OfflineXianyuListings(ctx context.Context, accountID string, itemIDs []string) (OfflineResult, error) {
	if err := service.listingRepository.RequireManagedItems(ctx, accountID, itemIDs); err != nil {
		return OfflineResult{}, err
	}
	state := service.stateForAccount(accountID)
	if err := lockMarketplaceState(ctx, &state.mutex); err != nil {
		return OfflineResult{}, fmt.Errorf("等待闲鱼账号操作锁超时：%w", err)
	}
	defer state.mutex.Unlock()

	xianyuResult, err := service.sellerXianyuService.ForAccount(accountID).OfflineItems(ctx, itemIDs)
	if err != nil {
		if !errors.Is(err, xianyu.ErrSessionExpired) {
			return OfflineResult{}, err
		}
		// 卖家工作台 Cookie 失效时，尝试复用仍有效的普通闲鱼会话。
		xianyuResult, err = service.xianyuService.ForAccount(accountID).OfflineItems(ctx, itemIDs)
		if err != nil {
			return OfflineResult{}, fmt.Errorf("卖家后台登录已失效，普通闲鱼登录回退也失败：%w", err)
		}
	}
	if err := service.listingRepository.DeletePlatformItemIDs(ctx, accountID, model.XianyuPlatform, xianyuResult.SucceededItemIDs); err != nil {
		return OfflineResult{}, err
	}
	return OfflineResult{
		SucceededItemIDs: xianyuResult.SucceededItemIDs,
		FailedItemIDs:    xianyuResult.FailedItemIDs,
	}, nil
}

// lockMarketplaceState 让耗时的同步锁可被请求超时取消，避免下架任务永久卡在处理中。
func lockMarketplaceState(ctx context.Context, mutex *sync.Mutex) error {
	for {
		if mutex.TryLock() {
			return nil
		}
		timer := time.NewTimer(25 * time.Millisecond)
		select {
		case <-ctx.Done():
			timer.Stop()
			return ctx.Err()
		case <-timer.C:
		}
	}
}

// extractItemNo 从系统生成的闲鱼标题中提取标准货号。
func extractItemNo(title string) string {
	matches := itemNoPattern.FindAllString(title, -1)
	if len(matches) == 0 {
		return ""
	}
	return normalizeItemNo(matches[len(matches)-1])
}

// normalizeItemNo 标准化跨系统货号。
func normalizeItemNo(itemNo string) string {
	return strings.ToUpper(strings.TrimSpace(itemNo))
}
