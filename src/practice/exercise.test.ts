import { describe, expect, it } from 'vitest'
import { TABLE_NUMBERS, createExercise, isCorrect, sameExercise, sanitizeAnswer } from './exercise'

const fixed = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]
}

describe('createExercise', () => {
  it('keeps both factors in 1..10 at the random extremes', () => {
    expect(createExercise('all', fixed(0, 0))).toEqual({ factorA: 1, factorB: 1 })
    expect(createExercise('all', fixed(0.9999, 0.9999))).toEqual({ factorA: 10, factorB: 10 })
  })

  it('keeps factors in range over many random runs', () => {
    for (let i = 0; i < 2000; i++) {
      for (const table of ['all', ...TABLE_NUMBERS] as const) {
        const { factorA, factorB } = createExercise(table)
        for (const f of [factorA, factorB]) {
          expect(Number.isInteger(f)).toBe(true)
          expect(f).toBeGreaterThanOrEqual(1)
          expect(f).toBeLessThanOrEqual(10)
        }
      }
    }
  })

  it('"all" picks two independent factors', () => {
    expect(createExercise('all', fixed(0.65, 0.25))).toEqual({ factorA: 7, factorB: 3 })
  })

  it('table N always includes N, in either position', () => {
    // first random -> other factor, second -> position
    expect(createExercise(7, fixed(0.25, 0.1))).toEqual({ factorA: 7, factorB: 3 })
    expect(createExercise(7, fixed(0.25, 0.9))).toEqual({ factorA: 3, factorB: 7 })
    for (const n of TABLE_NUMBERS) {
      for (let i = 0; i < 200; i++) {
        const e = createExercise(n)
        expect(e.factorA === n || e.factorB === n).toBe(true)
      }
    }
  })
})

describe('sanitizeAnswer', () => {
  it('keeps ASCII digits only', () => {
    expect(sanitizeAnswer('a1b2')).toBe('12')
    expect(sanitizeAnswer(' 5-6. ')).toBe('56')
    expect(sanitizeAnswer('٥٦')).toBe('') // non-ASCII digits are removed
    expect(sanitizeAnswer('abc')).toBe('')
  })

  it('filters before cutting to 3 characters', () => {
    expect(sanitizeAnswer('a12b3')).toBe('123')
    expect(sanitizeAnswer('12345')).toBe('123')
  })
})

describe('isCorrect', () => {
  const ex = { factorA: 7, factorB: 8 }
  it('checks by numeric value', () => {
    expect(isCorrect(ex, '56')).toBe(true)
    expect(isCorrect(ex, '056')).toBe(true)
    expect(isCorrect(ex, '57')).toBe(false)
    expect(isCorrect(ex, '')).toBe(false)
  })
})

describe('sameExercise', () => {
  it('compares factors in order', () => {
    expect(sameExercise({ factorA: 7, factorB: 8 }, { factorA: 7, factorB: 8 })).toBe(true)
    expect(sameExercise({ factorA: 7, factorB: 8 }, { factorA: 8, factorB: 7 })).toBe(false)
  })
})
