import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
    // Allow running on any available port for multiple simultaneous instances
    strictPort: false,
  },
})
