import { describe, expect, it } from 'vitest'
import type { Exercise } from './exercise'
import { createPracticeReducer, initialPracticeState } from './practiceState'
import type { PracticeAction, PracticeState } from './practiceState'

// Deterministic sequence of "random" values; each value v maps to factor 1 + floor(v * 10).
const sequence = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]
}

const ex = (factorA: number, factorB: number): Exercise => ({ factorA, factorB })

function stateWith(partial: Partial<PracticeState>): PracticeState {
  return { ...initialPracticeState(() => 0), exercise: ex(7, 8), ...partial }
}

const reducer = createPracticeReducer(sequence(0.25, 0.45)) // -> 3 × 5 in "all"

function run(state: PracticeState, ...actions: PracticeAction[]) {
  return actions.reduce(reducer, state)
}

describe('initial state', () => {
  it('starts on "all" with zero count and no feedback', () => {
    const s = initialPracticeState()
    expect(s.selectedTable).toBe('all')
    expect(s.correctCount).toBe(0)
    expect(s.feedback).toBeNull()
    expect(s.skipped).toEqual([])
    expect(s.isSummaryOpen).toBe(false)
  })
})

describe('check', () => {
  it('correct answer: +1 exactly, new exercise, cleared input, success feedback', () => {
    const s = run(stateWith({}), { type: 'input', value: '56' }, { type: 'check' })
    expect(s.correctCount).toBe(1)
    expect(s.exercise).toEqual(ex(3, 5))
    expect(s.answerInput).toBe('')
    expect(s.feedback).toBe('correct')
  })

  it('wrong answer: same exercise and count, input cleared, retries unlimited', () => {
    let s = stateWith({})
    for (let i = 0; i < 5; i++) {
      s = run(s, { type: 'input', value: '55' }, { type: 'check' })
      expect(s.correctCount).toBe(0)
      expect(s.exercise).toEqual(ex(7, 8))
      expect(s.answerInput).toBe('')
      expect(s.feedback).toBe('wrong')
    }
    s = run(s, { type: 'input', value: '56' }, { type: 'check' })
    expect(s.correctCount).toBe(1)
  })

  it('empty input: shows the empty prompt and changes nothing else', () => {
    const before = stateWith({ correctCount: 2 })
    const s = run(before, { type: 'check' })
    expect(s.feedback).toBe('empty')
    expect(s.correctCount).toBe(2)
    expect(s.exercise).toEqual(before.exercise)
  })

  it('a repeated check right after a correct answer does not count twice or hide the success message', () => {
    const s = run(stateWith({}), { type: 'input', value: '56' }, { type: 'check' }, { type: 'check' }, { type: 'check' })
    expect(s.correctCount).toBe(1)
    expect(s.feedback).toBe('correct')
  })

  it('typing clears feedback and sanitizes the input', () => {
    const s = run(stateWith({ feedback: 'wrong' }), { type: 'input', value: 'x5a67' })
    expect(s.feedback).toBeNull()
    expect(s.answerInput).toBe('567')
  })
})

describe('selectTable', () => {
  it('switches to a new exercise of the chosen table and keeps count and skipped list', () => {
    const before = stateWith({ correctCount: 4, skipped: [ex(2, 2)], answerInput: '12', feedback: 'wrong' })
    const s = createPracticeReducer(sequence(0.25, 0.1))(before, { type: 'selectTable', table: 9 })
    expect(s.selectedTable).toBe(9)
    expect(s.exercise).toEqual(ex(9, 3))
    expect(s.correctCount).toBe(4)
    expect(s.skipped).toEqual([ex(2, 2)])
    expect(s.answerInput).toBe('')
    expect(s.feedback).toBeNull()
  })

  it('selecting the current table changes nothing', () => {
    const before = stateWith({ selectedTable: 'all', answerInput: '12', feedback: 'wrong' })
    expect(reducer(before, { type: 'selectTable', table: 'all' })).toBe(before)
  })

  it('new exercises after a correct answer come from the selected table', () => {
    let s = createPracticeReducer()(stateWith({}), { type: 'selectTable', table: 4 })
    const r = createPracticeReducer()
    for (let i = 0; i < 50; i++) {
      const { factorA, factorB } = s.exercise
      expect(factorA === 4 || factorB === 4).toBe(true)
      s = r(r(s, { type: 'input', value: String(factorA * factorB) }), { type: 'check' })
    }
    expect(s.correctCount).toBe(50)
  })
})

describe('skip', () => {
  it('shows a new exercise, keeps the count and clears input and feedback', () => {
    const s = run(stateWith({ correctCount: 3, answerInput: '9', feedback: 'wrong' }), { type: 'skip' })
    expect(s.correctCount).toBe(3)
    expect(s.exercise).toEqual(ex(3, 5))
    expect(s.answerInput).toBe('')
    expect(s.feedback).toBeNull()
    expect(s.skipped).toEqual([ex(7, 8)])
  })

  it('adds an exercise once even if skipped several times, keeping skip order', () => {
    const r = createPracticeReducer(sequence(0.6, 0.7)) // next exercise 7 × 8 again in "all"
    let s = stateWith({ skipped: [ex(2, 3)] })
    s = r(s, { type: 'skip' })
    s = r(s, { type: 'skip' })
    expect(s.skipped).toEqual([ex(2, 3), ex(7, 8)])
  })

  it('a later correct answer removes the exercise from the list (same order only)', () => {
    const s1 = run(stateWith({ skipped: [ex(8, 7), ex(7, 8)] }), { type: 'input', value: '56' }, { type: 'check' })
    expect(s1.skipped).toEqual([ex(8, 7)])
  })
})

describe('review pass ("I want to solve") and reset ("Done")', () => {
  it('shows skipped exercises in skip order, then resumes random ones', () => {
    const r = createPracticeReducer(sequence(0.25, 0.45)) // random -> 3 × 5
    let s = r(stateWith({ skipped: [ex(2, 3), ex(6, 4)], isSummaryOpen: true, feedback: 'wrong' }), { type: 'startReview' })
    expect(s.isSummaryOpen).toBe(false)
    expect(s.feedback).toBeNull()
    expect(s.exercise).toEqual(ex(2, 3))
    s = r(r(s, { type: 'input', value: '6' }), { type: 'check' })
    expect(s.exercise).toEqual(ex(6, 4))
    expect(s.skipped).toEqual([ex(6, 4)])
    s = r(r(s, { type: 'input', value: '24' }), { type: 'check' })
    expect(s.exercise).toEqual(ex(3, 5))
    expect(s.skipped).toEqual([])
    expect(s.correctCount).toBe(2)
  })

  it('wrong answers during review keep the same exercise', () => {
    let s = reducer(stateWith({ skipped: [ex(2, 3), ex(6, 4)] }), { type: 'startReview' })
    s = run(s, { type: 'input', value: '7' }, { type: 'check' })
    expect(s.exercise).toEqual(ex(2, 3))
    expect(s.reviewQueue).toEqual([ex(6, 4)])
  })

  it('skipping during review moves to the next skipped exercise and keeps it listed once', () => {
    const r = createPracticeReducer(sequence(0.25, 0.45))
    let s = r(stateWith({ skipped: [ex(2, 3), ex(6, 4)] }), { type: 'startReview' })
    s = r(s, { type: 'skip' })
    expect(s.exercise).toEqual(ex(6, 4))
    expect(s.skipped).toEqual([ex(2, 3), ex(6, 4)])
    s = r(s, { type: 'skip' })
    expect(s.exercise).toEqual(ex(3, 5)) // pass ended
  })

  it('switching table ends the review pass', () => {
    let s = reducer(stateWith({ skipped: [ex(2, 3), ex(6, 4)] }), { type: 'startReview' })
    s = createPracticeReducer(sequence(0.25, 0.1))(s, { type: 'selectTable', table: 9 })
    expect(s.exercise).toEqual(ex(9, 3))
    expect(s.reviewQueue).toEqual([])
  })

  it('startReview with nothing skipped only closes the dialog', () => {
    const before = stateWith({ isSummaryOpen: true })
    expect(reducer(before, { type: 'startReview' })).toEqual({ ...before, isSummaryOpen: false })
  })

  it('reset starts a fresh session', () => {
    const s = createPracticeReducer(() => 0)(
      stateWith({ selectedTable: 6, correctCount: 5, skipped: [ex(6, 2)], reviewQueue: [ex(6, 3)], isSummaryOpen: true }),
      { type: 'reset' },
    )
    expect(s).toEqual(initialPracticeState(() => 0))
  })
})

describe('summary and leaving the screen', () => {
  it('open/close only toggle the dialog', () => {
    const before = stateWith({ correctCount: 2, skipped: [ex(3, 3)] })
    const opened = reducer(before, { type: 'openSummary' })
    expect(opened.isSummaryOpen).toBe(true)
    const closed = reducer(opened, { type: 'closeSummary' })
    expect(closed).toEqual(before)
  })

  it('leaveScreen clears input, feedback and dialog, and keeps the rest', () => {
    const before = stateWith({ selectedTable: 6, correctCount: 5, skipped: [ex(6, 2)], answerInput: '4', feedback: 'wrong', isSummaryOpen: true })
    const s = reducer(before, { type: 'leaveScreen' })
    expect(s).toEqual({ ...before, answerInput: '', feedback: null, isSummaryOpen: false })
  })
})
