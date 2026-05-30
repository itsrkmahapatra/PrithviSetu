import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/PrithviSetu/',
  optimizeDeps: {
    include: ['cobe'] // Forces Vite to pre-bundle cobe's map data
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          globe: ['cobe'],
          map: ['leaflet', 'react-leaflet'],
          chart: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
})
