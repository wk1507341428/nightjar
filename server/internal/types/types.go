package types

import "sidejob-server/internal/model"

// HealthResponse 是健康检查响应。
type HealthResponse struct {
	Status string `json:"status"`
}

// CatalogBrandStoreResponse 是可配置同步的品牌门店。
type CatalogBrandStoreResponse struct {
	ID            string `json:"id"`
	RegionID      string `json:"regionId"`
	DistributorID string `json:"distributorId"`
	BrandID       string `json:"brandId"`
	BrandName     string `json:"brandName"`
	ShopCode      string `json:"shopCode,omitempty"`
	StoreName     string `json:"storeName,omitempty"`
	SyncEnabled   bool   `json:"syncEnabled"`
	LastSyncedAt  string `json:"lastSyncedAt,omitempty"`
}

// SaveCatalogBrandStoreRequest 更新品牌门店的同步配置。
type SaveCatalogBrandStoreRequest struct {
	RegionID      string `json:"regionId"`
	DistributorID string `json:"distributorId"`
	BrandName     string `json:"brandName"`
	ShopCode      string `json:"shopCode,omitempty"`
	StoreName     string `json:"storeName,omitempty"`
	SyncEnabled   bool   `json:"syncEnabled"`
}

// BrandProfileMemberRequest 是品牌档案中的一个地区品牌成员。
type BrandProfileMemberRequest struct {
	RegionID      string `json:"regionId"`
	DistributorID string `json:"distributorId"`
	SourceName    string `json:"sourceName"`
}

// SaveBrandProfileRequest 保存单品牌或合并品牌档案。
type SaveBrandProfileRequest struct {
	ID              string                      `json:"id,omitempty"`
	Name            string                      `json:"name"`
	DefaultRegionID string                      `json:"defaultRegionId,omitempty"`
	Members         []BrandProfileMemberRequest `json:"members"`
}

// BrandProfileResponse 是发布和同步统一使用的品牌档案。
type BrandProfileResponse struct {
	ID              string                      `json:"id"`
	Name            string                      `json:"name"`
	DefaultRegionID string                      `json:"defaultRegionId,omitempty"`
	Members         []BrandProfileMemberRequest `json:"members"`
	UpdatedAt       string                      `json:"updatedAt"`
}

// BrandMaintenanceSourceResponse 是实时上游品牌及当前归属。
type BrandMaintenanceSourceResponse struct {
	RegionID         string `json:"regionId"`
	DistributorID    string `json:"distributorId"`
	Name             string `json:"name"`
	LogoURL          string `json:"logoUrl,omitempty"`
	OnlineGoodsCount int    `json:"onlineGoodsCount"`
	ProfileID        string `json:"profileId,omitempty"`
}

// BrandMaintenanceResponse 是品牌维护页的完整实时数据。
type BrandMaintenanceResponse struct {
	Profiles []BrandProfileResponse           `json:"profiles"`
	Sources  []BrandMaintenanceSourceResponse `json:"sources"`
}

// CatalogOfferListResponse 是本地商品库查询结果。
type CatalogOfferListResponse struct {
	List  []map[string]any `json:"list"`
	Total int64            `json:"total"`
}

// CatalogSKUPriceSnapshotResponse 是一个 SKU 的价格观察点。
type CatalogSKUPriceSnapshotResponse struct {
	ID                 string `json:"id"`
	SKUID              string `json:"skuId"`
	SKUCode            string `json:"skuCode,omitempty"`
	VariantLabel       string `json:"variantLabel"`
	PriceCents         int64  `json:"priceCents"`
	SourcePriceCents   int64  `json:"sourcePriceCents"`
	ActivityPriceCents int64  `json:"activityPriceCents"`
	MarketPriceCents   int64  `json:"marketPriceCents"`
	Stock              int64  `json:"stock"`
	ObservedAt         string `json:"observedAt"`
}

// CatalogOfferPriceHistoryResponse 是商品及全部 SKU 的价格历史。
type CatalogOfferPriceHistoryResponse struct {
	OfferID      string                            `json:"offerId"`
	ItemNo       string                            `json:"itemNo"`
	Name         string                            `json:"name"`
	BrandName    string                            `json:"brandName"`
	RegionID     string                            `json:"regionId"`
	ImageURL     string                            `json:"imageUrl,omitempty"`
	LastSyncedAt string                            `json:"lastSyncedAt"`
	Snapshots    []CatalogSKUPriceSnapshotResponse `json:"snapshots"`
}

// CatalogSyncResponse 是一次本地商品库同步结果。
type CatalogSyncResponse struct {
	ID             string `json:"id"`
	ScopeType      string `json:"scopeType"`
	BrandStoreID   string `json:"brandStoreId,omitempty"`
	BrandName      string `json:"brandName,omitempty"`
	RegionID       string `json:"regionId,omitempty"`
	OfferID        string `json:"offerId,omitempty"`
	Status         string `json:"status"`
	TotalCount     int    `json:"totalCount"`
	ProcessedCount int    `json:"processedCount"`
	CreatedCount   int    `json:"createdCount"`
	UpdatedCount   int    `json:"updatedCount"`
	InactiveCount  int    `json:"inactiveCount"`
	SuspectedCount int    `json:"suspectedCount"`
	ErrorMessage   string `json:"errorMessage,omitempty"`
	StartedAt      string `json:"startedAt"`
	FinishedAt     string `json:"finishedAt,omitempty"`
}

// CatalogSyncRunListResponse 是同步历史分页响应。
type CatalogSyncRunListResponse struct {
	List  []CatalogSyncResponse `json:"list"`
	Total int64                 `json:"total"`
}

// CatalogSyncChangeValueResponse 是 SKU 变更前后的关键状态。
type CatalogSyncChangeValueResponse struct {
	PriceCents         int64  `json:"priceCents"`
	SourcePriceCents   int64  `json:"sourcePriceCents"`
	ActivityPriceCents int64  `json:"activityPriceCents"`
	MarketPriceCents   int64  `json:"marketPriceCents"`
	Stock              int64  `json:"stock"`
	Status             string `json:"status,omitempty"`
}

// CatalogSyncChangeResponse 是一次同步的 SKU 变更明细。
type CatalogSyncChangeResponse struct {
	ID             string                         `json:"id"`
	RunID          string                         `json:"runId"`
	OfferID        string                         `json:"offerId"`
	ItemNo         string                         `json:"itemNo"`
	ProductName    string                         `json:"productName"`
	ImageURL       string                         `json:"imageUrl,omitempty"`
	SKUID          string                         `json:"skuId"`
	SKUCode        string                         `json:"skuCode,omitempty"`
	VariantLabel   string                         `json:"variantLabel"`
	ChangeType     string                         `json:"changeType"`
	Before         CatalogSyncChangeValueResponse `json:"before"`
	After          CatalogSyncChangeValueResponse `json:"after"`
	ChangedAt      string                         `json:"changedAt"`
	XianyuListings []MarketplaceListingResponse   `json:"xianyuListings"`
}

// CatalogSyncChangeListResponse 是同步变更明细分页响应。
type CatalogSyncChangeListResponse struct {
	Run   CatalogSyncResponse         `json:"run"`
	List  []CatalogSyncChangeResponse `json:"list"`
	Total int64                       `json:"total"`
}

// MarketplaceListingResponse 是一个渠道当前在售商品。
type MarketplaceListingResponse struct {
	ID             string `json:"id"`
	AccountID      string `json:"accountId"`
	Platform       string `json:"platform"`
	PlatformItemID string `json:"platformItemId"`
	SourceItemID   string `json:"sourceItemId,omitempty"`
	ItemNo         string `json:"itemNo,omitempty"`
	Title          string `json:"title"`
	PriceCents     int64  `json:"priceCents"`
	ImageURL       string `json:"imageUrl,omitempty"`
	ItemURL        string `json:"itemUrl,omitempty"`
	ListedAt       string `json:"listedAt"`
	LastSyncedAt   string `json:"lastSyncedAt"`
}

// MarketplaceListingListResponse 是渠道当前在售列表。
type MarketplaceListingListResponse struct {
	List         []MarketplaceListingResponse `json:"list"`
	Total        int                          `json:"total"`
	LastSyncedAt string                       `json:"lastSyncedAt,omitempty"`
}

// MarketplaceSyncResponse 是一次渠道同步结果。
type MarketplaceSyncResponse struct {
	Platform     string `json:"platform"`
	SyncedCount  int    `json:"syncedCount"`
	LastSyncedAt string `json:"lastSyncedAt"`
}

// MarketplaceOfflineRequest 是渠道商品下架请求。
type MarketplaceOfflineRequest struct {
	ItemIDs []string `json:"itemIds"`
}

// MarketplaceOfflineResponse 是渠道商品下架结果。
type MarketplaceOfflineResponse struct {
	SucceededItemIDs []string `json:"succeededItemIds"`
	FailedItemIDs    []string `json:"failedItemIds"`
}

// OfflineCenterPreviewRequest 是下架中心的品牌和商品筛选条件。
type OfflineCenterPreviewRequest struct {
	AccountID       string   `json:"accountId"`
	BrandProfileID  string   `json:"brandProfileId,omitempty"`
	RegionID        string   `json:"regionId,omitempty"`
	DistributorID   string   `json:"distributorId,omitempty"`
	BrandName       string   `json:"brandName,omitempty"`
	CategoryIDs     []string `json:"categoryIds,omitempty"`
	MinPriceCents   int64    `json:"minPriceCents,omitempty"`
	MaxPriceCents   int64    `json:"maxPriceCents,omitempty"`
	MinDiscountRate int      `json:"minDiscountRate,omitempty"`
	MaxDiscountRate int      `json:"maxDiscountRate,omitempty"`
}

// OfflineCenterCandidate 是一件可确认加入下架队列的闲鱼商品。
type OfflineCenterCandidate struct {
	PlatformItemID   string   `json:"platformItemId"`
	ItemNo           string   `json:"itemNo"`
	Title            string   `json:"title"`
	PriceCents       int64    `json:"priceCents"`
	MarketPriceCents int64    `json:"marketPriceCents,omitempty"`
	DiscountRate     int      `json:"discountRate,omitempty"`
	ImageURL         string   `json:"imageUrl,omitempty"`
	ItemURL          string   `json:"itemUrl,omitempty"`
	CategoryIDs      []string `json:"categoryIds,omitempty"`
	CategoryNames    []string `json:"categoryNames,omitempty"`
	SourceRegions    []string `json:"sourceRegions,omitempty"`
}

// OfflineCenterPreviewResponse 是下架中心品牌筛选后的闲鱼商品列表。
type OfflineCenterPreviewResponse struct {
	AccountID      string                   `json:"accountId"`
	BrandProfileID string                   `json:"brandProfileId"`
	BrandName      string                   `json:"brandName"`
	Total          int                      `json:"total"`
	Candidates     []OfflineCenterCandidate `json:"candidates"`
}

// CreateOfflineCenterOperationRequest 是用户确认后的下架入队请求。
type CreateOfflineCenterOperationRequest struct {
	AccountID       string   `json:"accountId"`
	BrandProfileID  string   `json:"brandProfileId,omitempty"`
	RegionID        string   `json:"regionId,omitempty"`
	DistributorID   string   `json:"distributorId,omitempty"`
	BrandName       string   `json:"brandName,omitempty"`
	CategoryIDs     []string `json:"categoryIds,omitempty"`
	CategoryNames   []string `json:"categoryNames,omitempty"`
	PlatformItemIDs []string `json:"platformItemIds"`
}

// PriceComparisonProduct 是待比价的来源商品。
type PriceComparisonProduct struct {
	SourceItemID       string `json:"sourceItemId,omitempty"`
	ItemNo             string `json:"itemNo,omitempty"`
	Brand              string `json:"brand,omitempty"`
	Name               string `json:"name"`
	ImageURL           string `json:"imageUrl,omitempty"`
	PriceCents         int64  `json:"priceCents,omitempty"`
	OriginalPriceCents int64  `json:"originalPriceCents,omitempty"`
}

// PriceComparisonFilters 是所有比价渠道共用的筛选条件。
type PriceComparisonFilters struct {
	Condition             []string `json:"condition,omitempty"`
	Shipping              string   `json:"shipping,omitempty"`
	MaxResultsPerPlatform int      `json:"maxResultsPerPlatform,omitempty"`
}

// CreatePriceComparisonRequest 是统一多平台比价请求。
type CreatePriceComparisonRequest struct {
	AccountID string                 `json:"accountId,omitempty"`
	Product   PriceComparisonProduct `json:"product"`
	Platforms []string               `json:"platforms"`
	Filters   PriceComparisonFilters `json:"filters"`
}

// PriceComparisonCandidate 是一个渠道候选商品。
type PriceComparisonCandidate struct {
	Platform           string            `json:"platform"`
	PlatformItemID     string            `json:"platformItemId"`
	Title              string            `json:"title"`
	PriceCents         int64             `json:"priceCents"`
	OriginalPriceCents int64             `json:"originalPriceCents,omitempty"`
	ImageURL           string            `json:"imageUrl,omitempty"`
	ItemURL            string            `json:"itemUrl,omitempty"`
	MatchScore         int               `json:"matchScore"`
	MatchReason        string            `json:"matchReason"`
	Attributes         map[string]string `json:"attributes,omitempty"`
}

// PriceComparisonPlatformResult 是单个平台的查询结果或接入状态。
type PriceComparisonPlatformResult struct {
	Platform   string                     `json:"platform"`
	Status     string                     `json:"status"`
	Message    string                     `json:"message,omitempty"`
	Candidates []PriceComparisonCandidate `json:"candidates"`
}

// PriceComparisonResponse 是统一比价响应。
type PriceComparisonResponse struct {
	ID              string                          `json:"id"`
	Status          string                          `json:"status"`
	Product         PriceComparisonProduct          `json:"product"`
	PlatformResults []PriceComparisonPlatformResult `json:"platformResults"`
	CreatedAt       string                          `json:"createdAt"`
}

// ConnectionResponse 是闲鱼连接状态响应。
type ConnectionResponse struct {
	AccountID      string `json:"accountId,omitempty"`
	Platform       string `json:"platform"`
	Status         string `json:"status"`
	Authenticated  bool   `json:"authenticated"`
	SearchReady    bool   `json:"searchReady"`
	LastVerifiedAt string `json:"lastVerifiedAt,omitempty"`
	Message        string `json:"message,omitempty"`
}

// CreateXianyuAccountRequest 是新建闲鱼账号的公开信息。
type CreateXianyuAccountRequest struct {
	Name string `json:"name"`
}

// UpdateXianyuAccountRequest 是账号名称或运行状态更新。
type UpdateXianyuAccountRequest struct {
	Name   string `json:"name,omitempty"`
	Status string `json:"status,omitempty"`
}

// XianyuAccountResponse 是脱敏后的闲鱼账号信息。
type XianyuAccountResponse struct {
	ID                   string `json:"id"`
	Name                 string `json:"name"`
	DisplayName          string `json:"displayName,omitempty"`
	PlatformUserID       string `json:"platformUserId,omitempty"`
	Status               string `json:"status"`
	IsDefault            bool   `json:"isDefault"`
	SessionConnected     bool   `json:"sessionConnected"`
	SellerConnected      bool   `json:"sellerConnected"`
	SearchReady          bool   `json:"searchReady"`
	LastVerifiedAt       string `json:"lastVerifiedAt,omitempty"`
	LastSellerVerifiedAt string `json:"lastSellerVerifiedAt,omitempty"`
	LastSyncedAt         string `json:"lastSyncedAt,omitempty"`
	CreatedAt            string `json:"createdAt"`
	UpdatedAt            string `json:"updatedAt"`
}

// XianyuAccountListResponse 是全部闲鱼账号列表。
type XianyuAccountListResponse struct {
	List []XianyuAccountResponse `json:"list"`
}

// SaveXianyuSessionRequest 是用户复制的闲鱼 cURL 或 Cookie Header。
type SaveXianyuSessionRequest struct {
	AccountID  string `json:"accountId,omitempty"`
	Credential string `json:"credential,omitempty"`
	Cookie     string `json:"cookie,omitempty"`
}

// CreatePublishTaskRequest 是前端确认后的闲鱼发布参数。
type CreatePublishTaskRequest struct {
	AccountID          string                        `json:"accountId"`
	SourceItemID       string                        `json:"sourceItemId"`
	ItemNo             string                        `json:"itemNo"`
	Title              string                        `json:"title"`
	Description        string                        `json:"description"`
	PriceCents         int64                         `json:"priceCents"`
	OriginalPriceCents int64                         `json:"originalPriceCents"`
	ImageURLs          []string                      `json:"imageUrls"`
	RegionID           string                        `json:"regionId"`
	Brand              string                        `json:"brand"`
	Condition          string                        `json:"condition"`
	AvailableSizes     []string                      `json:"availableSizes"`
	Variants           []CreatePublishVariantRequest `json:"variants,omitempty"`
	IsFootwear         bool                          `json:"isFootwear"`
	BrandProfileID     string                        `json:"brandProfileId,omitempty"`
	SourceRegions      []string                      `json:"sourceRegions,omitempty"`
}

// CreatePublishVariantRequest 是单件发布时传入的一条销售规格。
type CreatePublishVariantRequest struct {
	PriceCents int64                                 `json:"priceCents"`
	Quantity   int64                                 `json:"quantity"`
	Properties []CreatePublishVariantPropertyRequest `json:"properties"`
}

// CreatePublishVariantPropertyRequest 是销售规格的一项属性。
type CreatePublishVariantPropertyRequest struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// PublishTaskResponse 是脱敏后的发布任务响应。
type PublishTaskResponse struct {
	AccountID     string   `json:"accountId"`
	Action        string   `json:"action"`
	ChangeReasons []string `json:"changeReasons,omitempty"`
	ID            string   `json:"id"`
	Status        string   `json:"status"`
	ItemNo        string   `json:"itemNo"`
	Title         string   `json:"title"`
	Brand         string   `json:"brand,omitempty"`
	PriceCents    int64    `json:"priceCents"`
	ImageURLs     []string `json:"imageUrls,omitempty"`
	XianyuItemID  string   `json:"xianyuItemId,omitempty"`
	XianyuURL     string   `json:"xianyuUrl,omitempty"`
	ErrorMessage  string   `json:"errorMessage,omitempty"`
	CreatedAt     string   `json:"createdAt"`
	UpdatedAt     string   `json:"updatedAt"`
}

// PublishTaskListResponse 是发布任务列表响应。
type PublishTaskListResponse struct {
	List []PublishTaskResponse `json:"list"`
}

// CreatePublishBatchRequest 是品牌批量发布计划参数。
type CreatePublishBatchRequest struct {
	AccountID                       string   `json:"accountId" bson:"accountId"`
	PreviewID                       string   `json:"previewId,omitempty"`
	PreservedOfflinePlatformItemIDs []string `json:"preservedOfflinePlatformItemIds,omitempty"`
	BrandStoreID                    string   `json:"brandStoreId"`
	BrandProfileID                  string   `json:"brandProfileId,omitempty"`
	SourceType                      string   `json:"sourceType,omitempty"`
	DistributorID                   string   `json:"distributorId,omitempty"`
	BrandName                       string   `json:"brandName,omitempty"`
	RegionID                        string   `json:"regionId,omitempty"`
	ItemNos                         []string `json:"itemNos,omitempty"`
	CategoryIDs                     []string `json:"categoryIds,omitempty"`
	CategoryNames                   []string `json:"categoryNames,omitempty"`
	Limit                           int      `json:"limit"`
	MinDelaySeconds                 int      `json:"minDelaySeconds"`
	MaxDelaySeconds                 int      `json:"maxDelaySeconds"`
	MinPriceCents                   int64    `json:"minPriceCents,omitempty"`
	MaxPriceCents                   int64    `json:"maxPriceCents,omitempty"`
	MinDiscountRate                 int      `json:"minDiscountRate,omitempty"`
	MaxDiscountRate                 int      `json:"maxDiscountRate,omitempty"`
}

// PublishBatchSegmentResponse 是发布操作中追加的一段品牌任务。
type PublishBatchSegmentResponse struct {
	ID             string `json:"id"`
	SourceType     string `json:"sourceType"`
	BrandStoreID   string `json:"brandStoreId,omitempty"`
	DistributorID  string `json:"distributorId,omitempty"`
	BrandName      string `json:"brandName"`
	BrandProfileID string `json:"brandProfileId,omitempty"`
	RegionID       string `json:"regionId"`
	Requested      int    `json:"requested"`
	AddedAt        string `json:"addedAt"`
}

// PublishBatchSkipResponse 是自动跳过的商品。
type PublishBatchSkipResponse struct {
	ItemNo string `json:"itemNo"`
	Title  string `json:"title"`
	Reason string `json:"reason"`
}

// PublishBatchPreviewResponse 是创建前的批量发布预览。
type PublishBatchPreviewResponse struct {
	AccountID         string                                 `json:"accountId"`
	Candidates        []PublishBatchCandidateResponse        `json:"candidates"`
	Updates           []model.PublishTask                    `json:"updates"`
	Relists           []model.PublishTask                    `json:"relists"`
	Unchanged         int                                    `json:"unchanged"`
	PreviewID         string                                 `json:"previewId,omitempty"`
	BrandStoreID      string                                 `json:"brandStoreId"`
	BrandName         string                                 `json:"brandName"`
	CategoryIDs       []string                               `json:"categoryIds,omitempty"`
	CategoryNames     []string                               `json:"categoryNames,omitempty"`
	Total             int                                    `json:"total"`
	Publishable       int                                    `json:"publishable"`
	Selected          int                                    `json:"selected"`
	Skipped           []PublishBatchSkipResponse             `json:"skipped"`
	OfflineCandidates []PublishBatchOfflineCandidateResponse `json:"offlineCandidates"`
}

// PublishBatchCandidateResponse 是预览中的可发布商品摘要。
type PublishBatchCandidateResponse struct {
	ItemNo        string   `json:"itemNo"`
	Title         string   `json:"title"`
	PriceCents    int64    `json:"priceCents"`
	OriginalPrice int64    `json:"originalPriceCents"`
	DiscountRate  int      `json:"discountRate"`
	ImageURL      string   `json:"imageUrl,omitempty"`
	SourceRegions []string `json:"sourceRegions,omitempty"`
}

// PublishBatchOfflineCandidateResponse 是品牌对账后准备下架的闲鱼商品。
type PublishBatchOfflineCandidateResponse struct {
	PlatformItemID string `json:"platformItemId"`
	ItemNo         string `json:"itemNo"`
	Title          string `json:"title"`
	PriceCents     int64  `json:"priceCents"`
	ImageURL       string `json:"imageUrl,omitempty"`
	ItemURL        string `json:"itemUrl,omitempty"`
}

// PublishBatchResponse 是批次及其任务进度。
type PublishBatchResponse struct {
	ID               string                        `json:"id"`
	AccountID        string                        `json:"accountId"`
	BrandName        string                        `json:"brandName"`
	CategoryIDs      []string                      `json:"categoryIds,omitempty"`
	CategoryNames    []string                      `json:"categoryNames,omitempty"`
	Status           string                        `json:"status"`
	ErrorMessage     string                        `json:"errorMessage,omitempty"`
	Limit            int                           `json:"limit"`
	MinDelaySeconds  int                           `json:"minDelaySeconds"`
	MaxDelaySeconds  int                           `json:"maxDelaySeconds"`
	Total            int                           `json:"total"`
	Queued           int                           `json:"queued"`
	Running          int                           `json:"running"`
	Succeeded        int                           `json:"succeeded"`
	Failed           int                           `json:"failed"`
	NeedsLogin       int                           `json:"needsLogin"`
	Skipped          []PublishBatchSkipResponse    `json:"skipped"`
	SkippedCount     int                           `json:"skippedCount"`
	Tasks            []PublishTaskResponse         `json:"tasks"`
	CreatedAt        string                        `json:"createdAt"`
	Segments         []PublishBatchSegmentResponse `json:"segments"`
	OfflineRequested int                           `json:"offlineRequested"`
	OfflineSucceeded int                           `json:"offlineSucceeded"`
	OfflineFailed    int                           `json:"offlineFailed"`
}

// PublishBatchListResponse 是发布中心操作记录列表。
type PublishBatchListResponse struct {
	List  []PublishBatchResponse `json:"list"`
	Total int64                  `json:"total"`
}
