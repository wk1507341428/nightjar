import { API_BASE_URL, COMPANY_ID, PRODUCT_PAGE_SIZE, SIDEJOB_API_BASE_URL } from './constants';
import type {
  BrandOption,
  ProductDetail,
  ProductPurchaseNoticeResponse,
  ProductSummary,
  SearchMode,
  SeckillProductsResponse,
} from './types';

/** 各地区购买须知请求缓存。 */
const purchaseNoticeRequestCache = new Map<string, Promise<ProductPurchaseNoticeResponse>>();

/** 商品查询参数。 */
interface SearchProductsParams {
  query: string;
  mode: SearchMode;
  regionId: string;
  page?: number;
  brandDistributorIds?: string[];
  goodsSort?: number;
  localSort?: string;
}

/** 商品查询结果。 */
interface SearchProductsResult {
  products: ProductSummary[];
  similarProducts: ProductSummary[];
  total: number;
}

/** 构造小程序实时商品列表请求。 */
function buildLiveSearchUrl(query: string, regionId: string, page: number, distributorId?: string, goodsSort?: number): URL {
  const requestUrl = new URL(`${API_BASE_URL}/goods/items`);
  requestUrl.searchParams.set('company_id', COMPANY_ID);
  requestUrl.searchParams.set('regionauth_id', regionId);
  requestUrl.searchParams.set('page', String(page));
  requestUrl.searchParams.set('pageSize', String(PRODUCT_PAGE_SIZE));
  requestUrl.searchParams.set('keywords', query.trim());
  requestUrl.searchParams.set('approve_status', 'onsale,only_show');
  requestUrl.searchParams.set('item_type', 'normal');
  requestUrl.searchParams.set('is_point', 'false');
  if (distributorId) {
    requestUrl.searchParams.set('distributor_id', distributorId);
  }
  if (goodsSort) {
    requestUrl.searchParams.set('goodsSort', String(goodsSort));
  }
  return requestUrl;
}

/** 请求并解析 JSON 数据。 */
async function requestJson<ResponseType>(url: URL): Promise<ResponseType> {
  // 接口响应对象。
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`请求失败（HTTP ${response.status}）`);
  }

  return response.json() as Promise<ResponseType>;
}

/** 请求 SideJob 本地商品库接口。 */
async function requestCatalog<ResponseType>(path: string, query?: Record<string, string>): Promise<ResponseType> {
  // 本地商品库请求地址。
  const requestUrl = new URL(`${SIDEJOB_API_BASE_URL}${path}`, window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => requestUrl.searchParams.set(key, value));
  return requestJson<ResponseType>(requestUrl);
}

/** 按名称模糊搜索，或按货号进行精确匹配。 */
export async function searchProducts({
  query,
  mode,
  regionId,
  page = 1,
  brandDistributorIds = [],
  goodsSort,
  localSort,
}: SearchProductsParams): Promise<SearchProductsResult> {
  // 当前选中的本地品牌门店。
  const brandStoreId = brandDistributorIds[0] ?? 'all';
  // 本地商品库排序字段。
  let catalogSort = '';
  if (localSort === 'xianyuLast') {
    catalogSort = 'xianyuLast';
  } else if (goodsSort === 3) {
    catalogSort = 'priceAsc';
  } else if (goodsSort === 2) {
    catalogSort = 'priceDesc';
  }
  // 本地商品库搜索结果。
  const response = await requestCatalog<{ list?: ProductSummary[]; total?: number }>('/catalog/offers', {
    regionId,
    brandStoreId,
    keyword: query.trim(),
    page: String(page),
    pageSize: String(PRODUCT_PAGE_SIZE),
    stockOnly: 'false',
    sort: catalogSort,
  });
  return {
    products: response?.list ?? [],
    similarProducts: [],
    total: Number(response?.total ?? 0),
  };
}

/** 查询小程序实时货源。 */
export async function searchLiveProducts({ query, regionId, page = 1, brandDistributorIds = [], goodsSort }: SearchProductsParams): Promise<SearchProductsResult> {
  const distributorId = brandDistributorIds[0];
  const response = await requestJson<{ data?: { list?: ProductSummary[]; total_count?: number } }>(buildLiveSearchUrl(query, regionId, page, distributorId, goodsSort));
  return { products: response?.data?.list ?? [], similarProducts: [], total: Number(response?.data?.total_count ?? 0) };
}

/** 将多个门店商品列表按索引交错合并。 */
function interleaveProductLists(productLists: ProductSummary[][]): ProductSummary[] {
  // 最长门店列表长度。
  const maxListLength = Math.max(0, ...productLists.map((productList) => productList.length));
  // 交错后的商品列表。
  const mergedProducts: ProductSummary[] = [];

  for (let productIndex = 0; productIndex < maxListLength; productIndex += 1) {
    productLists.forEach((productList) => {
      const product = productList[productIndex];
      if (product) {
        mergedProducts.push(product);
      }
    });
  }
  return mergedProducts;
}

/** 按地区加载小程序品牌馆的完整在售品牌门店。 */
export async function fetchBrandOptions(regionId: string): Promise<BrandOption[]> {
  // 当前地区已启用的本地品牌门店。
  const response = await requestCatalog<Array<{ id?: string; brandName?: string; shopCode?: string; syncEnabled?: boolean }>>('/catalog/brand-stores', { regionId });
  return (response ?? [])
    .filter((brandStore) => brandStore?.syncEnabled && Boolean(brandStore?.id) && Boolean(brandStore?.brandName))
    .map((brandStore) => ({ value: brandStore.id ?? '', label: brandStore.brandName ?? '', shopCode: brandStore.shopCode, distributorIds: brandStore.id ? [brandStore.id] : [] }))
    .sort((firstBrand, secondBrand) => firstBrand.label.localeCompare(secondBrand.label, 'zh-CN'));
}

/** 读取小程序实时品牌门店列表。 */
export async function fetchLiveBrandOptions(regionId: string): Promise<BrandOption[]> {
  const requestUrl = new URL(`${API_BASE_URL}/distributor/get_all_distributor`);
  requestUrl.searchParams.set('company_id', COMPANY_ID);
  requestUrl.searchParams.set('regionauth_id', regionId);
  requestUrl.searchParams.set('page', '1');
  requestUrl.searchParams.set('pageSize', '1000');
  requestUrl.searchParams.set('sort_type', '5');
  const response = await requestJson<{ data?: { list?: Array<{ distributor_id?: string; name?: string; shop_code?: string }> } }>(requestUrl);
  return (response?.data?.list ?? []).filter((brandStore) => Boolean(brandStore?.distributor_id) && Boolean(brandStore?.name)).map((brandStore) => ({ value: `live:${brandStore.distributor_id}`, label: brandStore.name?.trim() ?? '', shopCode: brandStore.shop_code, distributorIds: brandStore.distributor_id ? [brandStore.distributor_id] : [] })).sort((firstBrand, secondBrand) => firstBrand.label.localeCompare(secondBrand.label, 'zh-CN'));
}

/** 获取指定商品的完整商详。 */
export async function fetchProductDetail(
  itemId: string,
  regionId: string,
): Promise<ProductDetail> {
  // 本地商品详情响应。
  const productDetail = await requestCatalog<ProductDetail>(`/catalog/offers/${encodeURIComponent(itemId)}`);

  // 当前地区购买须知地址。
  const purchaseNoticeUrl = new URL(`${API_BASE_URL}/setting/itemNotice`);
  purchaseNoticeUrl.searchParams.set('company_id', COMPANY_ID);
  purchaseNoticeUrl.searchParams.set('regionauth_id', regionId);
  // 地区级购买须知请求。
  let purchaseNoticeRequest = purchaseNoticeRequestCache.get(regionId);
  if (!purchaseNoticeRequest) {
    purchaseNoticeRequest = requestJson<ProductPurchaseNoticeResponse>(purchaseNoticeUrl);
    purchaseNoticeRequestCache.set(regionId, purchaseNoticeRequest);
  }
  // 商品详情和购买须知并行响应。
  const purchaseNoticeResponse = await purchaseNoticeRequest.catch(() => ({ data: undefined }));

  if (!productDetail) {
    throw new Error('未获取到本地商品详情');
  }

  return {
    ...productDetail,
    purchase_notice: purchaseNoticeResponse?.data?.product_purchase_notice,
    purchase_notice_open: purchaseNoticeResponse?.data?.product_purchase_notice_open === true,
  };
}

/** 获取小程序实时商品详情。 */
export async function fetchLiveProductDetail(itemId: string, regionId: string): Promise<ProductDetail> {
  const requestUrl = new URL(`${API_BASE_URL}/goods/items/${itemId}`);
  requestUrl.searchParams.set('company_id', COMPANY_ID);
  requestUrl.searchParams.set('regionauth_id', regionId);
  const response = await requestJson<{ data?: ProductDetail; message?: string }>(requestUrl);
  if (!response?.data) {
    throw new Error(response?.message ?? '未获取到实时商品详情');
  }
  return response.data;
}

/** 从 SideJob 服务获取指定地区的秒杀商品。 */
export async function fetchSeckillProducts(
  regionId: string,
  page = 1,
  pageSize = PRODUCT_PAGE_SIZE,
): Promise<SeckillProductsResponse> {
  // 秒杀专区请求地址。
  const requestUrl = new URL(`${SIDEJOB_API_BASE_URL}/catalog/seckill`, window.location.origin);

  requestUrl.searchParams.set('regionId', regionId);
  requestUrl.searchParams.set('page', String(page));
  requestUrl.searchParams.set('pageSize', String(pageSize));

  return requestJson<SeckillProductsResponse>(requestUrl);
}
