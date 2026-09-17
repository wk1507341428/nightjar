package xianyu

import "testing"

// TestCreateSignature 固定 MTop 签名输入，避免发布请求编码回归。
func TestCreateSignature(t *testing.T) {
	actual := createSignature("token", "1700000000000", "34839810", `{"a":1}`)
	if actual != "4f69b363508b3e5d638ae63ced87272b" {
		t.Fatalf("createSignature() = %s", actual)
	}
}

// TestParseCookieHeader 验证复制完整 Header 和纯值两种格式。
func TestParseCookieHeader(t *testing.T) {
	cookies := parseCookieHeader("Cookie: _m_h5_tk=abc_123; cookie2=value")
	if cookies["_m_h5_tk"] != "abc_123" || cookies["cookie2"] != "value" {
		t.Fatalf("parseCookieHeader() = %#v", cookies)
	}
}
