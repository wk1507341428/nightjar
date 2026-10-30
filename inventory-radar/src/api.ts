import { PRODUCT_PAGE_SIZE, SIDEJOB_API_BASE_URL } from './constants';
import type {
  BrandOption,
  BrandCategory,
  ProductDetail,
  ProductSummary,
  SearchMode,
} from './types';

/** 合并同名地区品类，同时保留所有源 ID，筛选和保存时不会漏掉其他地区。 */
function mergeSyncedBrandCategories(categories: BrandCategory[]): BrandCategory[] {
  // 显示一个同名选项，对应多个地区源分类 ID。
  const categoriesByName = new Map<string, BrandCategory>();
  for (const category of categories) {
    // 跨地区名称忽略首尾空白与大小写。
    const categoryKey = category.name.trim().toLocaleLowerCase('zh-CN');
    // 含后端可能已合并的源 ID。
    const sourceIds = category.sourceIds ?? [category.id];
    // 已记录的同名品类。
    const existingCategory = categoriesByName.get(categoryKey);
    if (!existingCategory) {
      categoriesByName.set(categoryKey, { ...category, sourceIds: [...sourceIds] });
      continue;
    }
    existingCategory.sourceIds = Array.from(new Set([...(existingCategory.sourceIds ?? [existingCategory.id]), ...sourceIds]));
    if (!existingCategory.imageUrl && category.imageUrl) existingCategory.imageUrl = category.imageUrl;
  }
  return Array.from(categoriesByName.values());
}

/** 同一聚合品牌的并行品类读取共享请求，完成后释放以便下次编辑读取新快照。 */
const profileCategoryRequests = new Map<string, Promise<BrandCategory[]>>();

/** 只读取一个品牌的本地品类元数据，不按门店逐个查询。 */
export function fetchSyncedProfileCategories(brandProfileId: string): Promise<BrandCategory[]> {
  // 正在读取的相同品牌请求。
  const existingRequest = profileCategoryRequests.get(brandProfileId);
  if (existingRequest) return existingRequest;
  // 完成和失败都释放请求，避免永久缓存旧 generation 或失败状态。
  const categoryRequest = requestCatalog<BrandCategory[]>('/catalog/source-categories', { brandProfileId })
    .then(mergeSyncedBrandCategories)
    .finally(() => { profileCategoryRequests.delete(brandProfileId); });
  profileCategoryRequests.set(brandProfileId, categoryRequest);
  return categoryRequest;
}

/** 商品查询参数。 */
interface SearchProductsParams {
	accountId?: string;
  query: string;
  mode: SearchMode;
  regionId: string;
  page?: number;
  brandDistributorIds?: string[];
  categoryId?: string;
  goodsSort?: number;
  localSort?: string;
}

/** 商品查询结果。 */
interface SearchProductsResult {
  products: ProductSummary[];
  similarProducts: ProductSummary[];
  total: number;
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
    // 原样提示未同步或版本失效，不把错误误显示为无商品。
    const failure = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(failure?.message || `请求失败（HTTP ${response.status}）`);
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
	accountId = '',
  query,
  mode,
  regionId,
  page = 1,
  brandDistributorIds = [],
  goodsSort,
  localSort,
  categoryId,
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
  } else if (goodsSort === 6) {
    catalogSort = 'discount';
  }
  // 本地商品库搜索结果。
  const response = await requestCatalog<{ list?: ProductSummary[]; total?: number }>('/catalog/offers', {
	accountId,
    regionId,
    brandStoreId,
    keyword: query.trim(),
    page: String(page),
    pageSize: String(PRODUCT_PAGE_SIZE),
    stockOnly: 'false',
    sort: catalogSort,
    categoryId: categoryId ?? '',
  });
  return {
    products: response?.list ?? [],
    similarProducts: [],
    total: Number(response?.total ?? 0),
  };
}

/** 兼容原货源入口，统一查询同步中心本地成功快照。 */
export function searchLiveProducts(params: SearchProductsParams): Promise<SearchProductsResult> {
  return searchProducts(params);
}

/** 按地区加载本地聚合品牌配置中的门店。 */
export async function fetchBrandOptions(regionId: string): Promise<BrandOption[]> {
  // 当前地区已启用的本地品牌门店。
  const response = await requestCatalog<Array<{ id?: string; brandName?: string; distributorId?: string; shopCode?: string }>>('/catalog/brand-stores', { regionId });
  return (response ?? [])
    .filter((brandStore) => Boolean(brandStore?.id) && Boolean(brandStore?.brandName))
    .map((brandStore) => ({ value: brandStore.id ?? '', label: brandStore.brandName ?? '', shopCode: brandStore.shopCode, categoryDistributorId: brandStore.distributorId, distributorIds: brandStore.id ? [brandStore.id] : [] }))
    .sort((firstBrand, secondBrand) => firstBrand.label.localeCompare(secondBrand.label, 'zh-CN'));
}

/** 兼容原品牌入口，读取本地已配置的地区门店。 */
export function fetchLiveBrandOptions(regionId: string): Promise<BrandOption[]> {
  return fetchBrandOptions(regionId);
}

/** 查询成功快照内保存的品牌品类，不调用小程序。 */
export function fetchLiveBrandCategories(regionId: string, distributorId: string): Promise<BrandCategory[]> {
  return requestCatalog<BrandCategory[]>('/catalog/source-categories', { regionId, distributorId });
}

/** 读取本地品牌门店对应的小程序商品品类。 */
export function fetchLocalBrandCategories(brandStoreId: string): Promise<BrandCategory[]> {
  return requestCatalog<BrandCategory[]>(`/catalog/brand-stores/${encodeURIComponent(brandStoreId)}/categories`);
}

/** 获取本地完整商详与 SKU，更新数据请前往同步中心。 */
export async function fetchProductDetail(itemId: string, regionId: string): Promise<ProductDetail> {
  // 读取已成功同步的商品版本，不补发任何源站购买须知请求。
  const productDetail = await requestCatalog<ProductDetail>(`/catalog/offers/${encodeURIComponent(itemId)}`, { regionId });
  if (!productDetail) throw new Error('暂无本地商品详情，请先在同步中心同步该品牌');
  return productDetail;
}

/** 保留旧调用签名，源商详统一由本地权威表提供。 */
export function fetchLiveProductDetail(itemId: string, regionId: string): Promise<ProductDetail> {
  return fetchProductDetail(itemId, regionId);
}
