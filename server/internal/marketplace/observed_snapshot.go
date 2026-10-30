package marketplace

import (
	"context"
	"fmt"
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
	"strconv"
	"sync"
	"time"
)

type observedMissingResult struct {
	item    *xianyu.OnSaleItem
	listing *model.MarketplaceListing
	err     error
}

// reconcileMissingListings verifies only omissions; list absence alone cannot downgrade a known listing.
func reconcileMissingListings(ctx context.Context, previous []model.MarketplaceListing, remote []xianyu.OnSaleItem, fetch func(context.Context, string) (map[string]any, error)) ([]xianyu.OnSaleItem, []model.MarketplaceListing, error) {
	seen := map[string]bool{}
	for _, item := range remote {
		seen[item.ItemID] = true
	}
	missing := []model.MarketplaceListing{}
	for _, listing := range previous {
		if !seen[listing.PlatformItemID] {
			missing = append(missing, listing)
		}
	}
	results := make([]observedMissingResult, len(missing))
	var group sync.WaitGroup
	semaphore := make(chan struct{}, 4)
	for index, listing := range missing {
		group.Add(1)
		go func(index int, listing model.MarketplaceListing) {
			defer group.Done()
			select {
			case semaphore <- struct{}{}:
				defer func() { <-semaphore }()
			case <-ctx.Done():
				results[index].err = ctx.Err()
				return
			}
			results[index] = readMissingListing(ctx, listing, fetch)
		}(index, listing)
	}
	group.Wait()
	verified := []model.MarketplaceListing{}
	for index, result := range results {
		if result.err != nil {
			return nil, nil, fmt.Errorf("在售列表遗漏商品%s，详情复核失败，状态未知，未覆盖本地快照：%w", missing[index].PlatformItemID, result.err)
		}
		if result.item != nil {
			remote = append(remote, *result.item)
		}
		if result.listing != nil {
			verified = append(verified, *result.listing)
		}
	}
	return remote, verified, nil
}

func readMissingListing(ctx context.Context, listing model.MarketplaceListing, fetch func(context.Context, string) (map[string]any, error)) observedMissingResult {
	detail, err := fetch(ctx, listing.PlatformItemID)
	if err != nil {
		return observedMissingResult{err: err}
	}
	status := ""
	if detail["itemStatus"] != nil {
		status = fmt.Sprint(detail["itemStatus"])
	}
	state := xianyu.ManagedState(detail)
	price, priceErr := strconv.ParseInt(fmt.Sprint(state["price"]), 10, 64)
	if priceErr != nil || price <= 0 {
		return observedMissingResult{err: fmt.Errorf("详情价格未知")}
	}
	if status == "0" {
		item := xianyu.OnSaleItem{ItemID: listing.PlatformItemID, Title: fmt.Sprint(state["title"]), PriceCents: price, ImageURL: listing.ImageURL, Status: status}
		return observedMissingResult{item: &item}
	}
	listing.SaleStatus = model.ObservedMarketplaceStatus(status)
	listing.RemoteStatus = status
	listing.PriceCents = price
	listing.LastSyncedAt = time.Now()
	listing.LastSeenAt = listing.LastSyncedAt
	if listing.SaleStatus == "off_shelf" {
		at := listing.LastSyncedAt
		listing.OffShelfAt = &at
	} else {
		listing.OffShelfAt = nil
	}
	return observedMissingResult{listing: &listing}
}

// RecordObservedListingStatus stores a read-back observation without performing a platform write.
func (service *Service) RecordObservedListingStatus(ctx context.Context, accountID, itemID, status string) error {
	return service.listingRepository.RecordObservedListingStatus(ctx, accountID, itemID, status)
}

// reconcileHistoryConflicts checks only history rows that contradict a known active/unknown local item.
func reconcileHistoryConflicts(ctx context.Context, previous []model.MarketplaceListing, remote []xianyu.OnSaleItem, fetch func(context.Context, string) (map[string]any, error)) ([]xianyu.OnSaleItem, []model.MarketplaceListing, error) {
	remoteIDs := map[string]bool{}
	for _, item := range remote {
		remoteIDs[item.ItemID] = true
	}
	conflicts := []model.MarketplaceListing{}
	conflictIDs := map[string]bool{}
	for _, listing := range previous {
		if remoteIDs[listing.PlatformItemID] {
			conflicts = append(conflicts, listing)
			conflictIDs[listing.PlatformItemID] = true
		}
	}
	retained := make([]xianyu.OnSaleItem, 0, len(remote))
	for _, item := range remote {
		if !conflictIDs[item.ItemID] {
			retained = append(retained, item)
		}
	}
	recovered, verified, err := reconcileMissingListings(ctx, conflicts, nil, fetch)
	if err != nil {
		return nil, nil, err
	}
	return append(retained, recovered...), verified, nil
}
