/** 财务固定业务取值。 */
export const FinancePlatform = { Xianyu: 'xianyu', Dewu: 'dewu' } as const;
export const FinanceStatus = { Completed: 'completed', Pending: 'pending', Refunded: 'refunded', Closed: 'closed' } as const;
/** 原始平台状态，筛选和计数与闲鱼订单行保持一致。 */
export const FinancePlatformStatus = { AwaitingPayment: '待付款', AwaitingShipment: '待发货', Shipped: '已发货', Refunding: '退款中', Completed: '交易成功', Closed: '交易关闭' } as const;
export const FinanceView = { Orders: 'orders', Expenses: 'expenses' } as const;
export const FinancePeriod = { All: 'all', Month: 'month' } as const;
export const FinanceSyncStatus = { Running: 'running', Succeeded: 'succeeded', Failed: 'failed' } as const;
export const ExpenseCategory = { Promotion: '超级擦亮', Hosting: '托管无忧卖', Packaging: '包装耗材', Shipping: '运费', Other: '其他支出' } as const;
export interface FinanceOrder {
  id: string; itemId: string; itemNo: string; title: string; imageUrl: string; buyerNickname: string;
  recipientName: string; recipientPhone: string; recipientAddress: string;
  size: string; status: typeof FinanceStatus[keyof typeof FinanceStatus]; platformStatus: string;
  isWorryFree: boolean; defaultFeeRatePercent: number;
  date: string; createdTime: string; paidTime: string; grossCents: number; refundCents: number;
  procurementCents: number | null; shippingCents: number; feeCents: number; feeEstimated: boolean;
  incomeCents: number; incomeEstimated: boolean; settlementDate: string; note: string;
}
export interface FinanceExpense {
  id: string; category: typeof ExpenseCategory[keyof typeof ExpenseCategory]; amountCents: number;
  date: string; orderId: string; note: string;
}
export interface FinanceSyncState { status: string; lastSucceededAt?: string; updatedAt?: string; added: number; updated: number; total: number; error: string }
export interface FinanceLedger { orders: FinanceOrder[]; expenses: FinanceExpense[]; sync: FinanceSyncState }
export interface OrderFinanceInput { procurementCents: number | null; shippingCents: number; feeCents: number | null; incomeCents: number | null; settlementDate: string; note: string }
/** 人民币展示保持分单位计算。 */
export function financeMoney(cents: number): string { return (cents === 0 ? 0 : cents / 100).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }); }
/** 买家昵称缺失时明确标记，避免用演示昵称代替。 */
export function financeBuyerName(order: FinanceOrder): string { return order.buyerNickname || '未返回买家昵称'; }
/** 支出类别选项。 */
export const EXPENSE_OPTIONS = Object.values(ExpenseCategory).map((value) => ({ value, label: value }));
