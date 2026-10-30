import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Empty, Progress, Select, Switch, Tag } from 'antd';
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

/** 把保存的规则转换为本地快照预览请求。 */
function buildPresetSettings(accountId: string, rule: PublishPresetRule, excludeBrokenSizeItems: boolean, sourceSnapshotId?: string) {
  return {
    accountId,
    sourceSnapshotId,
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
    excludeBrokenSizeItems,
    actionMode: rule.actionMode,
  };
}

/** 两个工人按完成速度领取规则，避免一条慢规则阻塞下一批。 */
export async function runPresetPreviewWorkers(
  rules: PublishPresetRule[],
  previewRule: (rule: PublishPresetRule) => Promise<PublishBatchPreview>,
  onSettled: (ruleIndex: number, outcome: PromiseSettledResult<PublishBatchPreview>) => void,
  isCurrent: () => boolean,
): Promise<void> {
  // 下一个尚未领取的规则索引。
  let nextRuleIndex = 0;
  /** 单个工人完成当前规则后立即领取下一条。 */
  async function work() {
    while (isCurrent() && nextRuleIndex < rules.length) {
      // 领取过程没有 await，确保同一规则只运行一次。
      const ruleIndex = nextRuleIndex++;
      // 一条规则失败仍保留其他已成功预览。
      let outcome: PromiseSettledResult<PublishBatchPreview>;
      try {
        outcome = { status: 'fulfilled', value: await previewRule(rules[ruleIndex]) };
      } catch (reason) {
        outcome = { status: 'rejected', reason };
      }
      if (isCurrent()) onSettled(ruleIndex, outcome);
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, rules.length) }, () => work()));
}

/** 确认时去重成空属于无需操作；其他错误仍须停止，不能吞掉异常。 */
export async function confirmPresetRule(submit: () => Promise<PublishBatch>): Promise<PublishBatch | null> {
  try {
    return await submit();
  } catch (error) {
    if (error instanceof Error && error.message === '当前品牌没有可发布商品') return null;
    throw error;
  }
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
  // 各品牌本轮对账预览结果。
  const [previewResults, setPreviewResults] = useState<Array<{ rule: PublishPresetRule; preview: PublishBatchPreview }>>([]);
  // 多品牌预览进度。
  const [previewProgress, setPreviewProgress] = useState(0);
  // 请求执行状态。
  const [isLoading, setIsLoading] = useState(false);
  // 当前错误提示。
  const [errorMessage, setErrorMessage] = useState('');
  // 本次方案运行是否统一跳过鞋服断码商品。
  const [excludeBrokenSizeItems, setExcludeBrokenSizeItems] = useState(false);
  // 预览是否有失败规则，避免把残缺方案当作全部成功提交。
  const [hasPreviewFailures, setHasPreviewFailures] = useState(false);
  // 账号、方案或筛选变化后，使此前异步回调失效。
  const previewRunRef = useRef(0);

  /** 加载当前账号的方案列表。 */
  async function loadPresets(requestId: number) {
    setIsLoading(true);
    try {
      const nextPresets = await fetchPublishPresets(accountId);
      if (previewRunRef.current !== requestId) return;
      setPresets(nextPresets);
      const nextSelectedPreset = nextPresets[0] ?? null;
      setSelectedPresetId(nextSelectedPreset?.id ?? '');
      setExcludeBrokenSizeItems(nextSelectedPreset?.rules.every((rule) => rule.excludeBrokenSizeItems === true) ?? false);
      setErrorMessage('');
    } catch (error) {
      if (previewRunRef.current === requestId) setErrorMessage(error instanceof Error ? error.message : '读取常用发布方案失败');
    } finally {
      if (previewRunRef.current === requestId) setIsLoading(false);
    }
  }

  useEffect(() => {
    clearPreview();
    void loadPresets(previewRunRef.current);
    return () => { previewRunRef.current += 1; };
  }, [accountId]);

  // 当前选择的完整方案。
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? null;
  // 所有品牌预览产生的任务总数。
  const previewActionCount = useMemo(() => previewResults.reduce((total, result) => total + getPresetActionCount(result.preview), 0), [previewResults]);

  /** 清理结果并阻止上一轮预览继续更新当前页面。 */
  function clearPreview() {
    previewRunRef.current += 1;
    setPreviewResults([]);
    setPreviewProgress(0);
    setHasPreviewFailures(false);
    setErrorMessage('');
    setIsLoading(false);
  }

  /** 切换方案并清理旧预览。 */
  function handlePresetChange(presetId: string) {
    // 下一套方案的断码默认设置。
    const nextPreset = presets.find((preset) => preset.id === presetId) ?? null;
    setSelectedPresetId(presetId);
    setExcludeBrokenSizeItems(nextPreset?.rules.every((rule) => rule.excludeBrokenSizeItems === true) ?? false);
    clearPreview();
  }

  /** 修改本次方案的断码过滤并使旧预览失效。 */
  function handleBrokenSizeFilterChange(checked: boolean) {
    setExcludeBrokenSizeItems(checked);
    clearPreview();
  }

  /** 同轮共享货源快照，两路工人逐条生成品牌预览。 */
  async function handleGeneratePreview() {
    if (!selectedPreset) return;
    clearPreview();
    // 每次主动生成都新建快照，不复用上一轮库存。
    const sourceSnapshotId = crypto.randomUUID();
    // 只允许当前轮次更新结果。
    const requestId = previewRunRef.current;
    // 本轮规则和结果按原方案顺序保存，避免完成先后影响确认顺序。
    const rules = selectedPreset.rules;
    const nextResults = new Map<number, { rule: PublishPresetRule; preview: PublishBatchPreview }>();
    // 已完成数包含失败项，错误单独呈现。
    let completedCount = 0;
    const failures: string[] = [];
    setIsLoading(true);
    try {
      await runPresetPreviewWorkers(
        rules,
        (rule) => previewPublishOperation(rule.brandStoreId ?? '', buildPresetSettings(accountId, rule, excludeBrokenSizeItems, sourceSnapshotId)),
        (ruleIndex, outcome) => {
          completedCount += 1;
          if (outcome.status === 'fulfilled') {
            nextResults.set(ruleIndex, { rule: rules[ruleIndex], preview: outcome.value });
            setPreviewResults([...nextResults.entries()].sort(([left], [right]) => left - right).map(([, result]) => result));
          } else {
            failures.push(`${rules[ruleIndex].brandName}：${outcome.reason instanceof Error ? outcome.reason.message : '生成预览失败'}`);
            setHasPreviewFailures(true);
            setErrorMessage(failures.join('；'));
          }
          setPreviewProgress(Math.round((completedCount / rules.length) * 100));
        },
        () => previewRunRef.current === requestId,
      );
    } finally {
      if (previewRunRef.current === requestId) setIsLoading(false);
    }
  }

  /** 确认全部有效预览并加入当前队列。 */
  async function handleConfirmPreset() {
    if (!selectedPreset || hasPreviewFailures || previewResults.length !== selectedPreset.rules.length || previewActionCount === 0 || previewActionCount > remainingCapacity) return;
    setIsLoading(true);
    setErrorMessage('');
    let appendedRuleCount = 0;
    try {
      let latestOperation: PublishBatch | null = null;
      for (const result of previewResults) {
        if (getPresetActionCount(result.preview) === 0) continue;
        // 只跳过确认时已无需操作的规则，继续处理后续品牌。
        const operation = await confirmPresetRule(() => appendPublishOperation(result.rule.brandStoreId ?? '', {
          ...buildPresetSettings(accountId, result.rule, excludeBrokenSizeItems),
          previewId: result.preview.previewId,
          preservedOfflinePlatformItemIds: [],
        }));
        if (!operation) continue;
        latestOperation = operation;
        appendedRuleCount += 1;
      }
      if (latestOperation) onOperationCreated(latestOperation);
    } catch (error) {
      const message = error instanceof Error ? error.message : '加入当前发布队列失败';
      setHasPreviewFailures(true);
      setErrorMessage(appendedRuleCount > 0 ? `已加入 ${appendedRuleCount} 个品牌，后续品牌失败：${message}；请重新生成预览，已入队货号会自动去重` : message);
    } finally {
      setIsLoading(false);
    }
  }

  if (presets.length === 0 && !isLoading) {
    return <section className="publish-preset-runner-empty"><Empty description="当前账号还没有常用发布方案"><Button type="primary" onClick={onManagePresets}>去配置常用方案</Button></Empty></section>;
  }

  return <section className="publish-preset-runner">
    {errorMessage ? <Alert type="error" showIcon closable message={errorMessage} onClose={() => setErrorMessage('')} /> : null}
    <header className="publish-preset-runner-head"><div><small>USE SAVED PLAYBOOK</small><strong>选择常用发布方案</strong><span>读取同步中心最近一次成功数据；需要更新货源请先同步。</span></div><Button onClick={onManagePresets}>管理方案</Button></header>
    <div className="publish-preset-runner-select"><Select loading={isLoading} value={selectedPresetId || undefined} onChange={handlePresetChange} placeholder="选择一套常用方案" options={presets.map((preset) => ({ value: preset.id, label: `${preset.name} · ${preset.rules.length} 个品牌` }))} /><label className="publish-preset-runner-option"><span><strong>不发布断码商品</strong><small>仅鞋服，剩余一个可售尺码时跳过</small></span><Switch checked={excludeBrokenSizeItems} onChange={handleBrokenSizeFilterChange} checkedChildren="开启" unCheckedChildren="关闭" /></label><Button type="primary" loading={isLoading} disabled={!selectedPreset} onClick={() => void handleGeneratePreview()}>生成方案预览</Button></div>
    {selectedPreset ? <div className="publish-preset-runner-rules">{selectedPreset.rules.map((rule) => <Tag key={rule.id}>{rule.brandName} · {rule.categoryNames.length ? rule.categoryNames.join(' / ') : '全部品类'} · {ACTION_MODE_LABELS[rule.actionMode]}</Tag>)}</div> : null}
    {isLoading ? <div className="publish-preset-runner-progress"><Progress percent={previewProgress} status="active" /><span>正在核对本地品牌快照与闲鱼商品</span></div> : null}
    {previewResults.length > 0 ? <><div className="publish-preset-preview-summary"><article><span>品牌规则</span><strong>{previewResults.length}</strong></article><article><span>实际任务</span><strong>{previewActionCount}</strong></article><article><span>剩余容量</span><strong>{remainingCapacity}</strong></article></div><div className="publish-preset-preview-list">{previewResults.map(({ rule, preview }) => <article key={rule.id}><header><div><strong>{rule.brandName}</strong><span>{rule.categoryNames.length ? rule.categoryNames.join(' / ') : '全部品类'} · {ACTION_MODE_LABELS[rule.actionMode]}</span></div><Tag color={getPresetActionCount(preview) ? 'processing' : 'default'}>{getPresetActionCount(preview)} 个任务</Tag></header><dl><div><dt>待更新</dt><dd>{preview.updates?.length ?? 0}</dd></div><div><dt>新品/恢复</dt><dd>{preview.selected}</dd></div><div><dt>待下架</dt><dd>{preview.offlineCandidates?.length ?? 0}</dd></div><div><dt>无需修改</dt><dd>{preview.unchanged ?? 0}</dd></div><div><dt>自动跳过</dt><dd>{preview.skipped.length}</dd></div></dl></article>)}</div>{previewActionCount > remainingCapacity ? <Alert type="warning" showIcon message={`方案需要 ${previewActionCount} 个任务，当前队列只剩 ${remainingCapacity} 个位置`} /> : null}<div className="publish-preset-runner-actions"><Button disabled={isLoading} onClick={clearPreview}>清除预览</Button><Button type="primary" loading={isLoading} disabled={hasPreviewFailures || previewResults.length !== selectedPreset?.rules.length || previewActionCount === 0 || previewActionCount > remainingCapacity} onClick={() => void handleConfirmPreset()}>确认全部加入队列</Button></div></> : null}
  </section>;
}
