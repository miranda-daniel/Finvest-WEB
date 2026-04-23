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
    proxy: {
      // Forward /graphql and /session requests to the API during development.
      // In production, the reverse proxy (nginx, etc.) handles this.
      '/graphql': process.env.VITE_API_URL ?? 'http://localhost:3001',
      '/session': process.env.VITE_API_URL ?? 'http://localhost:3001',
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
