import { SIDEJOB_API_BASE_URL } from './constants';
import type { BrandCategory, CreatePriceComparisonRequest, CreatePublishTaskRequest, MarketplaceListingListResponse, MarketplaceOfflineResponse, MarketplaceSyncResponse, OfflineCenterFilters, OfflineCenterPreview, PriceComparisonResponse, PublishBatch, PublishBatchPreview, PublishBatchSettings, PublishOperationListResponse, PublishTask, XianyuAccount, XianyuAccountListResponse, XianyuConnection } from './types';

/** 解析本地服务 JSON 响应并提取错误信息。 */
async function requestSideJob<ResponseType>(path: string, init?: RequestInit): Promise<ResponseType> {
  // 本地服务响应。
  const response = await fetch(`${SIDEJOB_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  // 本地服务响应内容。
  const responseBody = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) {
    throw new Error(responseBody?.message ?? `本地服务请求失败（HTTP ${response.status}）`);
  }
  return responseBody as ResponseType;
}

/** 查询闲鱼账号连接状态。 */
export function fetchXianyuConnection(): Promise<XianyuConnection> {
  return requestSideJob<XianyuConnection>('/xianyu/connection');
}

/** 校验并保存用户提供的闲鱼 cURL 或 Cookie。 */
export function connectXianyu(credential: string): Promise<XianyuConnection> {
  return requestSideJob<XianyuConnection>('/xianyu/session', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

/** 删除本地保存的闲鱼会话。 */
export function disconnectXianyu(): Promise<XianyuConnection> {
  return requestSideJob<XianyuConnection>('/xianyu/session', {
    method: 'DELETE',
  });
}

/** 查询闲鱼卖家工作台连接状态。 */
export function fetchXianyuSellerConnection(): Promise<XianyuConnection> {
  return requestSideJob<XianyuConnection>('/xianyu-seller/connection');
}

/** 保存闲鱼卖家工作台专用凭证。 */
export function connectXianyuSeller(credential: string): Promise<XianyuConnection> {
  return requestSideJob<XianyuConnection>('/xianyu-seller/session', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

/** 删除本地保存的闲鱼卖家工作台凭证。 */
export function disconnectXianyuSeller(): Promise<XianyuConnection> {
  return requestSideJob<XianyuConnection>('/xianyu-seller/session', {
    method: 'DELETE',
  });
}

/** 查询全部闲鱼账号。 */
export function fetchXianyuAccounts(): Promise<XianyuAccountListResponse> {
  return requestSideJob<XianyuAccountListResponse>('/xianyu/accounts');
}

/** 新建闲鱼账号槽位。 */
export function createXianyuAccount(name: string): Promise<XianyuAccount> {
  return requestSideJob<XianyuAccount>('/xianyu/accounts', { method: 'POST', body: JSON.stringify({ name }) });
}

/** 更新账号备注或运行状态。 */
export function updateXianyuAccount(accountId: string, update: { name?: string; status?: XianyuAccount['status'] }): Promise<XianyuAccount> {
  return requestSideJob<XianyuAccount>(`/xianyu/accounts/${encodeURIComponent(accountId)}`, { method: 'PATCH', body: JSON.stringify(update) });
}

/** 保存指定账号的一类闲鱼凭证。 */
export function connectXianyuAccount(accountId: string, kind: 'session' | 'seller', credential: string): Promise<XianyuAccount> {
  return requestSideJob<XianyuAccount>(`/xianyu/accounts/${encodeURIComponent(accountId)}/sessions/${kind}`, { method: 'PUT', body: JSON.stringify({ credential }) });
}

/** 断开指定账号的一类闲鱼凭证。 */
export function disconnectXianyuAccount(accountId: string, kind: 'session' | 'seller'): Promise<XianyuAccount> {
  return requestSideJob<XianyuAccount>(`/xianyu/accounts/${encodeURIComponent(accountId)}/sessions/${kind}`, { method: 'DELETE' });
}

/** 实时验证指定闲鱼账号连接。 */
export function verifyXianyuAccount(accountId: string): Promise<XianyuAccount> {
  return requestSideJob<XianyuAccount>(`/xianyu/accounts/${encodeURIComponent(accountId)}/verify`, { method: 'POST' });
}

/** 创建闲鱼发布任务。 */
export function createPublishTask(request: CreatePublishTaskRequest): Promise<PublishTask> {
  return requestSideJob<PublishTask>('/xianyu/publish-tasks', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/** 查询闲鱼发布任务的实时状态。 */
export function fetchPublishTask(taskId: string): Promise<PublishTask> {
  return requestSideJob<PublishTask>(`/xianyu/publish-tasks/${encodeURIComponent(taskId)}`);
}

/** 将失败的闲鱼发布任务重新加入队列。 */
export function retryPublishTask(taskId: string): Promise<PublishTask> {
  return requestSideJob<PublishTask>(`/xianyu/publish-tasks/${encodeURIComponent(taskId)}/retry`, {
    method: 'POST',
  });
}

/** 仅重新入队当前操作中确认选择的失败任务。 */
export function retryFailedOperation(operationId: string, taskIds: string[], action = '') {
  return requestSideJob<{ queued: string[]; rejected: Array<{ itemNo: string; reason: string }> }>(`/xianyu/publish-operations/${encodeURIComponent(operationId)}/retry-failed`, { method: 'POST', body: JSON.stringify({ taskIds, action }) });
}

/** 预览当前品牌的批量发布计划。 */
export function previewPublishBatch(brandStoreId: string, settings: PublishBatchSettings): Promise<PublishBatchPreview> {
  return previewPublishOperation(brandStoreId, settings);
}

/** 确认创建当前品牌的串行发布任务。 */
export function createPublishBatch(brandStoreId: string, settings: PublishBatchSettings): Promise<PublishBatch> {
  return requestSideJob<PublishBatch>('/xianyu/publish-batches', {
    method: 'POST',
    body: JSON.stringify({ brandStoreId, ...settings }),
  });
}

/** 查询批量发布任务实时进度。 */
export function fetchPublishBatch(batchId: string): Promise<PublishBatch> {
  return requestSideJob<PublishBatch>(`/xianyu/publish-batches/${encodeURIComponent(batchId)}`);
}

/** 读取发布中心操作记录。 */
export function fetchPublishOperations(page = 1, pageSize = 20, accountId = ''): Promise<PublishOperationListResponse> {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (accountId) query.set('accountId', accountId);
  return requestSideJob<PublishOperationListResponse>(`/xianyu/publish-operations?${query.toString()}`);
}

/** 读取一条发布操作及任务明细。 */
export function fetchPublishOperation(operationId: string): Promise<PublishBatch> {
  return requestSideJob<PublishBatch>(`/xianyu/publish-operations/${encodeURIComponent(operationId)}`);
}

/** 取消一个正在运行的发布队列。 */
export function cancelPublishOperation(operationId: string): Promise<{ id: string; status: string; message: string }> {
  return requestSideJob<{ id: string; status: string; message: string }>(`/xianyu/publish-operations/${encodeURIComponent(operationId)}/cancel`, { method: 'POST' });
}

/** 读取合并品牌覆盖的全部小程序品类。 */
export function fetchOfflineCenterCategories(brandProfileId: string): Promise<BrandCategory[]> {
  return requestSideJob<BrandCategory[]>(`/catalog/brand-profiles/${encodeURIComponent(brandProfileId)}/categories`);
}

/** 读取当前账号满足条件的闲鱼下架候选商品。 */
export function previewOfflineCenter(filters: OfflineCenterFilters): Promise<OfflineCenterPreview> {
  return requestSideJob<OfflineCenterPreview>('/xianyu/offline-center/preview', { method: 'POST', body: JSON.stringify(filters) });
}

/** 把下架中心已选商品加入当前账号队列。 */
export function createOfflineCenterOperation(request: { accountId: string; brandProfileId?: string; regionId?: string; distributorId?: string; brandName?: string; categoryIds?: string[]; categoryNames?: string[]; platformItemIds: string[] }): Promise<PublishBatch> {
  return requestSideJob<PublishBatch>('/xianyu/offline-center/operations', { method: 'POST', body: JSON.stringify(request) });
}

/** 预览准备追加到发布中心的品牌任务。 */
export async function previewPublishOperation(brandStoreId: string, settings: PublishBatchSettings): Promise<PublishBatchPreview> {
  // 逐件核对由后端执行，浏览器仅读取进度，避免长请求超时。
  let result = await requestSideJob<PublishBatchPreview & { status?: string }>('/xianyu/publish-operations/preview', { method: 'POST', body: JSON.stringify({ brandStoreId, ...settings, previewId: undefined }) });
  while (result.status === 'preparing') {
    await new Promise((resolve) => window.setTimeout(resolve, 2000));
    result = await requestSideJob<PublishBatchPreview & { status?: string }>('/xianyu/publish-operations/preview', { method: 'POST', body: JSON.stringify({ accountId: settings.accountId, previewId: result.previewId }) });
  }
  return result;
}

/** 创建发布操作或追加到当前运行队列。 */
export function appendPublishOperation(brandStoreId: string, settings: PublishBatchSettings): Promise<PublishBatch> {
  return requestSideJob<PublishBatch>('/xianyu/publish-operations', { method: 'POST', body: JSON.stringify({ brandStoreId, ...settings }) });
}

/** 同步后自动对账的历史记录。 */
export interface ReconcilePlanRecord { id: string; accountId: string; status: string; brandName: string; error?: string; updates: number; offline: number; createdAt: string; request: PublishBatchSettings }

/** 读取同步后生成的待确认对账记录。 */
export async function fetchReconcileOverview(accountId = '') {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return requestSideJob<ReconcilePlanRecord[]>(`/xianyu/reconcile-plans${query}`);
}


/** 查询指定渠道当前在售商品。 */
export function fetchMarketplaceListings(platform = 'xianyu', itemNos: string[] = [], accountId = ''): Promise<MarketplaceListingListResponse> {
  const query = new URLSearchParams({ platform });
  if (accountId) query.set('accountId', accountId);
  if (itemNos.length > 0) {
    query.set('itemNos', itemNos.join(','));
  }
  return requestSideJob<MarketplaceListingListResponse>(
    `/marketplace/listings?${query.toString()}`,
  );
}

/** 手动同步指定渠道当前在售商品。 */
export function syncMarketplaceListings(platform = 'xianyu', accountId = ''): Promise<MarketplaceSyncResponse> {
  const query = new URLSearchParams({ platform });
  if (accountId) query.set('accountId', accountId);
  return requestSideJob<MarketplaceSyncResponse>(
    `/marketplace/sync?${query.toString()}`,
    { method: 'POST' },
  );
}

/** 下架一个或多个当前闲鱼在售商品。 */
export function offlineMarketplaceListings(itemIds: string[], accountId = ''): Promise<MarketplaceOfflineResponse> {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return requestSideJob<MarketplaceOfflineResponse>(`/marketplace/listings/offline${query}`, {
    method: 'POST',
    body: JSON.stringify({ itemIds }),
  });
}

/** 发起统一多平台比价。 */
export function createPriceComparison(request: CreatePriceComparisonRequest): Promise<PriceComparisonResponse> {
  return requestSideJob<PriceComparisonResponse>('/price-comparisons', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
