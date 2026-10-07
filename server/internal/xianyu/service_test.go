package xianyu

import "testing"

// TestParseSellerReservePrice 验证卖家工作台售价字段按人民币转换为分。
func TestParseSellerReservePrice(t *testing.T) {
	priceCents := parseSearchPriceCents(map[string]any{"reservePrice": "229.00"})
	if priceCents != 22900 {
		t.Fatalf("parse seller reserve price = %d, want 22900", priceCents)
	}
}

func TestParseSellerPriceRangeUsesLowestSKUPrice(t *testing.T) {
	priceCents := parseSearchPriceCents(map[string]any{
		"reservePrice": "709.00~709.90",
		"idleItemSkuList": []any{
			map[string]any{"priceInCent": float64(70990)},
			map[string]any{"priceInCent": float64(70900)},
		},
	})
	if priceCents != 70900 {
		t.Fatalf("parse seller SKU price = %d, want 70900", priceCents)
	}
}

func TestEnsureConditionLabelAddsStableNewCondition(t *testing.T) {
	labels := ensureConditionLabel(nil, "全新", map[string]any{"channelCatId": "126862723"})
	if len(labels) != 1 || stringValue(labels[0]["propertyId"]) != "20879" || stringValue(labels[0]["valueId"]) != "21456" || stringValue(labels[0]["text"]) != "全新" {
		t.Fatalf("unexpected condition label: %#v", labels)
	}
	if repeated := ensureConditionLabel(labels, "全新", map[string]any{"channelCatId": "126862723"}); len(repeated) != 1 {
		t.Fatalf("condition label was duplicated: %#v", repeated)
	}
}

// TestExtractCategoryFallback 验证分类预测为空时使用已选分类卡片。
func TestExtractCategoryFallback(t *testing.T) {
	response := map[string]any{
		"cardList": []any{
			map[string]any{"cardData": map[string]any{
				"propertyId": "-10000",
				"valuesList": []any{map[string]any{
					"isClicked": "1", "catId": "123", "catName": "运动鞋", "channelCatId": "456",
				}},
			}},
		},
	}
	category := extractCategory(response)
	if stringValue(category["catId"]) != "123" {
		t.Fatalf("extractCategory() = %#v", category)
	}
}

// TestDefaultAddressForRegion 验证上海商品带上闲鱼要求的行政区编码。
func TestDefaultAddressForRegion(t *testing.T) {
	address := defaultAddressForRegion("3")
	if stringValue(address["divisionId"]) != "310115" {
		t.Fatalf("defaultAddressForRegion() = %#v", address)
	}
}

// TestAttributeValueMatches 验证中英文品牌和鞋码匹配规则。
func TestAttributeValueMatches(t *testing.T) {
	if !attributeValueMatches("Nike/耐克", "NIKE", attributeMatchBrand) {
		t.Fatal("Nike brand should match")
	}
	if !attributeValueMatches("36.5码", "36.5", attributeMatchSize) {
		t.Fatal("36.5 shoe size should match")
	}
	if attributeValueMatches("36", "36.5", attributeMatchSize) {
		t.Fatal("different shoe sizes should not match")
	}
}

// TestBuildPublishPayloadIncludesSellerVariants 验证卖家工作台发布载荷包含买家可选规格。
func TestBuildPublishPayloadIncludesSellerVariants(t *testing.T) {
	input := PublishInput{
		Title:       "【全新】343846-002 NIKE运动鞋",
		Description: "商品描述",
		PriceCents:  42490,
		Variants: []PublishVariant{
			{PriceCents: 42490, Quantity: 8, ImageURL: "https://example.com/black.jpg", Properties: []PublishVariantProperty{{Name: "鞋码", Value: "42"}, {Name: "颜色", Value: "黑色"}}},
			{PriceCents: 42490, Quantity: 3, ImageURL: "https://example.com/gray.jpg", Properties: []PublishVariantProperty{{Name: "鞋码", Value: "42"}, {Name: "颜色", Value: "灰色"}}},
			{PriceCents: 42490, Quantity: 2, ImageURL: "https://example.com/gray.jpg", Properties: []PublishVariantProperty{{Name: "鞋码", Value: "43"}, {Name: "颜色", Value: "灰色"}}},
		},
	}
	payload := buildPublishPayload(input, map[string]any{}, nil, map[string]any{"catId": "123"}, nil)
	if stringValue(payload["quantity"]) != "13" {
		t.Fatalf("unexpected total quantity: %#v", payload["quantity"])
	}
	skus := sliceValue(payload["itemSkuList"])
	if len(skus) != 3 || stringValue(mapValue(skus[0])["priceInCent"]) != "42490" {
		t.Fatalf("unexpected sku payload: %#v", payload["itemSkuList"])
	}
	properties := sliceValue(payload["itemProperties"])
	if len(properties) != 2 || stringValue(mapValue(properties[0])["propertyName"]) != "鞋码" || boolValue(mapValue(properties[0])["supportImage"]) || !boolValue(mapValue(properties[1])["supportImage"]) {
		t.Fatalf("unexpected property payload: %#v", payload["itemProperties"])
	}
	propertyImages := sliceValue(payload["propertyImageList"])
	if len(propertyImages) != 2 || stringValue(mapValue(mapValue(propertyImages[0])["property"])["propertyText"]) != "颜色" {
		t.Fatalf("unexpected property image payload: %#v", payload["propertyImageList"])
	}
}
