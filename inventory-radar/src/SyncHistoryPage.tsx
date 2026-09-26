import { useEffect, useState } from 'react';
import { Alert, Button, Select, Spin, Tag } from 'antd';
import { fetchCatalogBrandStores, fetchCatalogSyncRuns } from './catalogManagementApi';
import { REGION_OPTIONS } from './constants';
import type { CatalogBrandStore, CatalogSyncRun } from './types';

/** 历史页每页任务数量。 */
const SYNC_HISTORY_PAGE_SIZE = 20;

/** 将时间格式化为历史时间线文案。 */
function formatHistoryTime(value?: string): string {
  if (!value) {
    return '尚未结束';
  }
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

/** 返回同步任务状态标签。 */
function getRunStatus(run: CatalogSyncRun): { color: string; label: string } {
  if (run.status === 'completed') {
    return { color: 'success', label: '同步完成' };
  }
  if (run.status === 'running') {
    return { color: 'processing', label: '同步中' };
  }
  if (run.status.startsWith('suspicious')) {
    return { color: 'warning', label: '已保护数据' };
  }
  return { color: 'error', label: '同步失败' };
}

/** 全品牌同步历史与批次回溯页。 */
export function SyncHistoryPage({ onBack }: { onBack: () => void }) {
  // 同步任务历史。
  const [runs, setRuns] = useState<CatalogSyncRun[]>([]);
  // 可筛选的品牌配置。
  const [brandStores, setBrandStores] = useState<CatalogBrandStore[]>([]);
  // 当前品牌筛选。
  const [brandStoreId, setBrandStoreId] = useState('');
  // 当前地区筛选。
  const [regionId, setRegionId] = useState('3');
  // 历史记录总数。
  const [total, setTotal] = useState(0);
  // 当前已加载页码。
  const [page, setPage] = useState(1);
  // 页面加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 页面错误文案。
  const [errorMessage, setErrorMessage] = useState('');

  /** 加载当前地区的品牌筛选项。 */
  async function loadBrandStores(nextRegionId: string) {
    try {
      setBrandStores(await fetchCatalogBrandStores(nextRegionId));
    } catch {
      setBrandStores([]);
    }
  }

  /** 加载同步历史。 */
  async function loadHistory(nextBrandStoreId = brandStoreId, nextRegionId = regionId, nextPage = 1, append = false) {
    setIsLoading(true);
    try {
      const response = await fetchCatalogSyncRuns({ brandStoreId: nextBrandStoreId, regionId: nextRegionId, page: nextPage, pageSize: SYNC_HISTORY_PAGE_SIZE });
      setRuns((currentRuns) => append ? [...currentRuns, ...response.list] : response.list);
      setTotal(response.total);
      setPage(nextPage);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取同步历史失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.all([loadBrandStores(regionId), loadHistory('', regionId)]);
  }, []);

  /** 切换地区筛选并刷新品牌列表。 */
  function handleChangeRegion(nextRegionId: string) {
    setRegionId(nextRegionId);
    setBrandStoreId('');
    void loadBrandStores(nextRegionId);
    void loadHistory('', nextRegionId);
  }

  /** 切换品牌筛选并刷新历史。 */
  function handleChangeBrand(nextBrandStoreId: string) {
    setBrandStoreId(nextBrandStoreId);
    void loadHistory(nextBrandStoreId, regionId);
  }

  return (
    <main className="sync-history-page">
      <header className="sync-console-header"><button type="button" onClick={onBack}>← 返回同步配置</button><div><small>SYNC ARCHIVE</small><h1>同步历史档案</h1><p>每一次品牌同步都可以重新打开、核对和处理。</p></div><span>{total} RUNS</span></header>
      <section className="sync-history-toolbar"><div><strong>历史筛选</strong><span>按仓库和品牌定位一次同步</span></div><Select value={regionId} onChange={handleChangeRegion} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.name }))} /><Select value={brandStoreId || undefined} allowClear placeholder="全部品牌" onChange={(value) => handleChangeBrand(value ?? '')} options={brandStores.map((brandStore) => ({ value: brandStore.id, label: brandStore.brandName }))} /></section>
      {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
      {isLoading ? <div className="sync-console-loading"><Spin /><span>正在整理同步档案…</span></div> : null}
      {!isLoading && runs.length === 0 ? <div className="sync-change-empty"><strong>还没有同步记录</strong><span>在同步配置页运行一次品牌同步后，记录会出现在这里。</span></div> : null}
      {!isLoading && runs.length > 0 ? <><section className="sync-history-timeline">{runs.map((run, runIndex) => {
        const status = getRunStatus(run);
        return <article key={run.id}><div className="sync-history-timeline__index"><span>{String(runIndex + 1).padStart(2, '0')}</span><i /></div><div className="sync-history-card"><header><div><small>{run.brandName || run.brandStoreId || '品牌同步'}</small><h2>{formatHistoryTime(run.startedAt)}</h2></div><Tag color={status.color}>{status.label}</Tag></header><div className="sync-history-card__metrics"><span>扫描 <strong>{run.processedCount}/{run.totalCount || '—'}</strong></span><span>新增 <strong>{run.createdCount}</strong></span><span>更新 <strong>{run.updatedCount}</strong></span><span>正式下架 <strong>{run.inactiveCount}</strong></span></div>{run.errorMessage ? <p>{run.errorMessage}</p> : null}<footer><span>任务 #{run.id.slice(-8).toUpperCase()}</span><Button type="primary" onClick={() => { window.location.hash = `/sync-runs/${encodeURIComponent(run.id)}`; }}>查看完整结果 →</Button></footer></div></article>;
      })}</section>{runs.length < total ? <Button className="sync-history-load-more" loading={isLoading} onClick={() => void loadHistory(brandStoreId, regionId, page + 1, true)}>加载更多历史记录</Button> : null}</> : null}
    </main>
  );
}
