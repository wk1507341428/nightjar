package handler

import (
	"context"
	"testing"

	"sidejob-server/internal/model"
)

func manualLocalSourceFixture() map[string]any {
	source := aggregateFixtureProduct(6, sourceStatusOnSale)
	source["regionauth_id"], source["distributor_id"] = "5", "278"
	source["brand_profile_id"], source["_sync_generation"] = "adidas", "fixture-v1"
	source["price"], source["activity_price"], source["market_price"] = int64(20000), int64(20000), int64(40000)
	return source
}

func TestManualSourceUsesLocalAuthorityAndPreservesCustomContent(t *testing.T) {
	task := model.PublishTask{Title: "自定义标题", PriceCents: 31000, OriginalPriceCents: 9999999, BrandProfileID: "wrong", SourceRegions: []string{"wrong"}, Variants: []model.PublishVariant{{PriceCents: 32000, Quantity: 2, Properties: []model.PublishVariantProperty{{Name: "尺码", Value: "M"}}}}}
	bound, err := bindManualPublishSource(task, manualLocalSourceFixture())
	if err != nil {
		t.Fatal(err)
	}
	if bound.Title != task.Title || bound.PriceCents != 31000 || bound.Variants[0].PriceCents != 32000 || bound.Variants[0].Properties[0].Value != "M" {
		t.Fatal("custom content replaced with batch defaults")
	}
	if bound.OriginalPriceCents != 40000 || bound.SourcePriceCents != 20000 || bound.BrandProfileID != "adidas" || bound.SourceSyncVersion != "fixture-v1" || bound.SourceMemberIDs[0] != "5:278" || bound.Quantity != 2 {
		t.Fatalf("source authority not applied: %#v", bound)
	}
}

func TestManualSourceBlocksOverStockAndStaleUIPriceCeiling(t *testing.T) {
	for _, task := range []model.PublishTask{
		{PriceCents: 50000, OriginalPriceCents: 9999999},
		{PriceCents: 30000, Variants: []model.PublishVariant{{PriceCents: 30000, Quantity: 7}}},
	} {
		if _, err := bindManualPublishSource(task, manualLocalSourceFixture()); err == nil {
			t.Fatalf("unsafe manual content accepted: %#v", task)
		}
	}
}

func TestManualSourceReadsLocalAndRejectsWrongIdentity(t *testing.T) {
	fixture := newAggregateReconcileFixture(t, 6, false)
	seedSyncedFixture(t, fixture.ctx, fixture.db, []map[string]any{manualLocalSourceFixture()})
	source, err := loadManualPublishSource(fixture.ctx, fixture.sc, "5", "source-JQ0585", aggregateFixtureItemNo)
	if err != nil || productString(source, "_sync_generation") != "fixture-v1" {
		t.Fatalf("local lookup failed: %#v %v", source, err)
	}
	if _, err := loadManualPublishSource(fixture.ctx, fixture.sc, "5", "source-JQ0585", "OTHER"); err == nil {
		t.Fatal("wrong article accepted")
	}
	if fixture.detailCalls.Load() != 0 {
		t.Fatal("manual lookup queried mini program")
	}
	if _, err := loadManualPublishSource(context.Background(), nil, "5", "item", "no"); err == nil {
		t.Fatal("missing authority accepted")
	}
}
