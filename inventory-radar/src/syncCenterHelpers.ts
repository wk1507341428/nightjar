import type { PublishPreset, PublishPresetRule } from './types';
import { SyncStatus, type SourceSyncRun } from './syncCenterTypes';
/** 去重常用方案品牌，同时返回缺失品牌配置的规则。 */
export function getPresetSyncScope(preset: PublishPreset | undefined): { profileIds: string[]; missingRules: PublishPresetRule[] } {
  // 未配置聚合品牌的规则不能默默跳过。
  const missingRules = preset?.rules.filter((rule) => !rule.brandProfileId) ?? [];
  // 鞋服多条规则只同步一次完整品牌。
  const profileIds = [...new Set(preset?.rules.map((rule) => rule.brandProfileId).filter((id): id is string => Boolean(id)) ?? [])];
  return { profileIds, missingRules };
}
/** 只有成功激活整品牌快照才显示百分之百。 */
export function getSyncProgress(run: SourceSyncRun): number {
  if (run.status === SyncStatus.COMPLETE) return 100;
  if (!run.total) return 0;
  return Math.min(99, Math.max(0, Math.floor(run.processed / run.total * 100)));
}
/** 错误、中断状态必须与成功分开。 */
export function getSyncStatusLabel(status: string): string {
  if (status === SyncStatus.COMPLETE) return '同步成功';
  if (status === SyncStatus.RUNNING) return '同步中';
  if (status === SyncStatus.FAILED) return '同步失败';
  if (status === SyncStatus.INTERRUPTED) return '同步中断';
  return status || '尚未同步';
}

/** 稳定度派生失败仅作警示，成功的源快照进度仍保持成功。 */
export function getSyncProgressStatus(run: SourceSyncRun): 'success' | 'exception' | undefined {
  if (run.status === SyncStatus.COMPLETE) return 'success';
  if (run.error || run.status === SyncStatus.FAILED || run.status === SyncStatus.INTERRUPTED) return 'exception';
  return undefined;
}


/** 每次轮询后按更新时间倒序；相同时间保持稳定顺序，不修改原始数组。 */
export function sortSyncRunsByUpdatedAt(runs: SourceSyncRun[]): SourceSyncRun[] {
  /** 缺失或无效时间排在最后。 */
  const timestamp = (value: string) => Date.parse(value) || 0;
  return [...runs].sort((left, right) => timestamp(right.updatedAt) - timestamp(left.updatedAt)
    || timestamp(right.startedAt) - timestamp(left.startedAt) || left.id.localeCompare(right.id));
}

/** 一键同步只处理已加入管理列表的品牌，不扩展到所有品牌配置。 */
export function getManagedSyncProfileIds(brands: SourceSyncRun[]): string[] {
  return [...new Set(brands.map((brand) => brand.profileId).filter(Boolean))];
}
