import { SIDEJOB_API_BASE_URL } from './constants';
import type { SourceSyncBrand, SourceSyncProfile, SourceSyncRun, SourceSyncSearch, SourceSyncSearchResult } from './syncCenterTypes';

/** 通过本地服务读取同步中心，绝不直接访问货源接口。 */
async function requestSyncCenter<Result>(path: string, init?: RequestInit): Promise<Result> {
  // 本地接口响应。
  const response = await fetch(`${SIDEJOB_API_BASE_URL}/catalog/sync-center${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  // 错误响应也保留服务端具体说明。
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || `同步中心请求失败（HTTP ${response.status}）`);
  return result as Result;
}

/** 读取本地品牌、任务和最近成功快照。 */
export function fetchSyncProfiles(): Promise<SourceSyncProfile[]> {
  return requestSyncCenter('/profiles');
}

/** 读取同步任务历史与当前进度。 */
export function fetchSyncRuns(): Promise<{ list: SourceSyncRun[] }> {
  return requestSyncCenter('/runs');
}

/** 读取已加入同步中心的品牌，一品牌一行，重复同步更新同一行。 */
export function fetchSyncBrands(): Promise<{ list: SourceSyncBrand[] }> {
  return requestSyncCenter('/brands');
}

/** 仅删除本地同步数据，品牌配置与闲鱼商品保持不变。 */
export function deleteSyncBrand(profileId: string): Promise<unknown> {
  return requestSyncCenter(`/brands/${encodeURIComponent(profileId)}`, { method: 'DELETE' });
}

/** 明确发起整品牌同步，由服务端去重活动任务。 */
export function startSourceSync(profileIds: string[]): Promise<{ list: SourceSyncRun[] }> {
  return requestSyncCenter('/runs', { method: 'POST', body: JSON.stringify({ brandProfileIds: profileIds }) });
}

/** 搜索当前成功快照内的本地商品。 */
export function searchSyncedSKUs(filters: SourceSyncSearch): Promise<SourceSyncSearchResult> {
  // 仅提交已填写的筛选字段。
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return requestSyncCenter(`/skus?${query}`);
}
