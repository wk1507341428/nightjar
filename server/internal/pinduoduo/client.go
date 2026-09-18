package pinduoduo

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	merchantSearchEndpoint = "https://mms.pinduoduo.com/opportunity-goods/chance-goods/home_list"
	merchantPageURL        = "https://mms.pinduoduo.com/goods/goods_list/chance/chance_list"
	merchantUserAgent      = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/152 Safari/537.36"
	maximumResponseBytes   = 8 << 20
)

// SearchInput 是拼多多商家后台机会商品查询条件。
type SearchInput struct {
	Keyword string
	Page    int
	Size    int
}

// SearchItem 是拼多多机会商品参考价候选。
type SearchItem struct {
	ChanceID   string
	Title      string
	PriceCents int64
	ImageURL   string
	ItemURL    string
	HotIndex   string
}

// Client 调用拼多多商家后台机会商品接口。
type Client struct {
	credential Credential
	httpClient *http.Client
}

// NewClient 创建拼多多商家后台客户端。
func NewClient(credential Credential) (*Client, error) {
	credential.Cookie = strings.TrimSpace(credential.Cookie)
	if err := credential.Validate(); err != nil {
		return nil, err
	}
	return &Client{
		credential: credential,
		httpClient: &http.Client{Timeout: 20 * time.Second},
	}, nil
}

// Search 搜索拼多多机会商品并返回参考价格。
func (client *Client) Search(ctx context.Context, input SearchInput) ([]SearchItem, error) {
	keyword := strings.TrimSpace(input.Keyword)
	if keyword == "" {
		return nil, fmt.Errorf("拼多多比价缺少商品关键词")
	}
	page := input.Page
	if page <= 0 {
		page = 1
	}
	size := input.Size
	if size <= 0 || size > 30 {
		size = 20
	}
	requestBody, err := json.Marshal(map[string]any{
		"size":        size,
		"page":        page,
		"search_word": keyword,
	})
	if err != nil {
		return nil, err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, merchantSearchEndpoint, bytes.NewReader(requestBody))
	if err != nil {
		return nil, err
	}
	request.Header.Set("Accept", "*/*")
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Cookie", client.credential.Cookie)
	request.Header.Set("Origin", "https://mms.pinduoduo.com")
	request.Header.Set("Referer", merchantPageURL+"?search_word="+url.QueryEscape(keyword))
	request.Header.Set("User-Agent", merchantUserAgent)

	response, err := client.httpClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("调用拼多多商家后台失败：%w", err)
	}
	defer response.Body.Close()

	var payload struct {
		Success   bool   `json:"success"`
		ErrorCode any    `json:"error_code"`
		ErrorMsg  string `json:"error_msg"`
		Result    struct {
			Total int `json:"total"`
			List  []struct {
				ChanceID   string `json:"chance_id"`
				Keywords   string `json:"keywords"`
				ReferPrice int64  `json:"refer_price"`
				PicURL     string `json:"pic_url"`
				HotIndex   any    `json:"hot_index"`
			} `json:"list"`
		} `json:"result"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, maximumResponseBytes)).Decode(&payload); err != nil {
		return nil, fmt.Errorf("解析拼多多商家后台结果失败：%w", err)
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 || !payload.Success {
		message := strings.TrimSpace(payload.ErrorMsg)
		if message == "" {
			message = "错误码 " + valueString(payload.ErrorCode)
		}
		return nil, fmt.Errorf("拼多多商家后台凭证无效：%s", message)
	}

	items := make([]SearchItem, 0, len(payload.Result.List))
	for _, remoteItem := range payload.Result.List {
		if remoteItem.ChanceID == "" {
			continue
		}
		items = append(items, SearchItem{
			ChanceID:   remoteItem.ChanceID,
			Title:      remoteItem.Keywords,
			PriceCents: remoteItem.ReferPrice,
			ImageURL:   remoteItem.PicURL,
			ItemURL:    merchantPageURL + "?search_word=" + url.QueryEscape(keyword),
			HotIndex:   valueString(remoteItem.HotIndex),
		})
	}
	return items, nil
}

// valueString 兼容第三方接口中的字符串和数字字段。
func valueString(value any) string {
	switch typedValue := value.(type) {
	case string:
		return strings.TrimSpace(typedValue)
	case float64:
		return strconv.FormatInt(int64(typedValue), 10)
	case json.Number:
		return typedValue.String()
	default:
		return ""
	}
}
