import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 开发与构建配置。
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
