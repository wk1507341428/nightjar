import { useEffect, useState } from 'react';
import { Alert, Button, Drawer, Empty, Input, InputNumber, Popconfirm, Radio, Select, Tag } from 'antd';
import { fetchLiveBrandCategories } from './api';
import { fetchBrandMaintenance } from './catalogManagementApi';
import { REGION_OPTIONS } from './constants';
import type { BrandCategory, BrandProfile, PublishPreset, PublishPresetActionMode, PublishPresetRule } from './types';
import { createPublishPreset, deletePublishPreset, fetchPublishPresets, updatePublishPreset } from './xianyuApi';

/** 方案操作范围的显示文案。 */
const ACTION_MODE_OPTIONS: Array<{ value: PublishPresetActionMode; label: string; hint: string }> = [
  { value: 'update_only', label: '仅更新在售', hint: '只更新价格、库存、规格及图片' },
  { value: 'publish_update', label: '发布并更新', hint: '发布新品、恢复旧品并更新在售' },
  { value: 'full', label: '完整对账', hint: '额外包含缺货商品下架' },
];

/** 创建一条默认仅更新的品牌规则。 */
function createEmptyPresetRule(): PublishPresetRule {
  return {
    id: crypto.randomUUID(),
    sourceType: 'live',
    brandName: '',
    regionId: '3',
    categoryIds: [],
    categoryNames: [],
    limit: 500,
    minDelaySeconds: 1,
    maxDelaySeconds: 2,
    actionMode: 'update_only',
  };
}

/** 聚合一个品牌档案跨地区的同名品类。 */
async function fetchProfileCategories(profile: BrandProfile): Promise<BrandCategory[]> {
  const categoryResults = await Promise.allSettled(profile.members.map((member) => fetchLiveBrandCategories(member.regionId, member.distributorId)));
  // 按品类名称聚合后的选项。
  const categoriesByName = new Map<string, BrandCategory>();
  for (const result of categoryResults) {
    if (result.status !== 'fulfilled') continue;
    for (const category of result.value) {
      const categoryKey = category.name.trim().toLocaleLowerCase('zh-CN');
      const existingCategory = categoriesByName.get(categoryKey);
      if (!existingCategory) {
        categoriesByName.set(categoryKey, { ...category, sourceIds: [category.id] });
        continue;
      }
      existingCategory.sourceIds = Array.from(new Set([...(existingCategory.sourceIds ?? [existingCategory.id]), category.id]));
      if (!existingCategory.imageUrl && category.imageUrl) existingCategory.imageUrl = category.imageUrl;
    }
  }
  return Array.from(categoriesByName.values());
}

/** 常用发布方案配置管理抽屉。 */
export function PublishPresetDrawer({
  open,
  accountId,
  onClose,
}: {
  open: boolean;
  accountId: string;
  onClose: () => void;
}) {
  // 当前账号保存的方案。
  const [presets, setPresets] = useState<PublishPreset[]>([]);
  // 可选择的聚合品牌档案。
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  // 品牌对应的聚合品类。
  const [categoriesByProfileId, setCategoriesByProfileId] = useState<Record<string, BrandCategory[]>>({});
  // 当前抽屉视图。
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  // 当前编辑的方案 ID，新建时为空。
  const [editingPresetId, setEditingPresetId] = useState('');
  // 当前编辑的方案名称。
  const [presetName, setPresetName] = useState('');
  // 当前编辑的品牌规则。
  const [editingRules, setEditingRules] = useState<PublishPresetRule[]>([]);
  // 页面请求状态。
  const [isLoading, setIsLoading] = useState(false);
  // 当前错误提示。
  const [errorMessage, setErrorMessage] = useState('');

  /** 加载方案和品牌档案。 */
  async function loadDrawerData() {
    setIsLoading(true);
    try {
      const [nextPresets, maintenance] = await Promise.all([fetchPublishPresets(accountId), fetchBrandMaintenance()]);
      setPresets(nextPresets);
      setBrandProfiles(maintenance.profiles);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取常用发布方案失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setViewMode('list');
    void loadDrawerData();
  }, [open, accountId]);

  /** 确保指定品牌的品类已经加载。 */
  async function ensureProfileCategories(profileId: string) {
    if (!profileId || categoriesByProfileId[profileId]) return;
    const profile = brandProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    try {
      const categories = await fetchProfileCategories(profile);
      setCategoriesByProfileId((current) => ({ ...current, [profileId]: categories }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取品牌品类失败');
    }
  }

  /** 进入新建方案界面。 */
  function handleCreatePreset() {
    setEditingPresetId('');
    setPresetName('');
    setEditingRules([createEmptyPresetRule()]);
    setViewMode('edit');
    setErrorMessage('');
  }

  /** 进入编辑方案界面。 */
  function handleEditPreset(preset: PublishPreset) {
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
    setEditingRules(preset.rules.map((rule) => ({ ...rule })));
    setViewMode('edit');
    setErrorMessage('');
    for (const rule of preset.rules) {
      if (rule.brandProfileId) void ensureProfileCategories(rule.brandProfileId);
    }
  }

  /** 局部更新一条品牌规则。 */
  function updateRule(ruleIndex: number, patch: Partial<PublishPresetRule>) {
    setEditingRules((currentRules) => currentRules.map((rule, index) => index === ruleIndex ? { ...rule, ...patch } : rule));
  }

  /** 切换规则品牌并清空原品类。 */
  function handleRuleBrandChange(ruleIndex: number, profileId: string) {
    const profile = brandProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    updateRule(ruleIndex, {
      brandProfileId: profile.id,
      brandName: profile.name,
      regionId: profile.defaultRegionId ?? profile.members[0]?.regionId ?? '3',
      categoryIds: [],
      categoryNames: [],
    });
    void ensureProfileCategories(profile.id);
  }

  /** 更新规则选中的聚合品类。 */
  function handleRuleCategoryChange(ruleIndex: number, categoryNames: string[]) {
    const rule = editingRules[ruleIndex];
    const categories = categoriesByProfileId[rule.brandProfileId ?? ''] ?? [];
    const selectedNames = new Set(categoryNames);
    const selectedCategories = categories.filter((category) => selectedNames.has(category.name));
    updateRule(ruleIndex, {
      categoryNames,
      categoryIds: Array.from(new Set(selectedCategories.flatMap((category) => category.sourceIds ?? [category.id]))),
    });
  }

  /** 切换规则中的一个可视化品类卡片。 */
  function handleRuleCategoryToggle(ruleIndex: number, categoryName: string) {
    const currentCategoryNames = editingRules[ruleIndex]?.categoryNames ?? [];
    const nextCategoryNames = currentCategoryNames.includes(categoryName)
      ? currentCategoryNames.filter((name) => name !== categoryName)
      : [...currentCategoryNames, categoryName];
    handleRuleCategoryChange(ruleIndex, nextCategoryNames);
  }

  /** 保存当前方案。 */
  async function handleSavePreset() {
    if (!presetName.trim() || editingRules.some((rule) => !rule.brandProfileId || !rule.brandName)) {
      setErrorMessage('请填写方案名称，并为每条规则选择品牌');
      return;
    }
    setIsLoading(true);
    try {
      if (editingPresetId) {
        await updatePublishPreset(editingPresetId, { accountId, name: presetName.trim(), rules: editingRules });
      } else {
        await createPublishPreset({ accountId, name: presetName.trim(), rules: editingRules });
      }
      await loadDrawerData();
      setViewMode('list');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存常用发布方案失败');
    } finally {
      setIsLoading(false);
    }
  }

  /** 删除一套常用方案。 */
  async function handleDeletePreset(presetId: string) {
    setIsLoading(true);
    try {
      await deletePublishPreset(presetId, accountId);
      await loadDrawerData();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '删除常用发布方案失败');
    } finally {
      setIsLoading(false);
    }
  }

  /** 返回规则操作范围的显示配置。 */
  function getActionModeOption(actionMode: PublishPresetActionMode) {
    return ACTION_MODE_OPTIONS.find((option) => option.value === actionMode) ?? ACTION_MODE_OPTIONS[0];
  }

  return (
    <Drawer open={open} onClose={onClose} width="97vw" className="publish-preset-drawer publish-preset-drawer--wide" destroyOnHidden title={<div className="publish-preset-title"><small>PUBLISH PLAYBOOKS</small><strong>常用发布方案</strong><span>维护经常使用的品牌与品类组合，在创建发布操作时直接调用。</span></div>}>
      {errorMessage ? <Alert type="error" showIcon closable message={errorMessage} onClose={() => setErrorMessage('')} /> : null}

      {viewMode === 'list' ? <div className="publish-preset-list-view">
        <section className="publish-preset-intro"><div><span>01</span><strong>配置一次，重复使用</strong><p>这里仅维护方案；生成预览统一在“创建发布操作”中完成。</p></div><Button type="primary" onClick={handleCreatePreset}>＋ 新建方案</Button></section>
        {presets.length === 0 && !isLoading ? <Empty description="还没有常用方案"><Button type="primary" onClick={handleCreatePreset}>创建第一套方案</Button></Empty> : null}
        <div className="publish-preset-card-list">{presets.map((preset, presetIndex) => <article className="publish-preset-card" key={preset.id}>
          <header><span>{String(presetIndex + 1).padStart(2, '0')}</span><div><strong>{preset.name}</strong><small>{preset.rules.length} 个品牌规则</small></div></header>
          <div className="publish-preset-rule-tags">{preset.rules.map((rule) => <Tag key={rule.id}>{rule.brandName} · {rule.categoryNames.length ? rule.categoryNames.join(' / ') : '全部品类'}</Tag>)}</div>
          <footer><div><Popconfirm title="删除这套常用方案？" okText="删除" cancelText="取消" onConfirm={() => void handleDeletePreset(preset.id)}><button type="button" className="is-danger">删除方案</button></Popconfirm></div><Button onClick={() => handleEditPreset(preset)}>编辑方案</Button></footer>
        </article>)}</div>
      </div> : null}

      {viewMode === 'edit' ? <div className="publish-preset-editor">
        <section className="publish-preset-editor-head"><button type="button" onClick={() => setViewMode('list')}>← 返回方案列表</button><div><small>PLAYBOOK EDITOR</small><strong>{editingPresetId ? '编辑常用方案' : '新建常用方案'}</strong></div></section>
        <label className="publish-preset-name"><span>方案名称</span><Input value={presetName} maxLength={40} onChange={(event) => setPresetName(event.target.value)} placeholder="例如：每日鞋类价格库存更新" /></label>
        <div className="publish-preset-rule-list">{editingRules.map((rule, ruleIndex) => {
          const categories = categoriesByProfileId[rule.brandProfileId ?? ''] ?? [];
          const actionMode = getActionModeOption(rule.actionMode);
          return <section className="publish-preset-rule-card" key={rule.id}>
            <header><div><span>RULE {String(ruleIndex + 1).padStart(2, '0')}</span><strong>{rule.brandName || '选择一个品牌'}</strong></div>{editingRules.length > 1 ? <button type="button" onClick={() => setEditingRules((currentRules) => currentRules.filter((_, index) => index !== ruleIndex))}>移除</button> : null}</header>
            <div className="publish-preset-field-grid publish-preset-field-grid--brand"><label><span>聚合品牌</span><Select showSearch optionFilterProp="label" value={rule.brandProfileId || undefined} placeholder="选择品牌" onChange={(profileId) => handleRuleBrandChange(ruleIndex, profileId)} options={brandProfiles.map((profile) => ({ value: profile.id, label: profile.name }))} /></label></div>
            <div className="publish-preset-category-field"><span>商品品类</span><div className="publish-center-category-list"><button type="button" className={rule.categoryNames.length === 0 ? 'is-selected' : ''} onClick={() => handleRuleCategoryChange(ruleIndex, [])}><strong>ALL</strong><span>全部商品</span></button>{categories.map((category) => <button type="button" key={category.name} className={rule.categoryNames.includes(category.name) ? 'is-selected' : ''} onClick={() => handleRuleCategoryToggle(ruleIndex, category.name)}>{category.imageUrl ? <img src={category.imageUrl} alt="" /> : <strong>{category.name.slice(0, 1)}</strong>}<span>{category.name}</span></button>)}{rule.brandProfileId && categories.length === 0 ? <span className="publish-center-category-loading">正在聚合品类…</span> : null}</div></div>
            <div className="publish-preset-mode"><span>操作范围</span><Radio.Group value={rule.actionMode} onChange={(event) => updateRule(ruleIndex, { actionMode: event.target.value })}>{ACTION_MODE_OPTIONS.map((option) => <Radio.Button value={option.value} key={option.value}>{option.label}</Radio.Button>)}</Radio.Group><small>{actionMode.hint}</small></div>
            <section className="publish-preset-filter-panel"><header><div><strong>数量与商品筛选</strong><span>筛选条件留空时不限制，折扣按活动价与原价计算</span></div><Tag>OPTIONAL</Tag></header><div className="publish-preset-number-grid"><label><span>最多处理</span><InputNumber min={1} max={3000} value={rule.limit} addonAfter="件" onChange={(value) => updateRule(ruleIndex, { limit: Number(value ?? 500) })} /></label><label><span>最低售价</span><InputNumber min={0} precision={2} value={rule.minPriceCents ? rule.minPriceCents / 100 : undefined} addonAfter="元" placeholder="不限" onChange={(value) => updateRule(ruleIndex, { minPriceCents: value == null ? undefined : Math.round(Number(value) * 100) })} /></label><label><span>最高售价</span><InputNumber min={0} precision={2} value={rule.maxPriceCents ? rule.maxPriceCents / 100 : undefined} addonAfter="元" placeholder="不限" onChange={(value) => updateRule(ruleIndex, { maxPriceCents: value == null ? undefined : Math.round(Number(value) * 100) })} /></label><label><span>最低折扣</span><InputNumber min={0} max={100} value={rule.minDiscountRate || undefined} addonAfter="%" placeholder="不限" onChange={(value) => updateRule(ruleIndex, { minDiscountRate: value == null ? undefined : Number(value) })} /></label><label><span>最高折扣</span><InputNumber min={0} max={100} value={rule.maxDiscountRate || undefined} addonAfter="%" placeholder="不限" onChange={(value) => updateRule(ruleIndex, { maxDiscountRate: value == null ? undefined : Number(value) })} /></label></div></section>
          </section>;
        })}</div>
        <Button className="publish-preset-add-rule" onClick={() => setEditingRules((currentRules) => [...currentRules, createEmptyPresetRule()])} disabled={editingRules.length >= 12}>＋ 添加品牌规则</Button>
        <div className="publish-preset-editor-actions"><Button onClick={() => setViewMode('list')}>取消</Button><Button type="primary" loading={isLoading} onClick={() => void handleSavePreset()}>保存方案</Button></div>
      </div> : null}
    </Drawer>
  );
}
