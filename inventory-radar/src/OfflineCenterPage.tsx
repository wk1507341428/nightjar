import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Image, Input, InputNumber, Popconfirm, Select, Space, Statistic, Tag } from 'antd';
import { ProCard, ProTable, type ProColumns } from '@ant-design/pro-components';
import { fetchLiveBrandCategories, fetchLiveBrandOptions } from './api';
import { BrandSelectOption } from './BrandSelectOption';
import { fetchBrandMaintenance } from './catalogManagementApi';
import { REGION_OPTIONS } from './constants';
import type { BrandCategory, BrandOption, OfflineCenterCandidate } from './types';
import { createOfflineCenterOperation, previewOfflineCenter } from './xianyuApi';
import { useXianyuAccount } from './XianyuAccountContext';

/** 将分单位金额格式化为人民币。 */
function formatOfflinePrice(priceCents?: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }).format(Number(priceCents ?? 0) / 100);
}

/** 将地区 ID 列表格式化为仓库简称。 */
function formatOfflineRegions(regionIDs?: string[]): string {
  return (regionIDs ?? []).map((regionID) => REGION_OPTIONS.find((region) => region.id === regionID)?.shortName ?? regionID).join('、') || '历史归属';
}

/** 下架中心：按小程序品牌和 SKU 品类关系筛选闲鱼在售商品。 */
export function OfflineCenterPage() {
  // 全站当前闲鱼账号。
  const { currentAccount, currentAccountId } = useXianyuAccount();
  // 当前仓库地区。
  const [regionId, setRegionId] = useState('3');
  // 聚合品牌和当前地区单独品牌选项。
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  // 当前品牌选择键。
  const [brandId, setBrandId] = useState('');
  // 当前品牌覆盖的品类。
  const [brandCategories, setBrandCategories] = useState<BrandCategory[]>([]);
  // 当前选择的聚合品类键。
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  // 最低闲鱼售价，单位元。
  const [minPriceYuan, setMinPriceYuan] = useState<number | null>(null);
  // 最高闲鱼售价，单位元。
  const [maxPriceYuan, setMaxPriceYuan] = useState<number | null>(null);
  // 最低折扣率，百分比。
  const [minDiscountRate, setMinDiscountRate] = useState<number | null>(null);
  // 最高折扣率，百分比。
  const [maxDiscountRate, setMaxDiscountRate] = useState<number | null>(null);
  // 下架候选商品。
  const [candidates, setCandidates] = useState<OfflineCenterCandidate[]>([]);
  // 当前勾选的闲鱼商品 ID。
  const [selectedItemIds, setSelectedItemIds] = useState<React.Key[]>([]);
  // 商品列表关键词。
  const [keyword, setKeyword] = useState('');
  // 品牌加载状态。
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  // 品类加载状态。
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  // 生成预览状态。
  const [isPreviewing, setIsPreviewing] = useState(false);
  // 下架任务入队状态。
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 页面错误提示。
  const [errorMessage, setErrorMessage] = useState('');

  /** 清空当前预览和选择。 */
  function clearPreview() {
    setCandidates([]);
    setSelectedItemIds([]);
    setKeyword('');
  }

  /** 加载聚合品牌及当前地区全部单独品牌。 */
  async function loadBrandOptions(nextRegionId: string) {
    setIsLoadingBrands(true);
    setBrandId('');
    setBrandCategories([]);
    setCategoryIds([]);
    clearPreview();
    try {
      const [sourceBrands, maintenance] = await Promise.all([fetchLiveBrandOptions(nextRegionId), fetchBrandMaintenance()]);
      const sourcesByKey = new Map(maintenance.sources.map((source) => [`${source.regionId}:${source.distributorId}`, source]));
      const profileOptions: BrandOption[] = maintenance.profiles.map((profile) => {
        const memberSources = profile.members.map((member) => sourcesByKey.get(`${member.regionId}:${member.distributorId}`)).filter(Boolean);
        const regionNames = Array.from(new Set(profile.members.map((member) => REGION_OPTIONS.find((region) => region.id === member.regionId)?.shortName ?? member.regionId))).join('、');
        return { value: `profile:${profile.id}`, label: `${profile.name}（${regionNames}）`, brandProfileId: profile.id, logoUrl: memberSources.find((source) => source?.logoUrl)?.logoUrl, onlineGoodsCount: memberSources.reduce((total, source) => total + Number(source?.onlineGoodsCount ?? 0), 0), profileMembers: profile.members };
      });
      setBrandOptions([...profileOptions, ...sourceBrands]);
      setErrorMessage('');
    } catch (error) {
      setBrandOptions([]);
      setErrorMessage(error instanceof Error ? error.message : '品牌列表加载失败');
    } finally {
      setIsLoadingBrands(false);
    }
  }

  /** 加载并按品类名称聚合当前品牌覆盖门店的品类。 */
  async function loadBrandCategories(brandOption: BrandOption) {
    setIsLoadingCategories(true);
    setBrandCategories([]);
    setCategoryIds([]);
    try {
      let categoryLists: BrandCategory[][] = [];
      if (brandOption.brandProfileId) {
        const categoryResults = await Promise.allSettled((brandOption.profileMembers ?? []).map((member) => fetchLiveBrandCategories(member.regionId, member.distributorId)));
        categoryLists = categoryResults.filter((result): result is PromiseFulfilledResult<BrandCategory[]> => result.status === 'fulfilled').map((result) => result.value);
      } else {
        categoryLists = [await fetchLiveBrandCategories(regionId, brandOption.categoryDistributorId ?? '')];
      }
      const categoriesByName = new Map<string, BrandCategory>();
      categoryLists.flat().forEach((category) => {
        const categoryKey = category.name.trim().toLocaleLowerCase('zh-CN');
        const existingCategory = categoriesByName.get(categoryKey);
        if (!existingCategory) {
          categoriesByName.set(categoryKey, { ...category, sourceIds: [category.id] });
          return;
        }
        existingCategory.sourceIds = Array.from(new Set([...(existingCategory.sourceIds ?? [existingCategory.id]), category.id]));
        if (!existingCategory.imageUrl && category.imageUrl) existingCategory.imageUrl = category.imageUrl;
      });
      setBrandCategories(Array.from(categoriesByName.values()));
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '品牌品类加载失败');
    } finally {
      setIsLoadingCategories(false);
    }
  }

  /** 切换仓库地区并重新加载品牌。 */
  function handleRegionChange(nextRegionId: string) {
    setRegionId(nextRegionId);
    void loadBrandOptions(nextRegionId);
  }

  /** 切换聚合品牌或单独品牌。 */
  function handleBrandChange(nextBrandId: string) {
    setBrandId(nextBrandId);
    clearPreview();
    const nextBrand = brandOptions.find((brandOption) => brandOption.value === nextBrandId);
    if (nextBrand) void loadBrandCategories(nextBrand);
  }

  /** 切换一个品类筛选项。 */
  function handleToggleCategory(categoryId: string) {
    setCategoryIds((currentIds) => currentIds.includes(categoryId) ? currentIds.filter((currentId) => currentId !== categoryId) : [...currentIds, categoryId]);
    clearPreview();
  }

  /** 返回当前聚合品类对应的全部小程序源品类 ID。 */
  function getSourceCategoryIds(): string[] {
    const selectedCategorySet = new Set(categoryIds);
    return Array.from(new Set(brandCategories.filter((category) => selectedCategorySet.has(category.id)).flatMap((category) => category.sourceIds ?? [category.id])));
  }

  /** 根据当前品牌和区间条件生成下架预览。 */
  async function handlePreview() {
    const selectedBrand = brandOptions.find((brandOption) => brandOption.value === brandId);
    if (!selectedBrand) {
      setErrorMessage('请先选择需要下架的品牌');
      return;
    }
    setIsPreviewing(true);
    try {
      const response = await previewOfflineCenter({
        accountId: currentAccountId,
        brandProfileId: selectedBrand.brandProfileId,
        regionId: selectedBrand.brandProfileId ? undefined : regionId,
        distributorId: selectedBrand.brandProfileId ? undefined : selectedBrand.categoryDistributorId,
        brandName: selectedBrand.label,
        categoryIds: getSourceCategoryIds(),
        minPriceCents: minPriceYuan === null ? undefined : Math.round(minPriceYuan * 100),
        maxPriceCents: maxPriceYuan === null ? undefined : Math.round(maxPriceYuan * 100),
        minDiscountRate: minDiscountRate ?? undefined,
        maxDiscountRate: maxDiscountRate ?? undefined,
      });
      const nextCandidates = response?.candidates ?? [];
      setCandidates(nextCandidates);
      setSelectedItemIds(nextCandidates.map((candidate) => candidate.platformItemId));
      setErrorMessage('');
    } catch (error) {
      setCandidates([]);
      setSelectedItemIds([]);
      setErrorMessage(error instanceof Error ? error.message : '下架预览生成失败');
    } finally {
      setIsPreviewing(false);
    }
  }

  /** 将已勾选商品加入当前账号的下架队列。 */
  async function handleSubmitOffline() {
    const selectedBrand = brandOptions.find((brandOption) => brandOption.value === brandId);
    if (!selectedBrand || selectedItemIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const operation = await createOfflineCenterOperation({
        accountId: currentAccountId,
        brandProfileId: selectedBrand.brandProfileId,
        regionId: selectedBrand.brandProfileId ? undefined : regionId,
        distributorId: selectedBrand.brandProfileId ? undefined : selectedBrand.categoryDistributorId,
        brandName: selectedBrand.label,
        categoryIds: getSourceCategoryIds(),
        categoryNames: brandCategories.filter((category) => categoryIds.includes(category.id)).map((category) => category.name),
        platformItemIds: selectedItemIds.map(String),
      });
      setErrorMessage('');
      window.location.hash = `/publish-operations/${encodeURIComponent(operation.id)}`;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '加入下架队列失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => { void loadBrandOptions(regionId); }, []);
  useEffect(() => { clearPreview(); setErrorMessage(''); }, [currentAccountId]);

  // 当前选择的聚合品牌或单独品牌。
  const selectedBrand = brandOptions.find((brandOption) => brandOption.value === brandId);
  // 按关键词过滤后的下架候选商品。
  const visibleCandidates = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('zh-CN');
    if (!normalizedKeyword) return candidates;
    return candidates.filter((candidate) => `${candidate.itemNo} ${candidate.title} ${(candidate.categoryNames ?? []).join(' ')}`.toLocaleLowerCase('zh-CN').includes(normalizedKeyword));
  }, [candidates, keyword]);
  // 下架列表表格列。
  const columns: ProColumns<OfflineCenterCandidate>[] = [
    { title: 'SKU 图片', width: 88, search: false, render: (_, candidate) => candidate.imageUrl ? <Image width={56} height={56} className="offline-center-image" src={candidate.imageUrl} alt={candidate.title} preview={{ mask: '查看' }} /> : <span className="sku-image-placeholder">暂无图片</span> },
    { title: '货号', dataIndex: 'itemNo', width: 150, copyable: true, fixed: 'left' },
    { title: '闲鱼商品', dataIndex: 'title', ellipsis: true, render: (_, candidate) => <div className="offline-center-product"><strong>{candidate.title}</strong>{candidate.itemUrl ? <a href={candidate.itemUrl} target="_blank" rel="noreferrer">查看闲鱼商品 ↗</a> : null}</div> },
    { title: '品类归属', width: 210, render: (_, candidate) => <Space size={[4, 6]} wrap>{candidate.categoryNames?.length ? candidate.categoryNames.map((name) => <Tag key={name}>{name}</Tag>) : <Tag>品类未知</Tag>}</Space> },
    { title: '来源地区', width: 150, render: (_, candidate) => formatOfflineRegions(candidate.sourceRegions) },
    { title: '闲鱼售价', width: 120, render: (_, candidate) => <strong className="offline-center-price">{formatOfflinePrice(candidate.priceCents)}</strong> },
    { title: '折扣率', width: 100, render: (_, candidate) => candidate.discountRate ? `${candidate.discountRate}%` : '—' },
  ];

  return (
    <main className="offline-center-page">
      <header className="workspace-page-heading"><div><span className="workspace-eyebrow">OFFLINE / CONTROL</span><h1>下架中心</h1><p>当前账号：{currentAccount?.name ?? '未选择账号'} · 按小程序品牌与 SKU 品类归属筛选闲鱼在售商品。</p></div><div className="workspace-page-actions"><Button onClick={() => { window.location.hash = '/publish-center'; }}>查看队列</Button></div></header>
      {errorMessage ? <Alert type="error" showIcon closable message={errorMessage} onClose={() => setErrorMessage('')} /> : null}
      <ProCard className="offline-center-filter-card"><Form layout="vertical" className="publish-center-form"><div className="publish-center-form__grid"><Form.Item label="仓库地区"><Select value={regionId} onChange={handleRegionChange} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.name }))} /></Form.Item><Form.Item label="指定品牌" required><Select<string, BrandOption> value={brandId || undefined} onChange={handleBrandChange} showSearch optionFilterProp="label" popupMatchSelectWidth={420} loading={isLoadingBrands} placeholder="选择聚合品牌或当前地区品牌" options={brandOptions} optionRender={(option) => <BrandSelectOption brandOption={option.data} />} /></Form.Item></div>{brandId ? <Form.Item label="商品品类"><div className="publish-center-category-list"><button type="button" className={categoryIds.length === 0 ? 'is-selected' : ''} onClick={() => { setCategoryIds([]); clearPreview(); }}><strong>ALL</strong><span>全部商品</span></button>{brandCategories.map((category) => <button type="button" key={category.id} className={categoryIds.includes(category.id) ? 'is-selected' : ''} onClick={() => handleToggleCategory(category.id)}>{category.imageUrl ? <img src={category.imageUrl} alt="" /> : <strong>{category.name.slice(0, 1)}</strong>}<span>{category.name}</span></button>)}{isLoadingCategories ? <span className="publish-center-category-loading">正在聚合品类…</span> : null}</div></Form.Item> : null}<section className="publish-filter-panel"><header><div><strong>商品筛选</strong><span>只在填写条件后生效，默认不限制</span></div><Tag color="error">仅下架，不修改商品</Tag></header><div className="publish-center-form__grid publish-center-form__grid--four"><Form.Item label="最低售价"><InputNumber min={0} precision={2} value={minPriceYuan ?? undefined} onChange={(value) => { setMinPriceYuan(value); clearPreview(); }} addonAfter="元" placeholder="不限" /></Form.Item><Form.Item label="最高售价"><InputNumber min={0} precision={2} value={maxPriceYuan ?? undefined} onChange={(value) => { setMaxPriceYuan(value); clearPreview(); }} addonAfter="元" placeholder="不限" /></Form.Item><Form.Item label="最低折扣率"><InputNumber min={0} max={100} precision={0} value={minDiscountRate ?? undefined} onChange={(value) => { setMinDiscountRate(value); clearPreview(); }} addonAfter="%" placeholder="不限" /></Form.Item><Form.Item label="最高折扣率"><InputNumber min={0} max={100} precision={0} value={maxDiscountRate ?? undefined} onChange={(value) => { setMaxDiscountRate(value); clearPreview(); }} addonAfter="%" placeholder="不限" /></Form.Item></div></section><div className="offline-center-filter-actions"><span>将先刷新小程序当前品牌商品，再结合历史 SKU 归属匹配闲鱼在售商品。</span><Button type="primary" loading={isPreviewing} disabled={!brandId} onClick={() => void handlePreview()}>生成下架预览</Button></div></Form></ProCard>
      <section className="offline-center-summary"><ProCard><Statistic title="匹配品牌" value={selectedBrand?.label ?? '—'} /></ProCard><ProCard><Statistic title="匹配商品" value={candidates.length} suffix="件" /></ProCard><ProCard><Statistic title="已选择" value={selectedItemIds.length} suffix="件" /></ProCard><ProCard><Statistic title="当前账号" value={currentAccount?.name ?? '—'} /></ProCard></section>
      <ProTable<OfflineCenterCandidate> className="offline-center-table" rowKey="platformItemId" cardBordered columns={columns} dataSource={visibleCandidates} search={false} loading={isPreviewing} scroll={{ x: 1180 }} pagination={{ pageSize: 20, showSizeChanger: true }} rowSelection={{ selectedRowKeys: selectedItemIds, preserveSelectedRowKeys: true, onChange: setSelectedItemIds }} headerTitle={`待下架商品 · ${visibleCandidates.length} 件`} toolBarRender={() => [<Input.Search key="search" allowClear value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索货号、商品或品类" />, <Popconfirm key="submit" title={`确认下架已选 ${selectedItemIds.length} 件商品？`} description="确认后加入当前账号队列，已处理商品不会自动恢复。" okText="确认加入队列" cancelText="取消" onConfirm={() => void handleSubmitOffline()}><Button danger type="primary" loading={isSubmitting} disabled={selectedItemIds.length === 0 || !currentAccount?.sellerConnected || currentAccount.status !== 'active'}>确认加入下架队列</Button></Popconfirm>]} locale={{ emptyText: brandId ? '点击“生成下架预览”查看匹配商品' : '请先选择品牌' }} />
    </main>
  );
}
