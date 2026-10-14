import { requestSideJob } from './xianyuApi';
import type { FinanceExpense, FinanceLedger, FinanceSyncState, OrderFinanceInput } from './financeTypes';
/** 财务请求始终携带当前账号。 */
function financePath(path: string, accountId: string) { return `/finance/${path}?accountId=${encodeURIComponent(accountId)}`; }
/** 从本地数据库读取财务账本。 */
export function fetchFinanceLedger(accountId: string) { return requestSideJob<FinanceLedger>(financePath('ledger', accountId)); }
/** 启动全量分页订单同步。 */
export function syncFinanceOrders(accountId: string) { return requestSideJob<FinanceSyncState>(financePath('orders/sync', accountId), { method: 'POST' }); }
/** 保存用户录入的订单成本和到账信息。 */
export function saveOrderFinance(accountId: string, id: string, input: OrderFinanceInput) { return requestSideJob(financePath(`orders/${encodeURIComponent(id)}`, accountId), { method: 'PUT', body: JSON.stringify(input) }); }
/** 保存独立支出。 */
export function saveFinanceExpense(accountId: string, input: Omit<FinanceExpense, 'id'>, id?: string) { return requestSideJob(financePath(id ? `expenses/${encodeURIComponent(id)}` : 'expenses', accountId), { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) }); }
/** 删除当前账号的一笔支出。 */
export function deleteFinanceExpense(accountId: string, id: string) { return requestSideJob(financePath(`expenses/${encodeURIComponent(id)}`, accountId), { method: 'DELETE' }); }
