package xianyu

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestTemplateOnlyDifferencesDoNotTriggerEdit(t *testing.T) {
	before := map[string]any{"title": "旧标题", "description": "全新 商品名称\n有货尺码/型号：42、41\n发货地区：上海、成都\n旧购买说明", "quantity": "10", "skus": []string{"鞋码=42:10000:10"}}
	after := map[string]any{"title": "新标题", "description": "有货尺码/型号: 41、42\n发货地区：成都、上海\n新版购买说明", "quantity": "3", "skus": []any{"鞋码=42:10000:3"}}
	if !SameActionableState(before, after) || len(StateChangeReasons(before, after)) != 0 {
		t.Fatal("template or ordering changes triggered edit")
	}
	after["description"] = "有货尺码/型号：41、42\n发货地区：上海"
	reasons := StateChangeReasons(before, after)
	if SameActionableState(before, after) || len(reasons) != 1 || !strings.Contains(reasons[0], "发货地区：上海、成都 → 上海") {
		t.Fatalf("missing concrete region change: %v", reasons)
	}
	if SameManagedState(before, after) {
		t.Fatal("exact verification must remain strict")
	}
}

func TestActionableInventoryChanges(t *testing.T) {
	state := func(quantity string, skus any) map[string]any {
		return map[string]any{"quantity": quantity, "skus": skus, "price": "10000", "description": "发货地区：A、B"}
	}
	before := state("10", []string{"鞋码=42:10000:10"})
	cases := []struct {
		name    string
		after   map[string]any
		changed bool
	}{
		{"库存减少但仍有货", state("3", []any{"鞋码=42:10000:3"}), false},
		{"库存增加", state("20", []string{"鞋码=42:10000:20"}), false},
		{"尺码归零", state("0", []string{"鞋码=42:10000:0"}), true},
		{"尺码删除", state("0", []string{}), true},
		{"新增尺码", state("11", []string{"鞋码=42:10000:10", "鞋码=43:10000:1"}), true},
		{"规格价格变化", state("3", []string{"鞋码=42:12000:3"}), true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if changed := !SameActionableState(before, tc.after); changed != tc.changed {
				t.Fatalf("changed=%v want=%v", changed, tc.changed)
			}
			if changed := len(StateChangeReasons(before, tc.after)) > 0; changed != tc.changed {
				t.Fatal("reason and decision disagree")
			}
		})
	}
	if SameManagedState(before, cases[0].after) {
		t.Fatal("exact verification must retain actual quantities")
	}
	if SameActionableState(state("0", []string{"鞋码=42:10000:0"}), before) {
		t.Fatal("restocked size must trigger edit")
	}
	for _, field := range []string{"price", "description"} {
		after := state("3", []string{"鞋码=42:10000:3"})
		after[field] = "changed"
		if SameActionableState(before, after) {
			t.Fatalf("%s changes must still trigger edit", field)
		}
	}
	if !SameActionableState(state("10", nil), state("3", nil)) {
		t.Fatal("single-spec positive stock should be ignored")
	}
}

func TestManagedEditDropsMissingSizeAndPreservesExistingID(t *testing.T) {
	var before map[string]any
	_ = json.Unmarshal([]byte(`{"itemId":"123","imageInfoDOList":[{"url":"existing"}],"itemPostFeeDTO":{"canFreeShipping":true},"quantity":"5","itemSkuList":[{"skuId":"s42","quantity":"2","priceInCent":"10000","propertyList":[{"propertyText":"鞋码","valueText":"42"}]},{"skuId":"s43","quantity":"3","priceInCent":"10000","propertyList":[{"propertyText":"鞋码","valueText":"43"}]}]}`), &before)
	input := PublishInput{Title: "全新 鞋子 123", Description: "货号：123\n发货地区：A、B", PriceCents: 11000, Variants: []PublishVariant{{PriceCents: 11000, Quantity: 2, Properties: []PublishVariantProperty{{Name: "鞋码", Value: "42"}}}}}
	payload := ManagedEditPayload(before, input)
	skus := sliceValue(payload["itemSkuList"])
	if len(skus) != 1 || mapValue(skus[0])["skuId"] != "s42" {
		t.Fatalf("wrong sku identity: %#v", skus)
	}
	if stringValue(payload["quantity"]) != "2" || payload["itemId"] != "123" {
		t.Fatal("wrong quantity or item id")
	}
	encoded, _ := json.Marshal(payload)
	var remote map[string]any
	_ = json.Unmarshal(encoded, &remote)
	if !SameManagedState(ManagedState(payload), ManagedState(remote)) {
		t.Fatal("typed payload does not match remote state")
	}
	if SameManagedState(ManagedState(before), ManagedState(payload)) {
		t.Fatal("changed sizes not detected")
	}
	if len(sliceValue(before["itemSkuList"])) != 2 {
		t.Fatal("original snapshot modified")
	}
}

func TestManagedRelistPayloadSetsOnSaleStatus(t *testing.T) {
	detail := map[string]any{"itemId": "123", "itemStatus": "-2", "itemTextDTO": map[string]any{"title": "旧标题", "desc": "旧描述"}}
	payload := ManagedRelistPayload(detail, PublishInput{Title: "新标题", Description: "新描述", PriceCents: 10000})
	if stringValue(payload["itemStatus"]) != "0" {
		t.Fatalf("relist status=%v want=0", payload["itemStatus"])
	}
	if stringValue(detail["itemStatus"]) != "-2" {
		t.Fatal("original detail was modified")
	}
}
