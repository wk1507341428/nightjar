// Package catalog 负责读取奥莱商品和本地商品库数据。
package catalog

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"sidejob-server/internal/config"
	"sidejob-server/internal/repository"
)

// Service 提供商品目录查询与同步能力。
type Service struct {
	OnSynced            func(BrandStore)
	config              config.CatalogConfig
	httpClient          *http.Client
	liveOfferSemaphore  chan struct{}
	inventoryRepository *InventoryRepository
	listingRepository   *repository.MarketplaceListingRepository
}

// NewService 创建商品目录服务。
func NewService(serviceConfig config.CatalogConfig, inventoryRepository *InventoryRepository, listingRepository *repository.MarketplaceListingRepository) *Service {
	// 外部接口超时时间。
	timeoutSeconds := serviceConfig.RequestTimeout
	if timeoutSeconds <= 0 {
		timeoutSeconds = 15
	}

	return &Service{
		config:              serviceConfig,
		liveOfferSemaphore:  make(chan struct{}, 12),
		inventoryRepository: inventoryRepository,
		listingRepository:   listingRepository,
		httpClient: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}
}

// getJSON 调用奥莱只读接口并解码响应。
func (service *Service) getJSON(
	requestContext context.Context,
	path string,
	query url.Values,
	target any,
) error {
	// 请求地址。
	requestURL, err := url.Parse(strings.TrimRight(service.config.APIBase, "/") + path)
	if err != nil {
		return fmt.Errorf("parse catalog URL: %w", err)
	}
	query.Set("company_id", service.config.CompanyID)
	requestURL.RawQuery = query.Encode()

	request, err := http.NewRequestWithContext(requestContext, http.MethodGet, requestURL.String(), nil)
	if err != nil {
		return fmt.Errorf("create catalog request: %w", err)
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("authorizer-appid", service.config.AuthorizerAppID)

	response, err := service.httpClient.Do(request)
	if err != nil {
		return fmt.Errorf("request catalog API: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("catalog API returned HTTP %d", response.StatusCode)
	}
	if err := json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode catalog response: %w", err)
	}

	return nil
}
