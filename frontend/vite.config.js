import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        // Proxy all API paths through the gateway so the browser never hits
        // CORS issues in dev. The gateway's CorsConfig handles production.
        '/auth':     { target: apiTarget, changeOrigin: true },
        '/notes':    { target: apiTarget, changeOrigin: true },
        '/search':   { target: apiTarget, changeOrigin: true },
        '/settings': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            store:  ['zustand'],
          },
        },
      },
    },
  }
})