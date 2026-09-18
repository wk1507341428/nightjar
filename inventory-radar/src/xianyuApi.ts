import { SIDEJOB_API_BASE_URL } from './constants';
import type { CreatePriceComparisonRequest, CreatePublishTaskRequest, MarketplaceListingListResponse, MarketplaceSyncResponse, PinduoduoCredential, PlatformConnection, PriceComparisonResponse, PublishTask, XianyuConnection } from './types';

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

/** 查询指定渠道当前在售商品。 */
export function fetchMarketplaceListings(platform = 'xianyu'): Promise<MarketplaceListingListResponse> {
  return requestSideJob<MarketplaceListingListResponse>(
    `/marketplace/listings?platform=${encodeURIComponent(platform)}`,
  );
}

/** 手动同步指定渠道当前在售商品。 */
export function syncMarketplaceListings(platform = 'xianyu'): Promise<MarketplaceSyncResponse> {
  return requestSideJob<MarketplaceSyncResponse>(
    `/marketplace/sync?platform=${encodeURIComponent(platform)}`,
    { method: 'POST' },
  );
}

/** 发起统一多平台比价。 */
export function createPriceComparison(request: CreatePriceComparisonRequest): Promise<PriceComparisonResponse> {
  return requestSideJob<PriceComparisonResponse>('/price-comparisons', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
