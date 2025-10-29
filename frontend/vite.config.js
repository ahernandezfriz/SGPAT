// frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Opcional: para que el 'hot-reload' funcione bien con Docker
  server: {
    host: '0.0.0.0',
    port: 5173, // Puerto estándar de Vite
    watch: {
      usePolling: true,
    },
  },
})