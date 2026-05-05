import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor'
            }

            if (id.includes('recharts')) {
              return 'charts'
            }

            if (id.includes('lucide-react')) {
              return 'icons'
            }

            return 'vendor'
          }
        }
      }
    }
  }
})
