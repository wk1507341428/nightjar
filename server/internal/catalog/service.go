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

	redisclient "github.com/redis/go-redis/v9"
	"github.com/zeromicro/go-zero/core/logx"
	"golang.org/x/sync/singleflight"

	"sidejob-server/internal/config"
	"sidejob-server/internal/repository"
)

// Service 提供商品目录查询与同步能力。
type Service struct {
	OnSynced            func(BrandStore)
	config              config.CatalogConfig
	httpClient          *http.Client
	liveOfferSemaphore  chan struct{}
	detailSemaphore     chan struct{}
	detailGroup         singleflight.Group
	detailCache         *redisclient.Client
	ingestQueue         chan []PublishSourceSnapshot
	inventoryRepository *InventoryRepository
	listingRepository   *repository.MarketplaceListingRepository
}

// NewService 创建商品目录服务。
func NewService(serviceConfig config.CatalogConfig, inventoryRepository *InventoryRepository, listingRepository *repository.MarketplaceListingRepository, cacheClients ...*redisclient.Client) *Service {
	// 外部接口超时时间。
	timeoutSeconds := serviceConfig.RequestTimeout
	if timeoutSeconds <= 0 {
		timeoutSeconds = 15
	}

	var detailCache *redisclient.Client
	if len(cacheClients) > 0 {
		detailCache = cacheClients[0]
	}
	service := &Service{
		config:              serviceConfig,
		liveOfferSemaphore:  make(chan struct{}, 12),
		detailSemaphore:     make(chan struct{}, 10),
		detailCache:         detailCache,
		ingestQueue:         make(chan []PublishSourceSnapshot, 16),
		inventoryRepository: inventoryRepository,
		listingRepository:   listingRepository,
		httpClient: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}
	go service.runPublishSnapshotIngestion()
	return service
}

// PublishSourceSnapshot 是发布中心已经完整读取的一家来源门店快照。
type PublishSourceSnapshot struct {
	BrandProfileID string
	BrandName      string
	RegionID       string
	DistributorID  string
	Products       []map[string]any
	Complete       bool
}

// IngestPublishSnapshotsAsync 把发布中心货源快照交给单消费者批量落库。
func (service *Service) IngestPublishSnapshotsAsync(snapshots []PublishSourceSnapshot) {
	if len(snapshots) == 0 {
		return
	}
	encoded, err := json.Marshal(snapshots)
	if err != nil {
		return
	}
	var clonedSnapshots []PublishSourceSnapshot
	if json.Unmarshal(encoded, &clonedSnapshots) != nil {
		return
	}
	select {
	case service.ingestQueue <- clonedSnapshots:
	default:
		logx.Error("publish snapshot ingest queue is full, skip stale snapshot")
	}
}

// runPublishSnapshotIngestion 顺序处理批量快照，避免多个预览并发写同一门店。
func (service *Service) runPublishSnapshotIngestion() {
	for snapshots := range service.ingestQueue {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		if err := service.IngestPublishSnapshots(ctx, snapshots); err != nil {
			logx.Errorf("ingest publish snapshots: %v", err)
		}
		cancel()
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
