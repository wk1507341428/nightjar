import { useMemo, useRef, useState } from 'react';
import { Drawer, Spin } from 'antd';
import { getWarehouseName } from './constants';
import type { ProductDetail, ProductSku } from './types';

/** 人民币金额格式化器。 */
const CURRENCY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 将接口分单位价格格式化为人民币。 */
function formatPrice(price?: string | number): string {
  // 数值化后的价格。
  const numericPrice = Number(price ?? 0);

  return CURRENCY_FORMATTER.format(numericPrice / 100);
}

/** 获取商品或 SKU 的实际活动价。 */
function getEffectivePrice(item: ProductDetail | ProductSku): number {
  // 平台补贴活动价。
  const activityPrice = Number(item?.activity_price ?? item?.act_price ?? 0);

  if (activityPrice > 0) {
    return activityPrice;
  }

  return Number(item?.price ?? 0);
}

/** 获取平台补贴金额。 */
function getSubsidyAmount(item: ProductDetail | ProductSku): number {
  // 商品基础折扣价。
  const basePrice = Number(item?.price ?? 0);
  // 商品实际活动价。
  const effectivePrice = getEffectivePrice(item);

  return Math.max(basePrice - effectivePrice, 0);
}

/** 格式化接口折扣率。 */
function formatDiscount(discountRate?: string | number): string {
  // 百分制折扣率。
  const numericDiscount = Number(discountRate ?? 0);

  return numericDiscount > 0 ? `${(numericDiscount / 10).toFixed(1)}折` : '特惠';
}

/** 格式化活动结束时间。 */
function formatPromotionEndTime(endTimestamp?: string | number): string {
  // 秒级活动结束时间。
  const numericTimestamp = Number(endTimestamp ?? 0);

  if (numericTimestamp <= 0) {
    return '';
  }

  // 活动结束日期。
  const endDate = new Date(numericTimestamp * 1000);
  // 月份文本。
  const month = String(endDate.getMonth() + 1).padStart(2, '0');
  // 日期文本。
  const day = String(endDate.getDate()).padStart(2, '0');
  // 小时文本。
  const hour = String(endDate.getHours()).padStart(2, '0');
  // 分钟文本。
  const minute = String(endDate.getMinutes()).padStart(2, '0');

  return `${month}/${day} ${hour}:${minute} 截止`;
}

/** 从商品图文详情中提取安全的图片地址。 */
function extractDetailImageUrls(detailHtml?: string): string[] {
  if (!detailHtml) {
    return [];
  }

  // 商品详情 HTML 文档。
  const detailDocument = new DOMParser().parseFromString(detailHtml, 'text/html');
  // 商品详情图片地址。
  const imageUrls = Array.from(detailDocument.querySelectorAll('img'))
    .map((imageElement) => imageElement.getAttribute('src') ?? '')
    .filter((imageUrl) => /^https?:\/\//.test(imageUrl));

  return Array.from(new Set(imageUrls));
}

/** 读取 SKU 的指定规格值。 */
function getSkuSpec(sku: ProductSku, specName: string): string {
  // 匹配的规格项。
  const matchedSpec = sku?.item_spec?.find((spec) => spec?.spec_name === specName);

  return matchedSpec?.spec_value_name ?? '—';
}

/** 汇总商品全部在售 SKU 库存。 */
function getProductStock(product: ProductDetail): number {
  // 商品在售规格。
  const onSaleSkus = product?.spec_items?.filter((sku) => sku?.approve_status === 'onsale');

  if (onSaleSkus && onSaleSkus.length > 0) {
    return onSaleSkus.reduce((stockTotal, sku) => stockTotal + Number(sku?.store ?? 0), 0);
  }

  return Number(product?.item_total_store ?? product?.store ?? 0);
}

/** 复制图标。 */
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

/** 将文本写入系统剪贴板。 */
async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // 兼容旧浏览器的临时输入框。
  const fallbackInput = document.createElement('textarea');
  fallbackInput.value = text;
  fallbackInput.style.position = 'fixed';
  fallbackInput.style.opacity = '0';
  document.body.appendChild(fallbackInput);
  fallbackInput.select();
  document.execCommand('copy');
  fallbackInput.remove();
}

/** 可复制货号。 */
function CopyItemNoButton({ itemNo }: { itemNo?: string }) {
  // 复制完成提示状态。
  const [isCopied, setIsCopied] = useState(false);

  /** 复制当前货号。 */
  async function handleCopyItemNo() {
    if (!itemNo) {
      return;
    }

    await copyTextToClipboard(itemNo);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1200);
  }

  return (
    <button type="button" className="copy-item-no" onClick={handleCopyItemNo} title="复制货号">
      <CopyIcon />
      <span>{isCopied ? '已复制' : itemNo ?? '—'}</span>
    </button>
  );
}

/** ProductDetailDrawer 是普通列表和秒杀专区共用的商品详情抽屉。 */
export function ProductDetailDrawer({
  product,
  isLoading,
  errorMessage,
  marketplacePlatforms,
  onClose,
  onPublish,
}: {
  product: ProductDetail | null;
  isLoading: boolean;
  errorMessage: string;
  marketplacePlatforms: string[];
  onClose: () => void;
  onPublish: (product: ProductDetail) => void;
}) {
  // 在售 SKU 列表。
  const onSaleSkus = product?.spec_items?.filter((sku) => sku?.approve_status === 'onsale') ?? [];
  // 商详库存合计。
  const totalStock = product ? getProductStock(product) : 0;
  // 图文详情图片列表。
  const detailImageUrls = useMemo(() => extractDetailImageUrls(product?.intro), [product?.intro]);
  // 商品图片滚动容器。
  const galleryRef = useRef<HTMLDivElement>(null);
  // 鼠标拖拽过程数据。
  const galleryDragState = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    nextScrollLeft: 0,
    animationFrameId: null as number | null,
  });

  /** 开始拖动商品图片。 */
  function handleGalleryPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }

    // 当前图片滚动容器。
    const galleryElement = galleryRef.current;
    if (!galleryElement) {
      return;
    }

    galleryDragState.current = {
      isDragging: true,
      startX: event.clientX,
      startScrollLeft: galleryElement.scrollLeft,
      nextScrollLeft: galleryElement.scrollLeft,
      animationFrameId: null,
    };
    galleryElement.setPointerCapture(event.pointerId);
    galleryElement.classList.add('detail-gallery--dragging');
  }

  /** 根据鼠标位移滚动商品图片。 */
  function handleGalleryPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    // 当前拖拽状态。
    const dragState = galleryDragState.current;
    // 当前图片滚动容器。
    const galleryElement = galleryRef.current;
    if (!dragState.isDragging || !galleryElement) {
      return;
    }

    event.preventDefault();
    dragState.nextScrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX);
    if (dragState.animationFrameId !== null) {
      return;
    }

    dragState.animationFrameId = window.requestAnimationFrame(() => {
      galleryElement.scrollLeft = dragState.nextScrollLeft;
      dragState.animationFrameId = null;
    });
  }

  /** 结束拖动商品图片。 */
  function handleGalleryPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    // 当前图片滚动容器。
    const galleryElement = galleryRef.current;
    // 当前拖拽状态。
    const dragState = galleryDragState.current;

    if (dragState.animationFrameId !== null) {
      window.cancelAnimationFrame(dragState.animationFrameId);
      if (galleryElement) {
        galleryElement.scrollLeft = dragState.nextScrollLeft;
      }
      dragState.animationFrameId = null;
    }

    dragState.isDragging = false;
    galleryElement?.classList.remove('detail-gallery--dragging');
    if (galleryElement?.hasPointerCapture(event.pointerId)) {
      galleryElement.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      size={680}
      rootClassName="product-detail-drawer-root"
      title={<div className="drawer-title"><small>PRODUCT DETAIL</small><strong>商品详情</strong></div>}
      className="product-detail-drawer"
    >
      {isLoading ? <div className="detail-loading"><Spin size="large" tip="正在读取实时商详…"><div className="detail-loading__space" /></Spin></div> : null}
      {!isLoading && errorMessage ? <div className="notice notice--error">{errorMessage}</div> : null}
      {!isLoading && !errorMessage && product ? (
        <div className="detail-content">
          <div ref={galleryRef} className="detail-gallery" onPointerDown={handleGalleryPointerDown} onPointerMove={handleGalleryPointerMove} onPointerUp={handleGalleryPointerUp} onPointerCancel={handleGalleryPointerUp}>
            {(product?.pics ?? [product?.main_img ?? '']).filter(Boolean).map((imageUrl, imageIndex) => (
              <img key={`${imageUrl}-${imageIndex}`} src={imageUrl} alt={`商品图片 ${imageIndex + 1}`} draggable={false} />
            ))}
          </div>

          <div className="detail-summary">
            <div className="detail-summary__tags"><span>{product?.goods_brand ?? '品牌商品'}</span><span>{formatDiscount(product?.discount_rate)}</span>{marketplacePlatforms.includes('xianyu') ? <span className="marketplace-status-tag">闲鱼在售</span> : null}</div>
            <h2>{product?.item_name ?? '未命名商品'}</h2>
            <div className="detail-summary__number"><span>货号</span><CopyItemNoButton itemNo={product?.item_no} /></div>
            <div className="detail-summary__price">
              <strong>{formatPrice(getEffectivePrice(product))}</strong>
              <del>{formatPrice(product?.market_price)}</del>
              {getSubsidyAmount(product) > 0 ? <em>平台补贴 {formatPrice(getSubsidyAmount(product))}</em> : null}
              <span>共 {totalStock} 件</span>
            </div>
            <button type="button" className="detail-publish-button" onClick={() => onPublish(product)}>发布到闲鱼 <span>→</span></button>
          </div>

          {getSubsidyAmount(product) > 0 ? <section className="seckill-banner"><div><small>FLASH SALE</small><strong>限时秒杀</strong></div><span>平台已补贴 {formatPrice(getSubsidyAmount(product))}</span><em>{formatPromotionEndTime(product?.promotion_end_time) || '活动进行中'}</em></section> : null}

          <section className="detail-section">
            <div className="detail-section__heading"><h3>尺码与库存</h3><span>实时库存</span></div>
            <div className="sku-list">
              {onSaleSkus.map((sku) => <div className="sku-row" key={sku?.item_id}><strong>{getSkuSpec(sku, '尺码')}</strong><span>{getSkuSpec(sku, '颜色')}</span><span>{formatPrice(getEffectivePrice(sku))}</span><em>{Number(sku?.store ?? 0)} 件</em></div>)}
            </div>
          </section>

          <section className="detail-facts">
            <div><span>仓库地点</span><strong>{getWarehouseName(product?.regionauth_id ?? product?.distributor_info?.regionauth_id)}</strong></div>
            <div><span>店铺代码</span><strong>{product?.store_code ?? product?.distributor_info?.shop_code ?? '—'}</strong></div>
            <div><span>销售状态</span><strong>{product?.approve_status === 'onsale' ? '在售' : '非在售'}</strong></div>
          </section>

          {detailImageUrls.length > 0 ? <section className="detail-rich-content"><div className="detail-rich-content__heading"><small>PRODUCT STORY</small><h3>商品图文详情</h3></div><div className="detail-rich-content__images">{detailImageUrls.map((imageUrl, imageIndex) => <img key={`${imageUrl}-${imageIndex}`} src={imageUrl} alt={`商品详情图 ${imageIndex + 1}`} loading="lazy" />)}</div></section> : null}
        </div>
      ) : null}
    </Drawer>
  );
}
