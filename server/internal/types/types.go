package types

// HealthResponse 是健康检查响应。
type HealthResponse struct {
	Status string `json:"status"`
}

// MarketplaceListingResponse 是一个渠道当前在售商品。
type MarketplaceListingResponse struct {
	ID             string `json:"id"`
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
	Platform       string `json:"platform"`
	Status         string `json:"status"`
	Authenticated  bool   `json:"authenticated"`
	SearchReady    bool   `json:"searchReady"`
	LastVerifiedAt string `json:"lastVerifiedAt,omitempty"`
	Message        string `json:"message,omitempty"`
}

// SaveXianyuSessionRequest 是用户复制的闲鱼 cURL 或 Cookie Header。
type SaveXianyuSessionRequest struct {
	Credential string `json:"credential,omitempty"`
	Cookie     string `json:"cookie,omitempty"`
}

// SavePinduoduoSessionRequest 是用户提供的拼多多商家后台 cURL 或 Cookie。
type SavePinduoduoSessionRequest struct {
	Credential string `json:"credential,omitempty"`
	Cookie     string `json:"cookie,omitempty"`
}

// CreatePublishTaskRequest 是前端确认后的闲鱼发布参数。
type CreatePublishTaskRequest struct {
	SourceItemID       string   `json:"sourceItemId"`
	ItemNo             string   `json:"itemNo"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	PriceCents         int64    `json:"priceCents"`
	OriginalPriceCents int64    `json:"originalPriceCents"`
	ImageURLs          []string `json:"imageUrls"`
	RegionID           string   `json:"regionId"`
	Brand              string   `json:"brand"`
	Condition          string   `json:"condition"`
	AvailableSizes     []string `json:"availableSizes"`
	IsFootwear         bool     `json:"isFootwear"`
}

// PublishTaskResponse 是脱敏后的发布任务响应。
type PublishTaskResponse struct {
	ID           string `json:"id"`
	Status       string `json:"status"`
	ItemNo       string `json:"itemNo"`
	Title        string `json:"title"`
	PriceCents   int64  `json:"priceCents"`
	XianyuItemID string `json:"xianyuItemId,omitempty"`
	XianyuURL    string `json:"xianyuUrl,omitempty"`
	ErrorMessage string `json:"errorMessage,omitempty"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

// PublishTaskListResponse 是发布任务列表响应。
type PublishTaskListResponse struct {
	List []PublishTaskResponse `json:"list"`
}
