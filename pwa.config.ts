import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'

// Installed app name is fixed in Hebrew in every UI language (PRD F5).
export const manifest: Partial<ManifestOptions> = {
  name: 'כפל כיף',
  short_name: 'כפל כיף',
  lang: 'he',
  dir: 'rtl',
  // Relative to Vite's base (/multiplication-table/) so it works under the GitHub Pages repo path
  start_url: './',
  scope: './',
  display: 'standalone',
  // Same white as the page background, so the iPhone launch flash is in the app color
  background_color: '#FFFFFF',
  theme_color: '#FFFFFF',
  icons: [
    { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

export const pwaOptions: Partial<VitePWAOptions> = {
  strategies: 'generateSW',
  // ADR-3/ADR-6: no skipWaiting or clientsClaim and no update UI, so a new version
  // waits in the background and only takes over on the next fresh launch.
  registerType: 'prompt',
  // The virtual register module is not imported, so the plugin injects a plain registration script
  injectRegister: 'auto',
  manifest,
  // The icons are already matched by globPatterns below; avoid listing them twice
  includeManifestIcons: false,
  workbox: {
    // Only woff2 fonts: every target browser supports them, and the woff fallbacks would double the cache
    globPatterns: ['**/*.{html,js,css,svg,png,ico,woff2}'],
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
  },
}
