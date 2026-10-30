package model

import "testing"

func TestItemNoKeyPreservesColorAndUnifiesSupplierWhitespace(t *testing.T) {
	for _, input := range []string{"31012802", "310128 02", " 310128\t02 ", "310128\u00a002"} {
		if got := ItemNoKey(input); got != "31012802" {
			t.Errorf("ItemNoKey(%q) = %q", input, got)
		}
	}
	if ItemNoKey("CFP04  IMXAQ") != ItemNoKey("cfp04 IMXAQ") {
		t.Fatal("COACH whitespace aliases were not unified")
	}
	if ItemNoKey("ARBW012-3") == ItemNoKey("ARBW012-4") || ItemNoKey("SKU-12") == ItemNoKey("SKU12") {
		t.Fatal("different colors or punctuation were collapsed")
	}
}
