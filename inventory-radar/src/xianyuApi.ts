import { SIDEJOB_API_BASE_URL } from './constants';
import type { CreatePriceComparisonRequest, CreatePublishTaskRequest, MarketplaceListingListResponse, MarketplaceOfflineResponse, MarketplaceSyncResponse, PinduoduoCredential, PlatformConnection, PriceComparisonResponse, PublishBatch, PublishBatchPreview, PublishBatchSettings, PublishTask, XianyuConnection } from './types';

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

/** 查询拼多多连接状态。 */
export function fetchPinduoduoConnection(): Promise<PlatformConnection> {
  return requestSideJob<PlatformConnection>('/pinduoduo/connection');
}

/** 校验并保存拼多多商家后台 cURL 或 Cookie。 */
export function connectPinduoduo(credential: PinduoduoCredential): Promise<PlatformConnection> {
  return requestSideJob<PlatformConnection>('/pinduoduo/session', {
    method: 'POST',
    body: JSON.stringify(credential),
  });
}

/** 删除本地保存的拼多多凭证。 */
export function disconnectPinduoduo(): Promise<PlatformConnection> {
  return requestSideJob<PlatformConnection>('/pinduoduo/session', {
    method: 'DELETE',
  });
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

/** 预览当前品牌的批量发布计划。 */
export function previewPublishBatch(brandStoreId: string, settings: PublishBatchSettings): Promise<PublishBatchPreview> {
  return requestSideJob<PublishBatchPreview>('/xianyu/publish-batches/preview', {
    method: 'POST',
    body: JSON.stringify({ brandStoreId, ...settings }),
  });
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

/** 查询指定渠道当前在售商品。 */
export function fetchMarketplaceListings(platform = 'xianyu', itemNos: string[] = []): Promise<MarketplaceListingListResponse> {
  const query = new URLSearchParams({ platform });
  if (itemNos.length > 0) {
    query.set('itemNos', itemNos.join(','));
  }
  return requestSideJob<MarketplaceListingListResponse>(
    `/marketplace/listings?${query.toString()}`,
  );
}

/** 手动同步指定渠道当前在售商品。 */
export function syncMarketplaceListings(platform = 'xianyu'): Promise<MarketplaceSyncResponse> {
  return requestSideJob<MarketplaceSyncResponse>(
    `/marketplace/sync?platform=${encodeURIComponent(platform)}`,
    { method: 'POST' },
  );
}

/** 下架一个或多个当前闲鱼在售商品。 */
export function offlineMarketplaceListings(itemIds: string[]): Promise<MarketplaceOfflineResponse> {
  return requestSideJob<MarketplaceOfflineResponse>('/marketplace/listings/offline', {
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
