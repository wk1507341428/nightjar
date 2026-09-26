import { SIDEJOB_API_BASE_URL } from './constants';
import type { BrandMaintenanceResponse, BrandProfile, CatalogBrandStore, CatalogBrandStoreCandidate, CatalogSyncChangeListResponse, CatalogSyncRun, CatalogSyncRunListResponse, OfferPriceHistory } from './types';

/** 请求本地商品库管理接口。 */
async function requestCatalogManagement<ResponseType>(path: string, init?: RequestInit): Promise<ResponseType> {
  // 本地商品库管理响应。
  const response = await fetch(`${SIDEJOB_API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  // 失败响应正文。
  const responseBody = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) {
    throw new Error(responseBody?.message ?? `本地商品库请求失败（HTTP ${response.status}）`);
  }
  return responseBody as ResponseType;
}

/** 发现一个地区上游可配置的品牌门店。 */
export function discoverCatalogBrandStores(regionId: string): Promise<CatalogBrandStoreCandidate[]> {
  return requestCatalogManagement<CatalogBrandStoreCandidate[]>(`/catalog/brand-stores/discover?regionId=${encodeURIComponent(regionId)}`);
}

/** 读取一个地区已经保存的品牌同步配置。 */
export function fetchCatalogBrandStores(regionId: string): Promise<CatalogBrandStore[]> {
  return requestCatalogManagement<CatalogBrandStore[]>(`/catalog/brand-stores?regionId=${encodeURIComponent(regionId)}`);
}

/** 读取各地区实时品牌和品牌档案配置。 */
export function fetchBrandMaintenance(): Promise<BrandMaintenanceResponse> {
  return requestCatalogManagement<BrandMaintenanceResponse>('/catalog/brand-maintenance');
}

/** 创建或更新品牌档案。 */
export function saveBrandProfile(profile: { id?: string; name: string; defaultRegionId?: string; members: Array<{ regionId: string; distributorId: string; sourceName: string }> }): Promise<BrandProfile> {
  return requestCatalogManagement<BrandProfile>('/catalog/brand-profiles', { method: 'PUT', body: JSON.stringify(profile) });
}

/** 删除品牌档案配置。 */
export function deleteBrandProfile(profileId: string): Promise<{ deleted: boolean }> {
  return requestCatalogManagement<{ deleted: boolean }>(`/catalog/brand-profiles/${encodeURIComponent(profileId)}`, { method: 'DELETE' });
}

/** 顺序同步品牌档案覆盖的全部地区成员。 */
export function syncBrandProfile(profileId: string): Promise<{ profileId: string; profileName: string; memberCount: number; status: string }> {
  return requestCatalogManagement(`/catalog/brand-profiles/${encodeURIComponent(profileId)}/sync`, { method: 'POST' });
}

/** 更新一家品牌门店的同步开关。 */
export function saveCatalogBrandStore(brandStore: CatalogBrandStoreCandidate, syncEnabled: boolean): Promise<CatalogBrandStore> {
  return requestCatalogManagement<CatalogBrandStore>('/catalog/brand-stores', {
    method: 'PUT',
    body: JSON.stringify({ ...brandStore, syncEnabled }),
  });
}

/** 同步一家已启用品牌门店的全部商品。 */
export function syncCatalogBrandStore(brandStoreId: string): Promise<CatalogSyncRun> {
  return requestCatalogManagement<CatalogSyncRun>(`/catalog/brand-stores/${encodeURIComponent(brandStoreId)}/sync`, { method: 'POST' });
}

/** 查询后台品牌同步任务的最新状态。 */
export function fetchCatalogSyncRun(runId: string): Promise<CatalogSyncRun> {
  return requestCatalogManagement<CatalogSyncRun>(`/catalog/sync-runs/${encodeURIComponent(runId)}`);
}

/** 分页读取品牌同步历史。 */
export function fetchCatalogSyncRuns(params: { brandStoreId?: string; regionId?: string; page?: number; pageSize?: number }): Promise<CatalogSyncRunListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  return requestCatalogManagement<CatalogSyncRunListResponse>(`/catalog/sync-runs?${query.toString()}`);
}

/** 分页读取一次同步的 SKU 变更明细。 */
export function fetchCatalogSyncChanges(runId: string, params: { type?: string; keyword?: string; page?: number; pageSize?: number }): Promise<CatalogSyncChangeListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  return requestCatalogManagement<CatalogSyncChangeListResponse>(`/catalog/sync-runs/${encodeURIComponent(runId)}/changes?${query.toString()}`);
}

/** 刷新本地库中的一件商品。 */
export function refreshCatalogOffer(offerId: string): Promise<CatalogSyncRun> {
  return requestCatalogManagement<CatalogSyncRun>(`/catalog/offers/${encodeURIComponent(offerId)}/refresh`, { method: 'POST' });
}

/** 查询一件本地商品的 SKU 价格历史。 */
export function fetchCatalogOfferPriceHistory(offerId: string): Promise<OfferPriceHistory> {
  return requestCatalogManagement<OfferPriceHistory>(`/catalog/offers/${encodeURIComponent(offerId)}/price-history`);
}
