/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.{test,spec}.{js,jsx}', 'src/test/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Deliberate code-splitting: keep the animation/vendor weight out of
        // the initial paint so the landing hero streams fast.
        //
        // `recharts` (~115kB gzipped, the single largest dependency in the
        // app) is used by exactly one route — the admin-only Analytics page,
        // itself already behind a `lazy()` boundary in App.jsx — so it does
        // NOT get a manual chunk here. Pinning it to a named chunk earlier
        // caused Vite to emit it as a `<link rel="modulepreload">` in the
        // root index.html, fetched eagerly on every single page (including
        // the homepage) regardless of whether that page ever reaches
        // AdminAnalytics. Leaving it to automatic chunking keeps it bundled
        // with (or in a chunk reachable only from) that one lazy import, so
        // it downloads only for the visitors who actually open it.
        manualChunks: {
          motion: ['framer-motion', 'lenis'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
