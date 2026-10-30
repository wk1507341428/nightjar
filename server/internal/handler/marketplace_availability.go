package handler

import (
	"context"
	"github.com/zeromicro/go-zero/core/logx"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/types"
	"sort"
	"strings"
)

type marketplaceAvailabilityLoader func(context.Context, string, []string) (map[string]catalog.SyncCenterAvailability, error)

// overlayMarketplaceAvailability preserves genuine historical statistics but takes
// present availability exclusively from activated source snapshots. Unknown never means zero stock.
func overlayMarketplaceAvailability(ctx context.Context, responses []types.MarketplaceListingResponse, load marketplaceAvailabilityLoader) {
	batches := map[string]map[string]bool{}
	for _, response := range responses {
		profile := strings.TrimSpace(response.BrandProfileID)
		itemNo := model.ItemNoKey(response.ItemNo)
		if profile == "" || itemNo == "" {
			continue
		}
		if batches[profile] == nil {
			batches[profile] = map[string]bool{}
		}
		batches[profile][itemNo] = true
	}
	availability := map[string]map[string]catalog.SyncCenterAvailability{}
	if load != nil {
		for profile, items := range batches {
			itemNos := make([]string, 0, len(items))
			for itemNo := range items {
				itemNos = append(itemNos, itemNo)
			}
			sort.Strings(itemNos)
			current, err := load(ctx, profile, itemNos)
			if err != nil {
				logx.Errorf("read synced marketplace availability for %s: %v", profile, err)
				continue
			}
			availability[profile] = current
		}
	}
	for index := range responses {
		response := &responses[index]
		current := availability[strings.TrimSpace(response.BrandProfileID)][model.ItemNoKey(response.ItemNo)]
		if !current.Known {
			response.Stability = nil
			continue
		}
		// Without genuine history, retain the existing pending presentation rather than fabricate a score.
		if response.Stability != nil {
			copy := *response.Stability
			copy.CurrentAvailable = current.Available
			response.Stability = &copy
		}
	}
}
