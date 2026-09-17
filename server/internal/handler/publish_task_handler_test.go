package handler

import (
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
