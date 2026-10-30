package xianyu

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"testing"
)

const longColorA = "标准白/荧光果红/荧光数字粉 男 篮球外场鞋"
const longColorB = "标准白/荧光果红/荧光数字粉 女 篮球外场鞋"
const longAxis = "颜色分类详细规格名称超过二十个字符一二三四五六七八九十"

func protocolVariant(name, value string, quantity, price int64, image string) PublishVariant {
	return PublishVariant{PriceCents: price, Quantity: quantity, ImageURL: image, Properties: []PublishVariantProperty{{Name: "鞋码", Value: "43"}, {Name: name, Value: value}}}
}
func TestSKUProtocolLongChineseLabelsAreDistinctAndTraceable(t *testing.T) {
	variants := []PublishVariant{protocolVariant(longAxis, longColorA, 2, 10000, "image-a"), protocolVariant(longAxis, longColorB, 3, 20000, "image-b"), protocolVariant(longAxis, "标准白/荧光果红/荧光数字粉", 5, 30000, "image-c")}
	before, _ := json.Marshal(variants)
	mappings, err := SKUPropertyLabelMappings(variants)
	if err != nil {
		t.Fatal(err)
	}
	if len(mappings) != 3 {
		t.Fatalf("expected one axis/two long value mappings: %#v", mappings)
	}
	for _, mapping := range mappings {
		if len([]rune(mapping.Protocol)) > 20 || mapping.Original == mapping.Protocol || strings.Contains(mapping.Protocol, "~") {
			t.Fatalf("invalid protocol label: %#v", mapping)
		}
	}
	_, a := skuProtocolProperty(longAxis, longColorA)
	_, b := skuProtocolProperty(longAxis, longColorB)
	if a == b {
		t.Fatal("different same-prefix colors merged")
	}
	if name, value := skuProtocolProperty("颜色", "标准黑"); name != "颜色" || value != "标准黑" {
		t.Fatal("short labels changed")
	}
	if name, value := skuProtocolProperty("颜色", " 标准黑 "); name != "颜色" || value != " 标准黑 " {
		t.Fatal("short original label unexpectedly normalized")
	}
	rows := sliceValue(buildPublishSKUList(variants))
	if len(rows) != 3 {
		t.Fatal("SKU count changed")
	}
	for index, raw := range rows {
		row := mapValue(raw)
		if fmt.Sprint(row["priceInCent"]) != fmt.Sprint(variants[index].PriceCents) || fmt.Sprint(row["quantity"]) != fmt.Sprint(variants[index].Quantity) {
			t.Fatal("price or quantity changed")
		}
		for _, p := range sliceValue(row["propertyList"]) {
			property := mapValue(p)
			if len([]rune(stringValue(property["propertyText"]))) > 20 || len([]rune(stringValue(property["valueText"]))) > 20 {
				t.Fatal("SKU property exceeds contract")
			}
		}
	}
	definitions := sliceValue(buildPublishProperties(variants))
	images := sliceValue(buildPublishPropertyImages(variants))
	if len(definitions) != 2 || len(images) != 3 {
		t.Fatal("property or image references changed count")
	}
	declared := map[string]bool{}
	for _, raw := range definitions {
		definition := mapValue(raw)
		for _, v := range sliceValue(definition["propertyValues"]) {
			declared[stringValue(definition["propertyName"])+"="+stringValue(mapValue(v)["propertyValue"])] = true
		}
	}
	for _, raw := range images {
		p := mapValue(mapValue(raw)["property"])
		if !declared[stringValue(p["propertyText"])+"="+stringValue(p["valueText"])] {
			t.Fatal("image reference does not match shortened property definition")
		}
	}
	after, _ := json.Marshal(variants)
	if string(after) != string(before) {
		t.Fatal("source/task variants were mutated")
	}
}

func TestSKUProtocolRejectsCollisionAndEmptyBeforeAnyNetwork(t *testing.T) {
	_, generated := skuProtocolProperty("颜色", longColorA)
	collision := []PublishVariant{protocolVariant("颜色", longColorA, 1, 100, ""), protocolVariant("颜色", generated, 1, 100, "")}
	if _, err := SKUPropertyLabelMappings(collision); err == nil {
		t.Fatal("literal/generated collision not rejected")
	}
	generatedName, _ := skuProtocolProperty(longAxis, "x")
	if _, err := SKUPropertyLabelMappings([]PublishVariant{protocolVariant(longAxis, "x", 1, 100, ""), protocolVariant(generatedName, "y", 1, 100, "")}); err == nil {
		t.Fatal("axis collision not rejected")
	}
	invalid := []PublishVariant{{PriceCents: 100, Quantity: 1, Properties: []PublishVariantProperty{{Name: " ", Value: "x"}}}}
	service := &Service{} // A network/client access would panic; validation must precede it.
	if _, err := service.Publish(context.Background(), PublishInput{Variants: invalid}); err == nil {
		t.Fatal("publish accepted empty property")
	}
	if err := service.EditManagedItem(context.Background(), "id", PublishInput{Variants: collision}, nil); err == nil {
		t.Fatal("edit accepted collision")
	}
	if err := service.ReactivateManagedItem(context.Background(), "id", PublishInput{Variants: invalid}, nil); err == nil {
		t.Fatal("relist accepted empty property")
	}
}

func TestSKUProtocolPreservesOldIDsAndReadbackStaysStable(t *testing.T) {
	variants := []PublishVariant{protocolVariant("颜色", longColorA, 2, 10000, ""), protocolVariant("颜色", "标准黑", 3, 20000, "")}
	wireName, wireValue := skuProtocolProperty("颜色", longColorA)
	detail := map[string]any{"itemTextDTO": map[string]any{"title": "test", "desc": "test"}, "itemPriceDTO": map[string]any{"priceInCent": "10000", "origPriceInCent": "30000"}, "quantity": "5", "itemSkuList": []any{
		map[string]any{"skuId": "old-a", "inventoryId": "inventory-a", "priceInCent": "10000", "quantity": 2, "propertyList": []any{map[string]any{"propertyText": "鞋码", "valueText": "43"}, map[string]any{"propertyText": "颜色", "valueText": longColorA}}},
		map[string]any{"skuId": "old-b", "inventoryId": "inventory-b", "priceInCent": "20000", "quantity": 3, "propertyList": []any{map[string]any{"propertyText": "鞋码", "valueText": "43"}, map[string]any{"propertyText": "颜色", "valueText": "标准黑"}}}}, "propertyImageList": []any{
		map[string]any{"property": map[string]any{"propertyText": wireName, "valueText": wireValue}, "url": "image-a"}, map[string]any{"property": map[string]any{"propertyText": "颜色", "valueText": "标准黑"}, "url": "image-b"}}}
	hydrated := hydrateVariantImagesFromDetail(variants, detail)
	if hydrated[0].ImageURL != "image-a" || hydrated[1].ImageURL != "image-b" {
		t.Fatal("short image reference could not hydrate raw source labels")
	}
	input := PublishInput{Title: "test", Description: "test", PriceCents: 10000, OriginalPriceCents: 30000, Quantity: 5, Variants: hydrated}
	first := ManagedEditPayload(detail, input)
	skus := sliceValue(first["itemSkuList"])
	if stringValue(mapValue(skus[0])["skuId"]) != "old-a" || stringValue(mapValue(skus[0])["inventoryId"]) != "inventory-a" {
		t.Fatal("old SKU identity lost through label adaptation")
	}
	if !SameManagedState(ManagedState(detail), ManagedState(first)) {
		t.Fatalf("equivalent raw/wire states differ: before=%#v after=%#v", ManagedState(detail), ManagedState(first))
	}
	next := input
	next.Variants = hydrateVariantImagesFromDetail(variants, first)
	second := ManagedEditPayload(first, next)
	if !reflect.DeepEqual(ManagedState(first), ManagedState(second)) {
		t.Fatal("second preview/readback would repeatedly edit labels")
	}
	for _, row := range ManagedState(first)["skus"].([]string) {
		if strings.Contains(row, longColorA) {
			t.Fatal("ManagedState did not use protocol labels")
		}
	}
}
