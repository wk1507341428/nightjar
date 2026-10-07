import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Empty, Progress, Select, Tag } from 'antd';
import type { PublishBatch, PublishBatchPreview, PublishPreset, PublishPresetActionMode, PublishPresetRule } from './types';
import { appendPublishOperation, fetchPublishPresets, previewPublishOperation } from './xianyuApi';

/** 操作范围对应的用户文案。 */
const ACTION_MODE_LABELS: Record<PublishPresetActionMode, string> = {
  update_only: '仅更新在售',
  publish_update: '发布并更新',
  full: '完整对账',
};

/** 返回一条预览将进入队列的任务数量。 */
function getPresetActionCount(preview: PublishBatchPreview): number {
  return preview.selected + (preview.updates?.length ?? 0) + (preview.offlineCandidates?.length ?? 0);
}

/** 把保存的规则转换为实时预览请求。 */
function buildPresetSettings(accountId: string, rule: PublishPresetRule) {
  return {
    accountId,
    sourceType: rule.sourceType,
    brandProfileId: rule.brandProfileId,
    distributorId: rule.distributorId,
    brandName: rule.brandName,
    regionId: rule.regionId,
    categoryIds: rule.categoryIds,
    categoryNames: rule.categoryNames,
    limit: rule.limit,
    minDelaySeconds: rule.minDelaySeconds,
    maxDelaySeconds: rule.maxDelaySeconds,
    minPriceCents: rule.minPriceCents || undefined,
    maxPriceCents: rule.maxPriceCents || undefined,
    minDiscountRate: rule.minDiscountRate || undefined,
    maxDiscountRate: rule.maxDiscountRate || undefined,
    actionMode: rule.actionMode,
  };
}

/** 在创建发布操作中选择常用方案并执行预览。 */
export function PublishPresetRunner({
  accountId,
  remainingCapacity,
  onManagePresets,
  onOperationCreated,
}: {
  accountId: string;
  remainingCapacity: number;
  onManagePresets: () => void;
  onOperationCreated: (operation: PublishBatch) => void;
}) {
  // 当前账号保存的常用方案。
  const [presets, setPresets] = useState<PublishPreset[]>([]);
  // 当前选择的方案 ID。
  const [selectedPresetId, setSelectedPresetId] = useState('');
  // 各品牌实时预览结果。
  const [previewResults, setPreviewResults] = useState<Array<{ rule: PublishPresetRule; preview: PublishBatchPreview }>>([]);
  // 多品牌预览进度。
  const [previewProgress, setPreviewProgress] = useState(0);
  // 请求执行状态。
  const [isLoading, setIsLoading] = useState(false);
  // 当前错误提示。
  const [errorMessage, setErrorMessage] = useState('');

  /** 加载当前账号的方案列表。 */
  async function loadPresets() {
    setIsLoading(true);
    try {
      const nextPresets = await fetchPublishPresets(accountId);
      setPresets(nextPresets);
      setSelectedPresetId((currentId) => nextPresets.some((preset) => preset.id === currentId) ? currentId : nextPresets[0]?.id ?? '');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取常用发布方案失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadPresets(); }, [accountId]);

  // 当前选择的完整方案。
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? null;
  // 所有品牌预览产生的任务总数。
  const previewActionCount = useMemo(() => previewResults.reduce((total, result) => total + getPresetActionCount(result.preview), 0), [previewResults]);

  /** 切换方案并清理旧预览。 */
  function handlePresetChange(presetId: string) {
    setSelectedPresetId(presetId);
    setPreviewResults([]);
    setPreviewProgress(0);
    setErrorMessage('');
  }

  /** 使用两路并发生成方案内全部品牌预览。 */
  async function handleGeneratePreview() {
    if (!selectedPreset) return;
    setIsLoading(true);
    setPreviewResults([]);
    setPreviewProgress(0);
    setErrorMessage('');
    try {
      const nextResults: Array<{ rule: PublishPresetRule; preview: PublishBatchPreview }> = [];
      for (let ruleIndex = 0; ruleIndex < selectedPreset.rules.length; ruleIndex += 2) {
        const currentRules = selectedPreset.rules.slice(ruleIndex, ruleIndex + 2);
        const currentResults = await Promise.all(currentRules.map(async (rule) => ({
          rule,
          preview: await previewPublishOperation(rule.brandStoreId ?? '', buildPresetSettings(accountId, rule)),
        })));
        nextResults.push(...currentResults);
        setPreviewResults([...nextResults]);
        setPreviewProgress(Math.round((nextResults.length / selectedPreset.rules.length) * 100));
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '生成常用方案预览失败');
    } finally {
      setIsLoading(false);
    }
  }

  /** 确认全部有效预览并加入当前队列。 */
  async function handleConfirmPreset() {
    if (!selectedPreset || previewActionCount === 0 || previewActionCount > remainingCapacity) return;
    setIsLoading(true);
    setErrorMessage('');
    let appendedRuleCount = 0;
    try {
      let latestOperation: PublishBatch | null = null;
      for (const result of previewResults) {
        if (getPresetActionCount(result.preview) === 0) continue;
        latestOperation = await appendPublishOperation(result.rule.brandStoreId ?? '', {
          ...buildPresetSettings(accountId, result.rule),
          previewId: result.preview.previewId,
          preservedOfflinePlatformItemIds: [],
        });
        appendedRuleCount += 1;
      }
      if (latestOperation) onOperationCreated(latestOperation);
    } catch (error) {
      const message = error instanceof Error ? error.message : '加入当前发布队列失败';
      setErrorMessage(appendedRuleCount > 0 ? `已加入 ${appendedRuleCount} 个品牌，后续品牌失败：${message}` : message);
    } finally {
      setIsLoading(false);
    }
  }

  if (presets.length === 0 && !isLoading) {
    return <section className="publish-preset-runner-empty"><Empty description="当前账号还没有常用发布方案"><Button type="primary" onClick={onManagePresets}>去配置常用方案</Button></Empty></section>;
  }

  return <section className="publish-preset-runner">
    {errorMessage ? <Alert type="error" showIcon closable message={errorMessage} onClose={() => setErrorMessage('')} /> : null}
    <header className="publish-preset-runner-head"><div><small>USE SAVED PLAYBOOK</small><strong>选择常用发布方案</strong><span>每次都会重新读取实时货源和闲鱼商品，不使用旧预览。</span></div><Button onClick={onManagePresets}>管理方案</Button></header>
    <div className="publish-preset-runner-select"><Select loading={isLoading} value={selectedPresetId || undefined} onChange={handlePresetChange} placeholder="选择一套常用方案" options={presets.map((preset) => ({ value: preset.id, label: `${preset.name} · ${preset.rules.length} 个品牌` }))} /><Button type="primary" loading={isLoading} disabled={!selectedPreset} onClick={() => void handleGeneratePreview()}>生成方案预览</Button></div>
    {selectedPreset ? <div className="publish-preset-runner-rules">{selectedPreset.rules.map((rule) => <Tag key={rule.id}>{rule.brandName} · {rule.categoryNames.length ? rule.categoryNames.join(' / ') : '全部品类'} · {ACTION_MODE_LABELS[rule.actionMode]}</Tag>)}</div> : null}
    {isLoading && previewProgress > 0 ? <div className="publish-preset-runner-progress"><Progress percent={previewProgress} status="active" /><span>正在并发核对品牌实时数据</span></div> : null}
    {previewResults.length > 0 ? <><div className="publish-preset-preview-summary"><article><span>品牌规则</span><strong>{previewResults.length}</strong></article><article><span>实际任务</span><strong>{previewActionCount}</strong></article><article><span>剩余容量</span><strong>{remainingCapacity}</strong></article></div><div className="publish-preset-preview-list">{previewResults.map(({ rule, preview }) => <article key={rule.id}><header><div><strong>{rule.brandName}</strong><span>{rule.categoryNames.length ? rule.categoryNames.join(' / ') : '全部品类'} · {ACTION_MODE_LABELS[rule.actionMode]}</span></div><Tag color={getPresetActionCount(preview) ? 'processing' : 'default'}>{getPresetActionCount(preview)} 个任务</Tag></header><dl><div><dt>待更新</dt><dd>{preview.updates?.length ?? 0}</dd></div><div><dt>新品/恢复</dt><dd>{preview.selected}</dd></div><div><dt>待下架</dt><dd>{preview.offlineCandidates?.length ?? 0}</dd></div><div><dt>无需修改</dt><dd>{preview.unchanged ?? 0}</dd></div><div><dt>自动跳过</dt><dd>{preview.skipped.length}</dd></div></dl></article>)}</div>{previewActionCount > remainingCapacity ? <Alert type="warning" showIcon message={`方案需要 ${previewActionCount} 个任务，当前队列只剩 ${remainingCapacity} 个位置`} /> : null}<div className="publish-preset-runner-actions"><Button onClick={() => setPreviewResults([])}>清除预览</Button><Button type="primary" loading={isLoading} disabled={previewActionCount === 0 || previewActionCount > remainingCapacity} onClick={() => void handleConfirmPreset()}>确认全部加入队列</Button></div></> : null}
  </section>;
}
