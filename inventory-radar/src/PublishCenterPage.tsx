import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Drawer, Form, Image, Input, InputNumber, Modal, Popconfirm, Popover, Progress, Radio, Select, Space, Statistic, Tag, Typography } from 'antd';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { fetchBrandOptions, fetchLiveBrandCategories, fetchLiveBrandOptions, fetchLocalBrandCategories } from './api';
import { REGION_OPTIONS } from './constants';
import { appendPublishOperation, cancelPublishOperation, fetchPublishOperation, fetchPublishOperations, previewPublishOperation, retryPublishTask } from './xianyuApi';
import type { BrandCategory, BrandOption, PublishBatch, PublishBatchPreview, PublishBatchSettings, PublishTask } from './types';
import { BrandSelectOption } from './BrandSelectOption';
import { fetchBrandMaintenance } from './catalogManagementApi';
import { fetchReconcileOverview, type ReconcilePlanRecord } from './xianyuApi';
import { retryFailedOperation } from './xianyuApi';
import { useXianyuAccount } from './XianyuAccountContext';

/** 单个发布操作最多容纳的唯一商品任务。 */
const PUBLISH_OPERATION_CAPACITY = 3000;

/** 发布中心轮询间隔。 */
const PUBLISH_OPERATION_POLL_INTERVAL = 1800;


/** 发布任务状态标签。 */
const TASK_STATUS_LABELS: Record<string, string> = { queued: '等待处理', preparing: '准备中', publishing: '处理中', succeeded: '处理成功', failed: '处理失败', needs_login: '处理失败' };

/** 将分单位金额格式化为人民币。 */
function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(priceCents / 100);
}

/** 格式化发布时间。 */
function formatPublishTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

/** 将货源地区 ID 转成用户可读的仓库名称。 */
function formatSourceRegions(regionIDs?: string[]): string {
  return (regionIDs ?? []).map((regionID) => REGION_OPTIONS.find((region) => region.id === regionID)?.shortName ?? regionID).join('、') || '—';
}

/** 返回发布操作状态。 */
function getOperationStatus(operation: PublishBatch): { color: string; label: string } {
  if (operation.status === 'completed') return { color: 'success', label: '已完成' };
  if (operation.status === 'cancelled') return { color: 'warning', label: '已取消' };
  if (operation.status === 'failed') return { color: 'error', label: '失败' };
  if (operation.status === 'preparing') return { color: 'processing', label: '生成任务中' };
  return { color: 'processing', label: '处理中' };
}

/** 返回操作已处理任务数量。 */
function getProcessedCount(operation: PublishBatch): number {
  return operation.succeeded + operation.failed + operation.needsLogin;
}

/** 返回操作进度百分比。 */
function getOperationProgress(operation: PublishBatch): number {
  const taskCount = operation.tasks.length || Math.max(0, operation.total - (operation.skippedCount ?? operation.skipped.length));
  if (taskCount === 0) return 0;
  return Math.min(100, Math.round((getProcessedCount(operation) / taskCount) * 100));
}

/** 返回操作实际任务数量。 */
function getOperationTaskCount(operation: PublishBatch): number {
  return operation.tasks.length || Math.max(0, operation.total - (operation.skippedCount ?? operation.skipped.length));
}

/** 返回发布任务状态对应的标签颜色。 */
function getTaskStatusColor(status: PublishTask['status']): string {
  if (status === 'succeeded') return 'success';
  if (status === 'failed' || status === 'needs_login') return 'error';
  if (status === 'queued') return 'default';
  return 'processing';
}

/** 返回发布任务类型标签。 */
function renderTaskAction(task: PublishTask) {
  const action = task.action || 'publish';
  if (action === 'update') return <Tag color="processing">修改商品</Tag>;
  if (action === 'offline') return <Tag color="warning">下架商品</Tag>;
  if (action === 'relist') return <Tag color="cyan">恢复旧商品</Tag>;
  return <Tag color="success">发布商品</Tag>;
}

/** 展示紧凑的任务变更原因，并在点击后查看完整内容。 */
function renderTaskChangeReason(task: PublishTask) {
  const changeReasons = task.changeReasons ?? [];
  if (changeReasons.length === 0) return <span className="publish-task-no-change">—</span>;
  const changeReason = changeReasons.join('；');
  return <Popover title="触发编辑的具体变化" trigger={['hover', 'click']} placement="topLeft" content={<Typography.Paragraph style={{ maxWidth: 'min(520px, 78vw)', marginBottom: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{changeReasons.map((reason) => <span className="publish-task-change-line" key={reason}>{reason}</span>)}</Typography.Paragraph>}><button type="button" className="publish-task-change-reason"><span>{changeReason}</span>{changeReasons.length > 1 ? <em>共 {changeReasons.length} 项</em> : null}</button></Popover>;
}

/** 判断发布操作是否仍需刷新进度。 */
function isOperationActive(operation: PublishBatch): boolean {
  return operation.status === 'running' || operation.status === 'preparing';
}

/** 展示可点击放大的 SKU 商品图。 */
function renderSkuImage(imageUrl?: string, title?: string) {
  if (!imageUrl) return <span className="sku-image-placeholder">暂无图片</span>;
  return <Image className="sku-preview-image" width={56} height={56} src={imageUrl} alt={title || 'SKU 商品图'} preview={{ mask: '查看大图' }} fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect width='56' height='56' fill='%23f2f4f6'/%3E%3C/svg%3E" />;
}

/** 发布中心：统一管理当前队列、品牌追加和历史记录。 */
export function PublishCenterPage({ operationId }: { operationId?: string }) {
  // 当前账号决定列表、预览和新建队列的隔离范围。
  const { accounts, currentAccount, currentAccountId } = useXianyuAccount();
  // 同步后等待确认的历史计划。
  const [reconcilePlans, setReconcilePlans] = useState<ReconcilePlanRecord[]>([]);
  // 发布操作列表。
  const [operations, setOperations] = useState<PublishBatch[]>([]);
  // 当前操作详情。
  const [operation, setOperation] = useState<PublishBatch | null>(null);
  // 操作记录总数。
  const [operationTotal, setOperationTotal] = useState(0);
  // 页面加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 页面错误提示。
  const [errorMessage, setErrorMessage] = useState('');
  // 品牌追加弹窗状态。
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  // 追加来源。
  const [sourceType, setSourceType] = useState<'live' | 'local'>('live');
  // 追加仓库地区。
  const [regionId, setRegionId] = useState('3');
  // 当前可选品牌。
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  // 当前品牌选择。
  const [brandId, setBrandId] = useState('');
  // 当前品牌聚合后的商品品类。
  const [brandCategories, setBrandCategories] = useState<BrandCategory[]>([]);
  // 当前选中的商品品类键。
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  // 品牌品类加载状态。
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  // 发布数量。
  const [publishLimit, setPublishLimit] = useState(500);
  // 最小安全间隔。
  const [minDelaySeconds, setMinDelaySeconds] = useState(1);
  // 最大安全间隔。
  const [maxDelaySeconds, setMaxDelaySeconds] = useState(2);
  // 商品最低售价，单位元，空值表示不限制。
  const [minPriceYuan, setMinPriceYuan] = useState<number | null>(null);
  // 商品最高售价，单位元，空值表示不限制。
  const [maxPriceYuan, setMaxPriceYuan] = useState<number | null>(null);
  // 商品最低折扣率，百分比，空值表示不限制。
  const [minDiscountRate, setMinDiscountRate] = useState<number | null>(null);
  // 商品最高折扣率，百分比，空值表示不限制。
  const [maxDiscountRate, setMaxDiscountRate] = useState<number | null>(null);
  // 避免筛选改变后较慢的旧预览覆盖新配置。
  const previewRequestVersion = useRef(0);
  // 避免切换账号后旧队列请求覆盖新账号列表。
  const operationRequestVersion = useRef(0);
  /** 作废旧预览和未结束请求。 */
  function clearPreview() { previewRequestVersion.current += 1; setPreview(null); setIsPlanning(false); setOfflinePreviewKeyword(''); setUpdatePreviewKeyword(''); setCandidatePreviewKeyword(''); setPreservedOfflinePlatformItemIds([]); }
  // 当前品牌预览。
  const [preview, setPreview] = useState<PublishBatchPreview | null>(null);
  // 品牌和预览加载状态。
  const [isPlanning, setIsPlanning] = useState(false);
  // 当前重试任务 ID。
  const [retryingTaskId, setRetryingTaskId] = useState('');
  // 批量重试期间禁用全部重试入口，防止重复提交。
  const [retryingGroup, setRetryingGroup] = useState('');
  // 正在取消的发布队列 ID。
  const [cancellingOperationId, setCancellingOperationId] = useState('');
  // 当前任务明细查询条件。
  const [taskFilters, setTaskFilters] = useState({ itemNo: '', title: '', brand: '', status: '', action: '' });
  // 待下架预览搜索词。
  const [offlinePreviewKeyword, setOfflinePreviewKeyword] = useState('');
  // 用户确认保留上架的闲鱼商品 ID。
  const [preservedOfflinePlatformItemIds, setPreservedOfflinePlatformItemIds] = useState<string[]>([]);
  // 待修改预览搜索词。
  const [updatePreviewKeyword, setUpdatePreviewKeyword] = useState('');
  // 可发布商品搜索词。
  const [candidatePreviewKeyword, setCandidatePreviewKeyword] = useState('');

  /** 加载发布操作列表。 */
  async function loadOperations(silent = false) {
    const requestVersion = operationRequestVersion.current + 1;
    operationRequestVersion.current = requestVersion;
    const requestAccountId = currentAccountId;
    if (!silent) setIsLoading(true);
    try {
      const response = await fetchPublishOperations(1, 100, currentAccountId);
      if (requestVersion !== operationRequestVersion.current) return;
      setOperations(response.list);
      setOperationTotal(response.total);
      setErrorMessage('');
      const plans = await fetchReconcileOverview(currentAccountId);
      if (requestVersion !== operationRequestVersion.current || requestAccountId !== currentAccountId) return;
      setReconcilePlans(plans);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取发布操作记录失败');
    } finally {
      if (!silent && requestVersion === operationRequestVersion.current) setIsLoading(false);
    }
  }

  /** 加载当前发布操作详情。 */
  async function loadOperation(silent = false) {
    if (!operationId) return;
    if (!silent) setIsLoading(true);
    try {
      setOperation(await fetchPublishOperation(operationId));
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取发布队列失败');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  /** 取消当前发布队列，保留已经完成的任务。 */
  async function handleCancelOperation(operationID: string) {
    setCancellingOperationId(operationID);
    try {
      await cancelPublishOperation(operationID);
      if (operationId) await loadOperation(true);
      else await loadOperations(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '取消队列失败');
    } finally {
      setCancellingOperationId('');
    }
  }

  /** 加载当前来源与地区的品牌。 */
  async function loadBrands(nextSourceType: 'live' | 'local', nextRegionId: string) {
    setBrandId('');
    setBrandCategories([]);
    setCategoryIds([]);
    clearPreview();
    try {
      const [sourceBrands, maintenance] = await Promise.all([nextSourceType === 'live' ? fetchLiveBrandOptions(nextRegionId) : fetchBrandOptions(nextRegionId), fetchBrandMaintenance()]);
      const sourcesByKey = new Map(maintenance.sources.map((source) => [`${source.regionId}:${source.distributorId}`, source]));
      const profileOptions: BrandOption[] = maintenance.profiles.map((profile) => {
        const memberSources = profile.members.map((member) => sourcesByKey.get(`${member.regionId}:${member.distributorId}`)).filter(Boolean);
        const regionNames = Array.from(new Set(profile.members.map((member) => REGION_OPTIONS.find((region) => region.id === member.regionId)?.shortName ?? member.regionId))).join('、');
        return { value: `profile:${profile.id}`, label: `${profile.name}（${regionNames}）`, brandProfileId: profile.id, logoUrl: memberSources.find((source) => source?.logoUrl)?.logoUrl, onlineGoodsCount: memberSources.reduce((total, source) => total + Number(source?.onlineGoodsCount ?? 0), 0), profileMembers: profile.members };
      });
      setBrandOptions([...profileOptions, ...sourceBrands]);
    } catch (error) {
      setBrandOptions([]);
      setErrorMessage(error instanceof Error ? error.message : '品牌列表加载失败');
    }
  }

  /** 加载并聚合当前品牌覆盖门店的商品品类。 */
  async function loadBrandCategories(brandOption: BrandOption) {
    setIsCategoryLoading(true);
    setBrandCategories([]);
    setCategoryIds([]);
    try {
      let categoryLists: BrandCategory[][] = [];
      if (brandOption.brandProfileId) {
        const categoryResults = await Promise.allSettled((brandOption.profileMembers ?? []).map((member) => fetchLiveBrandCategories(member.regionId, member.distributorId)));
        categoryLists = categoryResults.filter((result): result is PromiseFulfilledResult<BrandCategory[]> => result.status === 'fulfilled').map((result) => result.value);
      } else if (sourceType === 'live') {
        categoryLists = [await fetchLiveBrandCategories(regionId, brandOption.categoryDistributorId ?? '')];
      } else {
        categoryLists = [await fetchLocalBrandCategories(brandOption.value)];
      }

      // 按品类名称聚合不同门店可能不一致的源 ID。
      const categoriesByName = new Map<string, BrandCategory>();
      categoryLists.flat().forEach((category) => {
        const categoryKey = category.name.trim().toLocaleLowerCase('zh-CN');
        const existingCategory = categoriesByName.get(categoryKey);
        if (!existingCategory) {
          categoriesByName.set(categoryKey, { ...category, sourceIds: [category.id] });
          return;
        }
        existingCategory.sourceIds = Array.from(new Set([...(existingCategory.sourceIds ?? [existingCategory.id]), category.id]));
        if (!existingCategory.imageUrl && category.imageUrl) existingCategory.imageUrl = category.imageUrl;
      });
      setBrandCategories(Array.from(categoriesByName.values()));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '品牌品类读取失败');
    } finally {
      setIsCategoryLoading(false);
    }
  }

  // 当前仍在运行的操作。
  const activeOperation = operation ?? operations.find(isOperationActive) ?? null;
  // 新任务应绑定列表当前账号或详情队列原账号。
  const targetAccountId = operation?.accountId ?? currentAccountId;
  // 新任务目标账号信息。
  const targetAccount = accounts.find((account) => account.id === targetAccountId) ?? currentAccount;
  // 当前页面是否存在需要轮询的操作。
  const shouldPollOperation = operationId ? Boolean(operation && isOperationActive(operation)) : Boolean(activeOperation);

  /** 页面可见时刷新仍在执行的发布操作。 */
  function pollActiveOperation() {
    if (document.visibilityState !== 'visible') return;
    if (operationId) void loadOperation(true);
    else void loadOperations(true);
  }

  useEffect(() => {
	operationRequestVersion.current += 1;
	clearPreview();
	setBrandId('');
	setOperations([]);
	setReconcilePlans([]);
    if (operationId) void loadOperation();
    else void loadOperations();
  }, [operationId, currentAccountId]);

  useEffect(() => {
    if (!shouldPollOperation) return undefined;
    const pollTimer = window.setInterval(pollActiveOperation, PUBLISH_OPERATION_POLL_INTERVAL);
    document.addEventListener('visibilitychange', pollActiveOperation);
    return () => {
      window.clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', pollActiveOperation);
    };
  }, [operationId, shouldPollOperation]);

  // 当前操作剩余容量。
  const remainingCapacity = Math.max(0, PUBLISH_OPERATION_CAPACITY - (activeOperation?.limit ?? 0));
  // 当前选中品牌。
  const selectedBrand = brandOptions.find((brandOption) => brandOption.value === brandId);
  // 应用查询条件后的任务明细。
  const filteredTasks = useMemo(() => {
    const normalizedItemNo = taskFilters.itemNo.trim().toLocaleLowerCase('zh-CN');
    const normalizedTitle = taskFilters.title.trim().toLocaleLowerCase('zh-CN');
    const normalizedBrand = taskFilters.brand.trim().toLocaleLowerCase('zh-CN');
    return (operation?.tasks ?? []).filter((task) => {
      if (normalizedItemNo && !task.itemNo.toLocaleLowerCase('zh-CN').includes(normalizedItemNo)) return false;
      if (normalizedTitle && !task.title.toLocaleLowerCase('zh-CN').includes(normalizedTitle)) return false;
      if (normalizedBrand && !(task.brand ?? '').toLocaleLowerCase('zh-CN').includes(normalizedBrand)) return false;
      if (taskFilters.status === 'failed') { if (task.status !== 'failed' && task.status !== 'needs_login') return false; }
      else if (taskFilters.status && task.status !== taskFilters.status) return false;
      if (taskFilters.action && (task.action || 'publish') !== taskFilters.action) return false;
      return true;
    });
  }, [operation?.tasks, taskFilters]);

  // 当前预览中匹配搜索词的待下架商品。
  const filteredOfflineCandidates = useMemo(() => {
    const keyword = offlinePreviewKeyword.trim().toLocaleLowerCase('zh-CN');
    if (!keyword) return preview?.offlineCandidates ?? [];
    return (preview?.offlineCandidates ?? []).filter((item) => `${item.itemNo ?? ''} ${item.title ?? ''}`.toLocaleLowerCase('zh-CN').includes(keyword));
  }, [preview?.offlineCandidates, offlinePreviewKeyword]);

  // 当前预览中将实际加入下架队列的商品。
  const pendingOfflineCandidates = useMemo(() => {
    const preservedItemIdSet = new Set(preservedOfflinePlatformItemIds);
    return (preview?.offlineCandidates ?? []).filter((item) => !preservedItemIdSet.has(item.platformItemId));
  }, [preview?.offlineCandidates, preservedOfflinePlatformItemIds]);

  // 当前预览中匹配搜索词的待修改商品。
  const filteredPreviewUpdates = useMemo(() => {
    const keyword = updatePreviewKeyword.trim().toLocaleLowerCase('zh-CN');
    if (!keyword) return preview?.updates ?? [];
    return (preview?.updates ?? []).filter((item) => `${item.itemNo ?? ''} ${item.title ?? ''} ${(item.changeReasons ?? []).join(' ')}`.toLocaleLowerCase('zh-CN').includes(keyword));
  }, [preview?.updates, updatePreviewKeyword]);

  // 当前预览中匹配搜索词的可发布商品。
  const filteredPreviewCandidates = useMemo(() => {
    const keyword = candidatePreviewKeyword.trim().toLocaleLowerCase('zh-CN');
    if (!keyword) return preview?.candidates ?? [];
    return (preview?.candidates ?? []).filter((item) => `${item.itemNo} ${item.title}`.toLocaleLowerCase('zh-CN').includes(keyword));
  }, [preview?.candidates, candidatePreviewKeyword]);

  // 按完整任务集统计，搜索筛选不改变队列总体数量；旧任务默认归类为发布。
  const actionSummaries = useMemo(() => {
    const summaries = [
      { action: 'publish', label: '发布商品', total: 0, waiting: 0, running: 0, succeeded: 0, failed: 0 },
      { action: 'update', label: '修改商品', total: 0, waiting: 0, running: 0, succeeded: 0, failed: 0 },
      { action: 'relist', label: '恢复旧商品', total: 0, waiting: 0, running: 0, succeeded: 0, failed: 0 },
      { action: 'offline', label: '下架商品', total: 0, waiting: 0, running: 0, succeeded: 0, failed: 0 },
    ];
    for (const task of operation?.tasks ?? []) {
      const summary = summaries.find((item) => item.action === (task.action || 'publish'));
      if (!summary) continue;
      summary.total += 1;
      if (task.status === 'queued') summary.waiting += 1;
      else if (task.status === 'preparing' || task.status === 'publishing') summary.running += 1;
      else if (task.status === 'succeeded') summary.succeeded += 1;
      else if (task.status === 'failed' || task.status === 'needs_login') summary.failed += 1;
    }
    return summaries;
  }, [operation?.tasks]);

  /** 打开追加品牌表单。 */
  function handleOpenAddBrand() {
    clearPreview();
    setPublishLimit(Math.min(500, remainingCapacity || 500));
    setIsAddBrandOpen(true);
    void loadBrands(sourceType, regionId);
  }

  /** 切换商品来源。 */
  function handleChangeSource(nextSourceType: 'live' | 'local') {
    setSourceType(nextSourceType);
    void loadBrands(nextSourceType, regionId);
  }

  /** 切换仓库地区。 */
  function handleChangeRegion(nextRegionId: string) {
    setRegionId(nextRegionId);
    void loadBrands(sourceType, nextRegionId);
  }

  /** 切换发布品牌并读取聚合品类。 */
  function handleChangeBrand(nextBrandId: string) {
    setBrandId(nextBrandId);
    clearPreview();
    const nextBrand = brandOptions.find((brandOption) => brandOption.value === nextBrandId);
    if (nextBrand) void loadBrandCategories(nextBrand);
  }

  /** 切换一个品类筛选项。 */
  function handleToggleCategory(categoryId: string) {
    setCategoryIds((currentIds) => currentIds.includes(categoryId) ? currentIds.filter((currentId) => currentId !== categoryId) : [...currentIds, categoryId]);
    clearPreview();
  }

  /** 切换一件待下架商品的保留状态。 */
  function handleToggleOfflinePreservation(platformItemId: string) {
    setPreservedOfflinePlatformItemIds((currentItemIds) => currentItemIds.includes(platformItemId)
      ? currentItemIds.filter((itemId) => itemId !== platformItemId)
      : [...currentItemIds, platformItemId]);
  }

  /** 生成当前品牌发布预览。 */
  async function handlePreview() {
    if (!selectedBrand) return;
    setIsPlanning(true);
    setErrorMessage('');
    try {
      const settings = buildPublishSettings();
      // 只接收当前配置发起的预览结果。
      const requestVersion = ++previewRequestVersion.current;
      const nextPreview = await previewPublishOperation(selectedBrand.brandProfileId ? '' : sourceType === 'local' ? selectedBrand.value : '', settings);
      if (requestVersion === previewRequestVersion.current) setPreview(nextPreview);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '生成发布计划失败');
    } finally {
      setIsPlanning(false);
    }
  }

  /** 组装发布中心品牌追加参数。 */
  function buildPublishSettings(): PublishBatchSettings {
    const selectedCategorySet = new Set(categoryIds);
    const selectedCategories = brandCategories.filter((category) => selectedCategorySet.has(category.id));
    const sourceCategoryIds = Array.from(new Set(selectedCategories.flatMap((category) => category.sourceIds ?? [category.id])));
    return { accountId: targetAccountId, sourceType, brandProfileId: selectedBrand?.brandProfileId, distributorId: sourceType === 'live' && !selectedBrand?.brandProfileId ? selectedBrand?.categoryDistributorId : undefined, brandName: selectedBrand?.label, regionId, categoryIds: sourceCategoryIds, categoryNames: selectedCategories.map((category) => category.name), limit: publishLimit, minDelaySeconds, maxDelaySeconds, minPriceCents: minPriceYuan == null ? undefined : Math.round(minPriceYuan * 100), maxPriceCents: maxPriceYuan == null ? undefined : Math.round(maxPriceYuan * 100), minDiscountRate: minDiscountRate ?? undefined, maxDiscountRate: maxDiscountRate ?? undefined };
  }

  /** 创建操作或追加品牌到当前队列。 */
  async function handleAppendBrand() {
    if (!preview) return;
    setIsPlanning(true);
    try {
      const nextOperation = await appendPublishOperation('', { ...buildPublishSettings(), previewId: preview.previewId, preservedOfflinePlatformItemIds });
      setIsAddBrandOpen(false);
      window.location.hash = `/publish-operations/${encodeURIComponent(nextOperation.id)}`;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '追加品牌失败');
    } finally {
      setIsPlanning(false);
    }
  }


  /** 同步后的计划重新核对实时货源后再交给用户确认。 */
  async function handleReviewReconcile(record: ReconcilePlanRecord) {
    setIsAddBrandOpen(true); clearPreview(); setIsPlanning(true);
    try { setPreview(await previewPublishOperation('', record.request)); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : '对账失败'); }
    finally { setIsPlanning(false); }
  }

  /** 按本次显示的失败集合重新入队，不包含运行中、成功或后来新增的失败任务。 */
  async function handleRetryFailed(action = '') {
    if (!operation || retryingGroup || retryingTaskId) return;
    // 固定此次重试的失败任务 ID，避免后台状态变化扩大执行范围。
    const failures = operation.tasks.filter((task) => (task.status === 'failed' || task.status === 'needs_login') && (!action || (task.action || 'publish') === action));
    if (failures.length === 0) return;
    setRetryingGroup(action || 'all');
    setErrorMessage('');
    try {
      const result = await retryFailedOperation(operation.id, failures.map((task) => task.id), action);
      await loadOperation(true);
      Modal.info({ title: `已重新入队 ${result.queued.length} 件`, content: result.rejected.length ? <div>{result.rejected.map((item, index) => <p key={`${item.itemNo}-${index}`}>{item.itemNo}：{item.reason}</p>)}</div> : '将在当前队列中依次重新核对并处理，可查看任务明细中的结果。' });
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : '重试失败'); }
    finally { setRetryingGroup(''); }
  }

  /** 重试一条失败或待登录任务。 */
  async function handleRetryTask(task: PublishTask) {
    setRetryingTaskId(task.id);
    try {
      await retryPublishTask(task.id);
      await loadOperation(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '取消队列失败');
    } finally {
      setCancellingOperationId('');
    }
  }

  // 发布操作记录表格列。
  const operationColumns: ProColumns<PublishBatch>[] = [
    { title: '操作记录', dataIndex: 'id', search: false, render: (_, record) => <div className="publish-operation-id"><strong>#{record.id.slice(-8).toUpperCase()}</strong><span>{formatPublishTime(record.createdAt)}</span></div> },
    { title: '品牌范围', search: false, render: (_, record) => <div className="publish-operation-brands">{(record.segments ?? []).map((segment) => <Tag key={segment.id}>{segment.brandName}</Tag>)}{(record.segments ?? []).length === 0 ? <Tag>{record.brandName}</Tag> : null}</div> },
    { title: '状态', dataIndex: 'status', search: false, render: (_, record) => { const status = getOperationStatus(record); return <Tag color={status.color}>{status.label}</Tag>; } },
    { title: '进度', search: false, width: 210, render: (_, record) => <div className="publish-operation-progress"><Progress percent={getOperationProgress(record)} size="small" /><span>{getProcessedCount(record)} / {getOperationTaskCount(record)}</span></div> },
    { title: '结果', search: false, render: (_, record) => <Space size={6} wrap><Tag color="success">成功 {record.succeeded}</Tag><Tag color="error">失败 {record.failed}</Tag><Tag>跳过 {record.skippedCount ?? record.skipped.length}</Tag>{record.offlineRequested > 0 ? <Tag color="warning">下架 {record.offlineSucceeded}/{record.offlineRequested}</Tag> : null}</Space> },
    { title: '操作', valueType: 'option', width: 190, render: (_, record) => [<Button type="link" key="detail" onClick={() => { window.location.hash = `/publish-operations/${encodeURIComponent(record.id)}`; }}>查看队列</Button>, record.status === 'running' || record.status === 'preparing' ? <Popconfirm key="cancel" title="确认取消这个队列？" description="已完成任务会保留，未执行任务将停止。" okText="确认取消" cancelText="返回" onConfirm={() => void handleCancelOperation(record.id)}><Button type="link" danger loading={cancellingOperationId === record.id}>取消队列</Button></Popconfirm> : null] },
  ];

  // 当前操作任务表格列。
  const taskColumns: ProColumns<PublishTask>[] = [
    { title: 'SKU 图片', search: false, width: 84, fixed: 'left', render: (_, task) => renderSkuImage(task.imageUrls?.[0], task.title) },
    { title: '货号', dataIndex: 'itemNo', copyable: true, width: 150, fixed: 'left', render: (_, task) => <code className="publish-task-item-no">{task.itemNo || '—'}</code> },
    { title: '商品标题', dataIndex: 'title', width: 300, render: (_, task) => <span className="publish-task-title" title={task.title}>{task.title || '未命名商品'}</span> },
    { title: '任务类型', dataIndex: 'action', valueType: 'select', valueEnum: { publish: '发布商品', relist: '恢复旧商品', update: '修改商品', offline: '下架商品' }, width: 112, render: (_, task) => renderTaskAction(task) },
    { title: '变更原因', search: false, width: 360, render: (_, task) => renderTaskChangeReason(task) },
    { title: '品牌', dataIndex: 'brand', width: 120 },
    { title: '售价', dataIndex: 'priceCents', search: false, width: 110, render: (_, task) => <strong className="publish-task-price">{formatPrice(task.priceCents)}</strong> },
    { title: '状态', dataIndex: 'status', valueType: 'select', valueEnum: Object.fromEntries(Object.entries(TASK_STATUS_LABELS).filter(([status]) => status !== 'needs_login').map(([status, label]) => [status, { text: label }])), width: 120, render: (_, task) => <Tag color={getTaskStatusColor(task.status)}>{TASK_STATUS_LABELS[task.status] ?? task.status}</Tag> },
    { title: '信息', search: false, width: 220, render: (_, task) => {
      if (task.errorMessage) return <Popover title="失败原因" trigger={['hover', 'click']} placement="topLeft" content={<Typography.Paragraph copyable={{ text: task.errorMessage }} style={{ maxWidth: 'min(440px, 75vw)', maxHeight: '50vh', overflowY: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginBottom: 0 }}>{task.errorMessage}</Typography.Paragraph>}><button type="button" className="publish-error-trigger" aria-label="查看完整失败原因">{task.errorMessage}</button></Popover>;
      if (task.xianyuUrl) return <a href={task.xianyuUrl} target="_blank" rel="noreferrer">查看闲鱼商品 ↗</a>;
      return '—';
    } },
    { title: '操作', valueType: 'option', width: 80, render: (_, task) => task.status === 'failed' || task.status === 'needs_login' ? [<Button key="retry" type="link" disabled={Boolean(retryingGroup) || Boolean(retryingTaskId && retryingTaskId !== task.id)} loading={retryingTaskId === task.id} onClick={() => void handleRetryTask(task)}>重试</Button>] : [] },
  ];

  // 页面实际展示或执行的账号名称。
  const displayedAccountName = targetAccount?.name ?? '未选择账号';

  return (
    <main className="publish-center-page">
      <header className="workspace-page-heading"><div><span className="workspace-eyebrow">PUBLISH / OPERATIONS</span><h1>{operationId ? '队列任务详情' : '发布中心'}</h1><p>当前账号：{displayedAccountName} · 所有发布、修改、下架与重试均绑定该账号。</p></div><div className="workspace-page-actions">{operationId ? <><Popconfirm title="确认取消这个队列？" description="已完成任务会保留，未执行任务将停止。" okText="确认取消" cancelText="返回" onConfirm={() => operation && void handleCancelOperation(operation.id)}><Button danger disabled={!operation || (operation.status !== 'running' && operation.status !== 'preparing')} loading={cancellingOperationId === operation?.id}>取消队列</Button></Popconfirm><Button onClick={() => { window.location.hash = '/publish-center'; }}>返回队列列表</Button></> : <Button type="primary" disabled={!targetAccount?.sellerConnected || targetAccount.status !== 'active'} onClick={handleOpenAddBrand}>加入品牌到队列</Button>}</div></header>
      {reconcilePlans.length > 0 ? <section className="publish-center-dashboard"><div className="workspace-list-heading"><div><strong>同步对账记录</strong><span>{reconcilePlans.length} 条待核对计划</span></div></div><ProTable<ReconcilePlanRecord> rowKey="id" search={false} options={false} dataSource={reconcilePlans} pagination={{ pageSize: 5 }} headerTitle="同步对账记录" columns={[{ title: '品牌', dataIndex: 'brandName' }, { title: '状态', dataIndex: 'status' }, { title: '待修改', dataIndex: 'updates' }, { title: '待下架', dataIndex: 'offline' }, { title: '失败原因', dataIndex: 'error' }, { title: '操作', render: (_, record) => <Button onClick={() => void handleReviewReconcile(record)}>重新核对并预览</Button> }]} /></section> : null}
      {errorMessage ? <Alert type="error" showIcon closable onClose={() => setErrorMessage('')} message={errorMessage} /> : null}
      {!operationId ? <section className="publish-center-dashboard">
        <div className="publish-center-metrics"><article><span>操作记录</span><strong>{operationTotal}</strong></article><article><span>当前队列容量</span><strong>{activeOperation?.limit ?? 0}<em> / 3000</em></strong></article><article><span>剩余可追加</span><strong>{remainingCapacity}</strong></article><article className="publish-center-metrics__live"><span>队列状态</span><strong>{activeOperation ? '运行中' : '空闲'}</strong></article></div>
        <div className="workspace-list-heading"><div><strong>发布队列与历史记录</strong><span>已加载 {operations.length} 条操作</span></div><Button onClick={() => void loadOperations()} loading={isLoading}>刷新记录</Button></div>
        <ProTable<PublishBatch> rowKey="id" className="publish-center-table" columns={operationColumns} dataSource={operations} loading={isLoading} search={false} pagination={{ pageSize: 20 }} options={{ density: false, fullScreen: false, reload: () => void loadOperations() }} headerTitle="发布队列与历史记录" toolBarRender={() => []} />
      </section> : null}
      {operationId && operation ? <section className="publish-operation-detail"><div className="publish-operation-hero"><div><small>OPERATION #{operation.id.slice(-8).toUpperCase()}</small><h2>{getOperationStatus(operation).label}</h2><p>{(operation.segments ?? []).map((segment) => segment.brandName).join(' · ') || operation.brandName}</p></div><div><Statistic title="队列容量" value={operation.limit} suffix="/ 3000" /><Progress type="circle" percent={getOperationProgress(operation)} size={90} /></div></div><div className="publish-center-metrics"><article><span>等待</span><strong>{operation.queued}</strong></article><article><span>处理中</span><strong>{operation.running}</strong></article><article><span>成功</span><strong>{operation.succeeded}</strong></article><article><span>失败/登录</span><strong>{operation.failed + operation.needsLogin}</strong></article></div><section className="queue-action-summary" aria-label="按任务类型统计">{actionSummaries.map((summary) => <article key={summary.action} className={`queue-action-summary__card queue-action-summary__card--${summary.action}`}><header><span>{summary.label}</span><strong>{summary.total}<small>件</small></strong></header><p>待处理 <b>{summary.waiting + summary.running}</b> 件</p><dl><div><dt>等待</dt><dd>{summary.waiting}</dd></div><div><dt>处理中</dt><dd>{summary.running}</dd></div><div><dt>成功</dt><dd>{summary.succeeded}</dd></div><div><dt>失败</dt><dd>{summary.failed}</dd></div></dl><Button style={{ marginTop: 14 }} disabled={summary.failed === 0 || Boolean(retryingGroup) || Boolean(retryingTaskId)} loading={retryingGroup === summary.action} onClick={() => void handleRetryFailed(summary.action)}>重试失败 {summary.failed} 件</Button></article>)}</section>{operation.status === 'preparing' || operation.tasks.length < operation.limit ? <p className="queue-action-summary__note">以上按已生成的 {operation.tasks.length} 条任务统计；预留容量 {operation.limit} 件，未生成任务不计入分类数量。</p> : null}<ProTable<PublishTask> rowKey="id" className="publish-center-table" columns={taskColumns} dataSource={filteredTasks} loading={isLoading} pagination={{ pageSize: 20, showSizeChanger: true }} scroll={{ x: 1680 }} tableLayout="fixed" search={{ labelWidth: 'auto' }} onSubmit={(params) => setTaskFilters({ itemNo: String(params.itemNo ?? ''), title: String(params.title ?? ''), brand: String(params.brand ?? ''), status: String(params.status ?? ''), action: String(params.action ?? '') })} onReset={() => setTaskFilters({ itemNo: '', title: '', brand: '', status: '', action: '' })} options={{ density: false, reload: () => void loadOperation() }} headerTitle={`任务明细 · ${filteredTasks.length} 条 · 自动跳过 ${operation.skipped.length} 件`} toolBarRender={() => [<Button key="retry-all" disabled={!operation.tasks.some((task) => task.status === 'failed' || task.status === 'needs_login') || Boolean(retryingGroup) || Boolean(retryingTaskId)} loading={retryingGroup === 'all'} onClick={() => void handleRetryFailed()}>一键重试全部失败</Button>, <Button key="add" type="primary" disabled={remainingCapacity === 0 || !targetAccount?.sellerConnected || targetAccount.status !== 'active'} onClick={handleOpenAddBrand}>继续加入品牌</Button>]} /></section> : null}
      <Drawer open={isAddBrandOpen} placement="right" width="97vw" className="publish-operation-drawer" title={<div className="publish-center-modal-title"><small>APPEND TO QUEUE</small><strong>{activeOperation ? '加入当前发布队列' : '创建发布操作'}</strong><span>账号：{targetAccount?.name ?? '未选择账号'} · 当前剩余容量 {remainingCapacity} 件</span></div>} onClose={() => setIsAddBrandOpen(false)} destroyOnHidden>
        <Form layout="vertical" className="publish-center-form">
          <Form.Item label="商品来源"><Radio.Group optionType="button" buttonStyle="solid" value={sourceType} onChange={(event) => handleChangeSource(event.target.value)} options={[{ value: 'live', label: '全部货源（实时）' }, { value: 'local', label: '我的商品库' }]} /></Form.Item>
          <div className="publish-center-form__grid"><Form.Item label="仓库地区"><Select value={regionId} onChange={handleChangeRegion} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.name }))} /></Form.Item><Form.Item label="指定品牌" required><Select<string, BrandOption> value={brandId || undefined} onChange={handleChangeBrand} showSearch optionFilterProp="label" popupMatchSelectWidth={340} placeholder="选择要加入队列的品牌" options={brandOptions} optionRender={(option) => <BrandSelectOption brandOption={option.data} />} /></Form.Item></div>
          {brandId ? <Form.Item label="商品品类"><div className="publish-center-category-list"><button type="button" className={categoryIds.length === 0 ? 'is-selected' : ''} onClick={() => { setCategoryIds([]); clearPreview(); }}><strong>ALL</strong><span>全部商品</span></button>{brandCategories.map((category) => <button type="button" key={category.id} className={categoryIds.includes(category.id) ? 'is-selected' : ''} onClick={() => handleToggleCategory(category.id)}>{category.imageUrl ? <img src={category.imageUrl} alt="" /> : <strong>{category.name.slice(0, 1)}</strong>}<span>{category.name}</span></button>)}{isCategoryLoading ? <span className="publish-center-category-loading">正在聚合品类…</span> : null}</div></Form.Item> : null}
          <div className="publish-center-form__grid publish-center-form__grid--three"><Form.Item label="发布数量"><InputNumber min={1} max={Math.max(1, remainingCapacity)} value={publishLimit} onChange={(value) => { setPublishLimit(Number(value ?? 500)); clearPreview(); }} addonAfter="件" /></Form.Item><Form.Item label="最小间隔"><InputNumber min={1} max={60} value={minDelaySeconds} onChange={(value) => setMinDelaySeconds(Number(value ?? 1))} addonAfter="秒" /></Form.Item><Form.Item label="最大间隔"><InputNumber min={1} max={60} value={maxDelaySeconds} onChange={(value) => setMaxDelaySeconds(Number(value ?? 2))} addonAfter="秒" /></Form.Item></div>
          <section className="publish-filter-panel"><header><div><strong>商品筛选</strong><span>只在填写条件后生效，默认不限制</span></div><Tag color="processing">按活动价与原价计算折扣</Tag></header><div className="publish-center-form__grid publish-center-form__grid--four"><Form.Item label="最低售价"><InputNumber min={0} precision={2} value={minPriceYuan ?? undefined} onChange={(value) => { setMinPriceYuan(value); clearPreview(); }} addonAfter="元" placeholder="不限" /></Form.Item><Form.Item label="最高售价"><InputNumber min={0} precision={2} value={maxPriceYuan ?? undefined} onChange={(value) => { setMaxPriceYuan(value); clearPreview(); }} addonAfter="元" placeholder="不限" /></Form.Item><Form.Item label="最低折扣率"><InputNumber min={0} max={100} precision={0} value={minDiscountRate ?? undefined} onChange={(value) => { setMinDiscountRate(value); clearPreview(); }} addonAfter="%" placeholder="不限" /></Form.Item><Form.Item label="最高折扣率"><InputNumber min={0} max={100} precision={0} value={maxDiscountRate ?? undefined} onChange={(value) => { setMaxDiscountRate(value); clearPreview(); }} addonAfter="%" placeholder="不限" /></Form.Item></div></section>
          {preview ? <><div className="publish-center-preview"><div><span>品牌商品</span><strong>{preview.total}</strong></div><div><span>可发布</span><strong>{preview.publishable}</strong></div><div><span>恢复旧商品</span><strong>{preview.relists?.length ?? 0}</strong></div><div><span>本次入队</span><strong>{preview.selected + (preview.updates?.length ?? 0) + (preview.offlineCandidates?.length ?? 0)}</strong></div><div><span>待修改</span><strong>{preview.updates?.length ?? 0}</strong></div><div><span>无需修改</span><strong>{preview.unchanged ?? 0}</strong></div><div><span>待下架</span><strong>{preview.offlineCandidates?.length ?? 0}</strong></div><div><span>自动跳过</span><strong>{preview.skipped.length}</strong></div></div>{preview.relists?.length ? <ProTable rowKey="id" cardBordered search={false} options={false} pagination={{ pageSize: 5 }} dataSource={preview.relists} headerTitle={`恢复旧商品 · ${preview.relists.length} 件`} columns={[{ title: 'SKU 图片', width: 88, render: (_, item) => renderSkuImage(item.imageUrls?.[0], item.title) }, { title: '货号', dataIndex: 'itemNo', width: 150 }, { title: '商品', dataIndex: 'title', ellipsis: true }, { title: '复用闲鱼商品 ID', dataIndex: 'xianyuItemId', copyable: true }, { title: '发布售价', render: (_, item) => formatPrice(item.priceCents) }]} /> : null}{preview.candidates?.length ? <ProTable rowKey="itemNo" cardBordered search={false} options={false} scroll={{ x: 980 }} pagination={{ pageSize: 10, total: filteredPreviewCandidates.length }} dataSource={filteredPreviewCandidates} headerTitle={'全新发布商品 · 匹配 ' + filteredPreviewCandidates.length + ' 件'} toolBarRender={() => [<Input.Search key="candidate-search" allowClear size="small" value={candidatePreviewKeyword} onChange={(event) => setCandidatePreviewKeyword(event.target.value)} placeholder="搜索货号或商品名称" />]} columns={[{ title: 'SKU 图片', width: 88, render: (_, item) => renderSkuImage(item.imageUrl, item.title) }, { title: '货号', dataIndex: 'itemNo', width: 150 }, { title: '商品', dataIndex: 'title', ellipsis: true }, { title: '发布售价', width: 120, render: (_, item) => formatPrice(item.priceCents) }, { title: '折扣', width: 90, render: (_, item) => item.discountRate > 0 ? item.discountRate + '%' : '—' }, { title: '发货地区', width: 150, render: (_, item) => formatSourceRegions(item.sourceRegions) }]} /> : null}{preview.offlineCandidates?.length > 0 ? <><Alert type="warning" showIcon message="确认后同时下架" description={`${preview.offlineCandidates.length} 件闲鱼商品已不在合并品牌任一地区货源中`} /><ProTable rowKey="platformItemId" cardBordered search={false} options={false} scroll={{ x: 760 }} pagination={{ pageSize: 5, total: filteredOfflineCandidates.length }} dataSource={filteredOfflineCandidates} headerTitle={`待下架商品 · 匹配 ${filteredOfflineCandidates.length} 件`} toolBarRender={() => [<Input.Search key="offline-search" allowClear size="small" value={offlinePreviewKeyword} onChange={(event) => setOfflinePreviewKeyword(event.target.value)} placeholder="搜索货号或商品名称" />]} columns={[{ title: 'SKU 图片', width: 88, render: (_, item) => renderSkuImage(item.imageUrl, item.title) }, { title: '货号', render: (_, item) => item.itemNo || '无货号' }, { title: '闲鱼商品', dataIndex: 'title' }, { title: '售价', render: (_, item) => formatPrice(item.priceCents) }, { title: '操作', width: 128, render: (_, item) => { const isPreserved = preservedOfflinePlatformItemIds.includes(item.platformItemId); return <Button type="link" danger={!isPreserved} onClick={() => handleToggleOfflinePreservation(item.platformItemId)}>{isPreserved ? '取消保留' : '保留商品'}</Button>; } }]} /></> : null}</> : null}
          {isPlanning ? <Alert type="info" showIcon message="正在读取各地区货源及闲鱼规格，生成对账计划，请稍候…" /> : null}
          {preview ? <ProTable rowKey="id" cardBordered search={false} options={false} scroll={{ x: 860 }} pagination={{ pageSize: 5, total: filteredPreviewUpdates.length }} dataSource={filteredPreviewUpdates} headerTitle={`待修改商品 · 匹配 ${filteredPreviewUpdates.length} 件`} toolBarRender={() => [<Space key="update-tools"><Tag color="processing">待修改 {preview.updates?.length ?? 0}</Tag><Tag>无需修改 {preview.unchanged ?? 0}</Tag><Input.Search allowClear size="small" value={updatePreviewKeyword} onChange={(event) => setUpdatePreviewKeyword(event.target.value)} placeholder="搜索货号、商品或变更原因" /></Space>]} columns={[{ title: 'SKU 图片', width: 88, render: (_, item) => renderSkuImage(item.imageUrls?.[0], item.title) }, { title: '货号', dataIndex: 'itemNo' }, { title: '触发编辑的具体变化', render: (_, item) => <div>{item.changeReasons?.map((reason) => <div key={reason}>{reason}</div>)}</div> }, { title: '售价', render: (_, item) => `${formatPrice(Number(item.before?.price ?? 0))} → ${formatPrice(item.priceCents)}` }]} /> : null}
          <div className="publish-center-form__actions"><Button onClick={() => setIsAddBrandOpen(false)}>取消</Button><Button onClick={() => void handlePreview()} loading={isPlanning} disabled={!brandId}>生成预览</Button><Button type="primary" onClick={() => void handleAppendBrand()} loading={isPlanning} disabled={!preview || (preview.selected + (preview.updates?.length ?? 0) + (preview.offlineCandidates?.length ?? 0)) === 0}>确认加入队列</Button></div>
        </Form>
      </Drawer>
    </main>
  );
}
