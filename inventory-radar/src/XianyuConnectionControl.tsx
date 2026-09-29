import { useState } from 'react';
import { Alert, Button, Drawer, Input, Modal, Popconfirm, Segmented, Select, Space, Tag, Tooltip } from 'antd';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { useXianyuAccount } from './XianyuAccountContext';
import { connectXianyuAccount, createXianyuAccount, disconnectXianyuAccount, updateXianyuAccount, verifyXianyuAccount } from './xianyuApi';
import type { XianyuAccount } from './types';

/** 返回账号队列状态标签。 */
function getAccountStatusTag(account: XianyuAccount) {
  if (account.status === 'active') return <Tag color="success">运行</Tag>;
  if (account.status === 'paused') return <Tag color="warning">暂停</Tag>;
  return <Tag>停用</Tag>;
}

/** 返回账号队列状态说明。 */
function getQueueStatusDescription(status: XianyuAccount['status']): string {
  if (status === 'paused') return '队列已暂停：已保存的等待任务会保留，恢复后继续处理。';
  if (status === 'disabled') return '账号已停用：不会处理新任务，历史记录和在售商品不会被删除。';
  return '队列运行中：暂停后，当前请求会正常结束，但不会开始处理下一件任务。';
}

/** 多闲鱼账号连接管理入口。 */
export function XianyuConnectionControl() {
  // 全站账号状态。
  const { accounts, currentAccount, currentAccountId, isLoading, errorMessage: accountError, setCurrentAccountId, refreshAccounts } = useXianyuAccount();
  // 连接管理抽屉状态。
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // 抽屉内选中的账号。
  const [editingAccountId, setEditingAccountId] = useState('');
  // 当前凭证类型。
  const [credentialKind, setCredentialKind] = useState<'session' | 'seller'>('seller');
  // 待提交凭证。
  const [credentialText, setCredentialText] = useState('');
  // 新账号弹窗状态。
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // 新账号备注。
  const [newAccountName, setNewAccountName] = useState('');
  // 修改账号备注弹窗状态。
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  // 待保存账号备注。
  const [renameAccountName, setRenameAccountName] = useState('');
  // 当前操作状态。
  const [operationKey, setOperationKey] = useState('');
  // 抽屉错误信息。
  const [errorMessage, setErrorMessage] = useState('');

  // 当前编辑账号。
  const editingAccount = accounts.find((account) => account.id === editingAccountId) ?? currentAccount ?? accounts[0];
  // 已连接卖家后台账号数量。
  const connectedSellerCount = accounts.filter((account) => account.sellerConnected).length;

  /** 打开闲鱼账号连接管理。 */
  function handleOpenDrawer() {
	setIsDrawerOpen(true);
	setEditingAccountId(currentAccountId);
	setErrorMessage('');
  }

  /** 新建账号并立即选中。 */
  async function handleCreateAccount() {
    if (!newAccountName.trim()) return;
    setOperationKey('create');
    try {
      const account = await createXianyuAccount(newAccountName.trim());
      await refreshAccounts();
      setEditingAccountId(account.id);
      setCurrentAccountId(account.id);
      setNewAccountName('');
      setIsCreateOpen(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '创建闲鱼账号失败');
    } finally {
      setOperationKey('');
    }
  }

  /** 修改当前账号备注。 */
  async function handleRenameAccount() {
    if (!editingAccount || !renameAccountName.trim()) return;
    setOperationKey('rename');
    try {
      await updateXianyuAccount(editingAccount.id, { name: renameAccountName.trim() });
      await refreshAccounts();
      setIsRenameOpen(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '修改账号备注失败');
    } finally {
      setOperationKey('');
    }
  }

  /** 保存当前账号的一类凭证。 */
  async function handleConnectCredential() {
    if (!editingAccount || !credentialText.trim()) return;
    setOperationKey(`connect:${credentialKind}`);
    try {
      await connectXianyuAccount(editingAccount.id, credentialKind, credentialText.trim());
      await refreshAccounts();
      setCredentialText('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '闲鱼凭证连接失败');
    } finally {
      setOperationKey('');
    }
  }

  /** 断开当前账号的一类凭证。 */
  async function handleDisconnectCredential() {
    if (!editingAccount) return;
    setOperationKey(`disconnect:${credentialKind}`);
    try {
      await disconnectXianyuAccount(editingAccount.id, credentialKind);
      await refreshAccounts();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '断开闲鱼凭证失败');
    } finally {
      setOperationKey('');
    }
  }

  /** 实时验证当前账号的连接。 */
  async function handleVerifyAccount() {
    if (!editingAccount) return;
    setOperationKey('verify');
    try {
      await verifyXianyuAccount(editingAccount.id);
      await refreshAccounts();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '验证闲鱼账号失败');
    } finally {
      setOperationKey('');
    }
  }

  /** 暂停、恢复或停用账号队列。 */
  async function handleChangeAccountStatus(status: XianyuAccount['status']) {
    if (!editingAccount) return;
    setOperationKey(`status:${status}`);
    try {
      await updateXianyuAccount(editingAccount.id, { status });
      await refreshAccounts();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '更新账号状态失败');
    } finally {
      setOperationKey('');
    }
  }

  /** 根据当前状态显示唯一可执行的队列控制动作。 */
  function renderQueueStatusAction() {
    if (!editingAccount) return null;
    if (editingAccount.status === 'active') {
      return <Button loading={operationKey === 'status:paused'} onClick={() => void handleChangeAccountStatus('paused')}>暂停后续任务</Button>;
    }
    return <Button type="primary" loading={operationKey === 'status:active'} onClick={() => void handleChangeAccountStatus('active')}>{editingAccount.status === 'disabled' ? '重新启用账号' : '恢复任务队列'}</Button>;
  }

  // 账号管理表格列。
  const accountColumns: ProColumns<XianyuAccount>[] = [
    { title: '账号', dataIndex: 'name', render: (_, account) => <div><strong>{account.name}</strong><div className="catalog-muted">{account.displayName || '尚未识别昵称'}</div></div> },
    { title: '卖家后台', width: 110, render: (_, account) => <Tag color={account.sellerConnected ? 'success' : 'default'}>{account.sellerConnected ? '已连接' : '未连接'}</Tag> },
    { title: '闲鱼搜索/比价', width: 130, render: (_, account) => <Tag color={account.sessionConnected ? 'success' : 'default'}>{account.sessionConnected ? '已连接' : '未连接'}</Tag> },
    { title: '队列', width: 95, render: (_, account) => getAccountStatusTag(account) },
    { title: '操作', valueType: 'option', width: 90, render: (_, account) => <Button type="link" onClick={() => setEditingAccountId(account.id)}>管理</Button> },
  ];

  return <>
    <div className="xianyu-account-switcher">
      <Select loading={isLoading} value={currentAccount?.id} onChange={setCurrentAccountId} placeholder="选择闲鱼账号" options={accounts.map((account) => ({ value: account.id, label: account.name, disabled: account.status === 'disabled' }))} />
      <Tooltip title={`已连接 ${connectedSellerCount} 个闲鱼卖家账号`}><Button className={connectedSellerCount > 0 ? 'xianyu-connect xianyu-connect--online' : 'xianyu-connect'} onClick={handleOpenDrawer}><span className="xianyu-connect__dot" />账号管理</Button></Tooltip>
    </div>

    <Drawer open={isDrawerOpen} size="95vw" title={<div className="platform-drawer-title"><small>GOOFISH ACCOUNTS</small><strong>闲鱼账号管理</strong><span>每个账号独立保存凭证、在售商品和发布队列。</span></div>} rootClassName="platform-connection-drawer" onClose={() => setIsDrawerOpen(false)}>
      {accountError ? <Alert type="error" showIcon message={accountError} /> : null}
      {errorMessage ? <Alert type="error" showIcon closable onClose={() => setErrorMessage('')} message={errorMessage} /> : null}
      <div className="xianyu-account-manager">
        <section className="xianyu-account-list-panel">
          <ProTable<XianyuAccount> rowKey="id" columns={accountColumns} dataSource={accounts} loading={isLoading} search={false} pagination={false} options={{ reload: () => void refreshAccounts(), density: true }} headerTitle={`闲鱼账号 · ${accounts.length}`} toolBarRender={() => [<Button key="create" type="primary" onClick={() => setIsCreateOpen(true)}>新增账号</Button>]} onRow={(account) => ({ onClick: () => setEditingAccountId(account.id), className: account.id === editingAccount?.id ? 'xianyu-account-row--active' : '' })} />
        </section>

        <section className="xianyu-account-detail-panel">
          {editingAccount ? <>
            <header><div><small>ACCOUNT / {editingAccount.id.slice(-8).toUpperCase()}</small><h2>{editingAccount.name}</h2><p>{editingAccount.displayName || '连接凭证后读取闲鱼昵称'}{editingAccount.platformUserId ? ` · 用户 ID ${editingAccount.platformUserId}` : ''}</p></div><Space>{getAccountStatusTag(editingAccount)}<Button onClick={() => { setRenameAccountName(editingAccount.name); setIsRenameOpen(true); }}>修改备注</Button><Button loading={operationKey === 'verify'} onClick={() => void handleVerifyAccount()}>验证连接</Button></Space></header>
            <div className="xianyu-account-status-actions">{renderQueueStatusAction()}<Popconfirm title="确认停用该账号？" description="历史记录和在售商品会保留，停用后不会执行新任务。" onConfirm={() => void handleChangeAccountStatus('disabled')}><Button danger disabled={editingAccount.status === 'disabled'}>停用账号</Button></Popconfirm></div>
            <Alert type="info" showIcon message="任务队列控制" description={getQueueStatusDescription(editingAccount.status)} />
            <Segmented value={credentialKind} onChange={setCredentialKind} options={[{ value: 'seller', label: `卖家后台 · ${editingAccount.sellerConnected ? '已连接' : '未连接'}` }, { value: 'session', label: `闲鱼搜索/比价 · ${editingAccount.sessionConnected ? '已连接' : '未连接'}` }]} />
            <div className="platform-config-form"><p>{credentialKind === 'seller' ? '登录 seller.goofish.com，从商品管理请求复制完整 cURL；用于发布、编辑、下架和同步在售商品。' : '从 h5api.m.goofish.com 请求复制完整 cURL；只用于闲鱼搜索与一键比价。'}</p><Button href={credentialKind === 'seller' ? 'https://seller.goofish.com/?site=COMMONPRO#/seller-item/goods-manage' : 'https://www.goofish.com/'} target="_blank">打开登录页面</Button><label><span>{credentialKind === 'seller' ? '卖家后台 cURL / Cookie' : '闲鱼搜索/比价 cURL / Cookie'}</span><Input.TextArea value={credentialText} onChange={(event) => setCredentialText(event.target.value)} autoSize={{ minRows: 8, maxRows: 14 }} placeholder="粘贴完整 cURL 或 Cookie" /></label><footer><Popconfirm title="确认断开这类凭证？" onConfirm={() => void handleDisconnectCredential()}><Button danger loading={operationKey === `disconnect:${credentialKind}`}>断开凭证</Button></Popconfirm><Button type="primary" loading={operationKey === `connect:${credentialKind}`} disabled={!credentialText.trim()} onClick={() => void handleConnectCredential()}>验证并保存凭证</Button></footer></div>
          </> : <Alert type="info" showIcon message="请先新增或选择一个闲鱼账号" />}
        </section>
      </div>
    </Drawer>

    <Modal open={isCreateOpen} title="新增闲鱼账号" okText="创建并选择" cancelText="取消" confirmLoading={operationKey === 'create'} onOk={() => void handleCreateAccount()} onCancel={() => setIsCreateOpen(false)}><label className="xianyu-account-create-field"><span>账号备注</span><Input value={newAccountName} onChange={(event) => setNewAccountName(event.target.value)} onPressEnter={() => void handleCreateAccount()} placeholder="例如：主账号、女鞋账号" /></label></Modal>
    <Modal open={isRenameOpen} title="修改账号备注" okText="保存" cancelText="取消" confirmLoading={operationKey === 'rename'} onOk={() => void handleRenameAccount()} onCancel={() => setIsRenameOpen(false)}><label className="xianyu-account-create-field"><span>账号备注</span><Input value={renameAccountName} onChange={(event) => setRenameAccountName(event.target.value)} onPressEnter={() => void handleRenameAccount()} /></label></Modal>
  </>;
}
