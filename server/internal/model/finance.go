package model

import "time"

const (
	FinanceCompleted     = "completed"
	FinancePending       = "pending"
	FinanceRefunded      = "refunded"
	FinanceClosed        = "closed"
	FinanceSyncRunning   = "running"
	FinanceSyncSucceeded = "succeeded"
	FinanceSyncFailed    = "failed"
)

// XianyuOrder 仅保存闲鱼订单源数据，财务录入存于独立集合。
type XianyuOrder struct {
	ID               string    `bson:"_id" json:"-"`
	AccountID        string    `bson:"accountId" json:"-"`
	OrderID          string    `bson:"orderId" json:"id"`
	ItemID           string    `bson:"itemId" json:"itemId"`
	ItemNo           string    `bson:"itemNo" json:"itemNo"`
	Title            string    `bson:"title" json:"title"`
	ImageURL         string    `bson:"imageUrl" json:"imageUrl"`
	BuyerNickname    string    `bson:"buyerNickname" json:"buyerNickname"`
	RecipientName    string    `bson:"recipientName" json:"recipientName"`
	RecipientPhone   string    `bson:"recipientPhone" json:"recipientPhone"`
	RecipientAddress string    `bson:"recipientAddress" json:"recipientAddress"`
	Size             string    `bson:"size" json:"size"`
	Status           string    `bson:"status" json:"status"`
	PlatformStatus   string    `bson:"platformStatus" json:"platformStatus"`
	IsWorryFree      bool      `bson:"isWorryFree" json:"isWorryFree"`
	TagIconURL       string    `bson:"tagIconUrl" json:"tagIconUrl"`
	Date             string    `bson:"date" json:"date"`
	CreatedTime      string    `bson:"createdTime" json:"createdTime"`
	PaidTime         string    `bson:"paidTime" json:"paidTime"`
	GrossCents       int64     `bson:"grossCents" json:"grossCents"`
	ConfirmedCents   int64     `bson:"confirmedCents" json:"confirmedCents"`
	RefundCents      int64     `bson:"refundCents" json:"refundCents"`
	Quantity         int64     `bson:"quantity" json:"quantity"`
	LastSyncedAt     time.Time `bson:"lastSyncedAt" json:"lastSyncedAt"`
}

// OrderFinance 存储用户录入的数据，同步源订单不会修改它。
type OrderFinance struct {
	ID               string    `bson:"_id" json:"-"`
	AccountID        string    `bson:"accountId" json:"-"`
	OrderID          string    `bson:"orderId" json:"orderId"`
	ProcurementCents *int64    `bson:"procurementCents" json:"procurementCents"`
	ShippingCents    int64     `bson:"shippingCents" json:"shippingCents"`
	FeeCents         *int64    `bson:"feeCents" json:"feeCents"`
	IncomeCents      *int64    `bson:"incomeCents" json:"incomeCents"`
	SettlementDate   string    `bson:"settlementDate" json:"settlementDate"`
	Note             string    `bson:"note" json:"note"`
	UpdatedAt        time.Time `bson:"updatedAt" json:"updatedAt"`
}

// FinanceExpense 保存独立或订单关联支出，统一只计入一次。
type FinanceExpense struct {
	ID          string    `bson:"_id" json:"id"`
	AccountID   string    `bson:"accountId" json:"-"`
	Category    string    `bson:"category" json:"category"`
	AmountCents int64     `bson:"amountCents" json:"amountCents"`
	Date        string    `bson:"date" json:"date"`
	OrderID     string    `bson:"orderId" json:"orderId"`
	Note        string    `bson:"note" json:"note"`
	UpdatedAt   time.Time `bson:"updatedAt" json:"updatedAt"`
}

// FinanceSyncState 持久化到现有账号文档，记录最后成功时间及本次同步结果。
type FinanceSyncState struct {
	Status          string     `bson:"status" json:"status"`
	LastSucceededAt *time.Time `bson:"lastSucceededAt,omitempty" json:"lastSucceededAt,omitempty"`
	UpdatedAt       time.Time  `bson:"updatedAt" json:"updatedAt"`
	Added           int64      `bson:"added" json:"added"`
	Updated         int64      `bson:"updated" json:"updated"`
	Total           int        `bson:"total" json:"total"`
	Error           string     `bson:"error" json:"error"`
}

// FinanceOrderView 合并只读订单与本地财务，不写回源订单。
type FinanceOrderView struct {
	XianyuOrder           `bson:",inline"`
	ProcurementCents      *int64  `json:"procurementCents"`
	ShippingCents         int64   `json:"shippingCents"`
	FeeCents              int64   `json:"feeCents"`
	FeeEstimated          bool    `json:"feeEstimated"`
	DefaultFeeRatePercent float64 `json:"defaultFeeRatePercent"`
	IncomeCents           int64   `json:"incomeCents"`
	IncomeEstimated       bool    `json:"incomeEstimated"`
	SettlementDate        string  `json:"settlementDate"`
	Note                  string  `json:"note"`
}
type FinanceLedger struct {
	Orders   []FinanceOrderView `json:"orders"`
	Expenses []FinanceExpense   `json:"expenses"`
	Sync     FinanceSyncState   `json:"sync"`
}
