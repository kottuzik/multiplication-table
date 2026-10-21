import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { listenForInstallPrompt, resetInstallPrompt } from '../pwa/installPrompt'

function fireInstallable() {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
  })
  act(() => {
    window.dispatchEvent(event)
  })
  return event
}

beforeAll(() => listenForInstallPrompt())
afterEach(() => act(() => resetInstallPrompt()))

describe('install button', () => {
  it('is hidden when the browser does not offer installing (e.g. iPhone)', () => {
    render(<App />)
    expect(screen.queryByRole('button', { name: 'התקנה' })).not.toBeInTheDocument()
  })

  it('appears in the top bar when installing is possible and opens the browser prompt', async () => {
    render(<App />)
    const event = fireInstallable()
    expect(event.defaultPrevented).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'התקנה' }))
    expect(event.prompt).toHaveBeenCalledTimes(1)
    // A prompt can be used only once
    expect(screen.queryByRole('button', { name: 'התקנה' })).not.toBeInTheDocument()
  })

  it('is shown on the inner screens too, translated', async () => {
    render(<App />)
    fireInstallable()
    await userEvent.click(screen.getByRole('button', { name: /אודות/ }))
    expect(screen.getByRole('button', { name: 'התקנה' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument()
  })

  it('disappears once the app is installed from the browser menu', () => {
    render(<App />)
    fireInstallable()
    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })
    expect(screen.queryByRole('button', { name: 'התקנה' })).not.toBeInTheDocument()
  })
})
