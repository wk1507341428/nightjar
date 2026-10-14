package repository

import (
	"sidejob-server/internal/model"
	"testing"
)

func TestMergeFinanceKeepsManualValues(t *testing.T) {
	cost, fee, income := int64(95000), int64(1600), int64(98400)
	view := MergeOrderFinance(model.XianyuOrder{GrossCents: 100000, Status: model.FinanceCompleted}, model.OrderFinance{ProcurementCents: &cost, FeeCents: &fee, IncomeCents: &income, ShippingCents: 1000})
	if view.IncomeCents != 98400 || view.FeeEstimated || view.IncomeEstimated || view.ProcurementCents == nil || *view.ProcurementCents != 95000 {
		t.Fatalf("manual values lost: %+v", view)
	}
	unknown := MergeOrderFinance(model.XianyuOrder{GrossCents: 100000}, model.OrderFinance{})
	if unknown.ProcurementCents != nil || !unknown.FeeEstimated || unknown.FeeCents != 1600 {
		t.Fatal("missing costs must remain unknown")
	}
}

func TestWorryFreeFeeAndManualOverride(t *testing.T) {
	order := model.XianyuOrder{GrossCents: 40000, Status: model.FinanceCompleted, IsWorryFree: true}
	view := MergeOrderFinance(order, model.OrderFinance{})
	if view.FeeCents != 1840 || view.DefaultFeeRatePercent != 4.6 || view.IncomeCents != 38160 {
		t.Fatalf("wrong 4.6 percent fee: %+v", view)
	}
	fee, income := int64(1000), int64(38000)
	view = MergeOrderFinance(order, model.OrderFinance{FeeCents: &fee, IncomeCents: &income})
	if view.FeeCents != 1000 || view.IncomeCents != 38000 || view.FeeEstimated || view.IncomeEstimated {
		t.Fatal("manual values must win without another 3 percent charge")
	}
}

func TestClosedOrderHasNoEstimatedFeeOrIncome(t *testing.T) {
	view := MergeOrderFinance(model.XianyuOrder{GrossCents: 11190, RefundCents: 11190, Status: model.FinanceClosed}, model.OrderFinance{})
	if view.FeeCents != 0 || view.IncomeCents != 0 || view.ProcurementCents != nil || view.FeeEstimated || view.IncomeEstimated {
		t.Fatalf("closed order must not invent costs: %+v", view)
	}
}
