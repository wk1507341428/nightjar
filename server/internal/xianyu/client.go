package xianyu

import (
	"bytes"
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"sidejob-server/internal/config"
)

const defaultUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/152 Safari/537.36"

// ErrSessionExpired 表示闲鱼 Cookie 已失效。
var ErrSessionExpired = errors.New("闲鱼登录已失效，请重新连接")

// APIError 保留闲鱼 MTop 返回的业务错误。
type APIError struct {
	Code    string
	Message string
}

// Error 返回用户可读的闲鱼业务错误。
func (apiError *APIError) Error() string {
	if apiError.Message != "" {
		return apiError.Message
	}
	return apiError.Code
}

// Client 使用 Cookie 和 MTop 签名直接调用闲鱼接口。
type Client struct {
	config     config.XianyuConfig
	httpClient *http.Client
	mutex      sync.Mutex
	cookies    map[string]string
}

// NewClient 从浏览器复制出的 Cookie Header 创建 API 客户端。
func NewClient(clientConfig config.XianyuConfig, rawCookie string) (*Client, error) {
	cookies := parseCookieHeader(rawCookie)
	if cookies["_m_h5_tk"] == "" {
		return nil, errors.New("Cookie 中缺少 _m_h5_tk，请复制完整的闲鱼请求 Cookie")
	}
	timeout := time.Duration(clientConfig.RequestTimeout) * time.Second
	if timeout <= 0 {
		timeout = 30 * time.Second
	}
	return &Client{
		config:     clientConfig,
		httpClient: &http.Client{Timeout: timeout},
		cookies:    cookies,
	}, nil
}

// CookieHeader 返回包含接口刷新结果的最新 Cookie Header。
func (client *Client) CookieHeader() string {
	client.mutex.Lock()
	defer client.mutex.Unlock()
	return serializeCookies(client.cookies)
}

// Call 调用一个已知 MTop API，并自动处理一次 Token 刷新重试。
func (client *Client) Call(ctx context.Context, api string, version string, requestData any, responseData any) error {
	dataBytes, err := json.Marshal(requestData)
	if err != nil {
		return fmt.Errorf("encode %s request: %w", api, err)
	}

	for attempt := 0; attempt < 2; attempt++ {
		envelope, callErr := client.callOnce(ctx, api, version, dataBytes)
		if callErr != nil {
			return callErr
		}
		if envelope.Success() {
			if responseData == nil || len(envelope.Data) == 0 {
				return nil
			}
			if err := json.Unmarshal(envelope.Data, responseData); err != nil {
				return fmt.Errorf("decode %s response: %w", api, err)
			}
			return nil
		}

		code, message := envelope.Error()
		if attempt == 0 && isTokenError(code) {
			continue
		}
		if isSessionError(code) {
			return ErrSessionExpired
		}
		return &APIError{Code: code, Message: message}
	}
	return ErrSessionExpired
}

// UploadImage 上传单张本地图片并返回闲鱼图片信息。
func (client *Client) UploadImage(ctx context.Context, imagePath string) (UploadedImage, error) {
	imageFile, err := os.Open(imagePath)
	if err != nil {
		return UploadedImage{}, err
	}
	defer imageFile.Close()

	requestBody := &bytes.Buffer{}
	multipartWriter := multipart.NewWriter(requestBody)
	filePart, err := multipartWriter.CreateFormFile("file", filepath.Base(imagePath))
	if err != nil {
		return UploadedImage{}, err
	}
	if _, err := io.Copy(filePart, imageFile); err != nil {
		return UploadedImage{}, err
	}
	if err := multipartWriter.Close(); err != nil {
		return UploadedImage{}, err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, client.config.UploadURL, requestBody)
	if err != nil {
		return UploadedImage{}, err
	}
	request.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	request.Header.Set("Cookie", client.CookieHeader())
	request.Header.Set("Origin", "https://www.goofish.com")
	request.Header.Set("Referer", "https://www.goofish.com/")
	request.Header.Set("User-Agent", defaultUserAgent)

	response, err := client.httpClient.Do(request)
	if err != nil {
		return UploadedImage{}, fmt.Errorf("upload image: %w", err)
	}
	defer response.Body.Close()
	client.mergeResponseCookies(response)

	var uploadResponse struct {
		Success bool          `json:"success"`
		Message string        `json:"message"`
		Object  UploadedImage `json:"object"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 2<<20)).Decode(&uploadResponse); err != nil {
		return UploadedImage{}, fmt.Errorf("decode upload response: %w", err)
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 || !uploadResponse.Success || uploadResponse.Object.URL == "" {
		return UploadedImage{}, fmt.Errorf("闲鱼图片上传失败：%s", uploadResponse.Message)
	}
	return uploadResponse.Object, nil
}

// callOnce 发送一次带签名的 MTop 请求。
func (client *Client) callOnce(ctx context.Context, api string, version string, dataBytes []byte) (mtopEnvelope, error) {
	timestamp := fmt.Sprintf("%d", time.Now().UnixMilli())
	token, err := client.signingToken()
	if err != nil {
		return mtopEnvelope{}, err
	}
	signature := createSignature(token, timestamp, client.config.AppKey, string(dataBytes))

	requestURL, err := url.Parse(strings.TrimRight(client.config.APIBase, "/") + "/" + api + "/" + version + "/")
	if err != nil {
		return mtopEnvelope{}, err
	}
	query := requestURL.Query()
	query.Set("jsv", "2.7.2")
	query.Set("appKey", client.config.AppKey)
	query.Set("t", timestamp)
	query.Set("sign", signature)
	query.Set("v", version)
	query.Set("type", "originaljson")
	query.Set("accountSite", "xianyu")
	query.Set("dataType", "json")
	query.Set("timeout", "20000")
	query.Set("api", api)
	query.Set("sessionOption", "AutoLoginOnly")
	requestURL.RawQuery = query.Encode()

	formBody := url.Values{"data": []string{string(dataBytes)}}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, requestURL.String(), strings.NewReader(formBody.Encode()))
	if err != nil {
		return mtopEnvelope{}, err
	}
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	request.Header.Set("Cookie", client.CookieHeader())
	request.Header.Set("Origin", "https://www.goofish.com")
	request.Header.Set("Referer", "https://www.goofish.com/")
	request.Header.Set("User-Agent", defaultUserAgent)

	response, err := client.httpClient.Do(request)
	if err != nil {
		return mtopEnvelope{}, fmt.Errorf("call %s: %w", api, err)
	}
	defer response.Body.Close()
	client.mergeResponseCookies(response)

	var envelope mtopEnvelope
	if err := json.NewDecoder(io.LimitReader(response.Body, 4<<20)).Decode(&envelope); err != nil {
		return mtopEnvelope{}, fmt.Errorf("decode %s envelope: %w", api, err)
	}
	return envelope, nil
}

// signingToken 提取 _m_h5_tk 下划线前的签名 Token。
func (client *Client) signingToken() (string, error) {
	client.mutex.Lock()
	defer client.mutex.Unlock()
	tokenCookie := client.cookies["_m_h5_tk"]
	if tokenCookie == "" {
		return "", ErrSessionExpired
	}
	return strings.SplitN(tokenCookie, "_", 2)[0], nil
}

// mergeResponseCookies 合并 MTop 刷新的 Token Cookie。
func (client *Client) mergeResponseCookies(response *http.Response) {
	client.mutex.Lock()
	defer client.mutex.Unlock()
	for _, responseCookie := range response.Cookies() {
		client.cookies[responseCookie.Name] = responseCookie.Value
	}
}

// createSignature 生成 H5 MTop MD5 签名。
func createSignature(token string, timestamp string, appKey string, data string) string {
	hash := md5.Sum([]byte(token + "&" + timestamp + "&" + appKey + "&" + data))
	return hex.EncodeToString(hash[:])
}

// parseCookieHeader 将 Cookie Header 转换为名称和值。
func parseCookieHeader(rawCookie string) map[string]string {
	cookies := make(map[string]string)
	rawCookie = strings.TrimSpace(rawCookie)
	if len(rawCookie) >= len("cookie:") && strings.EqualFold(rawCookie[:len("cookie:")], "cookie:") {
		rawCookie = strings.TrimSpace(rawCookie[len("cookie:"):])
	}
	for _, cookiePart := range strings.Split(rawCookie, ";") {
		nameValue := strings.SplitN(strings.TrimSpace(cookiePart), "=", 2)
		if len(nameValue) != 2 || nameValue[0] == "" {
			continue
		}
		cookies[nameValue[0]] = nameValue[1]
	}
	return cookies
}

// serializeCookies 生成稳定的 Cookie Header。
func serializeCookies(cookies map[string]string) string {
	names := make([]string, 0, len(cookies))
	for name := range cookies {
		names = append(names, name)
	}
	sort.Strings(names)
	parts := make([]string, 0, len(names))
	for _, name := range names {
		parts = append(parts, name+"="+cookies[name])
	}
	return strings.Join(parts, "; ")
}

// isTokenError 判断是否可通过刷新 Token 后重试。
func isTokenError(code string) bool {
	return strings.Contains(code, "TOKEN_EXPIRED") ||
		strings.Contains(code, "TOKEN_EXOIRED") ||
		strings.Contains(code, "TOKEN_EMPTY") ||
		strings.Contains(code, "ILLEGAL_ACCESS")
}

// isSessionError 判断登录态是否已经无效。
func isSessionError(code string) bool {
	return strings.Contains(code, "SESSION_EXPIRED") || strings.Contains(code, "USER_NOT_AUTH") || strings.Contains(code, "NEED_LOGIN")
}
