package model

import (
	"errors"
	"testing"
)

func TestListingPriceCeilingIncludesEverySellableVariant(t *testing.T) {
	cases := []struct {
		name     string
		original int64
		price    int64
		variants []PublishVariant
		blocked  bool
	}{
		{name: "full-price plus markup", original: 10000, price: 14000, blocked: true},
		{name: "equal allowed", original: 14000, price: 14000},
		{name: "discounted profit remains", original: 20000, price: 14000},
		{name: "one cent over", original: 14000, price: 14001, blocked: true},
		{name: "higher-priced size hidden by starting price", original: 20000, price: 15000, variants: []PublishVariant{{Quantity: 1, PriceCents: 23000}}, blocked: true},
		{name: "unavailable size", original: 20000, price: 15000, variants: []PublishVariant{{Quantity: 0, PriceCents: 23000}}},
	}
	for _, test := range cases {
		t.Run(test.name, func(t *testing.T) {
			err := ValidateListingPriceCeiling(test.original, test.price, test.variants)
			if errors.Is(err, ErrListingAboveOriginal) != test.blocked {
				t.Fatalf("price ceiling decision: %v", err)
			}
		})
	}
}

func TestSourcePriceCeilingRejectsEqualOriginalMarkupAndUnknownOriginal(t *testing.T) {
	for _, original := range []int64{0, -1} {
		if !errors.Is(ValidateListingSourcePriceCeiling(19900, original, 23900, nil), ErrListingOriginalUnknown) {
			t.Fatal("unknown original must not be inferred from the source price")
		}
	}
	for _, source := range []int64{0, 19900} {
		if !errors.Is(ValidateListingSourcePriceCeiling(source, 19900, 23900, nil), ErrListingAboveOriginal) {
			t.Fatal("known original ceiling was bypassed")
		}
	}
	if err := ValidateListingSourcePriceCeiling(19900, 19900, 19900, nil); err != nil {
		t.Fatalf("equal retail without markup should pass the price ceiling: %v", err)
	}
}
