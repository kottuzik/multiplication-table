import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { strings } from '../i18n/strings'

const he = strings.he

// Math.random() = 0.65 makes every "all" exercise 7 × 7 = 49.
const ANSWER = '49'

function setup() {
  const user = userEvent.setup()
  render(<App />)
  return user
}

async function openPractice(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: he.practiceButton }))
}

const input = () => screen.getByLabelText(he.answerLabel) as HTMLInputElement
const count = () => screen.getByTestId('correct-count').textContent
const status = () => screen.getByRole('status')

describe('Practice screen', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    // jsdom history is shared across tests: start from a neutral (home) entry
    window.history.pushState(null, '')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows selector, exercise, labeled input with numeric keyboard, buttons and counter', async () => {
    const user = setup()
    await openPractice(user)
    const group = screen.getByRole('group', { name: he.chooseTable })
    const chips = within(group).getAllByRole('button')
    expect(chips).toHaveLength(11)
    expect(chips[0]).toHaveTextContent(he.tableAll)
    expect(chips[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('exercise')).toHaveTextContent('7 × 7 = ?')
    expect(input()).toHaveAttribute('inputmode', 'numeric')
    expect(input()).toHaveAttribute('placeholder', he.answerPlaceholder)
    expect(screen.getByRole('button', { name: he.check })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.skip })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.finish })).toBeInTheDocument()
    expect(count()).toBe('0')
  })

  it('accepts digits only, up to 3, also when pasting', async () => {
    const user = setup()
    await openPractice(user)
    await user.type(input(), 'a1b2c3d4')
    expect(input().value).toBe('123')
    await user.clear(input())
    await user.click(input())
    await user.paste('x5-6y')
    expect(input().value).toBe('56')
  })

  it('empty check shows a prompt, does not count, and focuses the input', async () => {
    const user = setup()
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: he.check }))
    expect(status()).toHaveTextContent(he.feedbackEmpty)
    expect(count()).toBe('0')
    expect(input()).toHaveFocus()
  })

  it('wrong then correct (retries) counts once; feedback disappears on typing', async () => {
    const user = setup()
    await openPractice(user)
    await user.type(input(), '48')
    await user.click(screen.getByRole('button', { name: he.check }))
    expect(status()).toHaveTextContent(he.feedbackWrong)
    expect(input().value).toBe('')
    expect(input()).toHaveFocus()
    expect(count()).toBe('0')

    await user.type(input(), '4')
    expect(status()).toHaveTextContent('')

    await user.type(input(), '9{Enter}')
    expect(status()).toHaveTextContent(he.feedbackCorrect)
    expect(count()).toBe('1')
    expect(input()).toHaveFocus()
  })

  it('fast double click on Check counts a correct answer only once', async () => {
    const user = setup()
    await openPractice(user)
    await user.type(input(), ANSWER)
    await user.dblClick(screen.getByRole('button', { name: he.check }))
    expect(count()).toBe('1')
    expect(status()).toHaveTextContent(he.feedbackCorrect)
  })

  it('switching table keeps the counter and clears input and feedback', async () => {
    const user = setup()
    await openPractice(user)
    await user.type(input(), `${ANSWER}{Enter}`)
    await user.type(input(), '1')
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: he.tableAll })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('exercise')).toHaveTextContent('7 × 3 = ?')
    expect(count()).toBe('1')
    expect(input().value).toBe('')
    expect(status()).toHaveTextContent('')
  })

  it('keeps counter, table and exercise after visiting home and about', async () => {
    const user = setup()
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: '5' }))
    await user.type(input(), '35{Enter}')
    const exercise = screen.getByTestId('exercise').textContent
    await user.type(input(), '1')

    // Device/browser Back (history is shared across tests in jsdom, so simulate popstate)
    const goHome = () =>
      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
      })
    goHome()
    await user.click(screen.getByRole('button', { name: he.aboutButton }))
    goHome()
    await openPractice(user)

    expect(count()).toBe('1')
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('exercise').textContent).toBe(exercise)
    expect(input().value).toBe('')
    expect(status()).toHaveTextContent('')
  })

  it('a fresh load (remount) starts from zero and nothing is stored', async () => {
    const local = vi.spyOn(Storage.prototype, 'setItem')
    const user = setup()
    await openPractice(user)
    await user.type(input(), `${ANSWER}{Enter}`)
    await user.click(screen.getByRole('button', { name: he.skip }))
    expect(count()).toBe('1')
    expect(local).not.toHaveBeenCalled()

    // Simulate a reload
    document.body.innerHTML = ''
    const user2 = setup()
    await openPractice(user2)
    expect(count()).toBe('0')
  })

  it('skip shows a new exercise without counting; summary lists unsolved exercises without answers', async () => {
    const user = setup()
    await openPractice(user)
    await user.type(input(), '12')
    await user.click(screen.getByRole('button', { name: he.skip }))
    expect(input().value).toBe('')
    expect(input()).toHaveFocus()
    expect(count()).toBe('0')
    await user.click(screen.getByRole('button', { name: he.skip })) // same 7 × 7 again: listed once
    await user.click(screen.getByRole('button', { name: '3' })) // table 3 -> 7 × 3
    await user.click(screen.getByRole('button', { name: he.skip }))

    await user.click(screen.getByRole('button', { name: he.finish }))
    const dialog = screen.getByRole('dialog', { name: he.summaryTitle })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText(he.summaryListTitle, { selector: 'h3' })).toBeInTheDocument()
    expect(within(dialog).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['7 × 7', '7 × 3'])
    expect(dialog).not.toHaveTextContent('49')
    expect(within(dialog).getByRole('button', { name: he.solveSkipped })).toHaveFocus()
    expect(within(dialog).getByRole('button', { name: he.done })).toBeInTheDocument()
    expect(count()).toBe('0')
  })

  it('"I want to solve" brings the skipped exercises back one by one, in skip order', async () => {
    const user = setup()
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: he.skip })) // 7 × 7
    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: he.skip })) // 7 × 3
    await user.click(screen.getByRole('button', { name: '5' })) // current: 7 × 5

    await user.click(screen.getByRole('button', { name: he.finish }))
    await user.click(screen.getByRole('button', { name: he.solveSkipped }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('exercise')).toHaveTextContent('7 × 7 = ?')
    expect(input()).toHaveFocus()

    await user.type(input(), '49{Enter}')
    expect(screen.getByTestId('exercise')).toHaveTextContent('7 × 3 = ?')
    await user.type(input(), '21{Enter}')
    // Review pass done: back to random exercises from the selected table (5)
    expect(screen.getByTestId('exercise')).toHaveTextContent('7 × 5 = ?')
    expect(count()).toBe('2')

    await user.click(screen.getByRole('button', { name: he.finish }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent(he.summaryEmpty)
    expect(within(dialog).queryByRole('button', { name: he.solveSkipped })).not.toBeInTheDocument()
  })

  it('"Done" returns home and starts a fresh practice session', async () => {
    const user = setup()
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: '4' }))
    await user.type(input(), '28{Enter}')
    await user.click(screen.getByRole('button', { name: he.skip }))
    await user.click(screen.getByRole('button', { name: he.finish }))
    await user.click(screen.getByRole('button', { name: he.done }))

    expect(await screen.findByRole('button', { name: he.practiceButton })).toBeInTheDocument()
    await openPractice(user)
    expect(count()).toBe('0')
    expect(screen.getByRole('button', { name: he.tableAll })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: he.finish }))
    expect(screen.getByRole('dialog')).toHaveTextContent(he.summaryEmpty)
  })

  it('summary with nothing skipped shows the encouraging message and only "Done"; Escape closes and focus is trapped', async () => {
    const user = setup()
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: he.finish }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent(he.summaryEmpty)
    expect(within(dialog).getAllByRole('button')).toHaveLength(1)
    const done = within(dialog).getByRole('button', { name: he.done })
    expect(done).toHaveFocus()
    await user.tab()
    expect(done).toHaveFocus()
    await user.tab({ shift: true })
    expect(done).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: he.finish })).toHaveFocus()
  })

  it('leaving with the summary open closes it and keeps the skipped list', async () => {
    const user = setup()
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: he.skip }))
    await user.click(screen.getByRole('button', { name: he.finish }))
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await openPractice(user)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: he.finish }))
    expect(within(screen.getByRole('dialog')).getAllByRole('listitem')).toHaveLength(1)
  })
})
