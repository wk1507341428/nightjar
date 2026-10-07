import { useMemo, useState } from 'react';
import { Button, Input, Select, Tag, Tooltip } from 'antd';
import { ProCard, ProTable, type ProColumns } from '@ant-design/pro-components';
import type { MarketplaceListing, MarketplaceListingStability } from './types';
import { useXianyuAccount } from './XianyuAccountContext';

/** 稳定度筛选范围。 */
type StabilityFilter = 'all' | 'stable' | 'normal' | 'volatile' | 'pending';

/** 稳定度筛选选项。 */
const STABILITY_FILTER_OPTIONS: Array<{ label: string; value: StabilityFilter }> = [
  { label: '全部稳定度', value: 'all' },
  { label: '稳定 · 9～10分', value: 'stable' },
  { label: '一般 · 6～8分', value: 'normal' },
  { label: '波动 · 1～5分', value: 'volatile' },
  { label: '待评估', value: 'pending' },
];

/** 人民币金额格式化器。 */
const MARKETPLACE_CURRENCY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 日期时间格式化器。 */
const MARKETPLACE_DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** 格式化渠道售价。 */
function formatMarketplacePrice(priceCents: number): string {
  return MARKETPLACE_CURRENCY_FORMATTER.format(priceCents / 100);
}

/** 格式化渠道同步时间。 */
function formatMarketplaceDate(value?: string): string {
  if (!value) {
    return '尚未同步';
  }
  return MARKETPLACE_DATE_FORMATTER.format(new Date(value));
}

/** 判断商品是否满足稳定度筛选。 */
function matchesStabilityFilter(stability: MarketplaceListingStability | undefined, filter: StabilityFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return !stability;
  if (!stability) return false;
  if (filter === 'stable') return stability.score >= 9;
  if (filter === 'normal') return stability.score >= 6 && stability.score <= 8;
  return stability.score <= 5;
}

/** 返回稳定度对应的视觉等级。 */
function getStabilityTone(stability: MarketplaceListingStability): string {
  if (!stability.currentAvailable) return 'offline';
  if (stability.score >= 9) return 'stable';
  if (stability.score >= 6) return 'normal';
  return 'volatile';
}

/** 展示一件商品的稳定度和统计明细。 */
function MarketplaceStabilityBadge({ stability }: { stability?: MarketplaceListingStability }) {
  if (!stability) {
    return <span className="marketplace-stability marketplace-stability--pending"><strong>—</strong><small>待评估</small></span>;
  }
  // 当前稳定度视觉等级。
  const stabilityTone = getStabilityTone(stability);
  // 最近十天已观察日期中的在售比例。
  const availabilityRate = stability.observedDayCount > 0
    ? Math.round((stability.availableDayCount / stability.observedDayCount) * 100)
    : 0;
  // 稳定度明细浮层。
  const tooltipContent = (
    <div className="marketplace-stability-detail">
      <strong>货源稳定度 {stability.score}/10</strong>
      <span>统计窗口：最近 10 天</span>
      <span>已观察：{stability.observedDayCount} 天</span>
      <span>有货：{stability.availableDayCount} 天（{availabilityRate}%）</span>
      <span>发生下架：{stability.unavailableDayCount} 天</span>
      <span>当前状态：{stability.currentAvailable ? '小程序有货' : '小程序已缺货'}</span>
      {stability.lastUnavailableAt ? <span>最近下架：{formatMarketplaceDate(stability.lastUnavailableAt)}</span> : null}
    </div>
  );
  return (
    <Tooltip title={tooltipContent} placement="left">
      <span className={`marketplace-stability marketplace-stability--${stabilityTone}`}>
        <strong>{stability.score}<i>/10</i></strong>
        <small>{stability.currentAvailable ? '货源稳定' : '当前缺货'}</small>
      </span>
    </Tooltip>
  );
}

/** MarketplacePage 展示各电商渠道当前在售商品。 */
export function MarketplacePage({
  listings,
  lastSyncedAt,
  isLoading,
  errorMessage,
  onBack,
  onRefresh,
}: {
  listings: MarketplaceListing[];
  lastSyncedAt?: string;
  isLoading: boolean;
  errorMessage: string;
  onBack: () => void;
  onRefresh: () => void;
}) {
  // 当前渠道列表所属账号。
  const { currentAccount } = useXianyuAccount();
  // 当前渠道商品搜索词。
  const [marketplaceKeyword, setMarketplaceKeyword] = useState('');
  // 当前稳定度筛选条件。
  const [stabilityFilter, setStabilityFilter] = useState<StabilityFilter>('all');
  // 搜索和稳定度筛选后的渠道商品。
  const filteredListings = useMemo(() => {
    // 用于大小写无关匹配的关键词。
    const normalizedKeyword = marketplaceKeyword.trim().toLocaleLowerCase('zh-CN');
    return listings.filter((listing) => {
      // 当前商品可被检索的标题和货号文本。
      const searchableText = `${listing.itemNo ?? ''} ${listing.title}`.toLocaleLowerCase('zh-CN');
      return (!normalizedKeyword || searchableText.includes(normalizedKeyword))
        && matchesStabilityFilter(listing.stability, stabilityFilter);
    });
  }, [listings, marketplaceKeyword, stabilityFilter]);
  // 渠道商品列：保留货号、售价、同步时间和原平台跳转。
  const listingColumns: ProColumns<MarketplaceListing>[] = [
    { title: '商品', dataIndex: 'title', width: 460, render: (_, listing) => <div className="marketplace-product-cell">{listing.imageUrl ? <img src={listing.imageUrl} alt="" loading="lazy" /> : <span>闲</span>}<div><strong>{listing.title}</strong><small>{listing.itemNo || '未关联货号'}</small></div></div> },
    { title: '平台', dataIndex: 'platform', width: 110, render: () => <Tag color="gold">闲鱼在售</Tag> },
    { title: '售价', dataIndex: 'priceCents', width: 140, render: (_, listing) => <strong className="marketplace-table-price">{formatMarketplacePrice(listing.priceCents)}</strong> },
    { title: '稳定度', dataIndex: ['stability', 'score'], width: 150, sorter: (leftListing, rightListing) => (leftListing.stability?.score ?? 0) - (rightListing.stability?.score ?? 0), render: (_, listing) => <MarketplaceStabilityBadge stability={listing.stability} /> },
    { title: '最后同步', dataIndex: 'lastSyncedAt', width: 160, render: (_, listing) => <span className="catalog-muted">{formatMarketplaceDate(listing.lastSyncedAt)}</span> },
    { title: '操作', valueType: 'option', width: 130, render: (_, listing) => listing.itemUrl ? [<a key="open" href={listing.itemUrl} target="_blank" rel="noreferrer">查看闲鱼商品 ↗</a>] : [] },
  ];

  return (
    <main className="marketplace-page">
      <header className="workspace-page-heading"><div><span className="workspace-eyebrow">MARKETPLACE / LISTINGS</span><h1>渠道上架</h1><p>当前账号：{currentAccount?.name ?? '未选择账号'} · 在售快照与下架操作按账号隔离。</p></div><div className="workspace-page-actions"><Button onClick={onBack}>返回选品仓</Button><Button type="primary" disabled={!currentAccount?.sellerConnected || currentAccount.status !== 'active'} onClick={onRefresh} loading={isLoading}>同步闲鱼状态</Button></div></header>
      <div className="workspace-overview marketplace-overview"><ProCard className="workspace-overview-card"><small>闲鱼在售</small><strong>{listings.length.toLocaleString('zh-CN')}</strong><span>已同步商品</span></ProCard><ProCard className="workspace-overview-card"><small>最近同步</small><strong className="workspace-overview-card__date">{formatMarketplaceDate(lastSyncedAt)}</strong><span>点击右上角可手动刷新</span></ProCard></div>
      <div className="marketplace-channel-tabs" aria-label="销售渠道"><Tag color="gold">闲鱼 · {listings.length}</Tag></div>
      {errorMessage ? <div className="notice notice--error">{errorMessage}</div> : null}
      <ProTable<MarketplaceListing> className="workspace-data-table marketplace-listing-table" rowKey="id" columns={listingColumns} dataSource={filteredListings} loading={isLoading} search={false} pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 件` }} scroll={{ x: 1080 }} headerTitle={`闲鱼在售商品 · 匹配 ${filteredListings.length.toLocaleString('zh-CN')} 件`} toolBarRender={() => [<Input.Search key="marketplace-search" allowClear value={marketplaceKeyword} onChange={(event) => setMarketplaceKeyword(event.target.value)} placeholder="搜索货号或商品标题" aria-label="搜索闲鱼在售商品" />, <Select<StabilityFilter> key="stability-filter" value={stabilityFilter} options={STABILITY_FILTER_OPTIONS} onChange={setStabilityFilter} aria-label="筛选货源稳定度" />]} options={{ density: true, reload: onRefresh }} locale={{ emptyText: '没有符合条件的闲鱼商品' }} />
    </main>
  );
}
