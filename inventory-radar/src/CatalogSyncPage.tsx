import { useEffect, useState } from 'react';
import { Button, Input, Select, Spin, Switch } from 'antd';
import { discoverCatalogBrandStores, fetchCatalogBrandStores, fetchCatalogSyncRun, saveCatalogBrandStore, syncCatalogBrandStore } from './catalogManagementApi';
import { REGION_OPTIONS } from './constants';
import type { CatalogBrandStore, CatalogBrandStoreCandidate, CatalogSyncRun } from './types';

/** 同步配置页的品牌门店视图数据。 */
interface BrandStoreView extends CatalogBrandStoreCandidate {
  configuration?: CatalogBrandStore;
}

/** 格式化同步时间。 */
function formatSyncTime(value?: string): string {
  if (!value) {
    return '尚未同步';
  }
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

/** 判断品牌门店是否已经完成过至少一次同步。 */
function hasCompletedBrandStoreSync(brandStore: BrandStoreView): boolean {
  return Boolean(brandStore.configuration?.lastSyncedAt);
}

/** 返回品牌门店在同步工作台中的优先级。 */
function getBrandStorePriority(brandStore: BrandStoreView): number {
  if (hasCompletedBrandStoreSync(brandStore)) {
    return 0;
  }
  if (brandStore.configuration?.syncEnabled) {
    return 1;
  }
  return 2;
}

/** 返回同步任务对应的展示文案与样式。 */
function getSyncRunPresentation(run: CatalogSyncRun): { className: string; label: string } {
  if (run.status === 'completed') {
    return { className: 'catalog-sync-run catalog-sync-run--success', label: '同步完成' };
  }
  if (run.status === 'running') {
    return { className: 'catalog-sync-run catalog-sync-run--running', label: '同步中，正在获取商品' };
  }
  if (run.status === 'suspicious_empty') {
    return { className: 'catalog-sync-run catalog-sync-run--warning', label: '上游空结果，已保护本地商品' };
  }
  if (run.status === 'suspicious_incomplete') {
    return { className: 'catalog-sync-run catalog-sync-run--warning', label: '上游分页异常，已保护本地商品' };
  }
  return { className: 'catalog-sync-run', label: '同步失败' };
}

/** CatalogSyncPage 是本地商品库的品牌同步配置工作台。 */
export function CatalogSyncPage({ onBack }: { onBack: () => void }) {
  // 当前配置地区。
  const [regionId, setRegionId] = useState('3');
  // 上游发现的品牌门店。
  const [brandStores, setBrandStores] = useState<BrandStoreView[]>([]);
  // 页面加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 正在保存开关的门店 ID。
  const [savingBrandStoreId, setSavingBrandStoreId] = useState('');
  // 正在全量同步的门店 ID。
  const [syncingBrandStoreId, setSyncingBrandStoreId] = useState('');
  // 最近一次同步任务。
  const [latestRun, setLatestRun] = useState<CatalogSyncRun | null>(null);
  // 页面错误提示。
  const [errorMessage, setErrorMessage] = useState('');
  // 品牌门店关键词。
  const [brandKeyword, setBrandKeyword] = useState('');

  /** 加载一个地区的上游品牌门店及本地同步开关。 */
  async function loadBrandStoreWorkspace(nextRegionId: string) {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [candidates, configurations] = await Promise.all([
        discoverCatalogBrandStores(nextRegionId),
        fetchCatalogBrandStores(nextRegionId),
      ]);
      // 上游门店 ID 到本地配置的映射。
      const configurationsByDistributorId = new Map(configurations.map((configuration) => [configuration.distributorId, configuration]));
      // 合并后的品牌门店视图。
      const nextBrandStores = candidates.map((candidate) => ({ ...candidate, configuration: configurationsByDistributorId.get(candidate.distributorId) }));
      setBrandStores(nextBrandStores);
    } catch (error) {
      setBrandStores([]);
      setErrorMessage(error instanceof Error ? error.message : '品牌门店列表加载失败');
    } finally {
      setIsLoading(false);
    }
  }

  /** 切换当前查看地区。 */
  function handleChangeRegion(nextRegionId: string) {
    setRegionId(nextRegionId);
    setBrandKeyword('');
    setLatestRun(null);
    void loadBrandStoreWorkspace(nextRegionId);
  }

  /** 保存一家门店的同步开关。 */
  async function handleChangeSyncEnabled(brandStore: BrandStoreView, syncEnabled: boolean) {
    const operationId = brandStore.distributorId;
    setSavingBrandStoreId(operationId);
    setErrorMessage('');
    try {
      const configuration = await saveCatalogBrandStore(brandStore, syncEnabled);
      setBrandStores((currentBrandStores) => currentBrandStores.map((currentBrandStore) => (
        currentBrandStore.distributorId === operationId ? { ...currentBrandStore, configuration } : currentBrandStore
      )));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存同步配置失败');
    } finally {
      setSavingBrandStoreId('');
    }
  }

  /** 手动同步一家已启用品牌门店。 */
  async function handleSyncBrandStore(brandStore: BrandStoreView) {
    const configurationId = brandStore.configuration?.id;
    if (!configurationId) {
      return;
    }
    setSyncingBrandStoreId(configurationId);
    setErrorMessage('');
    try {
      const run = await syncCatalogBrandStore(configurationId);
      setLatestRun(run);
      await pollSyncRun(run, configurationId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '品牌同步失败');
    } finally {
      setSyncingBrandStoreId('');
    }
  }

  /** 轮询后台同步任务，完成后刷新品牌门店状态。 */
  async function pollSyncRun(initialRun: CatalogSyncRun, brandStoreId: string) {
    let currentRun = initialRun;
    while (currentRun.status === 'running') {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      currentRun = await fetchCatalogSyncRun(currentRun.id);
      setLatestRun(currentRun);
    }
    await loadBrandStoreWorkspace(regionId);
  }

  useEffect(() => {
    void loadBrandStoreWorkspace(regionId);
  }, []);

  // 已启用同步的门店数量。
  const enabledBrandStoreCount = brandStores.filter((brandStore) => brandStore.configuration?.syncEnabled).length;
  // 当前地区名称。
  const regionName = REGION_OPTIONS.find((region) => region.id === regionId)?.name ?? '当前地区';
  // 标准化后的品牌筛选关键词。
  const normalizedBrandKeyword = brandKeyword.trim().toLocaleUpperCase();
  // 当前关键词命中的品牌门店。
  const matchedBrandStores = brandStores.filter((brandStore) => {
    if (!normalizedBrandKeyword) {
      return true;
    }
    const searchableText = `${brandStore.brandName} ${brandStore.shopCode ?? ''} ${brandStore.storeName ?? ''}`.toLocaleUpperCase();
    return searchableText.includes(normalizedBrandKeyword);
  });
  // 已同步品牌优先展示；同组按最近同步时间与品牌名稳定排序。
  const visibleBrandStores = [...matchedBrandStores].sort((firstBrandStore, secondBrandStore) => {
    const priorityDifference = getBrandStorePriority(firstBrandStore) - getBrandStorePriority(secondBrandStore);
    if (priorityDifference !== 0) {
      return priorityDifference;
    }
    const firstSyncedAt = firstBrandStore.configuration?.lastSyncedAt ?? '';
    const secondSyncedAt = secondBrandStore.configuration?.lastSyncedAt ?? '';
    if (firstSyncedAt !== secondSyncedAt) {
      return secondSyncedAt.localeCompare(firstSyncedAt);
    }
    return firstBrandStore.brandName.localeCompare(secondBrandStore.brandName, 'zh-CN');
  });
  // 最近同步任务展示状态。
  const latestRunPresentation = latestRun ? getSyncRunPresentation(latestRun) : null;

  return (
    <main className="catalog-sync-page">
      <section className="catalog-sync-hero">
        <button type="button" className="catalog-sync-hero__back" onClick={onBack}>← 返回本地商品库</button>
        <div className="catalog-sync-hero__copy"><small>CATALOG CONTROL ROOM</small><h1>品牌同步配置</h1><p>决定哪些品牌门店进入本地商品库。启用后可手动同步；自动任务将在服务器部署后启用。</p></div>
        <div className="catalog-sync-hero__meter"><span>已启用</span><strong>{enabledBrandStoreCount}</strong><small>/ {brandStores.length || '—'} 品牌门店</small></div>
      </section>

      <section className="catalog-sync-workspace">
        <header className="catalog-sync-toolbar"><div><small>WAREHOUSE SCOPE</small><h2>{regionName}</h2></div><div className="catalog-sync-toolbar__controls"><Input value={brandKeyword} onChange={(event) => setBrandKeyword(event.target.value)} placeholder="搜索品牌、中文名或店铺代码" allowClear /><Select value={regionId} onChange={handleChangeRegion} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.name }))} /></div></header>
        {errorMessage ? <div className="notice notice--error">{errorMessage}</div> : null}
        {latestRun && latestRunPresentation ? <div className={latestRunPresentation.className}><span>最近同步</span><strong>{latestRunPresentation.label}</strong><p>新增 {latestRun.createdCount} · 更新 {latestRun.updatedCount} · 疑似下架 {latestRun.suspectedCount} · 下架 {latestRun.inactiveCount}</p></div> : null}
        {isLoading ? <div className="catalog-sync-loading"><Spin /><span>正在读取品牌门店配置…</span></div> : null}
        {!isLoading && visibleBrandStores.length === 0 ? <div className="empty-state"><strong>没有找到匹配的品牌门店</strong><p>试试输入英文品牌名、中文名或店铺代码。</p></div> : null}
        {!isLoading && visibleBrandStores.length > 0 ? <div className="catalog-brand-store-grid">{visibleBrandStores.map((brandStore) => {
          const configuration = brandStore.configuration;
          const isEnabled = configuration?.syncEnabled === true;
          const isSaving = savingBrandStoreId === brandStore.distributorId;
          const isSyncing = syncingBrandStoreId === configuration?.id;
          return <article className={isEnabled ? 'catalog-brand-store-card catalog-brand-store-card--enabled' : 'catalog-brand-store-card'} key={brandStore.distributorId}><div className="catalog-brand-store-card__identity"><i>{brandStore.brandName.slice(0, 1)}</i><div><small>{brandStore.shopCode || 'OUTLET STORE'}</small><h3>{brandStore.brandName}</h3><p>{brandStore.storeName || regionName}</p></div><Switch checked={isEnabled} loading={isSaving} onChange={(checked) => void handleChangeSyncEnabled(brandStore, checked)} /></div><div className="catalog-brand-store-card__meta"><span>{formatSyncTime(configuration?.lastSyncedAt)}</span><em>{isEnabled ? '本地同步已启用' : '未纳入本地商品库'}</em></div><Button type="primary" disabled={!isEnabled} loading={isSyncing} onClick={() => void handleSyncBrandStore(brandStore)}>{isSyncing ? '同步中…' : '立即同步该品牌'}</Button></article>;
        })}</div> : null}
      </section>
    </main>
  );
}
