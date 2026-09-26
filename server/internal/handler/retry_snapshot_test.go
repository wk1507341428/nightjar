package handler

import "testing"

func TestUncertainPublishForcesSnapshot(t *testing.T) {
	for _, message := range []string{"闲鱼发布接口失败：context deadline exceeded", "服务重启中断", "未知错误"} {
		if !retryRequiresFreshSnapshot(message) {
			t.Fatalf("uncertain error reused stale snapshot: %s", message)
		}
	}
	for _, message := range []string{"闲鱼登录已失效，请重新连接", "准备商品图片失败：网络超时", "闲鱼图片上传失败：文件过大"} {
		if retryRequiresFreshSnapshot(message) {
			t.Fatalf("pre-publish failure unnecessarily syncs: %s", message)
		}
	}
}
