import { Button, Spin } from 'antd';
import type { MarketplaceListing } from './types';

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
  return (
    <main className="marketplace-page">
      <section className="marketplace-hero">
        <button type="button" className="marketplace-hero__back" onClick={onBack}>← 返回选品仓</button>
        <div>
          <small>MARKETPLACE DESK</small>
          <h1>渠道上架</h1>
          <p>集中查看各平台当前在售商品，避免重复发布。</p>
        </div>
        <div className="marketplace-hero__counter"><strong>{listings.length}</strong><span>闲鱼在售</span></div>
      </section>

      <section className="marketplace-channel-tabs" aria-label="销售渠道">
        <button type="button" className="marketplace-channel-tab marketplace-channel-tab--active"><i>闲</i><span>闲鱼</span><strong>{listings.length}</strong></button>
        <button type="button" className="marketplace-channel-tab" disabled><i>淘</i><span>淘宝</span><small>待接入</small></button>
        <button type="button" className="marketplace-channel-tab" disabled><i>拼</i><span>拼多多</span><small>待接入</small></button>
        <div className="marketplace-sync-meta"><span>最后同步 {formatMarketplaceDate(lastSyncedAt)}</span><Button size="small" onClick={onRefresh} loading={isLoading}>同步闲鱼状态</Button></div>
      </section>


      {isLoading ? <div className="marketplace-loading"><Spin size="small" /><span>正在读取渠道在售商品…</span></div> : null}
      {errorMessage ? <div className="notice notice--error">{errorMessage}</div> : null}
      {!isLoading && !errorMessage && listings.length === 0 ? <div className="empty-state"><strong>暂无闲鱼在售商品</strong><p>连接闲鱼账号后重启服务，或从商品详情发布第一件商品。</p></div> : null}

      {listings.length > 0 ? (
        <div className="marketplace-listing-grid">
          {listings.map((listing) => (
            <article className="marketplace-listing-card" key={listing.id}>
              <div className="marketplace-listing-card__media">
                {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} loading="lazy" /> : <span>XIANYU</span>}
                <em>闲鱼在售</em>
              </div>
              <div className="marketplace-listing-card__content">
                <small>{listing.itemNo || '未关联货号'}</small>
                <h2>{listing.title}</h2>
                <div className="marketplace-listing-card__meta"><strong>{formatMarketplacePrice(listing.priceCents)}</strong><span>同步于 {formatMarketplaceDate(listing.lastSyncedAt)}</span></div>
                <div className="marketplace-listing-card__actions">
                  {listing.itemUrl ? <a href={listing.itemUrl} target="_blank" rel="noreferrer">查看闲鱼商品 <span>↗</span></a> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
