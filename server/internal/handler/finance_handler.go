package handler

import (
	"encoding/json"
	"errors"
	"github.com/zeromicro/go-zero/rest/pathvar"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"net/http"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"strings"
	"time"
)

func financeAccountID(request *http.Request) string {
	accountID := strings.TrimSpace(request.URL.Query().Get("accountId"))
	if accountID == "" {
		return model.DefaultXianyuAccountID
	}
	return accountID
}

// financeLedgerHandler 从本地数据库返回账号账本，按月时采用实际到账日期或明确的下单日期回退。
func financeLedgerHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		month := r.URL.Query().Get("month")
		if month != "" {
			if _, err := time.Parse("2006-01", month); err != nil {
				writeError(w, 400, "月份格式应为YYYY-MM")
				return
			}
		}
		ledger, err := sc.FinanceRepository.Ledger(r.Context(), financeAccountID(r))
		if err != nil {
			writeError(w, 500, "读取财务账本失败")
			return
		}
		if month != "" {
			orders := []model.FinanceOrderView{}
			expenses := []model.FinanceExpense{}
			for _, order := range ledger.Orders {
				date := order.SettlementDate
				if date == "" {
					date = order.Date
				}
				if strings.HasPrefix(date, month) {
					orders = append(orders, order)
				}
			}
			for _, expense := range ledger.Expenses {
				if strings.HasPrefix(expense.Date, month) {
					expenses = append(expenses, expense)
				}
			}
			ledger.Orders = orders
			ledger.Expenses = expenses
		}
		writeJSON(w, 200, ledger)
	}
}
func financeSyncHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		accountID := financeAccountID(r)
		if !requireActiveSellerAccount(w, r, sc, accountID) {
			return
		}
		state, err := sc.FinanceService.StartSync(r.Context(), accountID)
		if err != nil {
			writeError(w, 500, "无法启动订单同步")
			return
		}
		writeJSON(w, http.StatusAccepted, state)
	}
}

// saveOrderFinanceHandler 保存本地手工录入，空值保留待核算。
func saveOrderFinanceHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var finance model.OrderFinance
		if json.NewDecoder(http.MaxBytesReader(w, r.Body, 16384)).Decode(&finance) != nil {
			writeError(w, 400, "财务参数格式错误")
			return
		}
		if err := validateOrderFinance(finance); err != nil {
			writeError(w, 400, err.Error())
			return
		}
		finance.AccountID = financeAccountID(r)
		finance.OrderID = pathvar.Vars(r)["id"]
		if err := sc.FinanceRepository.SaveFinance(r.Context(), finance); err != nil {
			financeWriteError(w, err)
			return
		}
		writeJSON(w, 200, map[string]bool{"saved": true})
	}
}
func validateOrderFinance(finance model.OrderFinance) error {
	for _, amount := range []*int64{finance.ProcurementCents, finance.FeeCents, finance.IncomeCents, &finance.ShippingCents} {
		if amount != nil && (*amount < 0 || *amount > 100000000) {
			return errors.New("金额必须在0到100万元之间")
		}
	}
	if len([]rune(finance.Note)) > 200 {
		return errors.New("备注最多200字")
	}
	if finance.SettlementDate != "" {
		if _, err := time.Parse("2006-01-02", finance.SettlementDate); err != nil {
			return errors.New("到账日期格式错误")
		}
	}
	return nil
}
func saveFinanceExpenseHandler(sc *svc.ServiceContext, create bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var expense model.FinanceExpense
		if json.NewDecoder(http.MaxBytesReader(w, r.Body, 16384)).Decode(&expense) != nil {
			writeError(w, 400, "支出参数格式错误")
			return
		}
		if err := validateFinanceExpense(expense); err != nil {
			writeError(w, 400, err.Error())
			return
		}
		expense.AccountID = financeAccountID(r)
		expense.ID = pathvar.Vars(r)["id"]
		if create {
			expense.ID = primitive.NewObjectID().Hex()
		}
		if err := sc.FinanceRepository.SaveExpense(r.Context(), expense, create); err != nil {
			financeWriteError(w, err)
			return
		}
		writeJSON(w, 200, expense)
	}
}
func validateFinanceExpense(expense model.FinanceExpense) error {
	allowed := map[string]bool{"超级擦亮": true, "托管无忧卖": true, "包装耗材": true, "运费": true, "其他支出": true}
	if !allowed[expense.Category] {
		return errors.New("支出类别无效")
	}
	if expense.AmountCents <= 0 || expense.AmountCents > 100000000 {
		return errors.New("支出金额必须大于0且不超过100万元")
	}
	if _, err := time.Parse("2006-01-02", expense.Date); err != nil {
		return errors.New("支出日期格式错误")
	}
	if len([]rune(expense.Note)) > 200 {
		return errors.New("备注最多200字")
	}
	return nil
}
func deleteFinanceExpenseHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := sc.FinanceRepository.DeleteExpense(r.Context(), financeAccountID(r), pathvar.Vars(r)["id"]); err != nil {
			financeWriteError(w, err)
			return
		}
		writeJSON(w, 200, map[string]bool{"deleted": true})
	}
}
func financeWriteError(w http.ResponseWriter, err error) {
	if errors.Is(err, mongo.ErrNoDocuments) {
		writeError(w, 404, "当前账号的订单或支出不存在")
		return
	}
	writeError(w, 500, "保存财务数据失败")
}
