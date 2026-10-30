package model

import (
	"errors"
	"fmt"
)

var (
	ErrListingAboveOriginal   = errors.New("闲鱼售价高于商品原价，已跳过发布或修改")
	ErrListingOriginalUnknown = errors.New("商品原价未知，无法核验售价上限，已跳过发布或修改")
)

// ValidateListingSourcePriceCeiling 不把采购价等于原价解释为可绕过售价上限。
// sourcePrice 保留为兼容现有调用的货源信息；原价只能使用明确保存的值。
func ValidateListingSourcePriceCeiling(_ int64, originalPrice, price int64, variants []PublishVariant) error {
	return ValidateListingPriceCeiling(originalPrice, price, variants)
}

// ValidateListingPriceCeiling 比较实际生成的售价，不通过压价改变用户的利润策略。
// 原价未知时保守跳过，不猜测或自动降价；有价无货的规格不属于待售规格。
func ValidateListingPriceCeiling(originalPrice, price int64, variants []PublishVariant) error {
	if originalPrice <= 0 {
		return ErrListingOriginalUnknown
	}
	highest := price
	for _, variant := range variants {
		if variant.Quantity > 0 && variant.PriceCents > highest {
			highest = variant.PriceCents
		}
	}
	if highest > originalPrice {
		return fmt.Errorf("%w（拟售价¥%.2f，原价¥%.2f）", ErrListingAboveOriginal, float64(highest)/100, float64(originalPrice)/100)
	}
	return nil
}
