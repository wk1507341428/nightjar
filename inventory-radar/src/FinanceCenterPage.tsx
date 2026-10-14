import { useEffect, useRef, useState } from 'react';
import { Alert, Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Popconfirm, Segmented, Select, Table, Tabs, Tag, message } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useXianyuAccount } from './XianyuAccountContext';
import { EXPENSE_OPTIONS, ExpenseCategory, FinancePeriod, FinancePlatform, FinanceStatus, FinancePlatformStatus, FinanceView, FinanceSyncStatus, financeBuyerName, financeMoney, type FinanceExpense, type FinanceLedger, type FinanceOrder } from './financeTypes';
import { fetchFinanceLedger, syncFinanceOrders, saveOrderFinance, saveFinanceExpense, deleteFinanceExpense } from './financeApi';
import './finance-center.css';

/** 表单使用元，账本保存为分。 */
interface ExpenseFields { category: FinanceExpense['category']; amount: number; date: string; orderId?: string; note?: string }
interface OrderFields { procurement?: number; shipping: number; fee?: number; income?: number; settlementDate?: string; note?: string }

/** 状态标签栏的全部订单入口。 */
const ALL_ORDER_STATUS = 'all';

/** 以上海时区取得当前账单月份。 */
function currentFinanceMonth() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }).slice(0, 7); }

/** 财务中心入口：账号切换时重新加载该账号的本地账本。 */
export function FinanceCenterPage() {
  // 当前工作台账号。
  const { currentAccountId } = useXianyuAccount();
  return <FinanceWorkspace key={currentAccountId} accountId={currentAccountId} />;
}

/** 本地数据库账本，利润由只读订单和独立财务数据派生。 */
function FinanceWorkspace({ accountId }: { accountId: string }) {
  // 从本地数据库读取真实订单与财务录入。
  const [ledger, setLedger] = useState<FinanceLedger>({ orders: [], expenses: [], sync: { status: '', added: 0, updated: 0, total: 0, error: '' } });
  // 加载与保存状态，失败时保留原账本。
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // 每次用户启动的同步只提示一次最终结果。
  const awaitingSyncResult = useRef(false);
  // 组件卸载后忽略旧账号请求结果。
  const isMounted = useRef(true);
  // 一级平台与二级账本视图。
  const [platform, setPlatform] = useState<string>(FinancePlatform.Xianyu);
  const [view, setView] = useState<string>(FinanceView.Orders);
  // 全部时间或月度筛选。
  const [period, setPeriod] = useState<string>(FinancePeriod.All);
  const [month, setMonth] = useState(currentFinanceMonth);
  // 表格搜索与订单状态。
  const [keyword, setKeyword] = useState('');
  // 筛选买家昵称或收货人姓名、电话。
  const [buyerKeyword, setBuyerKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(FinancePlatformStatus.Completed);
  // 编辑面板上下文。
  const [editingOrder, setEditingOrder] = useState<FinanceOrder | null>(null);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinanceExpense | null>(null);
  // 两种录入表单。
  const [orderForm] = Form.useForm<OrderFields>();
  const [expenseForm] = Form.useForm<ExpenseFields>();
  // 当前面板消息。
  const [notification, notificationContext] = message.useMessage();
  // 编辑订单使用后端确定的默认费率，手工实际手续费仍优先。
  const editingFeeRate = editingOrder?.defaultFeeRatePercent ?? 1.6;

  /** 请求本地账本，并观察后台同步结果。 */
  async function refreshLedger() {
    try {
      // 当前账号完整本地账本。
      const response = await fetchFinanceLedger(accountId);
      if (!isMounted.current) return;
      setLedger(response); setErrorMessage('');
      if (awaitingSyncResult.current && response.sync.status !== FinanceSyncStatus.Running) {
        awaitingSyncResult.current = false;
        if (response.sync.status === FinanceSyncStatus.Succeeded) notification.success(`同步完成：新增${response.sync.added}笔，更新${response.sync.updated}笔`);
        if (response.sync.status === FinanceSyncStatus.Failed) notification.error(response.sync.error);
      }
    } catch (error) { if (isMounted.current) setErrorMessage(error instanceof Error ? error.message : '读取财务数据失败'); }
    finally { if (isMounted.current) setIsLoading(false); }
  }
  /** 启动同步，后续通过本地账本接口读取任务进度。 */
  async function handleSync() {
    setIsSaving(true);
    try {
      // 同步启动结果。
      const sync = await syncFinanceOrders(accountId);
      awaitingSyncResult.current = true;
      setLedger((previous) => ({ ...previous, sync }));
    } catch (error) { notification.error(error instanceof Error ? error.message : '同步启动失败'); }
    finally { setIsSaving(false); }
  }
  useEffect(() => { isMounted.current = true; void refreshLedger(); return () => { isMounted.current = false; }; }, [accountId]);
  useEffect(() => {
    if (ledger.sync.status !== FinanceSyncStatus.Running) return;
    // 只有正在同步时轮询任务，离开页面自动停止。
    const timer = window.setInterval(() => { void refreshLedger(); }, 2000);
    return () => window.clearInterval(timer);
  }, [ledger.sync.status, accountId]);

  /** 账单按到账日、支出发生日筛选。 */
  function matchesPeriod(date: string) { return period === FinancePeriod.All || date.startsWith(month); }
  // 汇总不受表格关键词与状态筛选影响。
  const periodOrders = ledger.orders.filter((order) => matchesPeriod(order.settlementDate || order.date));
  const periodExpenses = ledger.expenses.filter((expense) => matchesPeriod(expense.date));
  const completedOrders = periodOrders.filter((order) => order.status === FinanceStatus.Completed);
  const accountedOrders = completedOrders.filter((order) => order.procurementCents !== null);
  const pendingCostCount = completedOrders.length - accountedOrders.length;
  const netReceipts = completedOrders.reduce((sum, order) => sum + order.incomeCents, 0);
  const purchaseAndShipping = accountedOrders.reduce((sum, order) => sum + (order.procurementCents ?? 0) + order.shippingCents, 0);
  const independentExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  const accountedReceipts = accountedOrders.reduce((sum, order) => sum + order.incomeCents, 0);
  // 退款/关闭订单仍扣除实际已发生的运费。
  const closedShipping = periodOrders.filter((order) => order.status === FinanceStatus.Refunded || order.status === FinanceStatus.Closed).reduce((sum, order) => sum + order.shippingCents, 0);
  const netProfit = accountedReceipts - purchaseAndShipping - independentExpenses - closedShipping;
  const estimatedIncomeCount = completedOrders.filter((order) => order.incomeEstimated).length;
  const pendingReceipts = periodOrders.filter((order) => order.status === FinanceStatus.Pending).reduce((sum, order) => sum + order.grossCents - order.feeCents, 0);
  // 表格局部过滤。
  const searchText = keyword.trim().toLowerCase();
  const matchedOrders = periodOrders.filter((order) => `${order.id} ${order.itemNo} ${order.title} ${financeBuyerName(order)} ${order.recipientName ?? ''} ${order.recipientPhone ?? ''} ${order.recipientAddress ?? ''}`.toLowerCase().includes(searchText) && `${financeBuyerName(order)} ${order.recipientName ?? ''} ${order.recipientPhone ?? ''}`.toLowerCase().includes(buyerKeyword.trim().toLowerCase()));
  // 先统计当前查询条件下各状态数量，再筛选选中的状态。
  const statusCounts = matchedOrders.reduce<Record<string, number>>((counts, order) => { counts[order.platformStatus] = (counts[order.platformStatus] ?? 0) + 1; return counts; }, {});
  // 平台新增状态也按原文展示，不并入自定义“进行中”分类。
  const platformStatuses = [...new Set<string>([...Object.values(FinancePlatformStatus), ...ledger.orders.map((order) => order.platformStatus).filter(Boolean)])];
  const statusTabs = [{ key: ALL_ORDER_STATUS, label: `全部（${matchedOrders.length}）` }, ...platformStatuses.map((status) => ({ key: status, label: `${status}（${statusCounts[status] ?? 0}）` }))];
  const visibleOrders = matchedOrders.filter((order) => statusFilter === ALL_ORDER_STATUS || order.platformStatus === statusFilter);
  const visibleExpenses = periodExpenses.filter((expense) => {
    // 关联支出支持按商品名称和买家昵称查找。
    const linkedOrder = ledger.orders.find((order) => order.id === expense.orderId);
    const linkedText = linkedOrder ? `${linkedOrder.title} ${financeBuyerName(linkedOrder)}` : '';
    return `${expense.category} ${expense.note} ${expense.orderId} ${linkedText}`.toLowerCase().includes(searchText);
  });

  /** 打开订单成本录入，空成本继续保持未核算。 */
  function openOrder(order: FinanceOrder) {
    setEditingOrder(order);
    orderForm.resetFields();
    orderForm.setFieldsValue({ procurement: order.procurementCents === null ? undefined : order.procurementCents / 100, shipping: order.shippingCents / 100, fee: order.feeEstimated ? undefined : order.feeCents / 100, income: order.incomeEstimated ? undefined : order.incomeCents / 100, settlementDate: order.settlementDate || undefined, note: order.note });
  }

  /** 保存订单成本并重新计算利润。 */
  async function saveOrder(values: OrderFields) {
    if (!editingOrder) return;
    setIsSaving(true);
    try {
      await saveOrderFinance(accountId, editingOrder.id, { procurementCents: values.procurement == null ? null : Math.round(values.procurement * 100), shippingCents: Math.round(values.shipping * 100), feeCents: values.fee == null ? null : Math.round(values.fee * 100), incomeCents: values.income == null ? null : Math.round(values.income * 100), settlementDate: values.settlementDate ?? '', note: values.note ?? '' });
      await refreshLedger(); setEditingOrder(null); notification.success('订单财务已保存到本地数据库');
    } catch (error) { notification.error(error instanceof Error ? error.message : '保存失败'); }
    finally { setIsSaving(false); }
  }

  /** 新增或修改一笔支出，可预选关联订单。 */
  function openExpense(expense?: FinanceExpense, orderId = '') {
    setEditingExpense(expense ?? null);
    expenseForm.resetFields();
    expenseForm.setFieldsValue({ category: expense?.category ?? ExpenseCategory.Promotion, amount: expense ? expense.amountCents / 100 : undefined, date: expense?.date ?? new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }), orderId: expense?.orderId ?? orderId, note: expense?.note ?? '' });
    setExpenseOpen(true);
  }

  /** 支出只保存一份，关联订单不会重复扣费。 */
  async function saveExpense(values: ExpenseFields) {
    setIsSaving(true);
    try {
      await saveFinanceExpense(accountId, { category: values.category, amountCents: Math.round(values.amount * 100), date: values.date, orderId: values.orderId ?? '', note: values.note?.trim() ?? '' }, editingExpense?.id);
      await refreshLedger(); setExpenseOpen(false); notification.success('支出已保存到本地数据库');
    } catch (error) { notification.error(error instanceof Error ? error.message : '保存失败'); }
    finally { setIsSaving(false); }
  }

  /** 移除本地支出并重算汇总。 */
  async function removeExpense(id: string) { try { await deleteFinanceExpense(accountId, id); await refreshLedger(); } catch (error) { notification.error(error instanceof Error ? error.message : '删除失败'); } }

  /** 订单利润扣除关联支出；退款订单仅计实际发生的损失。 */
  function orderProfit(order: FinanceOrder): number | null {
    if (order.status === FinanceStatus.Pending) return null;
    // 当前订单全部已录入附加支出。
    const linkedCosts = ledger.expenses.filter((expense) => expense.orderId === order.id).reduce((sum, expense) => sum + expense.amountCents, 0);
    if (order.status === FinanceStatus.Refunded || order.status === FinanceStatus.Closed) return -linkedCosts - order.shippingCents;
    if (order.procurementCents === null) return null;
    return order.incomeCents - order.procurementCents - order.shippingCents - linkedCosts;
  }

  /** 关联订单展示商品、买家和订单号。 */
  function renderLinkedOrder(orderId: string) {
    // 关联的本地订单。
    const order = ledger.orders.find((item) => item.id === orderId);
    if (!order) return <span className="finance-muted">经营支出 · 不关联订单</span>;
    return <div className="finance-cell"><strong>{order.title}</strong><small>买家：{financeBuyerName(order)} · {order.itemNo}</small><small>{order.id}</small></div>;
  }
  // 独立支出列。
  const expenseColumns: ColumnsType<FinanceExpense> = [
    { title: '支出类别', dataIndex: 'category', width: 160, render: (category) => <Tag>{category}</Tag> },
    { title: '金额', width: 140, render: (_, expense) => <strong className="finance-negative">−{financeMoney(expense.amountCents)}</strong> },
    { title: '发生日期', dataIndex: 'date', width: 150 },
    { title: '关联订单', width: 300, render: (_, expense) => renderLinkedOrder(expense.orderId) },
    { title: '备注', dataIndex: 'note', render: (note) => note || '—' },
    { title: '操作', width: 150, render: (_, expense) => <><Button type="link" onClick={() => openExpense(expense)}>编辑</Button><Popconfirm title="删除这笔支出？" onConfirm={() => removeExpense(expense.id)}><Button type="link" danger>删除</Button></Popconfirm></> },
  ];

  return <section className="finance-page">
    {notificationContext}
    <header className="finance-heading"><div><span className="finance-eyebrow">FINANCE / LEDGER</span><h1>财务中心</h1><p>闲鱼订单同步，本地记录采购、运费和经营支出。</p></div></header>
    {errorMessage ? <Alert type="error" showIcon title={errorMessage} action={<Button onClick={() => void refreshLedger()}>重试读取</Button>} style={{ marginBottom: 16 }} /> : null}
    {ledger.sync.status === FinanceSyncStatus.Failed ? <Alert type="error" showIcon title={ledger.sync.error} style={{ marginBottom: 16 }} /> : null}
    {ledger.sync.status === FinanceSyncStatus.Running ? <Alert type="info" showIcon title="正在读取闲鱼全部分页订单，同步完成后会自动刷新。" style={{ marginBottom: 16 }} /> : null}
    <Tabs activeKey={platform} onChange={setPlatform} items={[{ key: FinancePlatform.Xianyu, label: '闲鱼订单' }, { key: FinancePlatform.Dewu, label: '得物订单' }]} />
    {platform === FinancePlatform.Dewu ? <div className="finance-card finance-coming"><Empty description="得物订单待接入" /><p>先完成闲鱼账本，得物订单后续接入。</p><Button onClick={() => setPlatform(FinancePlatform.Xianyu)}>查看闲鱼账本</Button></div> : <>
      <div className="finance-summary finance-summary--compact">
        <div className="finance-summary-item"><span>已核算净利润</span><strong className={netProfit >= 0 ? 'finance-positive' : 'finance-negative'}>{financeMoney(netProfit)}</strong><small>{accountedOrders.length} 笔已核算 · {pendingCostCount} 笔待补成本</small></div>
        <div className="finance-summary-item"><span>交易成功收入</span><strong>{financeMoney(netReceipts)}</strong><small>{completedOrders.length} 笔 · {estimatedIncomeCount} 笔收入估算</small></div>
        <div className="finance-summary-item"><span>已核算采购及运费</span><strong>{financeMoney(purchaseAndShipping)}</strong><small>按实际采购金额</small></div>
        <div className="finance-summary-item"><span>其他支出</span><strong>{financeMoney(independentExpenses)}</strong><small>{periodExpenses.length} 笔 · 推广等费用</small></div>
        <div className="finance-summary-item"><span>待到账</span><strong>{financeMoney(pendingReceipts)}</strong><small>尚未计入利润</small></div>
      </div>
      <div className="finance-card finance-ledger">
        <div className="finance-ledger-heading"><h2>订单与支出</h2><div className="finance-ledger-actions"><Segmented value={view} onChange={(value) => { setView(String(value)); setKeyword(''); }} options={[{ value: FinanceView.Orders, label: `订单明细 ${periodOrders.length}` }, { value: FinanceView.Expenses, label: `支出记录 ${periodExpenses.length}` }]} /><Button type="primary" onClick={() => openExpense()}>＋ 新增支出</Button></div></div>
        <div className="finance-toolbar finance-toolbar--filters">
          <div className="finance-filter-period"><span>账单范围</span><Segmented value={period} onChange={(value) => setPeriod(String(value))} options={[{ value: FinancePeriod.All, label: '全部时间' }, { value: FinancePeriod.Month, label: '按月查询' }]} />{period === FinancePeriod.Month ? <DatePicker picker="month" value={dayjs(`${month}-01`)} format="YYYY-MM" allowClear={false} onChange={(value) => { if (value) setMonth(value.format('YYYY-MM')); }} aria-label="账单月份" placeholder="选择月份" style={{ width: 150 }} /> : null}</div>
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={view === FinanceView.Orders ? '订单编号 / 宝贝名称 / 货号' : '支出类别 / 订单编号 / 备注'} allowClear aria-label="搜索财务账本" />
          {view === FinanceView.Orders ? <Input value={buyerKeyword} onChange={(event) => setBuyerKeyword(event.target.value)} placeholder="买家昵称 / 收货人 / 电话" aria-label="买家或收货人" allowClear /> : null}
          <Button onClick={() => { setKeyword(''); setBuyerKeyword(''); setStatusFilter(FinancePlatformStatus.Completed); setPeriod(FinancePeriod.All); setMonth(currentFinanceMonth()); }}>重置</Button>
        </div>
        <div className="finance-status-bar">
          {view === FinanceView.Orders ? <Tabs className="finance-status-tabs" size="small" activeKey={statusFilter} onChange={setStatusFilter} items={statusTabs} /> : <span className="finance-muted">当前条件下 {visibleExpenses.length} 笔支出</span>}
          <div className="finance-sync-actions"><small>{ledger.sync.lastSucceededAt ? `最近同步 ${new Date(ledger.sync.lastSucceededAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}` : '尚未同步订单'}</small><Button type="primary" loading={isSaving || ledger.sync.status === FinanceSyncStatus.Running} onClick={() => void handleSync()}>同步闲鱼订单</Button></div>
        </div>
        {view === FinanceView.Orders ? <div className="finance-orders-scroll"><div className="finance-orders-list">
          <div className="finance-order-columns"><span>商品信息</span><span>买家 / 收货信息</span><span>成交 / 到账</span><span>采购及支出</span><span>订单利润</span><span>操作</span></div>
          {visibleOrders.map((order) => <FinanceOrderRow key={order.id} order={order} profit={orderProfit(order)} onOpen={() => openOrder(order)} />)}
          {visibleOrders.length === 0 ? <Empty description="没有符合条件的订单" /> : null}
        </div></div> : <Table rowKey="id" columns={expenseColumns} dataSource={visibleExpenses} scroll={{ x: 1000 }} pagination={{ pageSize: 6, hideOnSinglePage: true }} />}
      </div>
      {isLoading ? <p className="finance-muted">正在读取本地财务账本…</p> : null}
      <p className="finance-accounting-note">普通订单默认按1.6%估算，无忧卖默认按4.6%估算（额外3个百分点）。订单列表未返回结算时间，未录入到账日期的订单按下单日期归月；支出按发生日期统计。手工手续费和实际到账优先采用，不再重复扣平台费。</p>
    </>}
    <Drawer title="订单成本与利润" size={520} open={editingOrder !== null} onClose={() => setEditingOrder(null)} extra={<Button type="primary" loading={isSaving} onClick={() => orderForm.submit()}>保存成本</Button>}>
      {editingOrder ? <><div className="finance-editor-order"><Tag>{editingOrder.platformStatus}</Tag>{editingOrder.isWorryFree ? <Tag color="volcano">无忧卖</Tag> : null}<h3>{editingOrder.title}</h3><p>{editingOrder.itemNo} · {editingOrder.size}</p><p>买家：{financeBuyerName(editingOrder)}</p><small>{editingOrder.id}</small><div><span>成交金额</span><strong>{financeMoney(editingOrder.grossCents)}</strong></div></div><Form form={orderForm} layout="vertical" onFinish={saveOrder}><Form.Item label="采购成本（元）" name="procurement" extra="按实际采购金额录入，留空表示尚未核算。"><InputNumber min={0} max={1000000} precision={2} placeholder="请输入实际采购成本" style={{ width: '100%' }} /></Form.Item><Form.Item label="发货运费（元）" name="shipping" rules={[{ required: true, message: '请输入发货运费，没有请填0' }]}><InputNumber min={0} max={1000000} precision={2} style={{ width: '100%' }} /></Form.Item><Form.Item label="实际平台手续费（元）" name="fee" extra={`留空按成交额${editingFeeRate}%估算，填0表示实际无手续费。`}><InputNumber min={0} max={1000000} precision={2} placeholder={`估算 ${financeMoney(Math.round(editingOrder.grossCents * editingFeeRate / 100))}`} style={{ width: '100%' }} /></Form.Item><Form.Item label="实际到账收入（元，可选）" name="income" extra="填写扣费后的实际到账金额，利润直接采用此金额，不再扣一次手续费。"><InputNumber min={0} max={1000000} precision={2} placeholder="留空使用估算收入" style={{ width: '100%' }} /></Form.Item><Form.Item label="到账日期（可选）" name="settlementDate" extra="填写后按此日期归月；未填时以订单日期归月。"><Input type="date" /></Form.Item><Form.Item label="备注" name="note"><Input.TextArea rows={3} maxLength={200} placeholder="采购门店、运费说明等" /></Form.Item></Form><Button block onClick={() => openExpense(undefined, editingOrder.id)}>＋ 记录这笔订单的其他支出</Button></> : null}
    </Drawer>
    <Drawer title={editingExpense ? '编辑支出' : '新增支出'} size={480} open={expenseOpen} onClose={() => setExpenseOpen(false)} extra={<Button type="primary" loading={isSaving} onClick={() => expenseForm.submit()}>保存支出</Button>}>
      <Alert type="info" showIcon title="超级擦亮、托管费用等可直接记为经营支出。" style={{ marginBottom: 24 }} /><Form form={expenseForm} layout="vertical" onFinish={saveExpense}><Form.Item label="支出类别" name="category" rules={[{ required: true }]}><Select options={EXPENSE_OPTIONS} /></Form.Item><Form.Item label="支出金额（元）" name="amount" rules={[{ required: true, message: '请输入支出金额' }]}><InputNumber min={0.01} max={1000000} precision={2} placeholder="例如：30.00" style={{ width: '100%' }} /></Form.Item><Form.Item label="发生日期" name="date" rules={[{ required: true, message: '请选择发生日期' }]}><Input type="date" /></Form.Item>
        <Form.Item label="关联订单（可选）" name="orderId" extra="可搜索商品名、买家昵称、货号或订单编号。留空表示经营支出。">
          <Select allowClear showSearch optionFilterProp="label" placeholder="搜索商品或买家，选择关联订单" popupMatchSelectWidth={false} styles={{ popup: { root: { width: 440, maxWidth: 'calc(100vw - 32px)' } } }}
            options={ledger.orders.map((order) => ({ value: order.id, label: `${order.title} · ${financeBuyerName(order)} · ${order.itemNo} · ${order.id}` }))}
            optionRender={(option) => { /* 下拉项对应的完整订单。 */ const order = ledger.orders.find((item) => item.id === option.value); if (!order) return option.label; return <div className="finance-order-option"><strong>{order.title}</strong><span>买家：{financeBuyerName(order)} · {order.itemNo} · {order.size}</span><small>{order.id} · {order.platformStatus || '未知状态'}</small></div>; }} />
        </Form.Item><Form.Item label="备注" name="note"><Input.TextArea rows={4} maxLength={200} placeholder="例如：10款商品超级擦亮推广" /></Form.Item></Form>
    </Drawer>
  </section>;
}

/** 仿闲鱼后台的订单分组：上方订单摘要，下方商品与买家信息。 */
function FinanceOrderRow({ order, profit, onOpen }: { order: FinanceOrder; profit: number | null; onOpen: () => void }) {
  // 买家展示昵称和退款后的实际到账。
  const buyerName = financeBuyerName(order);
  const receipt = order.incomeCents;
  // 关闭订单不提示缺失成本；平台费未手工录入时默认零。
  const isClosed = order.platformStatus === FinancePlatformStatus.Closed;
  // 成交关闭时展示零收入，不将它标成实际到账。
  let incomeLabel = order.incomeEstimated ? '估算收入' : '实际到账';
  if (isClosed) incomeLabel = '收入';
  // 未录入成本的关闭订单无需核算采购成本。
  let procurementDisplay = <span>{financeMoney(order.procurementCents ?? 0)}</span>;
  if (order.procurementCents === null) procurementDisplay = <span className="finance-warning">待补采购成本</span>;
  if (isClosed && order.procurementCents === null) procurementDisplay = <span>无采购成本</span>;
  return <article className="finance-order-group">
    <header><div><Tag color={order.status === FinanceStatus.Completed ? 'success' : 'default'}>{order.platformStatus || '未知状态'}</Tag>{order.isWorryFree ? <Tag color="volcano">无忧卖</Tag> : null}<span>订单编号：{order.id}</span></div><span>{order.settlementDate ? '到账日期' : '下单日期'}：{order.settlementDate || order.date}</span></header>
    <div className="finance-order-row">
      <div className="finance-product">{order.imageUrl ? <img className="finance-product-image" src={order.imageUrl} alt="" loading="lazy" /> : <span className="finance-product__brand">{order.itemNo.slice(0, 2)}</span>}<div><strong>{order.title}</strong><span>货号 {order.itemNo || '未识别'}</span><small>规格 {order.size}</small></div></div>
      <div className="finance-buyer"><span className="finance-buyer-avatar">{buyerName.slice(0, 1)}</span><div><strong>{buyerName}</strong><small>买家昵称</small><div className="finance-recipient"><span>收货人：{order.recipientName || '平台未提供'} {order.recipientPhone || ''}</span>{order.recipientAddress ? <span className="finance-recipient-address">{order.recipientAddress}</span> : null}</div></div></div>
      <div className="finance-cell"><strong>{financeMoney(order.grossCents)}</strong><small>{incomeLabel} {financeMoney(receipt)}</small><small>平台费 {financeMoney(order.feeCents)}{order.feeEstimated ? `（估${order.defaultFeeRatePercent ?? 1.6}%）` : ''}</small></div>
      <div className="finance-cell"><strong>{procurementDisplay}</strong><small>发货运费 {financeMoney(order.shippingCents)}</small></div>
      <div>{profit === null ? <Tag>待核算</Tag> : <strong className={profit >= 0 ? 'finance-positive' : 'finance-negative'}>{financeMoney(profit)}</strong>}</div>
      <Button type="link" onClick={onOpen}>录入成本</Button>
    </div>
  </article>;
}
