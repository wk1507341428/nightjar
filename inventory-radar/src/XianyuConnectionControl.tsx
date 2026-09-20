import { useEffect, useState } from 'react';
import { Alert, Button, Drawer, Input, Popconfirm, Tooltip } from 'antd';
import {
  connectPinduoduo,
  connectXianyu,
  connectXianyuSeller,
  disconnectPinduoduo,
  disconnectXianyu,
  disconnectXianyuSeller,
  fetchPinduoduoConnection,
  fetchXianyuConnection,
  fetchXianyuSellerConnection,
} from './xianyuApi';
import type { PlatformConnection } from './types';

/** 当前可配置的平台标识。 */
type ConfigurablePlatform = 'xianyu' | 'xianyuSeller' | 'pinduoduo';

/** 顶部多平台 API 连接管理入口。 */
export function XianyuConnectionControl() {
  // 当前闲鱼连接状态。
  const [xianyuConnection, setXianyuConnection] = useState<PlatformConnection | null>(null);
  // 当前闲鱼卖家后台连接状态。
  const [xianyuSellerConnection, setXianyuSellerConnection] = useState<PlatformConnection | null>(null);
  // 当前拼多多连接状态。
  const [pinduoduoConnection, setPinduoduoConnection] = useState<PlatformConnection | null>(null);
  // 平台管理抽屉显示状态。
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // 抽屉中当前选中的平台。
  const [activePlatform, setActivePlatform] = useState<ConfigurablePlatform>('xianyu');
  // 用户粘贴的闲鱼 cURL 或 Cookie Header。
  const [xianyuCredentialText, setXianyuCredentialText] = useState('');
  // 用户粘贴的闲鱼卖家后台 cURL 或 Cookie Header。
  const [xianyuSellerCredentialText, setXianyuSellerCredentialText] = useState('');
  // 用户提供的拼多多商家后台 cURL 或 Cookie。
  const [pinduoduoCredentialText, setPinduoduoCredentialText] = useState('');
  // 当前正在保存的平台。
  const [savingPlatform, setSavingPlatform] = useState<ConfigurablePlatform | null>(null);
  // 当前正在断开的平台。
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<ConfigurablePlatform | null>(null);
  // 当前平台操作错误提示。
  const [errorMessage, setErrorMessage] = useState('');

  /** 刷新所有平台的本地连接状态。 */
  async function refreshAllConnections() {
    const [xianyuResult, sellerXianyuResult, pinduoduoResult] = await Promise.allSettled([
      fetchXianyuConnection(),
      fetchXianyuSellerConnection(),
      fetchPinduoduoConnection(),
    ]);
    if (xianyuResult.status === 'fulfilled') {
      setXianyuConnection(xianyuResult.value);
    }
    if (pinduoduoResult.status === 'fulfilled') {
      setPinduoduoConnection(pinduoduoResult.value);
    }
    if (sellerXianyuResult.status === 'fulfilled') {
      setXianyuSellerConnection(sellerXianyuResult.value);
    }
    if (xianyuResult.status === 'rejected' && sellerXianyuResult.status === 'rejected' && pinduoduoResult.status === 'rejected') {
      setErrorMessage('本地服务不可用');
    }
  }

  /** 打开平台连接管理抽屉。 */
  function handleOpenDrawer() {
    setErrorMessage('');
    setIsDrawerOpen(true);
  }

  /** 切换当前管理的平台。 */
  function handleSelectPlatform(platform: ConfigurablePlatform) {
    setActivePlatform(platform);
    setErrorMessage('');
  }

  /** 校验并保存闲鱼连接信息。 */
  async function handleConnectXianyu() {
    const normalizedCredential = xianyuCredentialText.trim();
    if (!normalizedCredential) {
      setErrorMessage('请粘贴任意闲鱼请求 cURL 或完整 Cookie');
      return;
    }
    setSavingPlatform('xianyu');
    setErrorMessage('');
    try {
      const nextConnection = await connectXianyu(normalizedCredential);
      setXianyuConnection(nextConnection);
      setXianyuCredentialText('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '闲鱼连接失败');
    } finally {
      setSavingPlatform(null);
    }
  }

  /** 校验并保存闲鱼卖家后台连接信息。 */
  async function handleConnectXianyuSeller() {
    const normalizedCredential = xianyuSellerCredentialText.trim();
    if (!normalizedCredential) {
      setErrorMessage('请粘贴卖家工作台请求 cURL 或完整 Cookie');
      return;
    }
    setSavingPlatform('xianyuSeller');
    setErrorMessage('');
    try {
      const nextConnection = await connectXianyuSeller(normalizedCredential);
      setXianyuSellerConnection(nextConnection);
      setXianyuSellerCredentialText('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '闲鱼卖家后台连接失败');
    } finally {
      setSavingPlatform(null);
    }
  }

  /** 校验并保存拼多多连接信息。 */
  async function handleConnectPinduoduo() {
    const normalizedCredential = pinduoduoCredentialText.trim();
    if (!normalizedCredential) {
      setErrorMessage('请粘贴拼多多商家后台请求 cURL 或完整 Cookie');
      return;
    }
    setSavingPlatform('pinduoduo');
    setErrorMessage('');
    try {
      const nextConnection = await connectPinduoduo({ credential: normalizedCredential });
      setPinduoduoConnection(nextConnection);
      setPinduoduoCredentialText('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '拼多多连接失败');
    } finally {
      setSavingPlatform(null);
    }
  }

  /** 删除本地保存的闲鱼连接信息。 */
  async function handleDisconnectXianyu() {
    setDisconnectingPlatform('xianyu');
    setErrorMessage('');
    try {
      const nextConnection = await disconnectXianyu();
      setXianyuConnection(nextConnection);
      setXianyuCredentialText('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '断开闲鱼失败');
    } finally {
      setDisconnectingPlatform(null);
    }
  }

  /** 删除本地保存的闲鱼卖家后台连接信息。 */
  async function handleDisconnectXianyuSeller() {
    setDisconnectingPlatform('xianyuSeller');
    setErrorMessage('');
    try {
      const nextConnection = await disconnectXianyuSeller();
      setXianyuSellerConnection(nextConnection);
      setXianyuSellerCredentialText('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '断开闲鱼卖家后台失败');
    } finally {
      setDisconnectingPlatform(null);
    }
  }

  /** 删除本地保存的拼多多连接信息。 */
  async function handleDisconnectPinduoduo() {
    setDisconnectingPlatform('pinduoduo');
    setErrorMessage('');
    try {
      const nextConnection = await disconnectPinduoduo();
      setPinduoduoConnection(nextConnection);
      setPinduoduoCredentialText('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '断开拼多多失败');
    } finally {
      setDisconnectingPlatform(null);
    }
  }

  useEffect(() => {
    void refreshAllConnections();
  }, []);

  // 闲鱼是否已经连接。
  const isXianyuConnected = xianyuConnection?.authenticated === true;
  // 闲鱼卖家后台是否已经连接。
  const isXianyuSellerConnected = xianyuSellerConnection?.authenticated === true;
  // 拼多多是否已经连接。
  const isPinduoduoConnected = pinduoduoConnection?.authenticated === true;
  // 已连接的平台数量。
  const connectedPlatformCount = Number(isXianyuConnected) + Number(isXianyuSellerConnected) + Number(isPinduoduoConnected);
  // 顶部连接入口文案。
  const connectionButtonLabel = connectedPlatformCount > 0
    ? `平台 API ${connectedPlatformCount}/3`
    : '连接平台 API';

  return (
    <>
      <Tooltip title={`闲鱼${isXianyuConnected ? '已连接' : '未连接'} · 卖家后台${isXianyuSellerConnected ? '已连接' : '未连接'} · 拼多多${isPinduoduoConnected ? '已连接' : '未连接'}`}>
        <Button className={connectedPlatformCount > 0 ? 'xianyu-connect xianyu-connect--online' : 'xianyu-connect'} type={connectedPlatformCount > 0 ? 'default' : 'primary'} onClick={handleOpenDrawer}>
          <span className="xianyu-connect__dot" />
          {connectionButtonLabel}
        </Button>
      </Tooltip>

      <Drawer open={isDrawerOpen} width="95vw" title={<div className="platform-drawer-title"><small>CHANNEL ACCESS</small><strong>平台连接管理</strong><span>每个平台独立保存登录信息，连接成功后即可参与一键比价。</span></div>} rootClassName="platform-connection-drawer" onClose={() => setIsDrawerOpen(false)}>
        <div className="platform-connection-layout">
          <aside className="platform-connection-nav" aria-label="平台列表">
            <button type="button" className={activePlatform === 'xianyu' ? 'platform-nav-card platform-nav-card--active' : 'platform-nav-card'} onClick={() => handleSelectPlatform('xianyu')}><i className="platform-nav-card__logo platform-nav-card__logo--xianyu">闲</i><span><strong>闲鱼</strong><small>{isXianyuConnected ? '已连接' : '未连接'}</small></span><em className={isXianyuConnected ? 'status-dot status-dot--online' : 'status-dot'} /></button>
            <button type="button" className={activePlatform === 'xianyuSeller' ? 'platform-nav-card platform-nav-card--active' : 'platform-nav-card'} onClick={() => handleSelectPlatform('xianyuSeller')}><i className="platform-nav-card__logo platform-nav-card__logo--seller">鱼</i><span><strong>闲鱼卖家后台</strong><small>{isXianyuSellerConnected ? '已连接' : '未连接'}</small></span><em className={isXianyuSellerConnected ? 'status-dot status-dot--online' : 'status-dot'} /></button>
            <button type="button" className={activePlatform === 'pinduoduo' ? 'platform-nav-card platform-nav-card--active' : 'platform-nav-card'} onClick={() => handleSelectPlatform('pinduoduo')}><i className="platform-nav-card__logo platform-nav-card__logo--pdd">拼</i><span><strong>拼多多</strong><small>{isPinduoduoConnected ? '已连接' : '未连接'}</small></span><em className={isPinduoduoConnected ? 'status-dot status-dot--online' : 'status-dot'} /></button>
            <div className="platform-nav-card platform-nav-card--disabled"><i className="platform-nav-card__logo">淘</i><span><strong>淘宝</strong><small>后续接入</small></span></div>
            <div className="platform-nav-card platform-nav-card--disabled"><i className="platform-nav-card__logo">京</i><span><strong>京东</strong><small>后续接入</small></span></div>
          </aside>

          <main className="platform-connection-panel">
            {activePlatform === 'xianyu' ? (
              <section className="platform-config-section">
                <header><span>GOOFISH</span><h2>闲鱼 API</h2><p>用于发布商品、同步在售状态和查询闲鱼市场价格。</p></header>
                {isXianyuConnected ? <Alert type="success" showIcon message={xianyuConnection?.message || '闲鱼 API 已连接'} description={xianyuConnection?.searchReady ? '账号连接和一键比价凭证均已就绪。' : '当前连接未包含一键比价需要的 bx 安全参数。'} /> : null}
                <div className="platform-config-form"><p>从任意一个 <code>h5api.m.goofish.com</code> 请求中复制完整 cURL，也可以直接粘贴完整 Cookie。</p><Button href="https://www.goofish.com/" target="_blank">打开闲鱼网页登录</Button><label><span>闲鱼 cURL / Cookie</span><Input.TextArea value={xianyuCredentialText} onChange={(event) => setXianyuCredentialText(event.target.value)} placeholder="粘贴完整闲鱼 cURL 或 Cookie" autoSize={{ minRows: 7, maxRows: 12 }} /></label></div>
                <Alert type="info" showIcon message="登录凭证会使用服务端独立密钥加密保存，页面和日志不会再次显示明文。" />
                {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
                <footer>{isXianyuConnected ? <Popconfirm title="确认断开闲鱼连接？" description="只删除 SideJob 保存的凭证，不会退出闲鱼网页。" okText="确认断开" cancelText="取消" onConfirm={handleDisconnectXianyu}><Button danger loading={disconnectingPlatform === 'xianyu'}>断开连接</Button></Popconfirm> : <span />}<Button type="primary" loading={savingPlatform === 'xianyu'} onClick={handleConnectXianyu}>{isXianyuConnected ? '更新闲鱼凭证' : '验证并连接闲鱼'}</Button></footer>
              </section>
            ) : null}

            {activePlatform === 'xianyuSeller' ? (
              <section className="platform-config-section">
                <header><span>GOOFISH SELLER</span><h2>闲鱼卖家后台 API</h2><p>仅用于商品管理操作：下架、改价、库存与粉丝价；不会覆盖普通闲鱼 API 凭证。</p></header>
                {isXianyuSellerConnected ? <Alert type="success" showIcon message={xianyuSellerConnection?.message || '闲鱼卖家后台已连接'} description="卖家后台凭证已独立保存，可用于渠道上架页的下架操作。" /> : null}
                <div className="platform-config-form"><p>登录 <code>seller.goofish.com</code> 后，从商品管理页任意一个 <code>h5api.m.goofish.com</code> 请求中复制完整 cURL，或粘贴完整 Cookie。</p><Button href="https://seller.goofish.com/?site=COMMONPRO#/seller-item/goods-manage" target="_blank">打开商品管理页</Button><label><span>卖家后台 cURL / Cookie</span><Input.TextArea value={xianyuSellerCredentialText} onChange={(event) => setXianyuSellerCredentialText(event.target.value)} placeholder="粘贴卖家后台商品管理请求的完整 cURL 或 Cookie" autoSize={{ minRows: 7, maxRows: 12 }} /></label></div>
                <Alert type="info" showIcon message="该凭证会独立加密保存，仅用于卖家后台商品操作；普通闲鱼发布与比价凭证不会被替换。" />
                {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
                <footer>{isXianyuSellerConnected ? <Popconfirm title="确认断开闲鱼卖家后台连接？" description="只删除 SideJob 保存的卖家后台凭证，不会退出网页。" okText="确认断开" cancelText="取消" onConfirm={handleDisconnectXianyuSeller}><Button danger loading={disconnectingPlatform === 'xianyuSeller'}>断开连接</Button></Popconfirm> : <span />}<Button type="primary" loading={savingPlatform === 'xianyuSeller'} onClick={handleConnectXianyuSeller}>{isXianyuSellerConnected ? '更新卖家后台凭证' : '验证并连接卖家后台'}</Button></footer>
              </section>
            ) : null}

            {activePlatform === 'pinduoduo' ? (
              <section className="platform-config-section">
                <header><span>PINDUODUO MMS</span><h2>拼多多商家后台</h2><p>临时使用“机会商品”查询同款参考价，不再依赖小程序动态风控参数。</p></header>
                {isPinduoduoConnected ? <Alert type="success" showIcon message={pinduoduoConnection?.message || '拼多多商家后台已连接'} description="商家后台 Cookie 已验证，可以参与一键比价。" /> : null}
                <div className="platform-config-form"><p>登录拼多多商家后台后，从任意一个 <code>mms.pinduoduo.com</code> 请求中复制完整 cURL，也可以直接粘贴完整 Cookie。</p><Button href="https://mms.pinduoduo.com/" target="_blank">打开拼多多商家后台</Button><label><span>商家后台 cURL / Cookie</span><Input.TextArea value={pinduoduoCredentialText} onChange={(event) => setPinduoduoCredentialText(event.target.value)} placeholder="粘贴完整商家后台 cURL，或包含 JSESSIONID / PASS_ID 的 Cookie" autoSize={{ minRows: 8, maxRows: 13 }} /></label></div>
                <Alert type="info" showIcon message="系统只提取 Cookie 并使用服务端独立密钥加密保存；anti-content、etag 等动态字段不需要填写。" />
                {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
                <footer>{isPinduoduoConnected ? <Popconfirm title="确认断开拼多多连接？" description="将删除 SideJob 保存的商家后台 Cookie。" okText="确认断开" cancelText="取消" onConfirm={handleDisconnectPinduoduo}><Button danger loading={disconnectingPlatform === 'pinduoduo'}>断开连接</Button></Popconfirm> : <span />}<Button type="primary" loading={savingPlatform === 'pinduoduo'} onClick={handleConnectPinduoduo}>{isPinduoduoConnected ? '更新商家后台凭证' : '验证并连接商家后台'}</Button></footer>
              </section>
            ) : null}
          </main>
        </div>
      </Drawer>
    </>
  );
}
