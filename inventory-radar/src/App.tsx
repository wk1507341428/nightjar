import { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin, Switch } from 'antd';
import { fetchBrandOptions, fetchLiveBrandOptions, fetchLiveProductDetail, fetchProductDetail, fetchSeckillProducts, searchLiveProducts, searchProducts } from './api';
import { refreshCatalogOffer } from './catalogManagementApi';
import { INITIAL_SEARCH_STATE, INITIAL_SECKILL_STATE, PRODUCT_PAGE_SIZE, REGION_OPTIONS, getWarehouseName, getWarehouseShortName } from './constants';
import { loadCachedBrandOptions, loadRecentSearches, saveCachedBrandOptions, saveRecentSearch } from './storage';
import { PublishProductModal } from './PublishProductModal';
import { ProductDetailDrawer } from './ProductDetailDrawer';
import { MarketplacePage } from './MarketplacePage';
import { PriceComparisonModal } from './PriceComparisonModal';
import { XianyuConnectionControl } from './XianyuConnectionControl';
import { CatalogSyncPage } from './CatalogSyncPage';
import { fetchMarketplaceListings, syncMarketplaceListings } from './xianyuApi';
import type {
  MarketplaceListing,
  ProductDetail,
  BrandOption,
  ProductSearchState,
  ProductSku,
  ProductSummary,
  RecentSearch,
  SeckillState,
} from './types';

/** 人民币金额格式化器。 */
const CURRENCY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 更新时间格式化器。 */
const TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
});

/** 顶部模块导航；具体品类通过搜索和页面内入口查询。 */
const PRIMARY_NAV_ITEMS = ['全部货源', '我的商品库', '秒杀专区', '渠道上架', '同步配置'];

/** 商品排序方式。 */
type SortMode = 'default' | 'priceAsc' | 'priceDesc' | 'discount' | 'xianyuLast';

/** 商品列表展示模式。 */
type CatalogMode = 'standard' | 'seckill' | 'marketplace' | 'sync';

/** 商品数据来源。 */
type CatalogDataSource = 'live' | 'local';

/** 返回指定数据来源可用的排序项。 */
function getCatalogSortOptions(dataSource: CatalogDataSource): Array<{ value: SortMode; label: string }> {
  // 两个商品库共用的基础排序项。
  const sortOptions: Array<{ value: SortMode; label: string }> = [
    { value: 'default', label: '综合排序' },
    { value: 'priceAsc', label: '价格从低到高' },
    { value: 'priceDesc', label: '价格从高到低' },
    { value: 'discount', label: '折扣从低到高' },
  ];
  if (dataSource === 'local') {
    sortOptions.push({ value: 'xianyuLast', label: '闲鱼在售置底' });
  }
  return sortOptions;
}

/** 将接口分单位价格格式化为人民币。 */
function formatPrice(price?: string | number): string {
  // 数值化后的价格。
  const numericPrice = Number(price ?? 0);

  return CURRENCY_FORMATTER.format(numericPrice / 100);
}

/** 获取商品或 SKU 的实际活动价。 */
function getEffectivePrice(item: ProductSummary | ProductSku): number {
  // 平台补贴活动价。
  const activityPrice = Number(item?.activity_price ?? item?.act_price ?? 0);

  if (activityPrice > 0) {
    return activityPrice;
  }

  return Number(item?.price ?? 0);
}

/** 获取平台补贴金额。 */
function getSubsidyAmount(item: ProductSummary | ProductSku): number {
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

/** 汇总商品全部在售 SKU 库存。 */
function getProductStock(product: ProductSummary): number {
  // 商品在售规格。
  const onSaleSkus = product?.spec_items?.filter(
    (sku) => sku?.approve_status === 'onsale',
  );

  if (onSaleSkus && onSaleSkus.length > 0) {
    return onSaleSkus.reduce((stockTotal, sku) => stockTotal + Number(sku?.store ?? 0), 0);
  }

  return Number(product?.item_total_store ?? product?.store ?? 0);
}

/** 获取商详查询使用的 Item ID。 */
function getDetailItemId(product: ProductSummary): string {
  return product?.catalog_offer_id ?? product?.default_item_id ?? product?.item_id ?? product?.goods_id ?? '';
}

/** 将页面排序方式转换为后端排序值。 */
function getBackendGoodsSort(sortMode: SortMode): number | undefined {
  if (sortMode === 'priceAsc') {
    return 3;
  }

  if (sortMode === 'priceDesc') {
    return 2;
  }

  if (sortMode === 'discount') {
    return 6;
  }

  return undefined;
}

/** 生成当前商品区标题。 */
function getCatalogTitle(catalogMode: CatalogMode, isBrowseMode: boolean, regionShortName: string): string {
  if (catalogMode === 'seckill') {
    return `${regionShortName}秒杀专区`;
  }
  if (isBrowseMode) {
    return `${regionShortName}在售好物`;
  }
  return '搜索结果';
}

/** 判断当前地址是否为独立秒杀页。 */
function isSeckillPageRoute(): boolean {
  return window.location.hash === '#/seckill';
}

/** 判断当前地址是否为独立渠道上架页。 */
function isMarketplacePageRoute(): boolean {
  return window.location.hash === '#/marketplace';
}

/** 判断当前地址是否为同步配置页。 */
function isCatalogSyncPageRoute(): boolean {
  return window.location.hash === '#/sync';
}

/** 判断当前地址是否为本地商品库页面。 */
function isLocalCatalogPageRoute(): boolean {
  return window.location.hash === '#/library';
}

/** 标准化跨系统货号。 */
function normalizeMarketplaceItemNo(itemNo?: string): string {
  return itemNo?.trim().toUpperCase() ?? '';
}

/** 搜索图标。 */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

/** 定位图标。 */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}

/** 刷新图标。 */
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6v5h-5" />
      <path d="M18.2 15.5A7 7 0 1 1 17 7l3 4" />
    </svg>
  );
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
function CopyItemNoButton({ itemNo, compact = false }: { itemNo?: string; compact?: boolean }) {
  // 复制完成提示状态。
  const [isCopied, setIsCopied] = useState(false);

  /** 复制当前货号。 */
  async function handleCopyItemNo(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!itemNo) {
      return;
    }

    await copyTextToClipboard(itemNo);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1200);
  }

  return (
    <button
      type="button"
      className={compact ? 'copy-item-no copy-item-no--compact' : 'copy-item-no'}
      onClick={handleCopyItemNo}
      title="复制货号"
    >
      <CopyIcon />
      <span>{isCopied ? '已复制' : itemNo ?? '—'}</span>
    </button>
  );
}

/** 商品卡片。 */
function ProductCard({
  product,
  marketplacePlatforms,
  dataSource,
  onOpen,
}: {
  product: ProductSummary;
  marketplacePlatforms: string[];
  dataSource: CatalogDataSource;
  onOpen: (product: ProductSummary) => void;
}) {
  // 商品库存数量。
  const stock = getProductStock(product);
  // 商品展示图。
  const imageUrl = product?.main_img ?? product?.pics?.[0] ?? '';
  // 商品门店名称。
  const shopName = product?.distributor_info?.name ?? '奥莱门店';
  // 商品实际仓库地区 ID。
  const warehouseRegionId = product?.regionauth_id ?? product?.distributor_info?.regionauth_id;
  // 商品实际仓库简称。
  const warehouseShortName = getWarehouseShortName(warehouseRegionId);
  // 商品折扣文案。
  const discountLabel = formatDiscount(product?.discount_rate);
  // 商品平台补贴金额。
  const subsidyAmount = getSubsidyAmount(product);
  // 商品是否参加限时活动。
  const hasLimitedSale = subsidyAmount > 0;
  // 商品活动结束文案。
  const promotionEndLabel = formatPromotionEndTime(product?.promotion_end_time);
  // 商品本地同步时间文案。
  const localSyncLabel = product?.last_synced_at
    ? new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(product.last_synced_at))
    : '未同步';
  // 商品当前数据来源文案。
  const dataSourceLabel = dataSource === 'live' ? '实时 · 小程序' : `本地 · ${localSyncLabel}`;
  // 商品是否已在闲鱼发布；本地库优先使用后端给出的全局排序状态。
  const isListedOnXianyu = product?.xianyu_listed === true || marketplacePlatforms.includes('xianyu');

  /** 打开当前商品详情。 */
  function handleOpenProduct() {
    onOpen(product);
  }

  /** 通过键盘打开商品详情。 */
  function handleProductKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(product);
    }
  }

  return (
    <article className="product-card">
      <div className="product-card__button" role="button" tabIndex={0} onClick={handleOpenProduct} onKeyDown={handleProductKeyDown}>
        <div className="product-card__media">
          {imageUrl ? (
            <img src={imageUrl} alt={product?.item_name ?? '商品图片'} loading="lazy" />
          ) : (
            <div className="product-card__placeholder">SIDEJOB SELECT</div>
          )}
          <span className="product-card__discount">{discountLabel}</span>
          <span className={stock > 0 ? 'product-card__stock product-card__stock--ok' : 'product-card__stock'}>
            {stock > 0 ? `库存 ${stock}` : '暂时无货'}
          </span>
          {subsidyAmount > 0 ? <span className="product-card__subsidy">平台补贴 {formatPrice(subsidyAmount)}</span> : null}
          {hasLimitedSale ? <span className="product-card__seckill">限时秒杀{promotionEndLabel ? ` · ${promotionEndLabel}` : ''}</span> : null}
        </div>
        <div className="product-card__content">
          {isListedOnXianyu ? <div className="product-card__marketplaces"><span>闲鱼在售</span></div> : null}
          <h3>{product?.item_name ?? '未命名商品'}</h3>
          <div className="product-card__number"><span>货号</span><CopyItemNoButton itemNo={product?.item_no} compact /></div>
          <div className="product-card__footer">
            <div><strong>{formatPrice(getEffectivePrice(product))}</strong><del>{formatPrice(product?.market_price)}</del><span className="product-card__warehouse">{warehouseShortName}</span></div>
            <span className={dataSource === 'live' ? 'product-card__store product-card__store--live' : 'product-card__store'} title={shopName}>{shopName} · {dataSourceLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/** 商品列表骨架。 */
function ProductGridSkeleton() {
  // 骨架卡片序号。
  const skeletonItems = Array.from({ length: 8 }, (_, itemIndex) => itemIndex);

  return (
    <div className="product-grid" aria-label="商品正在加载">
      {skeletonItems.map((itemIndex) => (
        <div className="product-card product-card--skeleton" key={itemIndex}>
          <div className="skeleton-media" />
          <div className="skeleton-copy"><i /><i /><i /></div>
        </div>
      ))}
    </div>
  );
}

/** 应用主页面。 */
export function App() {
  // 当前输入关键词。
  const [query, setQuery] = useState('');
  // 当前地区 ID。
  const [regionId, setRegionId] = useState('3');
  // 当前快捷分类。
  const [activeCategory, setActiveCategory] = useState('全部');
  // 当前商品展示模式。
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('standard');
  // 当前商品浏览数据来源。
  const [catalogDataSource, setCatalogDataSource] = useState<CatalogDataSource>('live');
  // 当前排序方式。
  const [sortMode, setSortMode] = useState<SortMode>('default');
  // 是否仅展示有货商品。
  const [stockOnly, setStockOnly] = useState(true);
  // 当前品牌门店 ID。
  const [brandId, setBrandId] = useState('all');
  // 当前地区品牌列表。
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  // 品牌列表加载状态。
  const [isBrandLoading, setIsBrandLoading] = useState(false);
  // 商品搜索状态。
  const [searchState, setSearchState] = useState<ProductSearchState>(INITIAL_SEARCH_STATE);
  // 秒杀专区查询状态。
  const [seckillState, setSeckillState] = useState<SeckillState>(INITIAL_SECKILL_STATE);
  // 当前选中的秒杀分区。
  const [selectedSeckillActivityId, setSelectedSeckillActivityId] = useState('');
  // 当前全部渠道在售商品。
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  // 渠道在售列表加载状态。
  const [isMarketplaceLoading, setIsMarketplaceLoading] = useState(false);
  // 渠道在售列表错误信息。
  const [marketplaceErrorMessage, setMarketplaceErrorMessage] = useState('');
  // 闲鱼最近同步时间。
  const [marketplaceLastSyncedAt, setMarketplaceLastSyncedAt] = useState<string>();
  // 最近查询记录。
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => (
    loadRecentSearches().filter((recentSearch) => (
      REGION_OPTIONS.some((region) => region.id === recentSearch.regionId)
    ))
  ));
  // 当前商详数据。
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  // 商详加载状态。
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  // 商详错误文案。
  const [detailErrorMessage, setDetailErrorMessage] = useState('');
  // 商详抽屉状态。
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // 当前准备发布到闲鱼的商品。
  const [publishProduct, setPublishProduct] = useState<ProductDetail | null>(null);
  // 当前用于比价的来源商品。
  const [comparisonProduct, setComparisonProduct] = useState<ProductDetail | null>(null);
  // 是否已执行首页首次加载。
  const hasLoadedInitialProducts = useRef(false);
  // 最新搜索请求序号。
  const searchRequestSequence = useRef(0);
  // 最新秒杀请求序号。
  const seckillRequestSequence = useRef(0);
  // 最新商详请求序号。
  const detailRequestSequence = useRef(0);
  // 最新品牌请求序号。
  const brandRequestSequence = useRef(0);
  // 地址切换时使用的最新地区 ID。
  const currentRegionIdRef = useRef('3');
  // 当前地区配置。
  const currentRegion = REGION_OPTIONS.find((region) => region.id === regionId) ?? REGION_OPTIONS[0];
  // 当前是否处于首页浏览模式。
  const isBrowseMode = query.trim() === '' && (activeCategory === '全部货源' || activeCategory === '我的商品库');
  // 当前结果区标题。
  let resultTitle = getCatalogTitle(catalogMode, isBrowseMode, currentRegion.shortName);
  if (catalogMode === 'standard') {
    resultTitle = catalogDataSource === 'live' ? `${currentRegion.shortName}全部货源` : `${currentRegion.shortName}我的商品库`;
  }
  // 页面级接口加载状态。
  const isGlobalLoading = searchState.isLoading || seckillState.isLoading || isMarketplaceLoading;
  // 是否还能继续加载。
  const canLoadMore = catalogMode === 'seckill'
    ? seckillState.products.length < seckillState.total
    : searchState.products.length < searchState.total;
  // 库存筛选后的秒杀商品列表。
  const visibleSeckillProducts = useMemo(() => {
    // 当前分区下的秒杀商品。
    const activityProducts = selectedSeckillActivityId
      ? seckillState.products.filter((product) => product?.seckill_collection_id === selectedSeckillActivityId)
      : seckillState.products;

    return stockOnly
      ? activityProducts.filter((product) => getProductStock(product) > 0)
      : [...activityProducts];
  }, [seckillState.products, selectedSeckillActivityId, stockOnly]);
  // 当前优先展示的秒杀活动。
  const primarySeckillActivity = seckillState.activities.find((activity) => activity.status === 'ongoing')
    ?? seckillState.activities[0];
  // 按货号索引的渠道在售状态。
  const marketplacePlatformsByItemNo = useMemo(() => {
    // 货号到渠道集合的映射。
    const platformMap = new Map<string, Set<string>>();
    marketplaceListings.forEach((listing) => {
      const normalizedItemNo = normalizeMarketplaceItemNo(listing.itemNo);
      if (!normalizedItemNo) {
        return;
      }
      const platforms = platformMap.get(normalizedItemNo) ?? new Set<string>();
      platforms.add(listing.platform);
      platformMap.set(normalizedItemNo, platforms);
    });
    return platformMap;
  }, [marketplaceListings]);

  /** 返回商品当前在售渠道。 */
  function getProductMarketplacePlatforms(itemNo?: string): string[] {
    return Array.from(marketplacePlatformsByItemNo.get(normalizeMarketplaceItemNo(itemNo)) ?? []);
  }

  // 库存筛选后的商品列表；全局排序由本地商品库接口在分页前完成。
  const visibleProducts = useMemo(() => {
    return stockOnly
      ? searchState.products.filter((product) => getProductStock(product) > 0)
      : [...searchState.products];
  }, [searchState.products, stockOnly]);

  /** 执行商品查询。 */
  async function executeSearch({
    nextQuery,
    nextRegionId,
    nextPage = 1,
    append = false,
    recordHistory = true,
    nextBrandId = brandId,
    nextSortMode = sortMode,
    dataSource = catalogDataSource,
  }: {
    nextQuery: string;
    nextRegionId: string;
    nextPage?: number;
    append?: boolean;
    recordHistory?: boolean;
    nextBrandId?: string;
    nextSortMode?: SortMode;
    dataSource?: CatalogDataSource;
  }) {
    // 清理后的关键词。
    const trimmedQuery = nextQuery.trim();

    // 本次请求序号。
    const requestSequence = searchRequestSequence.current + 1;
    searchRequestSequence.current = requestSequence;
    setSearchState((currentState) => ({ ...currentState, isLoading: true, hasSearched: true, errorMessage: '' }));

    try {
      // 当前选中的聚合品牌。
      const selectedBrandOption = nextBrandId === 'all'
        ? undefined
        : brandOptions.find((brandOption) => brandOption.value === nextBrandId);
      // 商品查询结果。
      const searchFunction = dataSource === 'live' ? searchLiveProducts : searchProducts;
      const result = await searchFunction({
        query: trimmedQuery,
        mode: 'name',
        regionId: nextRegionId,
        page: nextPage,
        brandDistributorIds: selectedBrandOption?.distributorIds ?? [],
        goodsSort: getBackendGoodsSort(nextSortMode),
        localSort: dataSource === 'local' ? nextSortMode : undefined,
      });

      if (requestSequence !== searchRequestSequence.current) {
        return;
      }

      setSearchState((currentState) => ({
        products: append ? [...currentState.products, ...result.products] : result.products,
        similarProducts: result.similarProducts,
        total: result.total,
        page: nextPage,
        hasSearched: true,
        isLoading: false,
        errorMessage: '',
        updatedAt: TIME_FORMATTER.format(new Date()),
      }));

      if (recordHistory && trimmedQuery) {
        // 新增的最近查询记录。
        const nextRecentSearch: RecentSearch = { query: trimmedQuery, mode: 'name', regionId: nextRegionId };
        setRecentSearches((currentSearches) => saveRecentSearch(currentSearches, nextRecentSearch));
      }
    } catch (error) {
      if (requestSequence !== searchRequestSequence.current) {
        return;
      }

      // 用户可读错误信息。
      const errorMessage = error instanceof Error ? error.message : '查询失败，请稍后重试';
      setSearchState((currentState) => ({ ...currentState, isLoading: false, errorMessage }));
    }
  }

  /** 加载当前仓库范围的参与秒杀商品。 */
  async function loadSeckillProducts({
    nextRegionId,
    nextPage = 1,
    append = false,
  }: {
    nextRegionId: string;
    nextPage?: number;
    append?: boolean;
  }) {
    // 本次秒杀请求序号。
    const requestSequence = seckillRequestSequence.current + 1;
    seckillRequestSequence.current = requestSequence;
    setSeckillState((currentState) => ({ ...currentState, isLoading: true, errorMessage: '' }));

    try {
      // 后端聚合后的秒杀商品。
      const result = await fetchSeckillProducts(nextRegionId, nextPage);
      if (requestSequence !== seckillRequestSequence.current) {
        return;
      }

      setSeckillState((currentState) => ({
        products: append ? [...currentState.products, ...result.list] : result.list,
        activities: result.activities,
        total: result.total,
        page: nextPage,
        isLoading: false,
        errorMessage: '',
      }));
      if (!append) {
        setSelectedSeckillActivityId(result.activities[0]?.id ?? '');
      }
    } catch (error) {
      if (requestSequence !== seckillRequestSequence.current) {
        return;
      }

      // 用户可读秒杀错误。
      const errorMessage = error instanceof Error ? error.message : '秒杀商品加载失败';
      setSeckillState((currentState) => ({ ...currentState, isLoading: false, errorMessage }));
    }
  }

  /** 加载第三方渠道当前在售商品。 */
  async function loadMarketplaceListings() {
    setIsMarketplaceLoading(true);
    setMarketplaceErrorMessage('');
    try {
      // 当前闲鱼在售列表响应。
      const response = await fetchMarketplaceListings('xianyu');
      setMarketplaceListings(response.list ?? []);
      setMarketplaceLastSyncedAt(response.lastSyncedAt);
    } catch (error) {
      setMarketplaceErrorMessage(error instanceof Error ? error.message : '渠道在售状态加载失败');
    } finally {
      setIsMarketplaceLoading(false);
    }
  }

  /** 手动同步闲鱼在售状态并刷新本地列表。 */
  async function handleSyncMarketplaceListings() {
    setIsMarketplaceLoading(true);
    setMarketplaceErrorMessage('');
    try {
      await syncMarketplaceListings('xianyu');
      await loadMarketplaceListings();
    } catch (error) {
      setMarketplaceErrorMessage(error instanceof Error ? error.message : '同步闲鱼在售状态失败');
    } finally {
      setIsMarketplaceLoading(false);
    }
  }


  /** 按地区加载品牌门店，优先使用本地缓存。 */
  async function loadBrandOptions(nextRegionId: string, dataSource = catalogDataSource) {
    // 本次品牌请求序号。
    const requestSequence = brandRequestSequence.current + 1;
    brandRequestSequence.current = requestSequence;
    // 当前地区的品牌缓存。
    const cachedBrandOptions = dataSource === 'local' ? loadCachedBrandOptions(nextRegionId) : null;
    if (cachedBrandOptions) {
      setBrandOptions(cachedBrandOptions.options);
    }
    if (cachedBrandOptions?.isFresh && cachedBrandOptions.options.length > 0) {
      setIsBrandLoading(false);
      return;
    }
    setIsBrandLoading(!cachedBrandOptions);

    try {
      // 品牌馆接口返回的当前地区品牌门店。
      const nextBrandOptions = dataSource === 'live'
        ? await fetchLiveBrandOptions(nextRegionId)
        : await fetchBrandOptions(nextRegionId);
      if (requestSequence !== brandRequestSequence.current) {
        return;
      }
      setBrandOptions(nextBrandOptions);
      if (dataSource === 'local') {
        saveCachedBrandOptions(nextRegionId, nextBrandOptions);
      }
    } catch {
      if (requestSequence !== brandRequestSequence.current) {
        return;
      }
      if (!cachedBrandOptions) {
        setBrandOptions([]);
      }
    } finally {
      if (requestSequence === brandRequestSequence.current) {
        setIsBrandLoading(false);
      }
    }
  }

  /** 加载首页默认商品。 */
  function loadInitialProducts() {
    void loadMarketplaceListings();
    if (isCatalogSyncPageRoute()) {
      setCatalogMode('sync');
      setActiveCategory('同步配置');
      return;
    }
    if (isLocalCatalogPageRoute()) {
      setCatalogMode('standard');
      setCatalogDataSource('local');
      setSortMode('default');
      setActiveCategory('我的商品库');
      void executeSearch({ nextQuery: '', nextRegionId: '3', nextSortMode: 'default', recordHistory: false, dataSource: 'local' });
      void loadBrandOptions('3', 'local');
      return;
    }
    if (isMarketplacePageRoute()) {
      setCatalogMode('marketplace');
      setActiveCategory('渠道上架');
      return;
    }
    if (isSeckillPageRoute()) {
      setCatalogMode('seckill');
      setActiveCategory('秒杀专区');
      void loadSeckillProducts({ nextRegionId: currentRegionIdRef.current });
      return;
    }

    setCatalogDataSource('live');
    setSortMode('default');
    setActiveCategory('全部货源');
    void executeSearch({ nextQuery: '', nextRegionId: '3', nextSortMode: 'default', recordHistory: false, dataSource: 'live' });
    void loadBrandOptions('3', 'live');
  }

  /** 根据地址切换独立秒杀页或选品主页。 */
  function handleRouteChange() {
    if (isCatalogSyncPageRoute()) {
      setCatalogMode('sync');
      setActiveCategory('同步配置');
      setQuery('');
      return;
    }
    if (isLocalCatalogPageRoute()) {
      setCatalogMode('standard');
      setCatalogDataSource('local');
      setSortMode('default');
      setActiveCategory('我的商品库');
      setQuery('');
      setBrandId('all');
      void executeSearch({ nextQuery: '', nextRegionId: currentRegionIdRef.current, nextSortMode: 'default', recordHistory: false, dataSource: 'local', nextBrandId: 'all' });
      void loadBrandOptions(currentRegionIdRef.current, 'local');
      return;
    }
    if (isMarketplacePageRoute()) {
      setCatalogMode('marketplace');
      setActiveCategory('渠道上架');
      setQuery('');
      void loadMarketplaceListings();
      return;
    }
    if (isSeckillPageRoute()) {
      setCatalogMode('seckill');
      setActiveCategory('秒杀专区');
      setQuery('');
      void loadSeckillProducts({ nextRegionId: currentRegionIdRef.current });
      return;
    }

    setCatalogMode('standard');
    setCatalogDataSource('live');
    setSortMode('default');
    setActiveCategory('全部货源');
    void executeSearch({ nextQuery: '', nextRegionId: currentRegionIdRef.current, nextSortMode: 'default', recordHistory: false, dataSource: 'live' });
    void loadBrandOptions(currentRegionIdRef.current, 'live');
  }

  /** 打开独立秒杀页。 */
  function handleOpenSeckillPage() {
    if (isSeckillPageRoute()) {
      void loadSeckillProducts({ nextRegionId: regionId });
      return;
    }

    window.location.hash = '/seckill';
  }

  /** 打开独立渠道上架页。 */
  function handleOpenMarketplacePage() {
    if (isMarketplacePageRoute()) {
      void loadMarketplaceListings();
      return;
    }

    window.location.hash = '/marketplace';
  }

  /** 打开品牌同步配置页。 */
  function handleOpenCatalogSyncPage() {
    if (isCatalogSyncPageRoute()) {
      return;
    }
    window.location.hash = '/sync';
  }

  /** 打开本地商品库页面。 */
  function handleOpenLocalCatalogPage() {
    if (isLocalCatalogPageRoute()) {
      return;
    }
    window.location.hash = '/library';
  }

  /** 返回选品主页。 */
  function handleReturnToStorefront() {
    if (window.location.hash === '#/home') {
      handleRouteChange();
      return;
    }

    window.location.hash = '/home';
  }

  useEffect(() => {
    if (hasLoadedInitialProducts.current) {
      return;
    }

    hasLoadedInitialProducts.current = true;
    loadInitialProducts();
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  /** 提交搜索表单。 */
  function handleSubmitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.history.replaceState(null, '', catalogDataSource === 'live' ? '#/home' : '#/library');
    setCatalogMode('standard');
    setActiveCategory(catalogDataSource === 'live' ? '全部货源' : '我的商品库');
    void executeSearch({ nextQuery: query, nextRegionId: regionId, dataSource: catalogDataSource });
  }

  /** 切换查询地区并加载该地区首页商品。 */
  function handleChangeRegion(nextRegionId: string) {
    currentRegionIdRef.current = nextRegionId;
    setRegionId(nextRegionId);
    setQuery('');
    let nextActiveCategory = catalogDataSource === 'live' ? '全部货源' : '我的商品库';
    if (catalogMode === 'seckill') {
      nextActiveCategory = '秒杀专区';
    } else if (catalogMode === 'marketplace') {
      nextActiveCategory = '渠道上架';
    }
    setActiveCategory(nextActiveCategory);
    setBrandId('all');
    setBrandOptions([]);
    brandRequestSequence.current += 1;
    void loadBrandOptions(nextRegionId, catalogDataSource);
    if (catalogMode === 'seckill') {
      void loadSeckillProducts({ nextRegionId });
      return;
    }
    if (catalogMode === 'marketplace') {
      return;
    }

    void executeSearch({ nextQuery: '', nextRegionId, nextBrandId: 'all', recordHistory: false, dataSource: catalogDataSource });
  }

  /** 选择首页快捷分类。 */
  function handleSelectCategory(categoryName: string) {
    if (categoryName === '全部货源') {
      window.location.hash = '/home';
      return;
    }
    if (categoryName === '我的商品库') {
      handleOpenLocalCatalogPage();
      return;
    }
    if (categoryName === '秒杀专区') {
      handleOpenSeckillPage();
      return;
    }
    if (categoryName === '渠道上架') {
      handleOpenMarketplacePage();
      return;
    }
    if (categoryName === '同步配置') {
      handleOpenCatalogSyncPage();
      return;
    }

    // 全部分类对应的空关键词。
    const categoryQuery = categoryName === '全部货源' ? '' : categoryName;

    window.history.replaceState(null, '', '#/home');
    setCatalogMode('standard');
    setActiveCategory(categoryName);
    setQuery(categoryQuery);
    void executeSearch({ nextQuery: categoryQuery, nextRegionId: regionId, recordHistory: false, dataSource: catalogDataSource });
  }

  /** 切换品牌门店筛选。 */
  function handleChangeBrand(nextBrandId: string) {
    setBrandId(nextBrandId);
    void executeSearch({
      nextQuery: query,
      nextRegionId: regionId,
      nextBrandId,
      recordHistory: false,
      dataSource: catalogDataSource,
    });
  }

  /** 切换排序并从后端重新获取第一页。 */
  function handleChangeSort(nextSortMode: SortMode) {
    setSortMode(nextSortMode);
    void executeSearch({
      nextQuery: query,
      nextRegionId: regionId,
      nextSortMode,
      recordHistory: false,
      dataSource: catalogDataSource,
    });
  }

  /** 重新加载当前结果。 */
  function handleRefreshProducts() {
    if (catalogMode === 'seckill') {
      void loadSeckillProducts({ nextRegionId: regionId });
      return;
    }

    void executeSearch({ nextQuery: query, nextRegionId: regionId, recordHistory: false, dataSource: catalogDataSource });
  }

  /** 加载下一页名称搜索结果。 */
  function handleLoadMore() {
    if (catalogMode === 'seckill') {
      void loadSeckillProducts({
        nextRegionId: regionId,
        nextPage: seckillState.page + 1,
        append: true,
      });
      return;
    }

    void executeSearch({ nextQuery: query, nextRegionId: regionId, nextPage: searchState.page + 1, append: true, recordHistory: false, dataSource: catalogDataSource });
  }

  /** 复用最近查询。 */
  function handleUseRecentSearch(recentSearch: RecentSearch) {
    currentRegionIdRef.current = recentSearch.regionId;
    setCatalogMode('standard');
    setQuery(recentSearch.query);
    setRegionId(recentSearch.regionId);
    setActiveCategory(catalogDataSource === 'live' ? '全部货源' : '我的商品库');
    void executeSearch({ nextQuery: recentSearch.query, nextRegionId: recentSearch.regionId, recordHistory: false, dataSource: catalogDataSource });
  }

  /** 打开商品完整详情。 */
  async function handleOpenProduct(product: ProductSummary) {
    // 商详 Item ID。
    const itemId = getDetailItemId(product);

    if (!itemId) {
      return;
    }

    // 本次详情请求序号。
    const requestSequence = detailRequestSequence.current + 1;
    detailRequestSequence.current = requestSequence;
    setSelectedProduct(null);
    setDetailErrorMessage('');
    setIsDetailLoading(true);
    setIsDetailOpen(true);

    try {
      // 商品自身仓库 ID；“全部”模式下商详仍必须指定具体仓库。
      const productRegionId = product?.regionauth_id
        ?? product?.distributor_info?.regionauth_id
        ?? regionId;
      // 完整商品详情。
      const productDetail = catalogDataSource === 'live'
        ? await fetchLiveProductDetail(itemId, productRegionId)
        : await fetchProductDetail(itemId, productRegionId);

      if (requestSequence !== detailRequestSequence.current) {
        return;
      }

      setSelectedProduct({
        ...product,
        ...productDetail,
        regionauth_id: productDetail?.regionauth_id ?? product?.regionauth_id,
        distributor_info: productDetail?.distributor_info ?? product?.distributor_info,
      });
      setIsDetailLoading(false);
    } catch (error) {
      if (requestSequence !== detailRequestSequence.current) {
        return;
      }

      // 用户可读详情错误。
      const errorMessage = error instanceof Error ? error.message : '商详加载失败';
      setDetailErrorMessage(errorMessage);
      setIsDetailLoading(false);
    }
  }

  /** 关闭商品详情。 */
  function handleCloseDetail() {
    detailRequestSequence.current += 1;
    setIsDetailOpen(false);
  }

  /** 打开闲鱼发布确认面板。 */
  function handleOpenPublish(product: ProductDetail) {
    setPublishProduct(product);
  }

  /** 关闭闲鱼发布确认面板。 */
  function handleClosePublish() {
    setPublishProduct(null);
  }

  /** 打开当前商品的一键比价弹窗。 */
  function handleCompareProduct(product: ProductDetail) {
    setComparisonProduct(product);
  }

  /** 关闭一键比价弹窗。 */
  function handleCloseComparison() {
    setComparisonProduct(null);
  }

  /** 刷新当前本地商品并重新读取详情。 */
  async function handleRefreshSelectedProduct(product: ProductDetail) {
    const offerId = product.catalog_offer_id;
    if (!offerId) {
      return;
    }
    setIsDetailLoading(true);
    setDetailErrorMessage('');
    try {
      await refreshCatalogOffer(offerId);
      const refreshedProduct = await fetchProductDetail(offerId, product.regionauth_id ?? regionId);
      setSelectedProduct(refreshedProduct);
    } catch (error) {
      setDetailErrorMessage(error instanceof Error ? error.message : '商品刷新失败');
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <div className="storefront">
      {isGlobalLoading ? <div className="global-loading-bar" aria-label="数据加载中"><i /></div> : null}
      <header className="store-header">
        <div className="store-header__inner">
          <a href="#home" className="store-logo" aria-label="SideJob Select 首页">
            <span>SJ</span><div><strong>SideJob</strong><small>OUTLET SELECT</small></div>
          </a>

          <form className="header-search" onSubmit={handleSubmitSearch}>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索商品名称、品牌或货号" aria-label="搜索商品" />
            <button type="submit" aria-label="提交搜索"><SearchIcon /><span>搜索</span></button>
          </form>

          <XianyuConnectionControl />

          <label className="region-picker">
            <PinIcon /><span>仓库范围</span>
            <Select
              value={regionId}
              onChange={handleChangeRegion}
              options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.shortName }))}
              aria-label="仓库范围"
            />
          </label>
        </div>
      </header>

      <nav className="category-nav" aria-label="商品分类">
        <div className="category-nav__inner">
          {PRIMARY_NAV_ITEMS.map((categoryName) => (
            <button type="button" className={activeCategory === categoryName ? 'category-nav__item category-nav__item--active' : 'category-nav__item'} key={categoryName} onClick={() => handleSelectCategory(categoryName)}>
              {categoryName}
            </button>
          ))}
        </div>
      </nav>

      {catalogMode === 'sync' ? (
        <CatalogSyncPage onBack={handleReturnToStorefront} />
      ) : catalogMode === 'marketplace' ? (
        <MarketplacePage
          listings={marketplaceListings}
          lastSyncedAt={marketplaceLastSyncedAt}
          isLoading={isMarketplaceLoading}
          errorMessage={marketplaceErrorMessage}
          onBack={handleReturnToStorefront}
          onRefresh={handleSyncMarketplaceListings}
        />
      ) : (
      <main id="home">
        {catalogMode === 'standard' ? (
          <>
            {recentSearches.length > 0 ? (
              <section className="recent-strip">
                <span>最近搜索</span>
                <div>{recentSearches.map((recentSearch) => <button type="button" key={`${recentSearch.regionId}-${recentSearch.mode}-${recentSearch.query}`} onClick={() => handleUseRecentSearch(recentSearch)}>{recentSearch.query}</button>)}</div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="seckill-page-intro">
            <button type="button" onClick={handleReturnToStorefront}>← 返回选品仓</button>
            <span>LIMITED TIME / LIVE INVENTORY</span>
            <strong>限时秒杀</strong>
            <p>当前活动商品、实时价格与库存，一页看清。</p>
          </section>
        )}

        <section className="catalog-section">
          {catalogMode === 'seckill' ? (
            <>
              <div className="seckill-shelf-heading">
                <div>
                  <span className="seckill-shelf-heading__eyebrow">FLASH SELECTION · {currentRegion.shortName}</span>
                  <h2>{resultTitle}</h2>
                  <p>{seckillState.total.toLocaleString('zh-CN')} 件商品正在参与限时活动</p>
                </div>
                <div className="seckill-shelf-heading__meta">
                  <strong>{primarySeckillActivity?.status === 'ongoing' ? '正在秒杀' : '即将开抢'}</strong>
                  <span>{primarySeckillActivity ? formatPromotionEndTime(primarySeckillActivity.endTime) : '等待活动数据'}</span>
                  <button type="button" className="refresh-button refresh-button--light" onClick={handleRefreshProducts} disabled={seckillState.isLoading}><RefreshIcon /><span>刷新</span></button>
                </div>
              </div>

              {seckillState.activities.length > 0 ? (
                <div className="seckill-activity-strip" aria-label="当前秒杀场次">
                  {seckillState.activities.map((activity) => (
                    <button type="button" key={`${activity.regionId}-${activity.id}`} onClick={() => setSelectedSeckillActivityId(activity.id)} className={selectedSeckillActivityId === activity.id ? 'seckill-activity-chip seckill-activity-chip--active' : 'seckill-activity-chip'}>
                      <i>{activity.status === 'ongoing' ? 'LIVE' : 'NEXT'}</i>{activity.name || `${getWarehouseName(activity.regionId)}秒杀`}
                    </button>
                  ))}
                </div>
              ) : null}

              {seckillState.isLoading ? <div className="catalog-loading-indicator"><Spin size="small" /><span>正在核对秒杀场次与商品…</span></div> : null}
              {seckillState.errorMessage ? <div className="notice notice--error">{seckillState.errorMessage}</div> : null}
              {seckillState.isLoading && seckillState.products.length === 0 ? <ProductGridSkeleton /> : null}
              {!seckillState.isLoading && !seckillState.errorMessage && visibleSeckillProducts.length === 0 ? <div className="empty-state empty-state--seckill"><strong>当前没有进行中的秒杀商品</strong><p>切换仓库或稍后刷新，活动开始后商品会自动出现在这里。</p></div> : null}
              {visibleSeckillProducts.length > 0 ? <div className="product-grid">{visibleSeckillProducts.map((product) => <ProductCard key={`seckill-${product?.regionauth_id}-${product?.goods_id}-${product?.item_id}`} product={product} marketplacePlatforms={getProductMarketplacePlatforms(product?.item_no)} dataSource="live" onOpen={handleOpenProduct} />)}</div> : null}
              {canLoadMore ? <button type="button" className="load-more" onClick={handleLoadMore} disabled={seckillState.isLoading}>{seckillState.isLoading ? '正在加载…' : `加载更多秒杀商品 · ${PRODUCT_PAGE_SIZE} 件`}</button> : null}
            </>
          ) : (
            <>
              <div className="catalog-heading">
                <div>
                  <span className="catalog-heading__eyebrow">{catalogDataSource === 'live' ? 'LIVE FROM THE OUTLET' : 'YOUR LOCAL CATALOG'}</span>
                  <h2>{resultTitle}</h2>
                  <p>共找到 {searchState.total.toLocaleString('zh-CN')} 件商品</p>
                </div>
                <div className="catalog-controls">
                  <Select className="brand-select" value={brandId} onChange={handleChangeBrand} loading={isBrandLoading} showSearch optionFilterProp="label" popupMatchSelectWidth={260} options={[{ value: 'all', label: '全部品牌' }, ...brandOptions]} aria-label="品牌筛选" />
                  <label className="stock-toggle"><Switch size="small" checked={stockOnly} onChange={setStockOnly} /><span>只看有货</span></label>
                  <Select className="sort-select" value={sortMode} onChange={handleChangeSort} options={getCatalogSortOptions(catalogDataSource)} aria-label="商品排序" />
                  <button type="button" className="refresh-button" onClick={handleRefreshProducts} disabled={searchState.isLoading}><RefreshIcon /><span>{searchState.updatedAt || '刷新'}</span></button>
                </div>
              </div>
              {searchState.isLoading ? <div className="catalog-loading-indicator"><Spin size="small" /><span>{catalogDataSource === 'live' ? '正在获取小程序实时商品…' : '正在读取本地商品库…'}</span></div> : null}
              {searchState.errorMessage ? <div className="notice notice--error">{searchState.errorMessage}</div> : null}
              {searchState.isLoading && searchState.products.length === 0 ? <ProductGridSkeleton /> : null}
              {!searchState.isLoading && !searchState.errorMessage && visibleProducts.length === 0 ? <div className="empty-state"><strong>{catalogDataSource === 'live' ? '没有找到符合条件的实时商品' : '本地商品库还没有符合条件的商品'}</strong><p>{catalogDataSource === 'live' ? '换个关键词或切换其他仓库试试。' : '前往同步配置，启用品牌并完成首次同步。'}</p></div> : null}
              {visibleProducts.length > 0 ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={`${product?.catalog_offer_id ?? product?.regionauth_id}-${product?.goods_id}-${product?.item_id}`} product={product} marketplacePlatforms={getProductMarketplacePlatforms(product?.item_no)} dataSource={catalogDataSource} onOpen={handleOpenProduct} />)}</div> : null}
              {canLoadMore ? <button type="button" className="load-more" onClick={handleLoadMore} disabled={searchState.isLoading}>{searchState.isLoading ? '正在加载…' : `加载更多商品 · ${PRODUCT_PAGE_SIZE} 件`}</button> : null}
            </>
          )}
        </section>
      </main>
      )}

      {isDetailOpen ? (
        <ProductDetailDrawer
          product={selectedProduct}
          isLoading={isDetailLoading}
          errorMessage={detailErrorMessage}
          marketplacePlatforms={getProductMarketplacePlatforms(selectedProduct?.item_no)}
          isLocalCatalog={catalogDataSource === 'local'}
          onClose={handleCloseDetail}
          onRefresh={handleRefreshSelectedProduct}
          onPublish={handleOpenPublish}
          onCompare={handleCompareProduct}
        />
      ) : null}
      {publishProduct ? (
        <PublishProductModal
          key={publishProduct?.default_item_id ?? publishProduct?.item_id}
          product={publishProduct}
          onClose={handleClosePublish}
          onPublished={loadMarketplaceListings}
        />
      ) : null}
      {comparisonProduct ? (
        <PriceComparisonModal
          product={{
            sourceItemId: comparisonProduct.default_item_id ?? comparisonProduct.item_id,
            itemNo: comparisonProduct.item_no,
            brand: comparisonProduct.goods_brand,
            name: comparisonProduct.item_name ?? '',
            imageUrl: comparisonProduct.main_img ?? comparisonProduct.pics?.[0],
            priceCents: getEffectivePrice(comparisonProduct),
            originalPriceCents: Number(comparisonProduct.market_price ?? 0),
          }}
          onClose={handleCloseComparison}
        />
      ) : null}
    </div>
  );
}
