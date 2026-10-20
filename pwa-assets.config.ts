import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Run once with `npm run generate-icons`; the generated PNG/ICO files are committed in public/ (ADR-6).
// The source icon already has an opaque background, so the maskable and iPhone icons use it
// edge to edge instead of the preset's white padding.
const background = '#FFF9D6'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background } },
  },
  images: ['public/app-icon.svg'],
})
