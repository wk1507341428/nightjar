package xianyu

import "testing"

// TestParseSellerReservePrice 验证卖家工作台售价字段按人民币转换为分。
func TestParseSellerReservePrice(t *testing.T) {
	priceCents := parseSearchPriceCents(map[string]any{"reservePrice": "229.00"})
	if priceCents != 22900 {
		t.Fatalf("parse seller reserve price = %d, want 22900", priceCents)
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
