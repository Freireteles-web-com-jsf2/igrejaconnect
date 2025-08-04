import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Simple Vite config for GitHub Pages - NO Cloudflare dependencies
export default defineConfig({
  plugins: [react()],
  base: '/igrejaconnect/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    allowedHosts: true,
  },
})