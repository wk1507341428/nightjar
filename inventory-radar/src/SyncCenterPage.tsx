import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Empty, Input, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { REGION_OPTIONS } from './constants';
import { useXianyuAccount } from './XianyuAccountContext';
import { fetchPublishPresets } from './xianyuApi';
import { deleteSyncBrand, fetchSyncBrands, fetchSyncProfiles, searchSyncedSKUs, startSourceSync } from './syncCenterApi';
import { getManagedSyncProfileIds, getPresetSyncScope, getSyncProgress, getSyncProgressStatus, getSyncStatusLabel, sortSyncRunsByUpdatedAt } from './syncCenterHelpers';
import { SyncStage, SyncStatus, type SourceSyncedSKU, type SourceSyncProfile, type SourceSyncBrand, type SourceSyncSearch } from './syncCenterTypes';
import type { PublishPreset } from './types';

/** 轮询只读本地进度，不启动源站请求。 */
const POLL_INTERVAL_MS = 3000;
/** 本地 SKU 首屏分页。 */
const INITIAL_SEARCH: SourceSyncSearch = { page: 1, pageSize: 30, stockOnly: false };
/** 阶段名称与后端保持一致。 */
const STAGE_LABELS: Record<string, string> = { [SyncStage.LISTS]: '读取各地区商品目录', [SyncStage.DETAILS]: '同步商品与全部规格', [SyncStage.ACTIVATE]: '校验并启用本轮数据' };
/** 显示真实成功时间。 */
function formatSyncTime(value?: string): string { if (!value || value.startsWith('0001-')) return '尚未成功同步'; return new Date(value).toLocaleString('zh-CN', { hour12: false }); }
/** 分单位金额显示。 */
function formatSyncPrice(value?: number): string { return `¥${((value ?? 0) / 100).toFixed(2)}`; }
/** 保留服务端的具体错误原因。 */
function syncErrorMessage(error: unknown): string { return error instanceof Error ? error.message : '同步中心读取失败'; }

/** 显式同步整品牌，其余查询仅使用本地成功快照。 */
export function SyncCenterPage() {
  // 当前账号影响常用方案，源数据按聚合品牌共享。
  const { currentAccountId, currentAccount } = useXianyuAccount();
  // 本地品牌、任务与账号方案。
  const [profiles, setProfiles] = useState<SourceSyncProfile[]>([]);
  const [brands, setBrands] = useState<SourceSyncBrand[]>([]);
  const [presets, setPresets] = useState<PublishPreset[]>([]);
  const [presetId, setPresetId] = useState<string>();
  // 明确提交的同步品牌与本地搜索草稿。
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [filterProfileId, setFilterProfileId] = useState<string>();
  const [regionId, setRegionId] = useState<string>();
  const [stockOnly, setStockOnly] = useState(false);
  const [search, setSearch] = useState<SourceSyncSearch>(INITIAL_SEARCH);
  // 本地分页与操作反馈。
  const [skus, setSkus] = useState<SourceSyncedSKU[]>([]);
  const [skuTotal, setSkuTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSkuLoading, setIsSkuLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // 轮询错误与用户操作错误分离，避免后台刷新吞掉配置异常。
  const [overviewError, setOverviewError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [notice, setNotice] = useState('');
  // 当前通过操作列提交同步或重试的品牌。
  const [startingProfileId, setStartingProfileId] = useState<string>();
  // 当前删除的品牌，删除期间不允许发起同步。
  const [deletingProfileId, setDeletingProfileId] = useState<string>();
  // 删除和刷新请求顺序，旧轮询响应不能恢复已删除的品牌行。
  const overviewSequence = useRef(0);
  // 搜索响应归属与组件存活标记。
  const searchSequence = useRef(0);
  const alive = useRef(true);
  // 同一页面提交同步时阻止快速重复点击。
  const syncStartPending = useRef(false);
  // 新成功快照触发表格刷新，失败不覆盖本地旧数据。
  const completedGenerations = useRef('');
  const currentSearch = useRef(search);
  currentSearch.current = search;

  /** 查询本地 SKU，过期响应不能覆盖新筛选。 */
  async function loadSKUs(filters: SourceSyncSearch) {
    // 本轮请求序号。
    const sequence = ++searchSequence.current;
    setIsSkuLoading(true);
    try {
      // 当前成功快照的分页结果。
      const response = await searchSyncedSKUs(filters);
      if (!alive.current || sequence !== searchSequence.current) return;
      setSkus(response?.list ?? []); setSkuTotal(response?.total ?? 0); setSearchError('');
    } catch (error) { if (alive.current && sequence === searchSequence.current) setSearchError(syncErrorMessage(error)); }
    finally { if (alive.current && sequence === searchSequence.current) setIsSkuLoading(false); }
  }
  /** 只读任务与品牌最近成功时间。 */
  async function loadOverview() {
    // 本轮品牌元数据读取序号。
    const sequence = ++overviewSequence.current;
    try {
      // 两份元数据完全来自本地数据库。
      const [nextProfiles, response] = await Promise.all([fetchSyncProfiles(), fetchSyncBrands()]);
      if (!alive.current || sequence !== overviewSequence.current) return;
      setProfiles(nextProfiles ?? []); setBrands(sortSyncRunsByUpdatedAt(response?.list ?? [])); setOverviewError('');
      // 成功快照切换或删除后刷新 SKU，不依赖可被替换的任务记录。
      const generationKey = (nextProfiles ?? []).filter((profile) => profile.ready).map((profile) => `${profile.id}:${profile.generation ?? profile.lastSyncedAt ?? ''}`).sort().join(',');
      if (generationKey !== completedGenerations.current) { completedGenerations.current = generationKey; void loadSKUs(currentSearch.current); }
    } catch (error) { if (alive.current && sequence === overviewSequence.current) setOverviewError(syncErrorMessage(error)); }
    finally { if (alive.current && sequence === overviewSequence.current) setIsLoading(false); }
  }
  /** 提交搜索草稿。 */
  function handleSearch(page = 1, pageSize = search.pageSize) {
    // 已提交过滤条件。
    const filters = { keyword: keyword.trim(), brandProfileId: filterProfileId, regionId, stockOnly, page, pageSize };
    setSearch(filters); void loadSKUs(filters);
  }
  /** 常用方案仅选定品牌，鞋服规则去重。 */
  function handleApplyPreset() {
    // 方案的完整同步范围。
    const scope = getPresetSyncScope(presets.find((preset) => preset.id === presetId));
    if (scope.missingRules.length) { setErrorMessage(`方案中 ${scope.missingRules.map((rule) => rule.brandName).join('、')} 未配置聚合品牌，请先完善品牌配置。`); return; }
    if (!scope.profileIds.length) { setErrorMessage('请先选择有品牌规则的常用方案'); return; }
    setSelectedProfileIds(scope.profileIds); setErrorMessage(''); setNotice(`已选中 ${scope.profileIds.length} 个聚合品牌，点击添加并同步按钮开始读取最新数据。`);
  }
  /** 显式发起整品牌同步。 */
  async function handleStartSync(profileIds = selectedProfileIds) {
    if (!profileIds.length || syncStartPending.current || deletingProfileId) return;
    syncStartPending.current = true;
    setIsStarting(true); setNotice(''); setErrorMessage('');
    try { await startSourceSync([...new Set(profileIds)]); if (!alive.current) return; setNotice('同步已提交；新品牌加入列表，已有品牌更新同一行，离开页面不影响后台执行。'); await loadOverview(); }
    catch (error) { if (alive.current) setErrorMessage(syncErrorMessage(error)); }
    finally { syncStartPending.current = false; if (alive.current) setIsStarting(false); }
  }
  /** 单品牌同步或失败重试，后端决定继续断点还是新建审计任务。 */
  async function handleSyncBrand(brand: SourceSyncBrand) {
    if (syncStartPending.current || deletingProfileId || brand.status === SyncStatus.RUNNING) return;
    setStartingProfileId(brand.profileId);
    try { await handleStartSync([brand.profileId]); }
    finally { if (alive.current) setStartingProfileId(undefined); }
  }
  /** 二次确认后仅删除该品牌本地同步数据，不变更品牌配置或闲鱼。 */
  async function handleDeleteBrand(brand: SourceSyncBrand) {
    if (syncStartPending.current || deletingProfileId || brand.status === SyncStatus.RUNNING) return;
    syncStartPending.current = true;
    setDeletingProfileId(brand.profileId); setErrorMessage(''); setNotice('');
    try {
      await deleteSyncBrand(brand.profileId);
      if (!alive.current) return;
      // 删除后的旧查询响应不能重新展示已清理 SKU。
      searchSequence.current += 1;
      overviewSequence.current += 1;
      setBrands((current) => current.filter((item) => item.profileId !== brand.profileId));
      setSelectedProfileIds((current) => current.filter((id) => id !== brand.profileId));
      // 清理已删除品牌的筛选，保留其它搜索条件。
      const nextSearch = { ...currentSearch.current, page: 1 };
      if (nextSearch.brandProfileId === brand.profileId) {
        delete nextSearch.brandProfileId;
      }
      setFilterProfileId((current) => current === brand.profileId ? undefined : current);
      setSearch(nextSearch); currentSearch.current = nextSearch;
      setSkus([]); setSkuTotal(0);
      setNotice(`已删除 ${brand.profileName} 的本地同步商品、SKU 和元数据；品牌配置与闲鱼商品未变更。`);
      await loadOverview(); await loadSKUs(nextSearch);
    } catch (error) { if (alive.current) setErrorMessage(syncErrorMessage(error)); }
    finally { syncStartPending.current = false; if (alive.current) setDeletingProfileId(undefined); }
  }
  /** 建立串行轮询，避免上一轮未完成就叠加请求。 */
  function subscribeProgress() {
    alive.current = true;
    // 当前订阅的取消标记和定时器。
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    /** 一轮完成后再安排下一轮。 */
    async function poll() { await loadOverview(); if (!disposed) timer = setTimeout(() => { void poll(); }, POLL_INTERVAL_MS); }
    void poll(); void loadSKUs(INITIAL_SEARCH);
    return () => { disposed = true; alive.current = false; clearTimeout(timer); searchSequence.current += 1; overviewSequence.current += 1; };
  }
  // 定时器属于与后台状态的外部同步。
  useEffect(subscribeProgress, []);
  /** 同步当前账号方案，切换后丢弃旧账号响应。 */
  function subscribeAccountPresets() {
    // 当前账号请求取消标记。
    let disposed = false;
    /** 读取当前账号的本地常用方案。 */
    async function loadPresets() {
      setPresets([]); setPresetId(undefined);
      if (!currentAccountId) return;
      try { const response = await fetchPublishPresets(currentAccountId); if (!disposed) setPresets(response ?? []); }
      catch (error) { if (!disposed) setErrorMessage(syncErrorMessage(error)); }
    }
    void loadPresets(); return () => { disposed = true; };
  }
  // 账号状态与外部持久化方案同步。
  useEffect(subscribeAccountPresets, [currentAccountId]);

  // 本地成功覆盖和当前运行数。
  const readyProfiles = profiles.filter((profile) => profile.ready === true);
  const runningCount = brands.filter((brand) => brand.status === SyncStatus.RUNNING).length;
  // 一键同步的范围限定为已加入的同步品牌，不扩展品牌配置。
  const managedProfileIds = getManagedSyncProfileIds(brands);
  const totalSnapshotSKUs = readyProfiles.reduce((sum, profile) => sum + (profile.skuCount ?? 0), 0);
  const profileOptions = profiles.map((profile) => ({ value: profile.id, label: `${profile.name} · ${profile.members.length} 门店` }));
  // 保留地区来源、完整零库存规格与采购价对比。
  const skuColumns: ColumnsType<SourceSyncedSKU> = [
    { title: '货号 / 商品', key: 'product', width: 240, render: (_, sku) => <div className="source-sync-product"><strong>{sku.itemNo}</strong><small>{sku.name || '未提供商品名'}</small></div> },
    { title: '聚合品牌', dataIndex: 'profileName', width: 170, render: (name, sku) => name || profiles.find((profile) => profile.id === sku.profileId)?.name || sku.profileId },
    { title: '地区 / 门店', key: 'source', width: 150, render: (_, sku) => <div className="source-sync-product"><span>{REGION_OPTIONS.find((region) => region.id === sku.regionId)?.shortName ?? sku.regionId}</span><small>门店 {sku.distributorId}</small></div> },
    { title: '规格 / SKU', key: 'sku', width: 190, render: (_, sku) => <div className="source-sync-product"><strong>{sku.variantLabel || '默认规格'}</strong><small>{sku.skuCode || sku.skuId}</small></div> },
    { title: '采购价', key: 'price', width: 110, render: (_, sku) => formatSyncPrice(sku.activityPriceCents || sku.priceCents) },
    { title: '原价 / 折扣', key: 'discount', width: 130, render: (_, sku) => <div className="source-sync-product"><span>{formatSyncPrice(sku.marketPriceCents)}</span><small>{sku.marketPriceCents > 0 ? `${((sku.activityPriceCents || sku.priceCents) / sku.marketPriceCents * 10).toFixed(1)}折` : '原价未知'}</small></div> },
    { title: '库存', dataIndex: 'stock', width: 80, render: (stock) => <Tag color={stock > 0 ? 'green' : undefined}>{stock}</Tag> },
    { title: '可售库存', dataIndex: 'availableStock', width: 90 },
    { title: '来源状态', dataIndex: 'saleStatus', width: 100 },
    { title: '同步时间', dataIndex: 'observedAt', width: 180, render: formatSyncTime },
  ];
  // 展示真实已处理数量和错误，不把失败当成已完成。
  const brandColumns: ColumnsType<SourceSyncBrand> = [
    { title: '聚合品牌', dataIndex: 'profileName', width: 200 },
    { title: '状态 / 阶段', key: 'status', width: 220, render: (_, run) => <div className="source-sync-product"><Tag color={run.status === SyncStatus.COMPLETE ? 'green' : undefined}>{getSyncStatusLabel(run.status)}</Tag><small>{STAGE_LABELS[run.stage] ?? run.stage}</small></div> },
    { title: '本次同步进度', key: 'progress', width: 240, render: (_, run) => <div><Progress percent={getSyncProgress(run)} size="small" status={getSyncProgressStatus(run)} /><small>{run.processed} / {run.total} 条地区商品 · {run.skuCount} 个 SKU</small></div> },
    { title: '本地完整数据', key: 'snapshot', width: 210, render: (_, brand) => <div className="source-sync-product"><span>{brand.lastSyncedAt ? `${brand.snapshotProductCount ?? '—'} 条地区商品 · ${brand.snapshotSKUCount ?? '—'} 个 SKU` : '暂无成功快照'}</span><small>上次成功：{formatSyncTime(brand.lastSyncedAt)}</small></div> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 185, render: formatSyncTime },
    { title: '异常详情', key: 'errors', render: (_, run) => <div className="source-sync-product">
      {run.error ? <span className="source-sync-error">源数据同步异常：{run.error}</span> : null}
      {run.stabilityError ? <Tooltip title={`源数据已同步，稳定度更新失败：${run.stabilityError}`}><span className="source-sync-warning">源数据已同步，稳定度更新失败：{run.stabilityError}</span></Tooltip> : null}
      {!run.error && !run.stabilityError ? '—' : null}
    </div> },
    { title: '操作', key: 'actions', width: 170, fixed: 'right', render: (_, brand) => {
      // 状态与进度来自该品牌最近一次同步，失败不清理旧成功数据。
      const brandRunning = brand.status === SyncStatus.RUNNING;
      // 失败、中断沿用重试入口，成功品牌可再次同步。
      const actionLabel = brand.status === SyncStatus.FAILED || brand.status === SyncStatus.INTERRUPTED ? '重试' : '同步';
      return <Space size={0}><Tooltip title={brandRunning ? '该品牌正在同步' : '读取该品牌最新数据；失败保留旧成功数据'}><Button type="link" loading={startingProfileId === brand.profileId} disabled={isStarting || Boolean(deletingProfileId) || brandRunning} onClick={() => { void handleSyncBrand(brand); }}>{actionLabel}</Button></Tooltip><Popconfirm title={`删除 ${brand.profileName} 的本地同步数据？`} description="将清空此品牌已同步的商品、SKU、同步元数据。品牌维护配置和闲鱼商品不会删除；重新使用需再次同步。" okText="确认删除本地数据" cancelText="取消" okButtonProps={{ danger: true, loading: deletingProfileId === brand.profileId }} disabled={isStarting || Boolean(deletingProfileId) || brandRunning} onConfirm={() => handleDeleteBrand(brand)}><Button type="link" danger loading={deletingProfileId === brand.profileId} disabled={isStarting || Boolean(deletingProfileId) || brandRunning}>删除</Button></Popconfirm></Space>;
    } },
  ];
  return <main className="source-sync-page">
    <header className="source-sync-heading"><div><span className="workspace-eyebrow">SOURCE DATA / SYNC CENTER</span><h1>同步中心</h1><p>按聚合品牌同步全部地区商品与 SKU。搜索、比价和发布对账使用最近一次完整成功的数据。</p></div><Button onClick={() => { void loadOverview(); }} loading={isLoading}>刷新状态</Button></header>
    {overviewError ? <Alert type="error" showIcon title={overviewError} /> : null}
    {errorMessage ? <Alert type="error" showIcon title={errorMessage} /> : null}
    {notice ? <Alert type="info" showIcon title={notice} closable onClose={() => setNotice('')} /> : null}
    <section className="source-sync-metrics"><article><small>成功同步品牌</small><strong>{readyProfiles.length}<em> / {brands.length}</em></strong></article><article><small>本地完整 SKU</small><strong>{totalSnapshotSKUs.toLocaleString()}</strong></article><article><small>正在同步</small><strong>{runningCount}<em> 个品牌</em></strong></article><article><small>同步策略</small><strong className="source-sync-policy">整品牌成功后更新</strong><span>失败保留上次完整数据</span></article></section>
    <section className="source-sync-panel source-sync-control"><header><h2>新增同步品牌</h2><span className="source-sync-hint">仅点击同步按钮时读取小程序</span></header><label>聚合品牌</label><div className="source-sync-start"><Select mode="multiple" value={selectedProfileIds} onChange={setSelectedProfileIds} options={profileOptions} optionFilterProp="label" placeholder="选择需要更新的聚合品牌" aria-label="同步聚合品牌" /><Button type="primary" loading={isStarting} disabled={!selectedProfileIds.length || Boolean(deletingProfileId)} onClick={() => { void handleStartSync(); }}>添加并同步所选品牌</Button></div><div className="source-sync-preset"><span>{currentAccount?.name || '当前账号'}的常用方案</span><Select value={presetId} onChange={setPresetId} options={presets.map((preset) => ({ value: preset.id, label: preset.name }))} placeholder="选择常用方案" aria-label="常用方案同步范围" /><Button disabled={!presetId} onClick={handleApplyPreset}>使用方案品牌</Button><small>同一品牌的鞋服规则只同步一次</small></div><div className="source-sync-profile-dates">{profiles.filter((profile) => selectedProfileIds.includes(profile.id)).map((profile) => <div key={profile.id}><b>{profile.name}</b><span>上次成功：{formatSyncTime(profile.lastSyncedAt)}</span>{profile.lastSyncedAt && !profile.ready ? <Tag color="warning">品牌范围已变化，请重新同步</Tag> : null}</div>)}</div></section>
    <section className="source-sync-panel"><header><h2>同步品牌</h2><Space wrap><span className="source-sync-hint">一品牌一行，重复同步更新原行；每 3 秒刷新进度</span><Tooltip title={`同步列表内 ${managedProfileIds.length} 个品牌；不会自动加入其它品牌配置，运行中的任务不重复启动`}><Button type="primary" loading={isStarting} disabled={isLoading || Boolean(deletingProfileId) || managedProfileIds.length === 0} onClick={() => { void handleStartSync(managedProfileIds); }}>一键同步</Button></Tooltip></Space></header><Table rowKey="id" columns={brandColumns} dataSource={brands} loading={isLoading} pagination={{ pageSize: 6, showSizeChanger: false }} scroll={{ x: 1200 }} locale={{ emptyText: <Empty description="尚无同步品牌，请先选择品牌并添加同步" /> }} /></section>
    <section className="source-sync-panel"><header><h2>本地 SKU 数据</h2><span className="source-sync-hint">保留各地区、门店及零库存规格；查询不访问小程序</span></header><Space wrap className="source-sync-filters"><Input.Search value={keyword} onChange={(event) => setKeyword(event.target.value)} onSearch={() => handleSearch()} placeholder="搜索货号、商品或 SKU" allowClear aria-label="本地SKU关键词" /><Select value={filterProfileId} onChange={setFilterProfileId} options={profileOptions} optionFilterProp="label" showSearch allowClear placeholder="全部聚合品牌" aria-label="本地SKU品牌" /><Select value={regionId} onChange={setRegionId} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.shortName }))} allowClear placeholder="全部地区" aria-label="本地SKU地区" /><Checkbox checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)}>仅看有货</Checkbox><Button onClick={() => handleSearch()}>查询</Button></Space>{searchError ? <Alert type="error" showIcon title={searchError} /> : null}<Table rowKey="id" columns={skuColumns} dataSource={skus} loading={isSkuLoading} scroll={{ x: 1450 }} pagination={{ current: search.page, pageSize: search.pageSize, total: skuTotal, showTotal: (total) => `共 ${total} 条地区 SKU`, showSizeChanger: true, onChange: handleSearch }} locale={{ emptyText: <Empty description="暂无本地 SKU，请先同步聚合品牌" /> }} /></section>
  </main>;
}
