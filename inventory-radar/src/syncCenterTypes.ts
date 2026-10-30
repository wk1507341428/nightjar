import type { BrandProfile } from './types';

/** 同步任务固定状态，与本地服务保持一致。 */
export const SyncStatus = { RUNNING: 'running', COMPLETE: 'complete', FAILED: 'failed', INTERRUPTED: 'interrupted' } as const;
/** 同步任务阶段。 */
export const SyncStage = { LISTS: 'lists', DETAILS: 'details', ACTIVATE: 'activate' } as const;
/** 同步任务状态及完整覆盖计数。 */
export interface SourceSyncRun {
  id: string;
  profileId: string;
  profileName: string;
  status: string;
  stage: string;
  total: number;
  processed: number;
  productCount: number;
  skuCount: number;
  error?: string;
  /** 源版本成功后日度稳定度派生失败，不影响源数据可用性。 */
  stabilityError?: string;
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
}
/** 同步品牌管理行：id 固定为 profileId，runId 仅标识最近一次审计任务。 */
export interface SourceSyncBrand extends SourceSyncRun {
  runId?: string;
  lastSyncedAt?: string;
  snapshotProductCount?: number;
  snapshotSKUCount?: number;
}
/** 只在整品牌同步成功后切换的可用快照。 */
export interface SourceSyncSnapshot {
  profileId: string;
  generation: string;
  syncedAt: string;
  productCount: number;
  skuCount: number;
}
/** 本地品牌以及最后成功同步状态。 */
export interface SourceSyncProfile extends BrandProfile {
  /** 最近完整同步保存的品牌目录信息。 */
  logoUrl?: string;
  onlineGoodsCount?: number;
  metadataReady?: boolean;
  ready?: boolean;
  lastSyncedAt?: string;
  generation?: string;
  productCount?: number;
  skuCount?: number;
}
/** 完整保存的一条地区门店 SKU。 */
export interface SourceSyncedSKU {
  id: string;
  profileId: string;
  profileName: string;
  regionId: string;
  distributorId: string;
  itemNo: string;
  name: string;
  sourceItemId: string;
  skuId: string;
  skuCode: string;
  variantLabel: string;
  priceCents: number;
  activityPriceCents?: number;
  marketPriceCents: number;
  availableStock: number;
  stock: number;
  saleStatus: string;
  observedAt: string;
}
/** 本地 SKU 筛选，查询不会访问小程序。 */
export interface SourceSyncSearch {
  keyword?: string;
  brandProfileId?: string;
  regionId?: string;
  stockOnly?: boolean;
  page: number;
  pageSize: number;
}
/** 本地 SKU 分页。 */
export interface SourceSyncSearchResult {
  list: SourceSyncedSKU[];
  total: number;
}
