import { useEffect, useState } from 'react';
import { Alert, Button, Select, Tag } from 'antd';
import { ProCard, ProTable, type ProColumns } from '@ant-design/pro-components';
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

  // 历史批次列，按时间集中展示同步结果与回溯入口。
  const historyColumns: ProColumns<CatalogSyncRun>[] = [
    { title: '同步批次', dataIndex: 'startedAt', width: 220, render: (_, run) => <div className="sync-history-batch"><strong>{formatHistoryTime(run.startedAt)}</strong><span>#{run.id.slice(-8).toUpperCase()}</span></div> },
    { title: '品牌', dataIndex: 'brandName', width: 230, render: (_, run) => run.brandName || run.brandStoreId || '品牌同步' },
    { title: '状态', dataIndex: 'status', width: 120, render: (_, run) => <Tag color={getRunStatus(run).color}>{getRunStatus(run).label}</Tag> },
    { title: '扫描', dataIndex: 'processedCount', width: 120, render: (_, run) => `${run.processedCount} / ${run.totalCount || '—'}` },
    { title: '新增 / 更新 / 下架', width: 220, render: (_, run) => <div className="sync-history-numbers"><span>+{run.createdCount}</span><span>~{run.updatedCount}</span><span>-{run.inactiveCount}</span></div> },
    { title: '操作', valueType: 'option', width: 130, render: (_, run) => [<Button key="detail" type="link" onClick={() => { window.location.hash = `/sync-runs/${encodeURIComponent(run.id)}`; }}>查看结果</Button>] },
  ];

  return (
    <main className="sync-history-page">
      <header className="workspace-page-heading"><div><span className="workspace-eyebrow">CATALOG / SYNC HISTORY</span><h1>同步历史档案</h1><p>每一次品牌同步都可以重新打开、核对和处理。</p></div><div className="workspace-page-actions"><Button onClick={onBack}>返回同步配置</Button></div></header>
      <div className="workspace-overview"><ProCard className="workspace-overview-card"><small>同步批次</small><strong>{total}</strong><span>当前筛选范围</span></ProCard></div>
      <ProCard className="workspace-filter-card" title="历史筛选"><div className="sync-history-toolbar"><Select value={regionId} onChange={handleChangeRegion} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.shortName }))} /><Select value={brandStoreId || undefined} allowClear placeholder="全部品牌" onChange={(value) => handleChangeBrand(value ?? '')} options={brandStores.map((brandStore) => ({ value: brandStore.id, label: brandStore.brandName }))} /></div></ProCard>
      {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
      <ProTable<CatalogSyncRun> className="workspace-data-table" rowKey="id" columns={historyColumns} dataSource={runs} loading={isLoading} search={false} pagination={false} scroll={{ x: 980 }} headerTitle={`同步记录 · 已加载 ${runs.length} 条`} options={{ density: true, reload: () => void loadHistory(brandStoreId, regionId) }} locale={{ emptyText: '还没有同步记录' }} />
      {runs.length < total ? <Button className="sync-history-load-more" loading={isLoading} onClick={() => void loadHistory(brandStoreId, regionId, page + 1, true)}>加载更多历史记录</Button> : null}
    </main>
  );
}
