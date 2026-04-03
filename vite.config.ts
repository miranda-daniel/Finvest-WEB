import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [tanstackRouter({ routesDirectory: './src/routes' }), react(), tailwindcss()],
  server: {
    port: 5100,
    proxy: {
      // Forward /graphql and /session requests to the API during development.
      // In production, the reverse proxy (nginx, etc.) handles this.
      '/graphql': 'http://localhost:3001',
      '/session': 'http://localhost:3001',
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
