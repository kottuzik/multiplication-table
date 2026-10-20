import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  // jsdom reports en-US; default the tests to a Hebrew browser unless a test says otherwise.
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('he-IL')
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['he-IL'])
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.localStorage.clear()
  document.documentElement.lang = 'he'
  document.documentElement.dir = 'rtl'
  document.title = ''
})
