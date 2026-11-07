import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Necessário para hot reload com volumes do Docker no Windows
      watch: { usePolling: env.CHOKIDAR_USEPOLLING === 'true' },
      proxy: {
        // Requisições para /api são encaminhadas ao Laravel
        '/api': { target: apiTarget, changeOrigin: true },
        '/docs': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
