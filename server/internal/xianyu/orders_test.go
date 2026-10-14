package xianyu

import (
	"encoding/json"
	"sidejob-server/internal/model"
	"testing"
)

func TestParseSellerOrder(t *testing.T) {
	order, err := ParseSellerOrder(json.RawMessage(`{"commonData":{"orderId":"123","itemId":"456","orderStatus":"交易成功","createTime":"2026-10-11 12:00:00"},"itemVO":{"title":"全新 NIKE鞋 HJ4497-100","itemPicUrl":"image","itemInfoLines":[{"key":"规格","value":"42"}]},"buyerInfoVO":{"userNick":"买家","phone":"private"},"priceVO":{"totalPrice":"380.00","confirmFee":"380.00","refundFee":"0.00","buyNum":"1"}}`))
	if err != nil || order.GrossCents != 38000 || order.Status != model.FinanceCompleted || order.ItemNo != "HJ4497-100" || order.BuyerNickname != "买家" || order.RecipientPhone != "private" || order.Date != "2026-10-11" {
		t.Fatalf("unexpected order: %+v %v", order, err)
	}
}
func TestOrderAmount(t *testing.T) {
	for value, want := range map[string]int64{"237.06": 23706, "4.5": 450, "0.00": 0, "1000": 100000} {
		got, err := orderYuanCents(value)
		if err != nil || got != want {
			t.Fatalf("%s: %d %v", value, got, err)
		}
	}
	if _, err := orderYuanCents("invalid"); err == nil {
		t.Fatal("invalid amount accepted")
	}
}

func TestOrderIdentifiersPreserveNumericPrecision(t *testing.T) {
	var value struct {
		ID orderIdentifier `json:"id"`
	}
	if err := json.Unmarshal([]byte(`{"id":3316506566061007454}`), &value); err != nil || string(value.ID) != "3316506566061007454" {
		t.Fatalf("numeric ID lost: %s %v", value.ID, err)
	}
}

func TestWorryFreeOrderBadge(t *testing.T) {
	for _, icon := range []string{"https://gw.alicdn.com/imgextra/i4" + worryFreeBadgeFile, "https://gw.alicdn.com/imgextra/i4" + worryFreeBadgeFile + "?size=small"} {
		if !isWorryFreeOrderIcon(icon) {
			t.Fatalf("known badge missed: %s", icon)
		}
	}
	for _, icon := range []string{"", "https://gw.alicdn.com/another-badge.png"} {
		if isWorryFreeOrderIcon(icon) {
			t.Fatal("unknown icon classified as worry-free")
		}
	}
	order, err := ParseSellerOrder(json.RawMessage(`{"commonData":{"orderId":"1","orderStatus":"已发货"},"itemVO":{"title":"鞋","iconUrl":"https://gw.alicdn.com/imgextra/i4/O1CN01G5axbb1zp3LBi7OpO_!!6000000006762-2-tps-108-42.png"},"priceVO":{"totalPrice":"400.00","buyNum":1}}`))
	if err != nil || !order.IsWorryFree {
		t.Fatalf("worry-free order not mapped: %+v %v", order, err)
	}
}

func TestClosedOrderUsesPlatformStatusEvenWithRefund(t *testing.T) {
	order, err := ParseSellerOrder(json.RawMessage(`{"commonData":{"orderId":"1","orderStatus":"交易关闭"},"priceVO":{"totalPrice":"111.90","refundFee":"111.90","buyNum":1}}`))
	if err != nil || order.Status != model.FinanceClosed || order.PlatformStatus != "交易关闭" {
		t.Fatalf("closed order incorrectly split: %+v %v", order, err)
	}
}
