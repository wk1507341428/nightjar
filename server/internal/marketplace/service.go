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
	xianyuService       *xianyu.Service
	sellerXianyuService *xianyu.Service
	syncMutex           sync.Mutex
	lastFullSync        time.Time
	lastFullSyncCount   int
}

// OfflineResult 是渠道下架后的逐商品处理结果。
type OfflineResult struct {
	SucceededItemIDs []string
	FailedItemIDs    []string
}

// NewService 创建渠道同步服务。
func NewService(
	listingRepository *repository.MarketplaceListingRepository,
	publishRepository *repository.PublishTaskRepository,
	xianyuService *xianyu.Service,
	sellerXianyuService *xianyu.Service,
) *Service {
	return &Service{
		listingRepository:   listingRepository,
		publishRepository:   publishRepository,
		xianyuService:       xianyuService,
		sellerXianyuService: sellerXianyuService,
	}
}

// SyncXianyu 使用闲鱼当前在卖商品替换本地闲鱼在售快照。
func (service *Service) SyncXianyu(ctx context.Context) (int, error) {
	return service.ensureRetrySnapshot(ctx, true, func() (int, error) { return service.syncXianyuSnapshot(ctx) })
}

// EnsureRetrySnapshot 同一会话内复用60秒的成功全量快照；不确定结果强制刷新。
func (service *Service) EnsureRetrySnapshot(ctx context.Context, force bool) error {
	_, err := service.ensureRetrySnapshot(ctx, force, func() (int, error) { return service.syncXianyuSnapshot(ctx) })
	return err
}

func (service *Service) ensureRetrySnapshot(ctx context.Context, force bool, refresh func() (int, error)) (int, error) {
	service.syncMutex.Lock()
	defer service.syncMutex.Unlock()
	if err := ctx.Err(); err != nil {
		return 0, err
	}
	if !force && !service.lastFullSync.IsZero() && time.Since(service.lastFullSync) < 60*time.Second {
		return service.lastFullSyncCount, nil
	}
	started := time.Now()
	count, err := refresh()
	if err != nil {
		return 0, err
	}
	service.lastFullSync = started
	service.lastFullSyncCount = count
	return count, nil
}

// syncXianyuSnapshot 必须在 syncMutex 内执行；仅完整同步成功才允许更新时间戳。
func (service *Service) syncXianyuSnapshot(ctx context.Context) (int, error) {
	// 在售商品属于卖家工作台能力，必须使用卖家工作台凭证；普通闲鱼凭证只负责发布和市场搜索。
	remoteItems, err := service.sellerXianyuService.ListOnSaleItems(ctx)
	if err != nil {
		return 0, err
	}

	// 远程闲鱼商品 ID。
	itemIDs := make([]string, 0, len(remoteItems))
	for _, remoteItem := range remoteItems {
		itemIDs = append(itemIDs, remoteItem.ItemID)
	}
	linkedTasks, err := service.publishRepository.FindByXianyuItemIDs(ctx, itemIDs)
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

	if err := service.listingRepository.ReplacePlatformSnapshot(ctx, model.XianyuPlatform, listings); err != nil {
		return 0, err
	}
	return len(listings), nil
}

// MarkXianyuPublished 在 SideJob 发布成功后立即登记为闲鱼在售。
func (service *Service) MarkXianyuPublished(
	ctx context.Context,
	task model.PublishTask,
	result xianyu.PublishResult,
) error {
	service.syncMutex.Lock()
	defer service.syncMutex.Unlock()
	now := time.Now()
	imageURL := ""
	if len(task.ImageURLs) > 0 {
		imageURL = task.ImageURLs[0]
	}
	return service.listingRepository.Upsert(ctx, model.MarketplaceListing{
		ID:              model.XianyuPlatform + ":" + result.ItemID,
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
func (service *Service) OfflineXianyuListings(ctx context.Context, itemIDs []string) (OfflineResult, error) {
	service.syncMutex.Lock()
	defer service.syncMutex.Unlock()

	xianyuResult, err := service.sellerXianyuService.OfflineItems(ctx, itemIDs)
	if err != nil {
		if !errors.Is(err, xianyu.ErrSessionExpired) {
			return OfflineResult{}, err
		}
		// 卖家工作台 Cookie 失效时，尝试复用仍有效的普通闲鱼会话。
		xianyuResult, err = service.xianyuService.OfflineItems(ctx, itemIDs)
		if err != nil {
			return OfflineResult{}, fmt.Errorf("卖家后台登录已失效，普通闲鱼登录回退也失败：%w", err)
		}
	}
	if err := service.listingRepository.DeletePlatformItemIDs(ctx, model.XianyuPlatform, xianyuResult.SucceededItemIDs); err != nil {
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
