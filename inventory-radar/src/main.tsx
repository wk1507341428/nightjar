import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { App } from './App';
import 'antd/dist/reset.css';
import './styles.css';

// React 应用挂载节点。
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('未找到应用挂载节点');
}

createRoot(rootElement).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ff0046',
          colorInfo: '#ff0046',
          colorText: '#2f4858',
          colorBorder: '#dfe4eb',
          borderRadius: 12,
          fontFamily: '"Avenir Next", "Futura", "PingFang SC", sans-serif',
        },
        components: {
          Select: {
            optionSelectedBg: '#fff0f5',
            optionSelectedColor: '#ff0046',
            activeBorderColor: '#ff0046',
            hoverBorderColor: '#ff0046',
          },
          Switch: {
            colorPrimary: '#ff0046',
            colorPrimaryHover: '#d8003c',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
