package handler

import (
	"strings"
	"testing"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/types"
)

// TestValidatePublishTaskRequest 验证发布任务必填项。
func TestValidatePublishTaskRequest(t *testing.T) {
	validRequest := types.CreatePublishTaskRequest{
		Title:       "全新 Nike 运动鞋",
		Description: "全新正品，支持验货。",
		PriceCents:  18600,
		ImageURLs:   []string{"https://example.com/shoe.jpg"},
		Brand:       "NIKE",
		Condition:   "全新",
	}
	if message := validatePublishTaskRequest(validRequest); message != "" {
		t.Fatalf("valid request rejected: %s", message)
	}

	validRequest.IsFootwear = true
	validRequest.AvailableSizes = nil
	if message := validatePublishTaskRequest(validRequest); message != "" {
		t.Fatalf("footwear without structured sizes should still publish: %s", message)
	}

	validRequest.PriceCents = 0
	if message := validatePublishTaskRequest(validRequest); message == "" {
		t.Fatal("zero price should be rejected")
	}
}

// TestPublishTaskResponsesIncludesDiscountRate 验证恢复旧商品预览包含小程序折扣率。
func TestPublishTaskResponsesIncludesDiscountRate(t *testing.T) {
	responses := publishTaskResponses([]model.PublishTask{{
		ItemNo:             "S31023-552",
		SourcePriceCents:   73700,
		OriginalPriceCents: 139000,
	}})
	if len(responses) != 1 {
		t.Fatalf("unexpected response count: %d", len(responses))
	}
	if responses[0].DiscountRate != 53 {
		t.Fatalf("unexpected discount rate: %d", responses[0].DiscountRate)
	}
}

// TestUniqueImageURLs 验证图片地址清理和去重。
func TestUniqueImageURLs(t *testing.T) {
	actual := uniqueImageURLs([]string{" https://example.com/a.jpg ", "", "https://example.com/a.jpg"})
	if len(actual) != 1 || actual[0] != "https://example.com/a.jpg" {
		t.Fatalf("uniqueImageURLs() = %#v", actual)
	}
}

// TestSinglePublishUsesSharedTemplate 验证单件发布与批量发布使用同一标题和描述模板。
func TestSinglePublishUsesSharedTemplate(t *testing.T) {
	title := buildPublishTitle("【全新】343846-002 NIKE耐克 AIR MAX TORCH 4男子缓震运动跑步鞋343846-002", "343846-002")
	if len([]rune(title)) > 30 || !strings.HasPrefix(title, "全新 ") || !strings.HasSuffix(title, " 343846-002") {
		t.Fatalf("unexpected shared title: %s", title)
	}
	if title != "全新 NIKE耐克 AIR MAX 343846-002" {
		t.Fatalf("unexpected readable title truncation: %s", title)
	}
	publishedAt := time.Date(2026, 10, 8, 12, 0, 0, 0, time.Local)
	updatedAt := time.Date(2026, 10, 11, 12, 0, 0, 0, time.Local)
	description := buildPublishDescription("NIKE耐克 AIR MAX TORCH 4男子缓震运动跑步鞋343846-002", "343846-002", 79900, []string{"42", "40.5", "42"}, "成都、武汉", publishedAt, updatedAt)
	if !strings.HasPrefix(description, "\n货号：343846-002\n") || strings.Contains(description, "NIKE耐克 AIR MAX") {
		t.Fatalf("description repeats the title: %s", description)
	}
	for _, expected := range []string{"货号：343846-002", "商品原价：¥799.00", "有货尺码/型号：42、40.5", "发货地区：成都、武汉", "按“假一赔三”处理。", "48小时内发出，最晚不超过72小时", "默认使用京东快递或顺丰快递", "7. 关于售后", "发布时间： 2026-10-08", "更新时间： 2026-10-11 12:00"} {
		if !strings.Contains(description, expected) {
			t.Fatalf("shared description missing %q", expected)
		}
	}
}
