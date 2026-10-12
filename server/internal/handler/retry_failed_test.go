package handler

import "testing"

// TestIsValidRetryAction 验证批量重试支持全部任务类型。
func TestIsValidRetryAction(t *testing.T) {
	for _, action := range []string{"", retryActionPublish, retryActionUpdate, retryActionRelist, retryActionOffline} {
		if !isValidRetryAction(action) {
			t.Fatalf("expected retry action %q to be valid", action)
		}
	}
	if isValidRetryAction("unknown") {
		t.Fatal("unexpected unknown retry action to be valid")
	}
}
