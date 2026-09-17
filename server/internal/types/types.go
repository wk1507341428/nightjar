package types

// HealthResponse 是健康检查响应。
type HealthResponse struct {
	Status string `json:"status"`
}

// ConnectionResponse 是闲鱼连接状态响应。
type ConnectionResponse struct {
	Platform       string `json:"platform"`
	Status         string `json:"status"`
	Authenticated  bool   `json:"authenticated"`
	LastVerifiedAt string `json:"lastVerifiedAt,omitempty"`
	Message        string `json:"message,omitempty"`
}

// SaveXianyuSessionRequest 是用户从闲鱼请求中复制的 Cookie Header。
type SaveXianyuSessionRequest struct {
	Cookie string `json:"cookie"`
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
