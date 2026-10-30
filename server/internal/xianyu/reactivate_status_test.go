package xianyu

import (
	"strings"
	"testing"
)

func TestRelistReadbackRequiresExplicitOnSaleStatus(t *testing.T) {
	detail := map[string]any{"itemTextDTO": map[string]any{"title": "same", "desc": "same"}, "itemPriceDTO": map[string]any{"priceInCent": "100"}, "quantity": "1"}
	desired := ManagedState(detail)
	for _, status := range []string{"-2", "-9", "", "1"} {
		detail["itemStatus"] = status
		err := validateRelistReadback(detail, desired)
		if err == nil || !strings.Contains(err.Error(), "已提交，但未确认在售") {
			t.Fatalf("status=%q must remain unconfirmed: %v", status, err)
		}
	}
	detail["itemStatus"] = "0"
	if err := validateRelistReadback(detail, desired); err != nil {
		t.Fatal(err)
	}
	detail["itemStatus"] = float64(0)
	if err := validateRelistReadback(detail, desired); err != nil {
		t.Fatal(err)
	}
	detail["quantity"] = "2"
	if err := validateRelistReadback(detail, desired); err == nil {
		t.Fatal("on-sale status must not bypass content comparison")
	}
}
