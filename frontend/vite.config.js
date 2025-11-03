import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

