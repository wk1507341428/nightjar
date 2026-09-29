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
}

// OfflineResult 是渠道下架后的逐商品处理结果。
type OfflineResult struct {
	SucceededItemIDs []string
	FailedItemIDs    []string
}

// DeleteXianyuHistory 删除重复下架商品并同步本地历史状态。
func (service *Service) DeleteXianyuHistory(ctx context.Context, accountID string, itemIDs []string) error {
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
	remoteItems, err := service.sellerXianyuService.ForAccount(accountID).ListItemsByStatus(ctx, "-2,-12,-3,-11,1")
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
		listedAt := task.CreatedAt
		if listedAt.IsZero() {
			listedAt = syncedAt
		}
		offShelfAt := syncedAt
		listings = append(listings, model.MarketplaceListing{ID: model.XianyuPlatform + ":" + remoteItem.ItemID, AccountID: accountID, Platform: model.XianyuPlatform, PlatformItemID: remoteItem.ItemID, SourceItemID: task.SourceItemID, ItemNo: itemNo, Title: remoteItem.Title, PriceCents: remoteItem.PriceCents, ImageURL: remoteItem.ImageURL, ItemURL: "https://www.goofish.com/item?id=" + remoteItem.ItemID, ListedAt: listedAt, LastSyncedAt: syncedAt, LastSeenAt: syncedAt, SaleStatus: "off_shelf", RemoteStatus: remoteItem.Status, OffShelfAt: &offShelfAt, BrandProfileID: task.BrandProfileID, SourceType: task.SourceType, SourceRegions: task.SourceRegions, SourceMemberIDs: task.SourceMemberIDs, SourceItemIDs: task.SourceItemIDs})
	}
	if err := service.listingRepository.UpsertOffShelfSnapshot(ctx, accountID, listings); err != nil {
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
		listedAt := task.CreatedAt
		if listedAt.IsZero() {
			listedAt = syncedAt
		}
		listings = append(listings, model.MarketplaceListing{
			ID:              model.XianyuPlatform + ":" + remoteItem.ItemID,
			AccountID:       accountID,
			Platform:        model.XianyuPlatform,
			PlatformItemID:  remoteItem.ItemID,
			SourceItemID:    task.SourceItemID,
			ItemNo:          itemNo,
			Title:           remoteItem.Title,
			PriceCents:      remoteItem.PriceCents,
			ImageURL:        remoteItem.ImageURL,
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

	if err := service.listingRepository.ReplacePlatformSnapshot(ctx, accountID, model.XianyuPlatform, listings); err != nil {
		return 0, err
	}
	_ = service.accountRepository.MarkSynced(ctx, accountID)
	return len(listings), nil
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
		ListedAt:        now,
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

// OfflineXianyuListings 下架闲鱼商品并同步删除本地在售快照。
func (service *Service) OfflineXianyuListings(ctx context.Context, accountID string, itemIDs []string) (OfflineResult, error) {
	state := service.stateForAccount(accountID)
	state.mutex.Lock()
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
