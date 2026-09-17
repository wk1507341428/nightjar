import type { ProductSearchState, RegionOption, SeckillState } from './types';

/** 商品数据接口根地址。 */
export const API_BASE_URL = 'https://aiopro.fvo2o.com/api/h5app/wxapp';

/** SideJob 后端地址；容器环境由 Nginx 转发相对路径。 */
export const SIDEJOB_API_BASE_URL = import.meta.env.VITE_SIDEJOB_API_URL ?? '/api';

/** 平台公司 ID。 */
export const COMPANY_ID = '1';

/** 商品名称搜索每页数量。 */
export const PRODUCT_PAGE_SIZE = 24;

/** 地区列表。 */
export const REGION_OPTIONS: RegionOption[] = [
  { id: 'all', code: 'ALL', name: '全部仓库', shortName: '全部' },
  { id: '3', code: 'FVSH', name: '上海佛罗伦萨小镇', shortName: '上海' },
  { id: '2', code: 'FVJJ', name: '京津佛罗伦萨小镇', shortName: '京津' },
  { id: '4', code: 'FVGF', name: '广佛佛罗伦萨小镇', shortName: '广佛' },
  { id: '5', code: 'FVCD', name: '成都佛罗伦萨小镇', shortName: '成都' },
  { id: '6', code: 'FVWH', name: '武汉佛罗伦萨小镇', shortName: '武汉' },
  { id: '7', code: 'FVCQ', name: '重庆佛罗伦萨小镇', shortName: '重庆' },
];

/** 可用于接口查询的实际仓库地区。 */
export const WAREHOUSE_REGION_OPTIONS = REGION_OPTIONS.filter((region) => region.id !== 'all');

/** 根据地区 ID 返回仓库名称。 */
export function getWarehouseName(regionId?: string): string {
  if (!regionId) {
    return '未知仓库';
  }

  // 匹配的仓库地区。
  const matchedRegion = REGION_OPTIONS.find((region) => region.id === regionId);
  return matchedRegion?.name ?? `仓库 ${regionId}`;
}

/** 根据地区 ID 返回仓库简称。 */
export function getWarehouseShortName(regionId?: string): string {
  if (!regionId) {
    return '未知';
  }

  // 匹配的仓库地区。
  const matchedRegion = REGION_OPTIONS.find((region) => region.id === regionId);
  return matchedRegion?.shortName ?? regionId;
}

/** 搜索状态初始值。 */
export const INITIAL_SEARCH_STATE: ProductSearchState = {
  products: [],
  similarProducts: [],
  total: 0,
  page: 1,
  hasSearched: false,
  isLoading: false,
  errorMessage: '',
  updatedAt: '',
};

/** 秒杀专区初始状态。 */
export const INITIAL_SECKILL_STATE: SeckillState = {
  products: [],
  activities: [],
  total: 0,
  page: 1,
  isLoading: false,
  errorMessage: '',
};
