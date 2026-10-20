import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { LANGUAGE_STORAGE_KEY } from './language'
import { strings } from './strings'
import type { Language } from './strings'

const { he, en } = strings
const HEBREW = /[֐-׿]/
const LATIN = /[A-Za-z]/

// All visible text and text attributes, except the language button (it names the other language).
function uiText(): string {
  const clone = document.body.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.lang-button').forEach((el) => el.remove())
  const attrs = Array.from(clone.querySelectorAll('[placeholder], [aria-label]')).flatMap((el) => [
    el.getAttribute('placeholder') ?? '',
    el.getAttribute('aria-label') ?? '',
  ])
  return [clone.textContent ?? '', ...attrs].join(' ')
}

function expectOnly(language: Language) {
  const text = uiText()
  if (language === 'en') expect(text).not.toMatch(HEBREW)
  else expect(text).not.toMatch(LATIN)
  expect(document.title).toBe(strings[language].appName)
}

function setBrowserLanguage(lang: string) {
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(lang)
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue([lang])
}

const input = () => screen.getByRole('textbox') as HTMLInputElement
const count = () => screen.getByTestId('correct-count').textContent

describe('Bilingual UI', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    // Math.random() = 0.65 makes every "all" exercise 7 × 7 = 49.
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    window.history.pushState(null, '')
  })

  it('opens in English for an English browser', () => {
    setBrowserLanguage('en-US')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: en.appName })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(screen.getByRole('button', { name: en.languageButton })).toHaveAttribute('lang', 'he')
  })

  it.each(['he-IL', 'fr'])('opens in Hebrew for any other browser language (%s)', (lang) => {
    setBrowserLanguage(lang)
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: he.appName })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('he')
    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getByRole('button', { name: he.languageButton })).toHaveAttribute('lang', 'en')
  })

  it('switches every screen and state to the other language with no leftover strings', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const language of ['he', 'en', 'he'] as const) {
      const t = strings[language]
      if (language !== 'he' || document.documentElement.lang !== 'he') {
        await user.click(screen.getAllByRole('button', { name: strings[language === 'he' ? 'en' : 'he'].languageButton })[0])
      }
      expect(document.documentElement.lang).toBe(language)
      expect(document.documentElement.dir).toBe(language === 'he' ? 'rtl' : 'ltr')

      // Home
      expect(screen.getByRole('heading', { level: 1, name: t.appName })).toBeInTheDocument()
      expectOnly(language)

      // Practice: empty, wrong and correct feedback
      await user.click(screen.getByRole('button', { name: t.practiceButton }))
      await user.click(screen.getByRole('button', { name: t.check }))
      expect(screen.getByRole('status')).toHaveTextContent(t.feedbackEmpty)
      expectOnly(language)
      await user.type(input(), '5')
      await user.click(screen.getByRole('button', { name: t.check }))
      expect(screen.getByRole('status')).toHaveTextContent(t.feedbackWrong)
      expectOnly(language)
      await user.type(input(), '49')
      await user.click(screen.getByRole('button', { name: t.check }))
      expect(screen.getByRole('status')).toHaveTextContent(t.feedbackCorrect)
      expectOnly(language)

      // Summary: nothing skipped, then with a skipped exercise
      await user.click(screen.getByRole('button', { name: t.finish }))
      expect(screen.getByRole('dialog')).toHaveTextContent(t.summaryEmpty)
      expectOnly(language)
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      await user.click(screen.getByRole('button', { name: t.skip }))
      await user.click(screen.getByRole('button', { name: t.finish }))
      expect(screen.getByRole('dialog')).toHaveTextContent(t.summaryListTitle)
      expectOnly(language)
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

      // About
      await user.click(screen.getByRole('button', { name: t.back }))
      await user.click(await screen.findByRole('button', { name: t.aboutButton }))
      expect(screen.getByRole('heading', { level: 1, name: t.aboutTitle })).toBeInTheDocument()
      expectOnly(language)
      await user.click(screen.getByRole('button', { name: t.back }))
      await screen.findByRole('button', { name: t.practiceButton })
    }
  })

  it('switching language mid-exercise keeps the screen, exercise, typed answer, counter, table and skipped list', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: he.practiceButton }))
    // Skip 7 × 7, then switch to table 3 and solve one so the counter is above zero
    await user.click(screen.getByRole('button', { name: he.skip }))
    await user.click(screen.getByRole('button', { name: '3' }))
    const [a, b] = screen.getByTestId('exercise').textContent!.split(' × ').map((part) => parseInt(part, 10))
    await user.type(input(), String(a * b))
    await user.click(screen.getByRole('button', { name: he.check }))
    expect(count()).toBe('1')
    const nextExercise = screen.getByTestId('exercise').textContent
    await user.type(input(), '7')
    const historyLength = window.history.length

    await user.click(screen.getByRole('button', { name: he.languageButton }))

    expect(document.querySelector('[data-screen="practice"]')).toBeInTheDocument()
    expect(screen.getByTestId('exercise').textContent).toBe(nextExercise)
    expect(input().value).toBe('7')
    expect(input()).toHaveAttribute('placeholder', en.answerPlaceholder)
    expect(count()).toBe('1')
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true')
    expect(window.history.length).toBe(historyLength)

    await user.click(screen.getByRole('button', { name: en.finish }))
    expect(within(screen.getByRole('dialog')).getAllByRole('listitem')).toHaveLength(1)
  })

  it('the language button works while the summary is open; the dialog stays open with the same list', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: he.practiceButton }))
    await user.click(screen.getByRole('button', { name: he.skip }))
    await user.click(screen.getByRole('button', { name: he.finish }))
    const dialog = screen.getByRole('dialog', { name: he.summaryTitle })
    const items = within(dialog).getAllByRole('listitem').map((li) => li.textContent)

    const languageButton = within(dialog).getByRole('button', { name: he.languageButton })
    await user.click(languageButton)

    const englishDialog = screen.getByRole('dialog', { name: en.summaryTitle })
    expect(englishDialog).toHaveTextContent(en.summaryListTitle)
    expect(within(englishDialog).getByRole('button', { name: en.solveSkipped })).toBeInTheDocument()
    expect(within(englishDialog).getByRole('button', { name: en.done })).toBeInTheDocument()
    expect(within(englishDialog).getAllByRole('listitem').map((li) => li.textContent)).toEqual(items)
    expect(within(englishDialog).getByRole('button', { name: en.languageButton })).toHaveFocus()
  })

  it('saves only a manual choice and restores it on the next load', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    expect(window.localStorage.length).toBe(0)

    await user.click(screen.getByRole('button', { name: he.languageButton }))
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(window.localStorage.length).toBe(1)

    // Practice data is never stored
    await user.click(screen.getByRole('button', { name: en.practiceButton }))
    await user.type(input(), '49')
    await user.click(screen.getByRole('button', { name: en.check }))
    expect(window.localStorage.length).toBe(1)
    expect(window.sessionStorage.length).toBe(0)

    first.unmount()
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: en.appName })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('keeps working when localStorage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: he.languageButton }))
    expect(screen.getByRole('heading', { level: 1, name: en.appName })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: en.languageButton }))
    expect(screen.getByRole('heading', { level: 1, name: he.appName })).toBeInTheDocument()
  })
})
