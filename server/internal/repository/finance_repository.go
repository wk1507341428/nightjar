package repository

import (
	"context"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
	"time"
)

// FinanceRepository 管理三个财务集合及账号内同步状态。
type FinanceRepository struct{ db *mongo.Database }

const financeAccountCollection = "xianyu_managed_accounts"
const financeOrderCollection = "xianyu_orders"
const financeEntryCollection = "order_finances"
const financeExpenseCollection = "finance_expenses"

func NewFinanceRepository(db *mongo.Database) *FinanceRepository { return &FinanceRepository{db: db} }

// EnsureIndexes 用账号与订单号防止重复写入。
func (r *FinanceRepository) EnsureIndexes(ctx context.Context) error {
	for _, name := range []string{financeOrderCollection, financeEntryCollection} {
		if _, err := r.db.Collection(name).Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "orderId", Value: 1}}, Options: options.Index().SetUnique(true)}); err != nil {
			return err
		}
	}
	_, err := r.db.Collection(financeExpenseCollection).Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "accountId", Value: 1}, {Key: "date", Value: -1}}})
	return err
}

// RecoverSync 将服务重启中断的任务明确标记失败。
func (r *FinanceRepository) RecoverSync(ctx context.Context) error {
	_, err := r.db.Collection(financeAccountCollection).UpdateMany(ctx, bson.M{"financeSync.status": model.FinanceSyncRunning}, bson.M{"$set": bson.M{"financeSync.status": model.FinanceSyncFailed, "financeSync.error": "服务重启，同步已中断，请重新同步"}})
	return err
}

// SaveOrders 完整取数后批量更新，仅操作来源集合。
func (r *FinanceRepository) SaveOrders(ctx context.Context, accountID string, orders []model.XianyuOrder) (int64, int64, error) {
	writes := make([]mongo.WriteModel, 0, len(orders))
	for _, order := range orders {
		order.AccountID = accountID
		order.ID = accountID + ":" + order.OrderID
		order.LastSyncedAt = time.Now()
		writes = append(writes, mongo.NewReplaceOneModel().SetFilter(bson.M{"accountId": accountID, "orderId": order.OrderID}).SetReplacement(order).SetUpsert(true))
	}
	if len(writes) == 0 {
		return 0, 0, nil
	}
	result, err := r.db.Collection(financeOrderCollection).BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(true))
	if err != nil {
		return 0, 0, err
	}
	return result.UpsertedCount, result.MatchedCount, nil
}

// HasOrder 防止给另一个账号或未知订单记账。
func (r *FinanceRepository) HasOrder(ctx context.Context, accountID, orderID string) error {
	return r.db.Collection(financeOrderCollection).FindOne(ctx, bson.M{"accountId": accountID, "orderId": orderID}).Err()
}

// SaveFinance 仅覆盖当前订单的本地录入字段。
func (r *FinanceRepository) SaveFinance(ctx context.Context, finance model.OrderFinance) error {
	if err := r.HasOrder(ctx, finance.AccountID, finance.OrderID); err != nil {
		return err
	}
	finance.ID = finance.AccountID + ":" + finance.OrderID
	finance.UpdatedAt = time.Now()
	_, err := r.db.Collection(financeEntryCollection).ReplaceOne(ctx, bson.M{"accountId": finance.AccountID, "orderId": finance.OrderID}, finance, options.Replace().SetUpsert(true))
	return err
}

// SaveExpense 新增支出或按账号更新已存在记录。
func (r *FinanceRepository) SaveExpense(ctx context.Context, expense model.FinanceExpense, create bool) error {
	if _, err := r.SyncState(ctx, expense.AccountID); err != nil {
		return err
	}
	if expense.OrderID != "" {
		if err := r.HasOrder(ctx, expense.AccountID, expense.OrderID); err != nil {
			return fmt.Errorf("关联订单不存在：%w", err)
		}
	}
	expense.UpdatedAt = time.Now()
	if create {
		_, err := r.db.Collection(financeExpenseCollection).InsertOne(ctx, expense)
		return err
	}
	result, err := r.db.Collection(financeExpenseCollection).ReplaceOne(ctx, bson.M{"accountId": expense.AccountID, "_id": expense.ID}, expense)
	if err == nil && result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return err
}
func (r *FinanceRepository) DeleteExpense(ctx context.Context, accountID, id string) error {
	result, err := r.db.Collection(financeExpenseCollection).DeleteOne(ctx, bson.M{"accountId": accountID, "_id": id})
	if err == nil && result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return err
}

// SyncState 返回账号上一次同步状态。
func (r *FinanceRepository) SyncState(ctx context.Context, accountID string) (model.FinanceSyncState, error) {
	var account struct {
		Sync model.FinanceSyncState `bson:"financeSync"`
	}
	err := r.db.Collection(financeAccountCollection).FindOne(ctx, bson.M{"_id": accountID}).Decode(&account)
	return account.Sync, err
}
func (r *FinanceRepository) SaveSyncState(ctx context.Context, accountID string, state model.FinanceSyncState) error {
	_, err := r.db.Collection(financeAccountCollection).UpdateOne(ctx, bson.M{"_id": accountID}, bson.M{"$set": bson.M{"financeSync": state}})
	return err
}

// Ledger 按账号读取订单、财务录入和支出，并在内存中组合展示。
func (r *FinanceRepository) Ledger(ctx context.Context, accountID string) (model.FinanceLedger, error) {
	ledger := model.FinanceLedger{Orders: []model.FinanceOrderView{}, Expenses: []model.FinanceExpense{}}
	orders := []model.XianyuOrder{}
	finances := []model.OrderFinance{}
	if err := r.readAll(ctx, financeOrderCollection, accountID, &orders); err != nil {
		return ledger, err
	}
	if err := r.readAll(ctx, financeEntryCollection, accountID, &finances); err != nil {
		return ledger, err
	}
	if err := r.readAll(ctx, financeExpenseCollection, accountID, &ledger.Expenses); err != nil {
		return ledger, err
	}
	byOrder := map[string]model.OrderFinance{}
	for _, finance := range finances {
		byOrder[finance.OrderID] = finance
	}
	for _, order := range orders {
		ledger.Orders = append(ledger.Orders, MergeOrderFinance(order, byOrder[order.OrderID]))
	}
	state, err := r.SyncState(ctx, accountID)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return ledger, err
	}
	ledger.Sync = state
	return ledger, nil
}
func (r *FinanceRepository) readAll(ctx context.Context, name, accountID string, target any) error {
	cursor, err := r.db.Collection(name).Find(ctx, bson.M{"accountId": accountID}, options.Find().SetSort(bson.D{{Key: "date", Value: -1}, {Key: "_id", Value: -1}}))
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	return cursor.All(ctx, target)
}

const normalOrderFeePermille int64 = 16
const worryFreeOrderFeePermille int64 = 46

// MergeOrderFinance 普通订单1.6%、无忧卖4.6%估算；手工填写的费用和到账优先采用。
func MergeOrderFinance(order model.XianyuOrder, finance model.OrderFinance) model.FinanceOrderView {
	rate := normalOrderFeePermille
	if order.IsWorryFree {
		rate = worryFreeOrderFeePermille
	}
	view := model.FinanceOrderView{XianyuOrder: order, ProcurementCents: finance.ProcurementCents, ShippingCents: finance.ShippingCents, FeeCents: (order.GrossCents*rate + 500) / 1000, DefaultFeeRatePercent: float64(rate) / 10, FeeEstimated: finance.FeeCents == nil, IncomeEstimated: finance.IncomeCents == nil, SettlementDate: finance.SettlementDate, Note: finance.Note}
	if finance.FeeCents != nil {
		view.FeeCents = *finance.FeeCents
	}
	view.IncomeCents = order.GrossCents - order.RefundCents - view.FeeCents
	if finance.IncomeCents != nil {
		view.IncomeCents = *finance.IncomeCents
	}
	if order.Status == model.FinanceClosed || order.Status == model.FinanceRefunded {
		view.IncomeCents = 0
		view.IncomeEstimated = false
		if finance.FeeCents == nil {
			view.FeeCents = 0
			view.FeeEstimated = false
		}
	}
	return view
}
