import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
            '/auth':   { target: process.env.VITE_API_URL || 'http://localhost:8080', changeOrigin: true },
            '/notes':  { target: process.env.VITE_API_URL || 'http://localhost:8080', changeOrigin: true },
            '/search': { target: process.env.VITE_API_URL || 'http://localhost:8080', changeOrigin: true },
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
})