package publish

import "testing"

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

// TestImageExtension 验证图片扩展名只会落入白名单。
func TestImageExtension(t *testing.T) {
	if actual := imageExtension("image/webp", "https://example.com/a"); actual != ".webp" {
		t.Fatalf("imageExtension() = %q, want .webp", actual)
	}
	if actual := imageExtension("application/octet-stream", "https://example.com/a.exe"); actual != ".jpg" {
		t.Fatalf("imageExtension() = %q, want .jpg", actual)
	}
}
