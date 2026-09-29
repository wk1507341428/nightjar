import { Button, Tag } from 'antd';
import { ProCard, ProTable, type ProColumns } from '@ant-design/pro-components';
import type { MarketplaceListing } from './types';
import { useXianyuAccount } from './XianyuAccountContext';

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
  // 渠道商品列：保留货号、售价、同步时间和原平台跳转。
  const listingColumns: ProColumns<MarketplaceListing>[] = [
    { title: '商品', dataIndex: 'title', width: 460, render: (_, listing) => <div className="marketplace-product-cell">{listing.imageUrl ? <img src={listing.imageUrl} alt="" loading="lazy" /> : <span>闲</span>}<div><strong>{listing.title}</strong><small>{listing.itemNo || '未关联货号'}</small></div></div> },
    { title: '平台', dataIndex: 'platform', width: 110, render: () => <Tag color="gold">闲鱼在售</Tag> },
    { title: '售价', dataIndex: 'priceCents', width: 140, render: (_, listing) => <strong className="marketplace-table-price">{formatMarketplacePrice(listing.priceCents)}</strong> },
    { title: '最后同步', dataIndex: 'lastSyncedAt', width: 160, render: (_, listing) => <span className="catalog-muted">{formatMarketplaceDate(listing.lastSyncedAt)}</span> },
    { title: '操作', valueType: 'option', width: 130, render: (_, listing) => listing.itemUrl ? [<a key="open" href={listing.itemUrl} target="_blank" rel="noreferrer">查看闲鱼商品 ↗</a>] : [] },
  ];

  return (
    <main className="marketplace-page">
      <header className="workspace-page-heading"><div><span className="workspace-eyebrow">MARKETPLACE / LISTINGS</span><h1>渠道上架</h1><p>当前账号：{currentAccount?.name ?? '未选择账号'} · 在售快照与下架操作按账号隔离。</p></div><div className="workspace-page-actions"><Button onClick={onBack}>返回选品仓</Button><Button type="primary" disabled={!currentAccount?.sellerConnected || currentAccount.status !== 'active'} onClick={onRefresh} loading={isLoading}>同步闲鱼状态</Button></div></header>
      <div className="workspace-overview marketplace-overview"><ProCard className="workspace-overview-card"><small>闲鱼在售</small><strong>{listings.length.toLocaleString('zh-CN')}</strong><span>已同步商品</span></ProCard><ProCard className="workspace-overview-card"><small>最近同步</small><strong className="workspace-overview-card__date">{formatMarketplaceDate(lastSyncedAt)}</strong><span>点击右上角可手动刷新</span></ProCard></div>
      <div className="marketplace-channel-tabs" aria-label="销售渠道"><Tag color="gold">闲鱼 · {listings.length}</Tag></div>
      {errorMessage ? <div className="notice notice--error">{errorMessage}</div> : null}
      <ProTable<MarketplaceListing> className="workspace-data-table" rowKey="id" columns={listingColumns} dataSource={listings} loading={isLoading} search={false} pagination={{ pageSize: 20, showSizeChanger: true }} scroll={{ x: 930 }} headerTitle="闲鱼在售商品" options={{ density: true, reload: onRefresh }} locale={{ emptyText: '暂无闲鱼在售商品' }} />
    </main>
  );
}
