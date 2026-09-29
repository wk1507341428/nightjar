import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { App } from './App';
import { XianyuAccountProvider } from './XianyuAccountContext';
import 'antd/dist/reset.css';
import './styles.css';
import './admin-theme.css';

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
          colorText: '#203548',
          colorTextSecondary: '#728395',
          colorBorder: '#dfe6ed',
          colorBgLayout: '#f2f5f8',
          colorBgContainer: '#ffffff',
          borderRadius: 10,
          controlHeight: 36,
          fontFamily: '"Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif',
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
          Table: {
            headerBg: '#f7f9fb',
            headerColor: '#6d7e8f',
            rowHoverBg: '#fff7f9',
            cellPaddingBlock: 13,
          },
          Card: {
            headerFontSize: 15,
          },
        },
      }}
    >
      <XianyuAccountProvider><App /></XianyuAccountProvider>
    </ConfigProvider>
  </StrictMode>,
);
