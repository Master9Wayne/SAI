import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4111',
        changeOrigin: true,
        timeout: 6000000,
        proxyTimeout: 6000000,
      },
    },
  },
});
