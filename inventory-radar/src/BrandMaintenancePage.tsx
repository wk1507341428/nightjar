import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Select, Space, Tag } from 'antd';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { deleteBrandProfile, fetchBrandMaintenance, saveBrandProfile, syncBrandProfile } from './catalogManagementApi';
import { REGION_OPTIONS, getWarehouseShortName } from './constants';
import type { BrandMaintenanceSource, BrandProfile } from './types';

/** 返回地区品牌的稳定选择键。 */
function getSourceKey(source: BrandMaintenanceSource): string {
  return `${source.regionId}:${source.distributorId}`;
}

/** 品牌维护页：实时品牌列表与跨地区品牌合并配置。 */
export function BrandMaintenancePage() {
  // 弹窗独立草稿，取消不会修改主表选择或已保存成员。
  const [draftSources, setDraftSources] = useState<BrandMaintenanceSource[]>([]);
  // 候选门店的筛选及跨页选择。
  const [candidateRegion, setCandidateRegion] = useState('');
  const [candidateKeyword, setCandidateKeyword] = useState('');
  const [candidateKeys, setCandidateKeys] = useState<React.Key[]>([]);
  // 实时地区品牌列表。
  const [sources, setSources] = useState<BrandMaintenanceSource[]>([]);
  // 已保存品牌档案。
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  // 当前勾选地区品牌键。
  const [selectedSourceKeys, setSelectedSourceKeys] = useState<React.Key[]>([]);
  // 当前编辑品牌档案。
  const [editingProfile, setEditingProfile] = useState<BrandProfile | null>(null);
  // 合并品牌名称。
  const [profileName, setProfileName] = useState('');
  // 闲鱼商品发布时使用的单一平台定位。
  const [defaultRegionId, setDefaultRegionId] = useState('');
  // 合并弹窗状态。
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  // 页面加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 保存状态。
  const [isSaving, setIsSaving] = useState(false);
  // 合并品牌同步状态。
  const [syncingProfileId, setSyncingProfileId] = useState('');
  // 页面错误文案。
  const [errorMessage, setErrorMessage] = useState('');
  // 页面成功提示。
  const [successMessage, setSuccessMessage] = useState('');
  // 合并弹窗内错误提示。
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  // 已提交的地区筛选。
  const [filterRegionId, setFilterRegionId] = useState('');
  // 已提交的品牌模糊关键词。
  const [filterKeyword, setFilterKeyword] = useState('');

  /** 加载最新品牌及配置关系。 */
  async function loadMaintenance() {
    setIsLoading(true);
    try {
      const response = await fetchBrandMaintenance();
      setSources(response.sources);
      setProfiles(response.profiles);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '品牌维护数据加载失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadMaintenance(); }, []);

  // 品牌档案 ID 索引。
  const profilesByID = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  // 当前弹窗选中的实时品牌。
  const selectedSources = sources.filter((source) => selectedSourceKeys.includes(getSourceKey(source)));
  // 原有成员键用于计算此次草稿的新增和移除。
  const originalMemberKeys = new Set(editingProfile?.members.map((member) => `${member.regionId}:${member.distributorId}`) ?? []);
  const draftKeys = new Set(draftSources.map(getSourceKey));
  const addedCount = draftSources.filter((source) => !originalMemberKeys.has(getSourceKey(source))).length;
  const removedCount = [...originalMemberKeys].filter((key) => !draftKeys.has(key)).length;
  // 实时列表缺失的成员保留在草稿中，只显示库存未知。
  const liveKeys = new Set(sources.map(getSourceKey));
  const draftRegions = Array.from(new Set(draftSources.map((source) => source.regionId)));
  const candidates = sources.filter((source) => !draftKeys.has(getSourceKey(source)) && (!candidateRegion || source.regionId === candidateRegion) && `${source.name} ${source.distributorId}`.toLocaleLowerCase().includes(candidateKeyword.trim().toLocaleLowerCase()));

  /** 初始化弹窗搜索状态。 */
  function resetCandidateSearch() { setCandidateKeys([]); setCandidateRegion(''); setCandidateKeyword(''); }

  /** 把已勾选的未占用门店加入草稿。 */
  function handleAddCandidates() {
    // 再次校验归属，防止筛选或选中状态残留造成跨档案添加。
    const additions = sources.filter((source) => candidateKeys.includes(getSourceKey(source)) && !draftKeys.has(getSourceKey(source)) && (!source.profileId || source.profileId === editingProfile?.id));
    setDraftSources((current) => [...current, ...additions]);
    setCandidateKeys([]);
    if (!defaultRegionId) setDefaultRegionId(additions[0]?.regionId ?? '');
  }

  /** 移除草稿成员，同时修正已不在成员范围内的发布定位。 */
  function handleRemoveDraft(sourceKey: string) {
    const remaining = draftSources.filter((source) => getSourceKey(source) !== sourceKey);
    setDraftSources(remaining);
    if (!remaining.some((source) => source.regionId === defaultRegionId)) setDefaultRegionId(remaining[0]?.regionId ?? '');
  }

  /** 关闭弹窗并丢弃未保存的草稿。 */
  function handleCancelMerge() { if (isSaving) return; setIsMergeOpen(false); setEditingProfile(null); setDraftSources([]); resetCandidateSearch(); }
  // 按提交条件即时过滤实时品牌列表。
  const visibleSources = useMemo(() => {
    const normalizedKeyword = filterKeyword.trim().toLocaleUpperCase();
    return sources.filter((source) => {
      if (filterRegionId && source.regionId !== filterRegionId) return false;
      if (!normalizedKeyword) return true;
      return `${source.name} ${source.distributorId}`.toLocaleUpperCase().includes(normalizedKeyword);
    });
  }, [sources, filterRegionId, filterKeyword]);
  /** 打开新建合并品牌弹窗。 */
  function handleOpenMerge() {
    setEditingProfile(null);
    setDraftSources([...selectedSources]);
    resetCandidateSearch();
    setProfileName(selectedSources[0]?.name ?? '');
    setDefaultRegionId(selectedSources[0]?.regionId ?? '');
    setModalErrorMessage('');
    setIsMergeOpen(true);
  }

  /** 打开品牌档案编辑弹窗。 */
  function handleEditProfile(profile: BrandProfile) {
    setEditingProfile(profile);
    setProfileName(profile.name);
    setDefaultRegionId(profile.defaultRegionId ?? profile.members[0]?.regionId ?? '');
    // 上游暂未返回的原门店仍然提交，只有主动移除才会删除。
    const sourceIndex = new Map(sources.map((source) => [getSourceKey(source), source]));
    setDraftSources(profile.members.map((member) => sourceIndex.get(`${member.regionId}:${member.distributorId}`) ?? { regionId: member.regionId, distributorId: member.distributorId, name: member.sourceName, onlineGoodsCount: 0, profileId: profile.id }));
    resetCandidateSearch();
    setModalErrorMessage('');
    setIsMergeOpen(true);
  }

  /** 保存单品牌或合并品牌档案。 */
  async function handleSaveProfile() {
    if (!profileName.trim() || draftSources.length === 0) { setModalErrorMessage('请填写品牌名称，并至少保留一家门店'); return; }
    if (!draftSources.some((source) => source.regionId === defaultRegionId)) { setModalErrorMessage('请选择已选门店所在的发布地区'); return; }
    setIsSaving(true);
    try {
      await saveBrandProfile({ id: editingProfile?.id, name: profileName.trim(), defaultRegionId, members: draftSources.map((source) => ({ regionId: source.regionId, distributorId: source.distributorId, sourceName: source.name })) });
      setIsMergeOpen(false);
      setEditingProfile(null);
      setSuccessMessage(`已保存品牌配置：新增 ${addedCount} 家，移除 ${removedCount} 家。闲鱼商品需预览并确认后才会处理。`);
      setSelectedSourceKeys([]);
      await loadMaintenance();
    } catch (error) {
      setModalErrorMessage(error instanceof Error ? error.message : '品牌档案保存失败');
    } finally {
      setIsSaving(false);
    }
  }

  /** 点击品牌行时切换选择状态。 */
  function handleToggleSource(source: BrandMaintenanceSource, event: React.MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('button,a,.ant-checkbox-wrapper')) return;
    if (source.profileId) return;
    const sourceKey = getSourceKey(source);
    setSelectedSourceKeys((currentKeys) => currentKeys.includes(sourceKey) ? currentKeys.filter((key) => key !== sourceKey) : [...currentKeys, sourceKey]);
  }

  /** 删除一个品牌档案配置。 */
  function handleDeleteProfile(profile: BrandProfile) {
    Modal.confirm({ title: `删除品牌档案“${profile.name}”？`, content: '只删除合并配置，不删除商品、发布任务或闲鱼商品档案。', okText: '删除', okButtonProps: { danger: true }, cancelText: '取消', onOk: async () => { await deleteBrandProfile(profile.id); await loadMaintenance(); } });
  }

  /** 启动品牌档案全部地区成员同步。 */
  async function handleSyncProfile(profile: BrandProfile) {
    setSyncingProfileId(profile.id);
    try {
      const response = await syncBrandProfile(profile.id);
      setSuccessMessage(`${response.profileName} 已开始顺序同步 ${response.memberCount} 个地区成员`);
      setIsMergeOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '合并品牌同步失败');
    } finally {
      setSyncingProfileId('');
    }
  }

  // 实时品牌列表列定义。
  const columns: ProColumns<BrandMaintenanceSource>[] = [
    { title: '地区', dataIndex: 'regionId', valueType: 'select', valueEnum: Object.fromEntries(REGION_OPTIONS.map((region) => [region.id, { text: region.shortName }])), width: 105, render: (_, source) => <Tag>{getWarehouseShortName(source.regionId)}</Tag> },
    { title: '品牌', dataIndex: 'name', width: 330, render: (_, source) => <div className="brand-maintenance-brand">{source.logoUrl ? <img src={source.logoUrl} alt="" /> : <i>{source.name.slice(0, 1)}</i>}<div><strong>{source.name}</strong><span>ID {source.distributorId}</span></div></div> },
    { title: '实时可售', dataIndex: 'onlineGoodsCount', search: false, sorter: (first, second) => first.onlineGoodsCount - second.onlineGoodsCount, width: 130, render: (_, source) => <strong className="brand-maintenance-count">{source.onlineGoodsCount.toLocaleString('zh-CN')}<small> 件</small></strong> },
    { title: '品牌档案', dataIndex: 'profileId', search: false, render: (_, source) => { const profile = source.profileId ? profilesByID.get(source.profileId) : undefined; return profile ? <button type="button" className="brand-profile-pill" onClick={() => handleEditProfile(profile)}>{profile.name}<span>{new Set(profile.members.map((member) => member.regionId)).size} 个地区 · {profile.members.length} 家门店</span></button> : <span className="brand-profile-unassigned">未配置</span>; } },
    { title: '操作', valueType: 'option', render: (_, source) => source.profileId ? <Button type="link" onClick={() => { const profile = profilesByID.get(source.profileId!); if (profile) handleEditProfile(profile); }}>编辑合并品牌</Button> : null },
  ];

  // 编辑档案时的候选门店，保留跨页勾选。
  const candidateColumns: ProColumns<BrandMaintenanceSource>[] = [
    { title: '地区', width: 90, render: (_, source) => getWarehouseShortName(source.regionId) },
    { title: '品牌门店', dataIndex: 'name', render: (_, source) => <div className="brand-maintenance-brand">{source.logoUrl ? <img src={source.logoUrl} alt="" /> : <i>{source.name.slice(0, 1)}</i>}<div><strong>{source.name}</strong><span>ID {source.distributorId}</span></div></div> },
    { title: '可售', dataIndex: 'onlineGoodsCount', width: 90, render: (_, source) => `${source.onlineGoodsCount} 件` },
    { title: '归属', width: 130, render: (_, source) => source.profileId && source.profileId !== editingProfile?.id ? <Tag>其他档案</Tag> : '可添加' },
  ];

  const selectedColumns: ProColumns<BrandMaintenanceSource>[] = [
    { title: '地区', width: 90, render: (_, source) => getWarehouseShortName(source.regionId) },
    { title: '已合并门店', dataIndex: 'name', render: (_, source) => <div className="brand-maintenance-brand">{source.logoUrl ? <img src={source.logoUrl} alt="" /> : <i>{source.name.slice(0, 1)}</i>}<div><strong>{source.name}</strong><span>ID {source.distributorId} · {liveKeys.has(getSourceKey(source)) ? `可售 ${source.onlineGoodsCount} 件` : '实时信息暂缺，保留原成员'}</span></div></div> },
    { title: '操作', valueType: 'option', width: 80, render: (_, source) => <Button disabled={isSaving} type="link" danger onClick={() => handleRemoveDraft(getSourceKey(source))}>移除</Button> },
  ];

  return <main className="brand-maintenance-page">
    <section className="brand-maintenance-summary"><div><small>BRAND DIRECTORY</small><h1>品牌维护</h1><p>品牌数据实时来自小程序；数据库只保存单品牌或跨地区合并关系。</p></div><div><span>实时品牌</span><strong>{sources.length}</strong></div><div><span>品牌档案</span><strong>{profiles.length}</strong></div><div><span>已配置成员</span><strong>{sources.filter((source) => source.profileId).length}</strong></div></section>
    {errorMessage ? <Alert type="error" showIcon closable onClose={() => setErrorMessage('')} message={errorMessage} /> : null}
    {successMessage ? <Alert type="success" showIcon closable onClose={() => setSuccessMessage('')} message={successMessage} /> : null}
    <ProTable<BrandMaintenanceSource> rowKey={getSourceKey} className="brand-maintenance-table" columns={columns} dataSource={visibleSources} loading={isLoading} pagination={{ pageSize: 20, showSizeChanger: true }} scroll={{ x: 980 }} search={{ labelWidth: 'auto' }} onSubmit={(params) => { setFilterRegionId(String(params.regionId ?? '')); setFilterKeyword(String(params.name ?? '')); }} onReset={() => { setFilterRegionId(''); setFilterKeyword(''); }} onRow={(source) => ({ onClick: (event) => handleToggleSource(source, event), className: 'brand-maintenance-row' })} rowSelection={{ selectedRowKeys: selectedSourceKeys, preserveSelectedRowKeys: true, onChange: setSelectedSourceKeys, getCheckboxProps: (source) => ({ disabled: Boolean(source.profileId) }) }} options={{ density: false, reload: () => void loadMaintenance() }} headerTitle={`各地区实时品牌 · ${visibleSources.length} 条`} toolBarRender={() => [<Select<string> key="edit" value={undefined} style={{ width: 240 }} showSearch optionFilterProp="label" placeholder="编辑已合并品牌" options={profiles.map((profile) => ({ value: profile.id, label: profile.name }))} onChange={(id) => { const profile = profilesByID.get(id); if (profile) handleEditProfile(profile); }} />, <Button key="merge" type="primary" disabled={selectedSourceKeys.length === 0} onClick={handleOpenMerge}>合并所选品牌 ({selectedSourceKeys.length})</Button> ]} />
    <Modal open={isMergeOpen} width="75vw" className="brand-editor-modal" title={<div className="brand-maintenance-modal-title"><small>BRAND PROFILE</small><strong>{editingProfile ? '编辑合并品牌' : '创建品牌档案'}</strong></div>} okText="保存修改" cancelText="取消" confirmLoading={isSaving} onOk={() => void handleSaveProfile()} onCancel={handleCancelMerge} closable={!isSaving} mask={{ closable: !isSaving }}>
      {modalErrorMessage ? <Alert type="error" showIcon message={modalErrorMessage} /> : null}
      <div className="brand-maintenance-form">
        <label><span>品牌档案名称</span><Input disabled={isSaving} value={profileName} onChange={(event) => setProfileName(event.target.value)} /></label>
        <label><span>闲鱼发布定位</span><Select disabled={isSaving} value={defaultRegionId || undefined} onChange={setDefaultRegionId} options={draftRegions.map((id) => ({ value: id, label: getWarehouseShortName(id) }))} /></label>
      </div>
      <div className="brand-editor-panels">
        <section className="brand-editor-panel">
          <header><strong>添加门店</strong><span>搜索、勾选后加入右侧</span></header>
          <div className="brand-editor-filters"><Select aria-label="筛选门店地区" allowClear placeholder="全部地区" value={candidateRegion || undefined} onChange={(value) => { setCandidateRegion(value ?? ''); }} options={REGION_OPTIONS.map((region) => ({ value: region.id, label: region.shortName }))} /><Input aria-label="搜索门店品牌" allowClear placeholder="品牌名称或门店 ID" value={candidateKeyword} onChange={(event) => { setCandidateKeyword(event.target.value); }} /></div>
          <ProTable<BrandMaintenanceSource> rowKey={getSourceKey} columns={candidateColumns} dataSource={candidates} search={false} options={false} size="small" pagination={{ pageSize: 8 }} scroll={{ x: 680, y: 360 }} rowSelection={{ selectedRowKeys: candidateKeys, preserveSelectedRowKeys: true, onChange: setCandidateKeys, getCheckboxProps: (source) => ({ disabled: isSaving || Boolean(source.profileId && source.profileId !== editingProfile?.id) }) }} />
          <Button type="primary" disabled={isSaving || candidateKeys.length === 0} onClick={handleAddCandidates}>添加已选 {candidateKeys.length} 家门店 →</Button>
        </section>
        <section className="brand-editor-panel brand-editor-panel--selected">
          <header><strong>已合并门店</strong><span>{draftRegions.length} 个地区 · {draftSources.length} 家门店</span></header>
          <ProTable<BrandMaintenanceSource> rowKey={getSourceKey} columns={selectedColumns} dataSource={draftSources} search={false} options={false} size="small" pagination={{ pageSize: 8 }} scroll={{ x: 580, y: 360 }} locale={{ emptyText: '尚未选择门店，请从左侧添加' }} />
        </section>
      </div>
      <div className="brand-editor-review"><Space><Tag color="success">新增 {addedCount} 家</Tag><Tag color="warning">移除 {removedCount} 家</Tag><span>保存仅更新品牌配置，闲鱼商品需另行预览并确认。</span></Space></div>
      {editingProfile ? <Space><Button disabled={isSaving || addedCount > 0 || removedCount > 0} loading={syncingProfileId === editingProfile.id} onClick={() => void handleSyncProfile(editingProfile)}>同步已保存的门店</Button><Button disabled={isSaving} danger onClick={() => handleDeleteProfile(editingProfile)}>删除品牌档案</Button></Space> : null}
    </Modal>
  </main>;
}
