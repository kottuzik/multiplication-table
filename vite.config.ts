import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { pwaOptions } from './pwa.config.ts'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project URL: https://kottuzik.github.io/multiplication-table/
  base: '/multiplication-table/',
  plugins: [react(), VitePWA(pwaOptions)],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
