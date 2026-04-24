import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import fs from 'fs'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'serve-public-index',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.url === '/' || req.url === '/index.html') {
                        try {
                            let html = fs.readFileSync(path.resolve(__dirname, 'public/index.html'), 'utf-8')
                            // Replace the incorrect path if present
                            html = html.replace('/frontend/src/main.jsx', '/src/main.jsx')
                            html = await server.transformIndexHtml(req.url, html)
                            res.setHeader('Content-Type', 'text/html')
                            res.end(html)
                            return
                        } catch (e) {
                            return next(e)
                        }
                    }
                    next()
                })
            }
        }
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:8000',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    store: ['zustand'],
                },
            },
        },
    },
})