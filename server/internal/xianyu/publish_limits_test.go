package xianyu

import (
	"errors"
	"fmt"
	"testing"
)

func TestPublishCountLimitUsesCapturedBusinessCode(t *testing.T) {
	if !IsPublishCountLimit(fmt.Errorf("发布失败: %w", &APIError{Code: PublishCountLimitErrorCode, Message: "用户发布商品数已达到上限"})) {
		t.Fatal("wrapped real capacity code missed")
	}
	for _, err := range []error{nil, errors.New("队列容量3000"), &APIError{Code: "FAIL_BIZ_OTHER", Message: "用户发布商品数已达到上限"}, &APIError{Code: "FAIL_BIZ_OTHER", Message: "图片存在安全问题"}} {
		if IsPublishCountLimit(err) {
			t.Fatalf("unrelated error incorrectly stopped account: %v", err)
		}
	}
}
