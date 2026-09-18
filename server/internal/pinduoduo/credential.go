// Package pinduoduo 提供拼多多商家后台凭证管理与机会商品查询能力。
package pinduoduo

import (
	"encoding/json"
	"errors"
	"regexp"
	"strings"
)

var (
	curlCookiePattern = regexp.MustCompile(`(?is)(?:^|\s)(?:-b|--cookie)\s+(?:'([^']*)'|"([^"]*)"|([^\s\\]+))`)
	headerPattern     = regexp.MustCompile(`(?is)(?:^|\s)(?:-H|--header)\s+(?:'([^']*)'|"([^"]*)")`)
)

// Credential 是调用拼多多商家后台接口所需的 Cookie。
type Credential struct {
	Cookie string `json:"cookie"`
}

// ParseCredential 支持商家后台 cURL 或完整 Cookie。
func ParseCredential(rawCredential string) (Credential, error) {
	normalizedCredential := strings.TrimSpace(rawCredential)
	if normalizedCredential == "" {
		return Credential{}, errors.New("请粘贴拼多多商家后台请求 cURL 或完整 Cookie")
	}
	if !strings.HasPrefix(strings.ToLower(normalizedCredential), "curl ") {
		credential := Credential{Cookie: normalizeCookie(normalizedCredential)}
		return credential, credential.Validate()
	}

	if cookieMatch := curlCookiePattern.FindStringSubmatch(normalizedCredential); len(cookieMatch) > 0 {
		credential := Credential{Cookie: firstMatchedValue(cookieMatch)}
		return credential, credential.Validate()
	}
	for _, headerMatch := range headerPattern.FindAllStringSubmatch(normalizedCredential, -1) {
		headerValue := firstMatchedValue(headerMatch)
		if strings.HasPrefix(strings.ToLower(strings.TrimSpace(headerValue)), "cookie:") {
			credential := Credential{Cookie: normalizeCookie(headerValue)}
			return credential, credential.Validate()
		}
	}
	return Credential{}, errors.New("cURL 中没有找到拼多多商家后台 Cookie")
}

// Validate 校验商家后台会话的关键 Cookie。
func (credential Credential) Validate() error {
	credential.Cookie = strings.TrimSpace(credential.Cookie)
	if credential.Cookie == "" {
		return errors.New("请填写拼多多商家后台 Cookie")
	}
	if !strings.Contains(credential.Cookie, "JSESSIONID=") && !strings.Contains(credential.Cookie, "PASS_ID=") {
		return errors.New("Cookie 中缺少 JSESSIONID 或 PASS_ID，请复制完整商家后台请求")
	}
	return nil
}

// EncodeCredential 序列化凭证后交给会话加密器。
func EncodeCredential(credential Credential) (string, error) {
	encodedCredential, err := json.Marshal(credential)
	if err != nil {
		return "", err
	}
	return string(encodedCredential), nil
}

// DecodeCredential 解析已解密的拼多多商家后台凭证。
func DecodeCredential(encodedCredential string) (Credential, error) {
	var credential Credential
	if err := json.Unmarshal([]byte(encodedCredential), &credential); err != nil {
		return Credential{}, err
	}
	credential.Cookie = strings.TrimSpace(credential.Cookie)
	if err := credential.Validate(); err != nil {
		return Credential{}, err
	}
	return credential, nil
}

// normalizeCookie 移除可选的 Cookie 请求头前缀。
func normalizeCookie(rawCookie string) string {
	trimmedCookie := strings.TrimSpace(rawCookie)
	if len(trimmedCookie) >= len("cookie:") && strings.EqualFold(trimmedCookie[:len("cookie:")], "cookie:") {
		return strings.TrimSpace(trimmedCookie[len("cookie:"):])
	}
	return trimmedCookie
}

// firstMatchedValue 返回正则捕获组中的首个非空值。
func firstMatchedValue(matches []string) string {
	for _, match := range matches[1:] {
		if strings.TrimSpace(match) != "" {
			return strings.TrimSpace(match)
		}
	}
	return ""
}
