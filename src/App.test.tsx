import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { strings } from './i18n/strings'

const he = strings.he

describe('App navigation', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('shows the home screen with approved texts', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: he.appName })).toBeInTheDocument()
    expect(screen.getByText(he.homeSubtitle)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.practiceButton })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.aboutButton })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.languageButton })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: he.back })).not.toBeInTheDocument()
  })

  it('opens practice and returns home with the Back button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: he.practiceButton }))
    expect(document.querySelector('[data-screen="practice"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.languageButton })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: he.back }))
    expect(await screen.findByRole('button', { name: he.practiceButton })).toBeInTheDocument()
  })

  it('opens about and returns home with the Back button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: he.aboutButton }))
    expect(screen.getByRole('heading', { level: 1, name: he.aboutTitle })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: he.back }))
    expect(await screen.findByRole('button', { name: he.aboutButton })).toBeInTheDocument()
  })

  it('returns home when the browser Back button fires popstate', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: he.aboutButton }))
    expect(screen.getByRole('heading', { level: 1, name: he.aboutTitle })).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    })
    expect(screen.getByRole('button', { name: he.practiceButton })).toBeInTheDocument()
  })
})
