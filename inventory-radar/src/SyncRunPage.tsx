import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Input, Modal, Progress, Select, Spin, Tag } from 'antd';
import { fetchCatalogSyncChanges } from './catalogManagementApi';
import { offlineMarketplaceListings } from './xianyuApi';
import type { CatalogSyncChange, CatalogSyncChangeListResponse, MarketplaceListing } from './types';

/** 同步结果轮询间隔。 */
const SYNC_RUN_POLL_INTERVAL = 1600;

/** 变更类型筛选选项。 */
const CHANGE_TYPE_OPTIONS = [
  { value: 'all', label: '全部变化' },
  { value: 'price_changed', label: '价格变化' },
  { value: 'stock_changed', label: '库存变化' },
  { value: 'sku_created', label: '新增 SKU' },
  { value: 'sku_off_shelf', label: 'SKU 下架' },
  { value: 'offer_off_shelf', label: '正式下架' },
];

/** 变更类型的中文文案。 */
const CHANGE_TYPE_LABELS: Record<string, string> = Object.fromEntries(CHANGE_TYPE_OPTIONS.map((option) => [option.value, option.label]));

/** 将分单位金额格式化为人民币。 */
function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(priceCents / 100);
}

/** 将时间格式化为同步控制台短时间。 */
function formatDateTime(value?: string): string {
  if (!value) {
    return '进行中';
  }
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}

/** 返回一条变更最适合展示的价格。 */
function getEffectivePrice(change: CatalogSyncChange, state: 'before' | 'after'): number {
  const changeValue = change[state];
  return changeValue.activityPriceCents || changeValue.sourcePriceCents || changeValue.priceCents;
}

/** 按闲鱼商品 ID 去重渠道商品。 */
function uniqueXianyuListings(changes: CatalogSyncChange[]): MarketplaceListing[] {
  const listingsByItemID = new Map<string, MarketplaceListing>();
  changes.forEach((change) => change.xianyuListings?.forEach((listing) => listingsByItemID.set(listing.platformItemId, listing)));
  return Array.from(listingsByItemID.values());
}

/** 同步任务实时进度与完整变更审计页。 */
export function SyncRunPage({ runId, onBack }: { runId: string; onBack: () => void }) {
  // 当前同步任务及变更明细。
  const [syncResult, setSyncResult] = useState<CatalogSyncChangeListResponse | null>(null);
  // 当前变更类型筛选。
  const [changeType, setChangeType] = useState('all');
  // 当前搜索关键词。
  const [keyword, setKeyword] = useState('');
  // 页面加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 下架操作状态。
  const [isOfflining, setIsOfflining] = useState(false);
  // 页面错误文案。
  const [errorMessage, setErrorMessage] = useState('');
  // 操作结果提示。
  const [operationMessage, setOperationMessage] = useState('');
  // 用户勾选的闲鱼商品 ID。
  const [selectedListingIDs, setSelectedListingIDs] = useState<string[]>([]);
  // 当前等待用户确认的闲鱼下架清单。
  const [offlinePreviewListings, setOfflinePreviewListings] = useState<MarketplaceListing[]>([]);
  // 当前下架清单的触发原因。
  const [offlinePreviewReason, setOfflinePreviewReason] = useState('手动选择');
  // 下架确认框内展示的接口错误。
  const [offlineErrorMessage, setOfflineErrorMessage] = useState('');
  // 最新筛选条件，供轮询读取。
  const filterRef = useRef({ changeType: 'all', keyword: '' });

  /** 读取同步任务和变更明细。 */
  async function loadSyncResult(nextType = filterRef.current.changeType, nextKeyword = filterRef.current.keyword, silent = false) {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await fetchCatalogSyncChanges(runId, { type: nextType, keyword: nextKeyword, page: 1, pageSize: 100 });
      setSyncResult(response);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取同步结果失败');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadSyncResult();
    const pollTimer = window.setInterval(() => {
      if (syncResult?.run.status !== 'completed' && syncResult?.run.status !== 'failed') {
        void loadSyncResult(filterRef.current.changeType, filterRef.current.keyword, true);
      }
    }, SYNC_RUN_POLL_INTERVAL);
    return () => window.clearInterval(pollTimer);
  }, [runId, syncResult?.run.status]);

  // 当前结果关联的去重闲鱼在售商品。
  const xianyuListings = useMemo(() => uniqueXianyuListings(syncResult?.list ?? []), [syncResult?.list]);
  // 只有来源商品正式下架才进入安全的一键下架范围。
  const formalOfflineListings = useMemo(() => uniqueXianyuListings((syncResult?.list ?? []).filter((change) => change.changeType === 'offer_off_shelf')), [syncResult?.list]);
  // 当前同步进度百分比。
  const progressPercent = syncResult?.run.totalCount ? Math.min(100, Math.round((syncResult.run.processedCount / syncResult.run.totalCount) * 100)) : 0;
  // 当前同步是否结束。
  const isFinished = syncResult?.run.status !== 'running';

  /** 应用页面筛选条件。 */
  function handleApplyFilters() {
    filterRef.current = { changeType, keyword: keyword.trim() };
    setSelectedListingIDs([]);
    void loadSyncResult(changeType, keyword.trim());
  }

  /** 切换一个闲鱼商品的勾选状态。 */
  function handleToggleListing(listingID: string, checked: boolean) {
    setSelectedListingIDs((currentIDs) => checked ? Array.from(new Set([...currentIDs, listingID])) : currentIDs.filter((currentID) => currentID !== listingID));
  }

  /** 批量切换一条 SKU 关联的全部闲鱼商品。 */
  function handleToggleListings(listingIDs: string[], checked: boolean) {
    listingIDs.forEach((listingID) => handleToggleListing(listingID, checked));
  }

  /** 打开单件或批量闲鱼下架清单。 */
  function handleOfflineListings(listingIDs: string[], reason = '手动选择') {
    const uniqueListingIDs = Array.from(new Set(listingIDs));
    if (uniqueListingIDs.length === 0) {
      return;
    }
    setOfflineErrorMessage('');
    setOfflinePreviewReason(reason);
    setOfflinePreviewListings(xianyuListings.filter((listing) => uniqueListingIDs.includes(listing.platformItemId)));
  }

  /** 确认并执行清单中的闲鱼商品下架。 */
  async function handleConfirmOffline() {
    const listingIDs = Array.from(new Set(offlinePreviewListings.map((listing) => listing.platformItemId)));
    if (listingIDs.length === 0) {
      return;
    }
    setIsOfflining(true);
    setOperationMessage('');
    setOfflineErrorMessage('');
    try {
      let succeededCount = 0;
      let failedCount = 0;
      for (let startIndex = 0; startIndex < listingIDs.length; startIndex += 100) {
        const response = await offlineMarketplaceListings(listingIDs.slice(startIndex, startIndex + 100));
        succeededCount += response.succeededItemIds?.length ?? 0;
        failedCount += response.failedItemIds?.length ?? 0;
      }
      setOperationMessage(`下架完成：成功 ${succeededCount} 件，失败 ${failedCount} 件。`);
      setSelectedListingIDs([]);
      setOfflinePreviewListings([]);
      await loadSyncResult(filterRef.current.changeType, filterRef.current.keyword, true);
    } catch (error) {
      setOfflineErrorMessage(error instanceof Error ? error.message : '闲鱼商品下架失败');
    } finally {
      setIsOfflining(false);
    }
  }

  return (
    <main className="sync-run-page">
      <header className="sync-console-header">
        <button type="button" onClick={onBack}>← 返回同步配置</button>
        <div><small>SYNC RUN / {runId.slice(-8).toUpperCase()}</small><h1>{syncResult?.run.brandName || '品牌同步任务'}</h1><p>{formatDateTime(syncResult?.run.startedAt)} 发起</p></div>
        <Button onClick={() => { window.location.hash = '/sync-history'; }}>同步历史</Button>
      </header>

      {isLoading && !syncResult ? <div className="sync-console-loading"><Spin size="large" /><span>正在装载同步审计记录…</span></div> : null}
      {errorMessage ? <Alert type="error" showIcon closable onClose={() => setErrorMessage('')} message={errorMessage} /> : null}
      {operationMessage ? <Alert type="success" showIcon closable onClose={() => setOperationMessage('')} message={operationMessage} /> : null}

      {syncResult ? <div className="sync-console-workspace">
        <section className="sync-run-hero">
          <div className="sync-run-hero__signal"><span className={isFinished ? 'sync-signal sync-signal--done' : 'sync-signal'} /><small>{isFinished ? 'SYNC COMPLETE' : 'LIVE SYNC'}</small><h2>{isFinished ? '本批次处理完成' : '正在核对上游 SKU'}</h2><p>结果持续写入数据库，关闭或刷新页面不会中断任务。</p></div>
          <div className="sync-run-hero__progress"><strong>{progressPercent}%</strong><Progress percent={progressPercent} showInfo={false} strokeColor="#ff0a4f" trailColor="rgba(255,255,255,.12)" /><span>{syncResult.run.processedCount} / {syncResult.run.totalCount || '—'} 件商品</span></div>
        </section>

        <section className="sync-run-metrics">
          <article><span>新增商品</span><strong>{syncResult.run.createdCount}</strong><em>NEW ARRIVALS</em></article>
          <article><span>真实更新</span><strong>{syncResult.run.updatedCount}</strong><em>CHANGED ONLY</em></article>
          <article><span>正式下架</span><strong>{syncResult.run.inactiveCount}</strong><em>OFF SHELF</em></article>
          <article className="sync-run-metrics__xianyu"><span>变更商品关联闲鱼</span><strong>{xianyuListings.length}</strong><em>仅表示有关联，不会自动下架</em></article>
        </section>

        <section className="sync-change-panel">
          <header><div><small>CHANGE LEDGER</small><h2>SKU 变更明细</h2><p>共 {syncResult.total} 条符合当前条件的变化</p></div><Button danger disabled={selectedListingIDs.length === 0} loading={isOfflining} onClick={() => handleOfflineListings(selectedListingIDs)}>下架已选 {selectedListingIDs.length > 0 ? `(${selectedListingIDs.length})` : ''}</Button></header>
          <div className="sync-change-toolbar"><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={handleApplyFilters} placeholder="搜索货号、商品或尺码" allowClear /><Select value={changeType} onChange={setChangeType} options={CHANGE_TYPE_OPTIONS} /><Button type="primary" onClick={handleApplyFilters}>应用筛选</Button><Button danger disabled={formalOfflineListings.length === 0} loading={isOfflining} onClick={() => handleOfflineListings(formalOfflineListings.map((listing) => listing.platformItemId), '来源商品已正式下架')}>一键下架正式下架商品 {formalOfflineListings.length > 0 ? `(${formalOfflineListings.length})` : ''}</Button></div>
          {syncResult.list.length === 0 ? <div className="sync-change-empty"><strong>这一批次没有对应变化</strong><span>切换筛选类型或等待同步继续处理。</span></div> : <div className="sync-change-list">{syncResult.list.map((change) => {
            const previousPrice = getEffectivePrice(change, 'before');
            const nextPrice = getEffectivePrice(change, 'after');
            const listing = change.xianyuListings?.[0];
            const listingIDs = change.xianyuListings?.map((xianyuListing) => xianyuListing.platformItemId) ?? [];
            return <article key={change.id} className={`sync-change-row sync-change-row--${change.changeType}`}>
              <div className="sync-change-product">{change.imageUrl ? <img src={change.imageUrl} alt="" /> : <span>{change.itemNo.slice(0, 1)}</span>}<div><small>{change.itemNo}</small><strong>{change.productName}</strong><em>{change.variantLabel || change.skuCode || '默认规格'}</em></div></div>
              <Tag>{CHANGE_TYPE_LABELS[change.changeType] || change.changeType}</Tag>
              <div className="sync-change-diff"><span>{change.changeType.includes('price') ? '成交价' : change.changeType.includes('stock') ? '库存' : '状态'}</span><strong>{change.changeType.includes('price') ? `${formatPrice(previousPrice)} → ${formatPrice(nextPrice)}` : change.changeType.includes('stock') ? `${change.before.stock} → ${change.after.stock}` : `${change.before.status || '无'} → ${change.after.status || '在售'}`}</strong></div>
              <div className="sync-change-channel">{listing ? <><Checkbox checked={listingIDs.every((listingID) => selectedListingIDs.includes(listingID))} onChange={(event) => handleToggleListings(listingIDs, event.target.checked)} /><div><span>闲鱼在售 {listingIDs.length > 1 ? `· ${listingIDs.length} 件` : ''}</span><a href={listing.itemUrl} target="_blank" rel="noreferrer">{formatPrice(listing.priceCents)} · 查看 ↗</a></div><Button danger size="small" loading={isOfflining} onClick={() => handleOfflineListings(listingIDs, `${CHANGE_TYPE_LABELS[change.changeType] || change.changeType} · 手动操作`)}>下架</Button></> : <span className="sync-change-channel__empty">闲鱼未在售</span>}</div>
            </article>;
          })}</div>}
        </section>
      </div> : null}
      <Modal
        open={offlinePreviewListings.length > 0}
        width={720}
        className="sync-offline-modal"
        title={<div className="sync-offline-modal__title"><small>GOOFISH OFFLINE REVIEW</small><strong>确认下架清单</strong><span>范围：{offlinePreviewReason} · 请核对以下 {offlinePreviewListings.length} 件闲鱼商品。</span></div>}
        okText={`确认下架 ${offlinePreviewListings.length} 件`}
        cancelText="返回检查"
        confirmLoading={isOfflining}
        okButtonProps={{ danger: true, loading: isOfflining }}
        cancelButtonProps={{ disabled: isOfflining }}
        closable={!isOfflining}
        maskClosable={!isOfflining}
        keyboard={!isOfflining}
        onOk={() => void handleConfirmOffline()}
        onCancel={() => { setOfflinePreviewListings([]); setOfflineErrorMessage(''); }}
        destroyOnHidden
      >
        <Alert type="warning" showIcon message="下架操作会直接提交到闲鱼卖家后台，请确认货号、标题和价格。" />
        {isOfflining ? <Alert type="info" showIcon icon={<Spin size="small" />} message="正在提交闲鱼卖家后台，请勿关闭页面或重复点击。" /> : null}
        {offlineErrorMessage ? <Alert type="error" showIcon message="下架失败" description={offlineErrorMessage} /> : null}
        <div className="sync-offline-list">{offlinePreviewListings.map((listing, listingIndex) => <article key={listing.platformItemId}><span>{String(listingIndex + 1).padStart(2, '0')}</span>{listing.imageUrl ? <img src={listing.imageUrl} alt="" /> : <i>闲</i>}<div><small>{listing.itemNo || '未识别货号'} · ID {listing.platformItemId}</small><strong>{listing.title}</strong><a href={listing.itemUrl} target="_blank" rel="noreferrer">打开闲鱼商品核对 ↗</a></div><em>{formatPrice(listing.priceCents)}</em></article>)}</div>
      </Modal>
    </main>
  );
}
