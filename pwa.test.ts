import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { manifest, pwaOptions } from './pwa.config.ts'

const root = import.meta.dirname
const indexHtml = readFileSync(`${root}/index.html`, 'utf8')

describe('web app manifest', () => {
  it('uses the fixed Hebrew app name in standalone mode', () => {
    expect(manifest.name).toBe('כפל כיף')
    expect(manifest.short_name).toBe('כפל כיף')
    expect(manifest.lang).toBe('he')
    expect(manifest.dir).toBe('rtl')
    expect(manifest.display).toBe('standalone')
  })

  it('keeps start_url and scope relative to the deploy base', () => {
    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
  })

  it('uses the white page background as the launch color', () => {
    expect(manifest.background_color).toBe('#FFFFFF')
  })

  it('lists 192, 512 and maskable icons that exist in public/', () => {
    const icons = manifest.icons ?? []
    expect(icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
    expect(icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
    for (const icon of icons) expect(existsSync(`${root}/public/${icon.src}`)).toBe(true)
  })
})

describe('index.html head', () => {
  it('has the iPhone icon, title and standalone tags', () => {
    expect(indexHtml).toContain('rel="apple-touch-icon" href="/apple-touch-icon-180x180.png"')
    expect(indexHtml).toContain('name="apple-mobile-web-app-title" content="כפל כיף"')
    expect(indexHtml).toContain('name="apple-mobile-web-app-capable" content="yes"')
    expect(indexHtml).not.toContain('apple-touch-startup-image')
  })

  it('links only icon files that exist in public/', () => {
    const hrefs = [...indexHtml.matchAll(/<link rel="(?:icon|apple-touch-icon)" href="\/([^"]+)"/g)].map((m) => m[1])
    expect(hrefs).toHaveLength(3)
    for (const href of hrefs) expect(existsSync(`${root}/public/${href}`)).toBe(true)
  })
})

describe('update policy (ADR-3)', () => {
  it('never activates a new version in the middle of a session', () => {
    expect(pwaOptions.registerType).toBe('prompt')
    expect(pwaOptions.workbox?.skipWaiting).toBeUndefined()
    expect(pwaOptions.workbox?.clientsClaim).toBeUndefined()
  })
})
