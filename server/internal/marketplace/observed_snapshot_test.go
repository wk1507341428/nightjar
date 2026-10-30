package marketplace

import (
	"context"
	"errors"
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
	"testing"
)

func TestMissingListingsRequireExplicitDetailStatus(t *testing.T) {
	previous := []model.MarketplaceListing{{PlatformItemID: "one", PriceCents: 100, SaleStatus: "onsale"}}
	for _, test := range []struct{ status, want string }{{"0", "onsale"}, {"-2", "off_shelf"}, {"-9", "unknown"}, {"", "unknown"}} {
		t.Run(test.status, func(t *testing.T) {
			remote, verified, err := reconcileMissingListings(context.Background(), previous, nil, func(context.Context, string) (map[string]any, error) {
				return map[string]any{"itemStatus": test.status, "itemPriceDTO": map[string]any{"priceInCent": "100"}, "itemTextDTO": map[string]any{"title": "test"}}, nil
			})
			if err != nil {
				t.Fatal(err)
			}
			if test.want == "onsale" {
				if len(remote) != 1 || len(verified) != 0 {
					t.Fatal("current on-sale omitted")
				}
			} else if len(remote) != 0 || len(verified) != 1 || verified[0].SaleStatus != test.want || verified[0].RemoteStatus != test.status {
				t.Fatalf("incorrect observed state: %#v", verified)
			}
		})
	}
	if _, _, err := reconcileMissingListings(context.Background(), previous, nil, func(context.Context, string) (map[string]any, error) { return nil, errors.New("read unavailable") }); err == nil {
		t.Fatal("read failure treated as absence")
	}
}
func TestUnknownOwnRelistCannotBypassGuard(t *testing.T) {
	task := model.PublishTask{Action: model.PublishActionRelist, ItemNo: "SKU", XianyuItemID: "one"}
	if err := activationConflict(task, []model.MarketplaceListing{{ItemNo: "SKU", PlatformItemID: "one", SaleStatus: model.MarketplaceStatusUnknown}}); err == nil {
		t.Fatal("own unknown listing bypassed activation guard")
	}
}
func TestSeenListingsAvoidExtraDetailReads(t *testing.T) {
	_, _, err := reconcileMissingListings(context.Background(), []model.MarketplaceListing{{PlatformItemID: "one"}}, []xianyu.OnSaleItem{{ItemID: "one"}}, func(context.Context, string) (map[string]any, error) {
		t.Fatal("known present item should not require detail call")
		return nil, nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestHistorySnapshotCannotDowngradeCurrentOnSaleOrUnknown(t *testing.T) {
	previous := []model.MarketplaceListing{{PlatformItemID: "one", SaleStatus: "onsale"}, {PlatformItemID: "two", SaleStatus: model.MarketplaceStatusUnknown}}
	remote := []xianyu.OnSaleItem{{ItemID: "one", Status: "-2"}, {ItemID: "two", Status: "-2"}, {ItemID: "uncontested", Status: "-2"}}
	resolved, verified, err := reconcileHistoryConflicts(context.Background(), previous, remote, func(_ context.Context, id string) (map[string]any, error) {
		status := "0"
		if id == "two" {
			status = "-9"
		}
		return map[string]any{"itemStatus": status, "itemPriceDTO": map[string]any{"priceInCent": "100"}}, nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 2 || resolved[1].ItemID != "one" || resolved[1].Status != "0" || len(verified) != 1 || verified[0].SaleStatus != model.MarketplaceStatusUnknown {
		t.Fatalf("history contradicted observation: %#v %#v", resolved, verified)
	}
	if _, _, err = reconcileHistoryConflicts(context.Background(), previous, remote, func(context.Context, string) (map[string]any, error) { return nil, errors.New("read failed") }); err == nil {
		t.Fatal("failed history conflict observation accepted")
	}
}
