package handler

import (
	"strings"
	"testing"

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
	description := buildPublishDescription("NIKE耐克 AIR MAX TORCH 4男子缓震运动跑步鞋343846-002", "343846-002", []string{"42", "40.5", "42"}, "成都、武汉")
	if !strings.HasPrefix(description, "货号：343846-002\n") || strings.Contains(description, "NIKE耐克 AIR MAX") {
		t.Fatalf("description repeats the title: %s", description)
	}
	for _, expected := range []string{"货号：343846-002", "有货尺码/型号：42、40.5", "发货地区：成都、武汉"} {
		if !strings.Contains(description, expected) {
			t.Fatalf("shared description missing %q", expected)
		}
	}
}
