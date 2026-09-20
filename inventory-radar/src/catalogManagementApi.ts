import { SIDEJOB_API_BASE_URL } from './constants';
import type { CatalogBrandStore, CatalogBrandStoreCandidate, CatalogSyncRun } from './types';

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

/** 刷新本地库中的一件商品。 */
export function refreshCatalogOffer(offerId: string): Promise<CatalogSyncRun> {
  return requestCatalogManagement<CatalogSyncRun>(`/catalog/offers/${encodeURIComponent(offerId)}/refresh`, { method: 'POST' });
}
