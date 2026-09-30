import { SIDEJOB_API_BASE_URL } from './constants';
import type { BrandMaintenanceResponse, BrandProfile, OfferPriceHistory } from './types';

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

/** 查询一件本地商品的 SKU 价格历史。 */
export function fetchCatalogOfferPriceHistory(offerId: string): Promise<OfferPriceHistory> {
  return requestCatalogManagement<OfferPriceHistory>(`/catalog/offers/${encodeURIComponent(offerId)}/price-history`);
}
