import { useEffect, useState } from 'react';
import { Alert, Button, InputNumber, Progress, Select, Spin, Tag, message } from 'antd';
import { fetchLocalBrandCategories } from './api';
import { createPublishBatch, fetchPublishBatch, previewPublishBatch, retryPublishTask } from './xianyuApi';
import type { BrandCategory, PublishBatch, PublishBatchPreview, PublishBatchSettings, PublishTask, PublishTaskStatus } from './types';

/** 发布任务状态展示配置。 */
const TASK_STATUS_LABELS: Record<PublishTaskStatus, string> = {
  queued: '等待发布',
  preparing: '准备图片',
  needs_login: '需要登录',
  publishing: '发布中',
  succeeded: '发布成功',
  failed: '发布失败',
};

/** 返回发布任务标签颜色。 */
function getTaskStatusColor(status: PublishTaskStatus): string {
  if (status === 'succeeded') return 'success';
  if (status === 'failed' || status === 'needs_login') return 'error';
  if (status === 'publishing' || status === 'preparing') return 'processing';
  return 'default';
}

/** 品牌批量发布独立页面。 */
export function BrandPublishPage({ batchId, brandStoreId, brandName, onBack }: { batchId?: string; brandStoreId?: string; brandName?: string; onBack: () => void }) {
  // 本次最多创建的任务数量。
  const [publishLimit, setPublishLimit] = useState(20);
  // 相邻商品发布的最小间隔秒数。
  const [minDelaySeconds, setMinDelaySeconds] = useState(4);
  // 相邻商品发布的最大间隔秒数。
  const [maxDelaySeconds, setMaxDelaySeconds] = useState(7);
  // 当前品牌在小程序中的可选品类。
  const [brandCategories, setBrandCategories] = useState<BrandCategory[]>([]);
  // 本批次选择的品牌品类 ID。
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  // 创建前预览结果。
  const [preview, setPreview] = useState<PublishBatchPreview | null>(null);
  // 已创建的批量发布任务。
  const [batch, setBatch] = useState<PublishBatch | null>(null);
  // 页面请求状态。
  const [isLoading, setIsLoading] = useState(Boolean(batchId));
  // 品牌品类加载状态。
  const [isCategoryLoading, setIsCategoryLoading] = useState(!batchId && Boolean(brandStoreId));
  // 页面错误信息。
  const [errorMessage, setErrorMessage] = useState('');
  // Ant Design 消息实例。
  const [messageApi, messageContextHolder] = message.useMessage();

  /** 获取当前数量下的发布计划预览。 */
  function getPublishBatchSettings(): PublishBatchSettings {
    const selectedCategorySet = new Set(categoryIds);
    const selectedCategories = brandCategories.filter((category) => selectedCategorySet.has(category.id));
    return { limit: publishLimit, minDelaySeconds, maxDelaySeconds, categoryIds: selectedCategories.map((category) => category.id), categoryNames: selectedCategories.map((category) => category.name) };
  }

  /** 获取当前配置下的发布计划预览。 */
  async function loadPreview() {
    if (!brandStoreId) {
      setErrorMessage('发布页面缺少品牌门店信息');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      setPreview(await previewPublishBatch(brandStoreId, getPublishBatchSettings()));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '发布计划预览失败');
    } finally {
      setIsLoading(false);
    }
  }

  /** 确认创建并启动串行发布任务。 */
  async function handleCreateBatch() {
    if (!brandStoreId) {
      setErrorMessage('发布页面缺少品牌门店信息');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const nextBatch = await createPublishBatch(brandStoreId, getPublishBatchSettings());
      setBatch(nextBatch);
      messageApi.success(`已创建 ${nextBatch.tasks.length} 个串行发布任务`);
      window.location.hash = `/publish-batches/${nextBatch.id}`;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '批量发布任务创建失败');
    } finally {
      setIsLoading(false);
    }
  }

  /** 重试一条失败或需要登录的任务。 */
  async function handleRetryTask(task: PublishTask) {
    try {
      await retryPublishTask(task.id);
      messageApi.success(`${task.itemNo} 已重新排队`);
      if (batch) setBatch(await fetchPublishBatch(batch.id));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '重新排队失败');
    }
  }

  /** 刷新批量发布任务的实时进度。 */
  async function refreshBatchProgress(batchId: string) {
    try {
      setBatch(await fetchPublishBatch(batchId));
    } catch {
      // 短暂轮询失败时保留当前进度，下一轮继续读取。
    }
  }

  /** 根据页面路由读取预览或已有批次。 */
  async function loadRouteContent() {
    if (batchId) {
      setIsLoading(true);
      setErrorMessage('');
      try {
        setBatch(await fetchPublishBatch(batchId));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '读取批量发布进度失败');
      } finally {
        setIsLoading(false);
      }
    }
  }

  /** 读取品牌可用于筛选和发布的商品品类。 */
  async function loadCategoryOptions() {
    if (!brandStoreId || batchId) {
      setIsCategoryLoading(false);
      return;
    }
    try {
      setBrandCategories(await fetchLocalBrandCategories(brandStoreId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '品牌品类读取失败');
    } finally {
      setIsCategoryLoading(false);
    }
  }

  /** 修改发布设置并废弃旧预览。 */
  function updatePublishSetting(updateSetting: () => void) {
    updateSetting();
    setPreview(null);
  }

  useEffect(() => {
    void loadRouteContent();
    void loadCategoryOptions();
  }, []);

  useEffect(() => {
    if (!batch || batch.status === 'completed' || batch.status === 'failed') return undefined;
    const timer = window.setInterval(() => void refreshBatchProgress(batch.id), 1500);
    return () => window.clearInterval(timer);
  }, [batch?.id, batch?.status]);

  // 已结束的实际发布任务数量。
  const finishedCount = batch ? batch.succeeded + batch.failed + batch.needsLogin : 0;
  // 发布任务完成进度。
  const progressPercent = batch && batch.tasks.length > 0 ? Math.round((finishedCount / batch.tasks.length) * 100) : 0;
  // 当前正在处理的任务。
  const currentTask = batch?.tasks.find((task) => task.status === 'preparing' || task.status === 'publishing');
  // 当前队列阶段文案。
  let progressHeadline = `安全间隔中 · ${batch?.minDelaySeconds ?? minDelaySeconds}–${batch?.maxDelaySeconds ?? maxDelaySeconds} 秒后继续`;
  if (batch?.status === 'preparing') {
    progressHeadline = '正在逐件读取实时商详并生成任务';
  } else if (batch?.status === 'failed') {
    progressHeadline = '批量任务准备失败';
  } else if (currentTask) {
    progressHeadline = `正在发布 ${currentTask.itemNo}`;
  } else if (batch?.status === 'completed') {
    progressHeadline = '本批次处理完成';
  }
  // 当前展示的自动跳过清单。
  const skippedItems = batch?.skipped ?? preview?.skipped ?? [];

  return (
    <main className="brand-publish-page">
      {messageContextHolder}
      <header className="brand-publish-page__header"><button type="button" onClick={onBack}>← 返回我的商品库</button><div><small>BRAND PUBLISH QUEUE</small><h1>发布当前品牌</h1><p>{batch?.brandName ?? preview?.brandName ?? brandName ?? '品牌发布批次'}{(batch?.categoryNames?.length || preview?.categoryNames?.length) ? ` · ${(batch?.categoryNames ?? preview?.categoryNames ?? []).join('、')}` : ''} · 串行发布与跳过检查</p></div></header>
      <div className="brand-publish-workspace">
        <section className="brand-publish-overview">
          <div><small>CURRENT BRAND</small><h2>{batch?.brandName ?? preview?.brandName ?? brandName ?? '正在读取品牌'}</h2><p>每件商品依次发布；确认前不会创建任何闲鱼任务。</p></div>
          {!batch ? <div className="brand-publish-settings">
            <label><span>发布商品品类</span><Select mode="multiple" allowClear maxTagCount="responsive" value={categoryIds} placeholder="全部品类" loading={isCategoryLoading} onChange={(values) => updatePublishSetting(() => setCategoryIds(values))} options={brandCategories.map((category) => ({ value: category.id, label: category.name }))} /></label>
            <label><span>本次最多发布</span><InputNumber min={1} max={500} value={publishLimit} onChange={(value) => updatePublishSetting(() => setPublishLimit(Number(value ?? 20)))} addonAfter="件" /></label>
            <label><span>发布安全间隔</span><div className="brand-publish-delay-range"><InputNumber min={1} max={60} value={minDelaySeconds} onChange={(value) => updatePublishSetting(() => setMinDelaySeconds(Number(value ?? 4)))} addonAfter="秒" /><b>至</b><InputNumber min={1} max={60} value={maxDelaySeconds} onChange={(value) => updatePublishSetting(() => setMaxDelaySeconds(Number(value ?? 7)))} addonAfter="秒" /></div></label>
            <Button type="primary" onClick={() => void loadPreview()} disabled={isLoading || isCategoryLoading || minDelaySeconds > maxDelaySeconds}>{preview ? '重新生成预览' : '生成发布预览'}</Button>
          </div> : null}
        </section>

        {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
        {isLoading ? <div className="brand-publish-loading"><Spin /><span>正在核对当前品牌商品…</span></div> : null}

        {!batch && preview ? <section className="brand-publish-preview">
          <div className="brand-publish-metrics"><article><span>品牌商品</span><strong>{preview.total}</strong></article><article><span>可发布</span><strong>{preview.publishable}</strong></article><article><span>本次入队</span><strong>{preview.selected}</strong></article><article><span>自动跳过</span><strong>{preview.skipped.length}</strong></article></div>
          <Alert type="info" showIcon message={`当前范围：${preview.categoryNames?.join('、') || '全部品类'}。确认后创建 ${preview.selected} 个任务，按 ${minDelaySeconds}～${maxDelaySeconds} 秒随机间隔逐件发布。`} />
          <footer><Button onClick={onBack}>取消</Button><Button type="primary" disabled={preview.selected === 0 || minDelaySeconds > maxDelaySeconds} loading={isLoading} onClick={() => void handleCreateBatch()}>确认并开始发布</Button></footer>
        </section> : null}

        {batch ? <section className="brand-publish-progress">
          <header><div><small>QUEUE PROGRESS</small><h3>{progressHeadline}</h3></div><strong>{progressPercent}%</strong></header>
          <Progress percent={progressPercent} showInfo={false} strokeColor="#ff0046" />
          {batch.errorMessage ? <Alert type="error" showIcon message={batch.errorMessage} /> : null}
          <div className="brand-publish-metrics"><article><span>等待</span><strong>{batch.queued}</strong></article><article><span>处理中</span><strong>{batch.running}</strong></article><article><span>成功</span><strong>{batch.succeeded}</strong></article><article><span>失败/登录</span><strong>{batch.failed + batch.needsLogin}</strong></article></div>
          <div className="brand-publish-task-list">{batch.tasks.map((task) => <article key={task.id}><div><strong>{task.itemNo}</strong><span>{task.title}</span></div><Tag color={getTaskStatusColor(task.status)}>{TASK_STATUS_LABELS[task.status]}</Tag>{task.errorMessage ? <p>{task.errorMessage}</p> : null}{task.xianyuUrl ? <a href={task.xianyuUrl} target="_blank" rel="noreferrer">查看闲鱼商品 ↗</a> : null}{task.status === 'failed' || task.status === 'needs_login' ? <Button size="small" onClick={() => void handleRetryTask(task)}>重试</Button> : null}</article>)}</div>
        </section> : null}

        {skippedItems.length > 0 ? <section className="brand-publish-skips"><header><small>AUTO SKIPPED</small><h3>自动跳过 {skippedItems.length} 件</h3></header><div>{skippedItems.map((item, index) => <article key={`${item.itemNo}-${index}`}><strong>{item.itemNo || '无货号'}</strong><span>{item.title}</span><em>{item.reason}</em></article>)}</div></section> : null}
      </div>
    </main>
  );
}
