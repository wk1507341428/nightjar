package publish

import (
	"net/http"
	"testing"
	"time"
)

// TestValidatePublicImageURL 验证图片下载只允许公网 HTTP 地址。
func TestValidatePublicImageURL(t *testing.T) {
	if err := validatePublicImageURL("https://8.8.8.8/product.jpg"); err != nil {
		t.Fatalf("public image URL rejected: %v", err)
	}

	invalidURLs := []string{
		"file:///tmp/product.jpg",
		"http://127.0.0.1/product.jpg",
		"http://localhost/product.jpg",
	}
	for _, imageURL := range invalidURLs {
		if err := validatePublicImageURL(imageURL); err == nil {
			t.Fatalf("private image URL accepted: %s", imageURL)
		}
	}
}

// TestImageHeaderValidation 验证动态图片识别不依赖错误的文件扩展名。
func TestImageHeaderValidation(t *testing.T) {
	animatedWebP := append([]byte("RIFF\x00\x00\x00\x00WEBP"), []byte("ANIM")...)
	if !isAnimatedWebP(animatedWebP) {
		t.Fatal("animated WebP was not detected")
	}
	if contentType := http.DetectContentType([]byte("GIF89a")); contentType != "image/gif" {
		t.Fatalf("unexpected GIF content type: %s", contentType)
	}
}

// TestNextPublishDelay 验证任务间隔遵循每个任务的配置。
func TestNextPublishDelay(t *testing.T) {
	for testIndex := 0; testIndex < 100; testIndex++ {
		delay := nextPublishDelay(4, 7)
		if delay < 4*time.Second || delay > 7*time.Second {
			t.Fatalf("unexpected publish delay: %s", delay)
		}
	}
}

// TestNextPublishDelayUsesDefaults 验证旧任务没有配置时使用默认间隔。
func TestNextPublishDelayUsesDefaults(t *testing.T) {
	delay := nextPublishDelay(0, 0)
	if delay < 1*time.Second || delay > 2*time.Second {
		t.Fatalf("unexpected default publish delay: %s", delay)
	}
}

// TestImageExtension 验证图片扩展名只会落入白名单。
func TestImageExtension(t *testing.T) {
	if actual := imageExtension("image/webp", "https://example.com/a"); actual != ".webp" {
		t.Fatalf("imageExtension() = %q, want .webp", actual)
	}
	if actual := imageExtension("application/octet-stream", "https://example.com/a.exe"); actual != ".jpg" {
		t.Fatalf("imageExtension() = %q, want .jpg", actual)
	}
}
