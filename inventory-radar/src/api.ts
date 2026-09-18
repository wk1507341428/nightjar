import { API_BASE_URL, COMPANY_ID, PRODUCT_PAGE_SIZE, SIDEJOB_API_BASE_URL } from './constants';
import type {
  BrandOption,
  ProductDetail,
  ProductDetailResponse,
  ProductPurchaseNoticeResponse,
  ProductSearchResponse,
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
}

/** 商品查询结果。 */
interface SearchProductsResult {
  products: ProductSummary[];
  similarProducts: ProductSummary[];
  total: number;
}

/** 将货号标准化后用于精确比较。 */
function normalizeItemNo(itemNo: string): string {
  return itemNo.trim().toUpperCase();
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

/** 构造商品列表请求地址。 */
function buildSearchUrl(
  query: string,
  regionId: string,
  page: number,
  brandId?: string,
  goodsSort?: number,
  pageSize = PRODUCT_PAGE_SIZE,
): URL {
  // 商品搜索地址。
  const requestUrl = new URL(`${API_BASE_URL}/goods/items`);

  requestUrl.searchParams.set('company_id', COMPANY_ID);
  requestUrl.searchParams.set('regionauth_id', regionId);
  requestUrl.searchParams.set('page', String(page));
  requestUrl.searchParams.set('pageSize', String(pageSize));
  requestUrl.searchParams.set('keywords', query.trim());
  requestUrl.searchParams.set('approve_status', 'onsale,only_show');
  requestUrl.searchParams.set('item_type', 'normal');
  requestUrl.searchParams.set('is_point', 'false');
  if (brandId) {
    requestUrl.searchParams.set('distributor_id', brandId);
  }
  if (goodsSort) {
    requestUrl.searchParams.set('goodsSort', String(goodsSort));
  }

  return requestUrl;
}

/** 查询单页商品数据。 */
async function fetchProductPage(
  query: string,
  regionId: string,
  page: number,
  brandId?: string,
  goodsSort?: number,
  pageSize = PRODUCT_PAGE_SIZE,
): Promise<ProductSearchResponse> {
  // 当前页请求地址。
  const requestUrl = buildSearchUrl(query, regionId, page, brandId, goodsSort, pageSize);

  return requestJson<ProductSearchResponse>(requestUrl);
}

/** 按名称模糊搜索，或按货号进行精确匹配。 */
export async function searchProducts({
  query,
  mode,
  regionId,
  page = 1,
  brandDistributorIds = [],
  goodsSort,
}: SearchProductsParams): Promise<SearchProductsResult> {
  if (brandDistributorIds.length > 1) {
    // 每个品牌门店的分页大小，合并后保持一页约 24 件。
    const pageSizePerDistributor = Math.max(1, Math.ceil(PRODUCT_PAGE_SIZE / brandDistributorIds.length));
    // 同品牌不同门店的并行响应。
    const brandResponses = await Promise.all(
      brandDistributorIds.map((distributorId) => (
        fetchProductPage(query, regionId, page, distributorId, goodsSort, pageSizePerDistributor)
      )),
    );
    // 按门店轮询交错后的商品，避免单一仓库占满首屏。
    const interleavedProducts = interleaveProductLists(
      brandResponses.map((response) => response?.data?.list ?? []),
    ).slice(0, PRODUCT_PAGE_SIZE);

    return {
      products: interleavedProducts,
      similarProducts: [],
      total: brandResponses.reduce((total, response) => total + Number(response?.data?.total_count ?? 0), 0),
    };
  }

  // 单门店品牌筛选 ID。
  const brandId = brandDistributorIds[0];
  // 首屏搜索响应。
  const firstResponse = await fetchProductPage(query, regionId, page, brandId, goodsSort);
  // 首屏商品列表。
  const firstPageProducts = firstResponse?.data?.list ?? [];
  // 搜索命中总量。
  const total = firstResponse?.data?.total_count ?? 0;

  if (mode === 'name') {
    return {
      products: firstPageProducts,
      similarProducts: [],
      total,
    };
  }

  // 目标标准货号。
  const normalizedQuery = normalizeItemNo(query);
  // 首屏精确匹配结果。
  const firstExactMatches = firstPageProducts.filter(
    (product) => normalizeItemNo(product?.item_no ?? '') === normalizedQuery,
  );

  if (firstExactMatches.length > 0 || total <= PRODUCT_PAGE_SIZE) {
    return {
      products: firstExactMatches,
      similarProducts: firstPageProducts.filter(
        (product) => normalizeItemNo(product?.item_no ?? '') !== normalizedQuery,
      ),
      total: firstExactMatches.length,
    };
  }

  // 最多补查后续四页，避免一次货号查询产生过多请求。
  const pageCount = Math.min(Math.ceil(total / PRODUCT_PAGE_SIZE), 5);
  // 后续页码。
  const remainingPages = Array.from(
    { length: pageCount - 1 },
    (_, pageIndex) => pageIndex + 2,
  );
  // 后续页面并行响应。
  const remainingResponses = await Promise.all(
    remainingPages.map((pageNumber) => fetchProductPage(query, regionId, pageNumber, brandId, goodsSort)),
  );
  // 合并后的候选商品。
  const candidateProducts = [
    ...firstPageProducts,
    ...remainingResponses.flatMap((response) => response?.data?.list ?? []),
  ];
  // 全部精确匹配商品。
  const exactProducts = candidateProducts.filter(
    (product) => normalizeItemNo(product?.item_no ?? '') === normalizedQuery,
  );

  return {
    products: exactProducts,
    similarProducts: candidateProducts.filter(
      (product) => normalizeItemNo(product?.item_no ?? '') !== normalizedQuery,
    ),
    total: exactProducts.length,
  };
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
  // 品牌馆完整门店请求地址。
  const requestUrl = new URL(`${API_BASE_URL}/distributor/get_all_distributor`);

  requestUrl.searchParams.set('company_id', COMPANY_ID);
  requestUrl.searchParams.set('regionauth_id', regionId);
  requestUrl.searchParams.set('page', '1');
  requestUrl.searchParams.set('pageSize', '1000');
  requestUrl.searchParams.set('sort_type', '5');

  // 小程序品牌馆接口响应。
  const response = await requestJson<{
    data?: {
      list?: Array<{
        distributor_id?: string;
        name?: string;
        shop_code?: string;
        regionauth_id?: string;
        online_goods_num?: string | number;
      }>;
    };
  }>(requestUrl);
  // 当前地区返回的完整有效品牌门店。
  const validDistributors = response?.data?.list?.filter((distributor) => (
    Boolean(distributor?.distributor_id)
    && Boolean(distributor?.name)
  )) ?? [];

  return validDistributors
    .map((distributor) => ({
      value: `distributor:${distributor.distributor_id}`,
      label: distributor.name?.trim() ?? '',
      shopCode: distributor.shop_code,
      distributorIds: distributor.distributor_id ? [distributor.distributor_id] : [],
      distributorIdsByRegion: distributor.distributor_id
        ? { [regionId]: distributor.distributor_id }
        : undefined,
    }))
    .sort((firstBrand, secondBrand) => firstBrand.label.localeCompare(secondBrand.label, 'zh-CN'));
}

/** 获取指定商品的完整商详。 */
export async function fetchProductDetail(
  itemId: string,
  regionId: string,
): Promise<ProductDetail> {
  // 商品详情地址。
  const requestUrl = new URL(`${API_BASE_URL}/goods/items/${itemId}`);

  requestUrl.searchParams.set('company_id', COMPANY_ID);
  requestUrl.searchParams.set('regionauth_id', regionId);

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
  const [response, purchaseNoticeResponse] = await Promise.all([
    requestJson<ProductDetailResponse>(requestUrl),
    purchaseNoticeRequest.catch(() => ({ data: undefined })),
  ]);
  // 商品详情数据。
  const productDetail = response?.data;

  if (!productDetail) {
    throw new Error(response?.message || '未获取到商品详情');
  }

  return {
    ...productDetail,
    purchase_notice: purchaseNoticeResponse?.data?.product_purchase_notice,
    purchase_notice_open: purchaseNoticeResponse?.data?.product_purchase_notice_open === true,
  };
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
