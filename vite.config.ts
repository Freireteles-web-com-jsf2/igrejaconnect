import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    // Only use Cloudflare plugin for local development and Cloudflare builds
    ...(process.env.NODE_ENV !== 'production' || process.env.CF_PAGES ? [cloudflare()] : [])
  ],
  base: process.env.NODE_ENV === 'production' ? '/igrejaconnect/' : '/',
  server: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
    outDir: 'dist',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
