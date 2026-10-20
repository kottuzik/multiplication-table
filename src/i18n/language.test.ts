import { describe, expect, it } from 'vitest'
import { LANGUAGE_STORAGE_KEY, detectInitialLanguage, languageDir, saveLanguage } from './language'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

const blockedStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('detectInitialLanguage', () => {
  it('prefers a saved manual choice over the browser language', () => {
    expect(detectInitialLanguage(memoryStorage({ [LANGUAGE_STORAGE_KEY]: 'en' }), 'he-IL')).toBe('en')
    expect(detectInitialLanguage(memoryStorage({ [LANGUAGE_STORAGE_KEY]: 'he' }), 'en-US')).toBe('he')
  })

  it('ignores an invalid saved value', () => {
    expect(detectInitialLanguage(memoryStorage({ [LANGUAGE_STORAGE_KEY]: 'fr' }), 'en-US')).toBe('en')
    expect(detectInitialLanguage(memoryStorage({ [LANGUAGE_STORAGE_KEY]: '' }), 'he')).toBe('he')
  })

  it.each(['en', 'en-US', 'EN-gb'])('uses English for an English browser (%s)', (lang) => {
    expect(detectInitialLanguage(memoryStorage(), lang)).toBe('en')
  })

  it.each(['he', 'he-IL', 'iw', 'fr', 'ar', 'eng', ''])('uses Hebrew for any other browser language (%s)', (lang) => {
    expect(detectInitialLanguage(memoryStorage(), lang)).toBe('he')
  })

  it('uses Hebrew when the browser language is missing and nothing is stored', () => {
    expect(detectInitialLanguage(null, undefined)).toBe('he')
  })

  it('keeps working when storage is blocked', () => {
    expect(detectInitialLanguage(blockedStorage, 'en-US')).toBe('en')
    expect(detectInitialLanguage(blockedStorage, 'he-IL')).toBe('he')
  })
})

describe('saveLanguage', () => {
  it('stores only the language code under one key', () => {
    const storage = memoryStorage()
    saveLanguage('en', storage)
    expect([...storage.data.entries()]).toEqual([[LANGUAGE_STORAGE_KEY, 'en']])
  })

  it('does not throw when storage is blocked', () => {
    expect(() => saveLanguage('en', blockedStorage)).not.toThrow()
    expect(() => saveLanguage('he', null)).not.toThrow()
  })
})

describe('languageDir', () => {
  it('maps Hebrew to rtl and English to ltr', () => {
    expect(languageDir('he')).toBe('rtl')
    expect(languageDir('en')).toBe('ltr')
  })
})
