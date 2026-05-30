import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/PrithviSetu/',
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          map: ['leaflet', 'react-leaflet'],
          chart: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
})
