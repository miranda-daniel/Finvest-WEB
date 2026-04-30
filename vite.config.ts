import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    tanstackRouter({ routesDirectory: './src/routes' }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    port: 5100,
    // Dev-only proxy: forwards any /api/* request to the API server and strips
    // the /api prefix before forwarding (e.g. /api/session/login → /session/login).
    //
    // This avoids CORS issues during local development — both the frontend and the
    // API appear to the browser as the same origin (localhost:5100).
    //
    // The /api prefix is the contract between the frontend and whatever sits in
    // front of it. In production an ALB (or nginx) takes over this role:
    //   /api/*  → API service
    //   /*      → frontend service
    // This file is never used in production — Vite is a dev server only.
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/logos': {
        target: 'https://financialmodelingprep.com/image-stock',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/logos/, ''),
      },
      '/posthog': {
        target: 'https://app.posthog.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/posthog/, ''),
      },
      '/sentry': {
        target: 'https://o<id>.ingest.sentry.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sentry/, ''),
      },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
