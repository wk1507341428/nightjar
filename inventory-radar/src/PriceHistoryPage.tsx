import { useEffect, useMemo, useState } from 'react';
import { Alert, Spin } from 'antd';
import { fetchCatalogOfferPriceHistory } from './catalogManagementApi';
import { getWarehouseShortName } from './constants';
import type { OfferPriceHistory, SKUPriceSnapshot } from './types';

/** 人民币价格格式化器。 */
const PRICE_FORMATTER = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** 日期时间格式化器。 */
const HISTORY_TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

/** 按 SKU 汇总后的价格轨迹。 */
interface SKUPriceTrack {
  skuId: string;
  skuCode?: string;
  label: string;
  snapshots: SKUPriceSnapshot[];
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
}

/** 将分单位价格格式化为人民币。 */
function formatPrice(priceCents: number): string {
  return PRICE_FORMATTER.format(priceCents / 100);
}

/** 返回涨跌金额对应的样式类。 */
function getPriceChangeClass(changeAmount: number): string {
  if (changeAmount > 0) return 'price-up';
  if (changeAmount < 0) return 'price-down';
  return '';
}

/** 将接口快照按 SKU 分组并计算区间。 */
function buildSKUPriceTracks(snapshots: SKUPriceSnapshot[]): SKUPriceTrack[] {
  // SKU 到价格快照的索引。
  const snapshotsBySKU = new Map<string, SKUPriceSnapshot[]>();
  snapshots.forEach((snapshot) => {
    const currentSnapshots = snapshotsBySKU.get(snapshot.skuId) ?? [];
    currentSnapshots.push(snapshot);
    snapshotsBySKU.set(snapshot.skuId, currentSnapshots);
  });

  return Array.from(snapshotsBySKU.entries()).map(([skuId, skuSnapshots]) => {
    // 按观察时间排列的 SKU 快照。
    const orderedSnapshots = [...skuSnapshots].sort((left, right) => new Date(left.observedAt).getTime() - new Date(right.observedAt).getTime());
    // SKU 历史有效价格。
    const prices = orderedSnapshots.map((snapshot) => snapshot.priceCents).filter((price) => price > 0);
    // SKU 最新快照。
    const latestSnapshot = orderedSnapshots[orderedSnapshots.length - 1];
    return {
      skuId,
      skuCode: latestSnapshot?.skuCode,
      label: latestSnapshot?.variantLabel || '默认规格',
      snapshots: orderedSnapshots,
      currentPrice: latestSnapshot?.priceCents ?? 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    };
  }).sort((left, right) => left.label.localeCompare(right.label, 'zh-CN', { numeric: true }));
}

/** 生成折线图使用的坐标点。 */
function buildChartPoints(snapshots: SKUPriceSnapshot[]): string {
  if (snapshots.length === 0) return '';
  // 折线图有效价格。
  const prices = snapshots.map((snapshot) => snapshot.priceCents);
  // 折线图价格上下界。
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  // 避免单价格历史产生零区间。
  const priceRange = Math.max(maxPrice - minPrice, 1);
  return snapshots.map((snapshot, index) => {
    const x = snapshots.length === 1 ? 450 : 48 + (index / (snapshots.length - 1)) * 804;
    const y = 252 - ((snapshot.priceCents - minPrice) / priceRange) * 196;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/** 商品 SKU 价格走势独立页面。 */
export function PriceHistoryPage({ offerId, onBack }: { offerId: string; onBack: () => void }) {
  // 商品价格历史数据。
  const [priceHistory, setPriceHistory] = useState<OfferPriceHistory | null>(null);
  // 当前主动选择的 SKU。
  const [selectedSkuId, setSelectedSkuId] = useState('');
  // 页面加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 页面错误信息。
  const [errorMessage, setErrorMessage] = useState('');

  /** 加载商品 SKU 价格历史。 */
  async function loadPriceHistory() {
    setIsLoading(true);
    setErrorMessage('');
    try {
      setPriceHistory(await fetchCatalogOfferPriceHistory(offerId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '价格历史读取失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPriceHistory();
  }, [offerId]);

  // 商品全部 SKU 价格轨迹。
  const skuTracks = useMemo(() => buildSKUPriceTracks(priceHistory?.snapshots ?? []), [priceHistory?.snapshots]);
  // 当前展示的 SKU 价格轨迹。
  const selectedTrack = skuTracks.find((track) => track.skuId === selectedSkuId) ?? skuTracks[0];
  // 当前 SKU 首次价格。
  const firstPrice = selectedTrack?.snapshots[0]?.priceCents ?? 0;
  // 当前 SKU 相对首次记录的涨跌金额。
  const changeAmount = (selectedTrack?.currentPrice ?? 0) - firstPrice;
  // 当前 SKU 折线图坐标。
  const chartPoints = buildChartPoints(selectedTrack?.snapshots ?? []);

  return (
    <main className="price-history-page">
      <header className="price-history-header">
        <button type="button" onClick={onBack}>← 返回商品详情</button>
        <div><small>PRICE ARCHIVE / SKU LEDGER</small><h1>价格走势</h1><p>只记录首次价格与真实变价节点，避免重复同步制造噪声。</p></div>
      </header>

      {isLoading ? <div className="price-history-loading"><Spin size="large" /><span>正在整理 SKU 价格档案…</span></div> : null}
      {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}

      {!isLoading && priceHistory && selectedTrack ? <div className="price-history-workspace">
        <section className="price-history-hero">
          <div className="price-history-product">
            {priceHistory.imageUrl ? <img src={priceHistory.imageUrl} alt="" /> : <span>{priceHistory.brandName.slice(0, 1)}</span>}
            <div><small>{priceHistory.brandName} · {getWarehouseShortName(priceHistory.regionId)}</small><h2>{priceHistory.name}</h2><p>货号 {priceHistory.itemNo} · {skuTracks.length} 个 SKU 已建立价格档案</p></div>
          </div>
          <div className="price-history-current"><span>CURRENT</span><strong>{formatPrice(selectedTrack.currentPrice)}</strong><em className={getPriceChangeClass(changeAmount)}>{changeAmount === 0 ? '基准价' : `${changeAmount > 0 ? '↑' : '↓'} ${formatPrice(Math.abs(changeAmount))}`}</em></div>
        </section>

        <section className="price-history-metrics">
          <article><span>历史最低</span><strong>{formatPrice(selectedTrack.minPrice)}</strong></article>
          <article><span>历史最高</span><strong>{formatPrice(selectedTrack.maxPrice)}</strong></article>
          <article><span>价格跨度</span><strong>{formatPrice(selectedTrack.maxPrice - selectedTrack.minPrice)}</strong></article>
          <article><span>变价节点</span><strong>{selectedTrack.snapshots.length}</strong><em>次记录</em></article>
        </section>

        <section className="price-history-sku-section">
          <header><div><small>SKU RANGE</small><h3>选择尺码 / 规格</h3></div><span>每个 SKU 独立计算价格区间</span></header>
          <div className="price-history-sku-rail">{skuTracks.map((track) => <button type="button" key={track.skuId} className={track.skuId === selectedTrack.skuId ? 'price-history-sku price-history-sku--active' : 'price-history-sku'} onClick={() => setSelectedSkuId(track.skuId)}><span>{track.label}</span><strong>{formatPrice(track.currentPrice)}</strong><em>{formatPrice(track.minPrice)}—{formatPrice(track.maxPrice)}</em></button>)}</div>
        </section>

        <section className="price-history-chart-card">
          <header><div><small>PRICE SIGNAL</small><h3>{selectedTrack.label} 价格轨迹</h3></div><span>最近同步 {HISTORY_TIME_FORMATTER.format(new Date(priceHistory.lastSyncedAt))}</span></header>
          <div className="price-history-chart">
            <svg viewBox="0 0 900 300" role="img" aria-label={`${selectedTrack.label}价格走势图`} preserveAspectRatio="none">
              <defs><linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff0046" stopOpacity=".34" /><stop offset="1" stopColor="#ff0046" stopOpacity="0" /></linearGradient></defs>
              <line x1="48" y1="56" x2="852" y2="56" /><line x1="48" y1="154" x2="852" y2="154" /><line x1="48" y1="252" x2="852" y2="252" />
              {chartPoints ? <><polygon points={`48,252 ${chartPoints} 852,252`} fill="url(#priceArea)" stroke="none" /><polyline points={chartPoints} className="price-history-chart__line" /></> : null}
              {(selectedTrack.snapshots ?? []).map((snapshot, index) => {
                const coordinate = chartPoints.split(' ')[index]?.split(',') ?? [];
                return <circle key={snapshot.id} cx={coordinate[0]} cy={coordinate[1]} r="6" />;
              })}
            </svg>
            <div className="price-history-chart__labels"><span>{formatPrice(selectedTrack.maxPrice)}</span><span>{formatPrice((selectedTrack.maxPrice + selectedTrack.minPrice) / 2)}</span><span>{formatPrice(selectedTrack.minPrice)}</span></div>
          </div>
        </section>

        <section className="price-history-ledger">
          <header><div><small>CHANGE LOG</small><h3>变价记录</h3></div><span>新记录在前</span></header>
          <div>{[...selectedTrack.snapshots].reverse().map((snapshot, index, reversedSnapshots) => {
            const previousSnapshot = reversedSnapshots[index + 1];
            const priceDelta = previousSnapshot ? snapshot.priceCents - previousSnapshot.priceCents : 0;
            let changeSymbol = '—';
            if (priceDelta > 0) changeSymbol = '↑';
            if (priceDelta < 0) changeSymbol = '↓';
            return <article key={snapshot.id}><time>{HISTORY_TIME_FORMATTER.format(new Date(snapshot.observedAt))}</time><div><strong>{formatPrice(snapshot.priceCents)}</strong><span>挂牌 {formatPrice(snapshot.sourcePriceCents)} · 原价 {formatPrice(snapshot.marketPriceCents)} · 库存 {snapshot.stock}</span></div><em className={getPriceChangeClass(priceDelta)}>{previousSnapshot ? `${changeSymbol} ${formatPrice(Math.abs(priceDelta))}` : '价格基线'}</em></article>;
          })}</div>
        </section>
      </div> : null}
    </main>
  );
}
