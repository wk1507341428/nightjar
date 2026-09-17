import { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Tooltip } from 'antd';
import { connectXianyu, fetchXianyuConnection } from './xianyuApi';
import type { XianyuConnection } from './types';

/** 顶部闲鱼 API 连接入口。 */
export function XianyuConnectionControl() {
  // 当前闲鱼连接状态。
  const [connection, setConnection] = useState<XianyuConnection | null>(null);
  // 连接弹窗显示状态。
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 用户粘贴的 Cookie Header。
  const [cookieText, setCookieText] = useState('');
  // Cookie 校验请求状态。
  const [isConnecting, setIsConnecting] = useState(false);
  // 本地服务或会话错误提示。
  const [errorMessage, setErrorMessage] = useState('');

  /** 刷新本地保存的闲鱼连接状态。 */
  async function refreshConnection() {
    try {
      // 最新连接状态。
      const nextConnection = await fetchXianyuConnection();
      setConnection(nextConnection);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '本地服务不可用');
    }
  }

  /** 校验并加密保存闲鱼 Cookie。 */
  async function handleConnectXianyu() {
    if (!cookieText.trim()) {
      setErrorMessage('请粘贴完整 Cookie');
      return;
    }

    setIsConnecting(true);
    setErrorMessage('');
    try {
      // 验证成功后的连接状态。
      const nextConnection = await connectXianyu(cookieText.trim());
      setConnection(nextConnection);
      setCookieText('');
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '闲鱼连接失败');
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    void refreshConnection();
  }, []);

  // 当前是否已经连接闲鱼 API。
  const isConnected = connection?.authenticated === true;
  // 顶部按钮文案。
  let buttonLabel = '连接闲鱼';
  if (isConnected) {
    buttonLabel = '闲鱼 API 已连接';
  } else if (errorMessage) {
    buttonLabel = '本地服务未连接';
  }

  return (
    <>
      <Tooltip title={errorMessage || connection?.message || '通过 Go 后端直接调用闲鱼 API'}>
        <Button
          className={isConnected ? 'xianyu-connect xianyu-connect--online' : 'xianyu-connect'}
          type={isConnected ? 'default' : 'primary'}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="xianyu-connect__dot" />
          {buttonLabel}
        </Button>
      </Tooltip>

      <Modal
        open={isModalOpen}
        title="连接闲鱼 API"
        okText="验证并连接"
        cancelText="取消"
        confirmLoading={isConnecting}
        onOk={handleConnectXianyu}
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="xianyu-session-guide">
          <p>先在闲鱼网页完成登录，然后从任意一个 <code>h5api.m.goofish.com</code> 请求中复制完整的 <code>Cookie</code> 请求头。</p>
          <Button href="https://www.goofish.com/" target="_blank">打开闲鱼网页登录</Button>
          <Input.TextArea
            value={cookieText}
            onChange={(event) => setCookieText(event.target.value)}
            placeholder="粘贴 Cookie，例如 _m_h5_tk=...; _m_h5_tk_enc=...; cookie2=..."
            autoSize={{ minRows: 5, maxRows: 9 }}
          />
          <Alert type="info" showIcon message="Cookie 会使用本机独立密钥加密后保存，前端和日志不会再次显示明文。" />
          {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
        </div>
      </Modal>
    </>
  );
}

