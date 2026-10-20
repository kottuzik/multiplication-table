// Exercise engine: pure functions, no UI or network dependencies.

export type TableNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type Table = 'all' | TableNumber

export const TABLE_NUMBERS: TableNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export type Exercise = { factorA: number; factorB: number }

export type RandomFn = () => number

export const MAX_ANSWER_LENGTH = 3

function randomFactor(random: RandomFn): number {
  return 1 + Math.floor(random() * 10)
}

// "all": two independent factors in 1..10. Table N: one factor is N, the other
// is random, and N may be first or second. Repeating the previous exercise is allowed.
export function createExercise(table: Table, random: RandomFn = Math.random): Exercise {
  if (table === 'all') {
    return { factorA: randomFactor(random), factorB: randomFactor(random) }
  }
  const other = randomFactor(random)
  return random() < 0.5 ? { factorA: table, factorB: other } : { factorA: other, factorB: table }
}

// Keep ASCII digits only, then cut to the max length (filter first, so pasted "a12b3" -> "123").
export function sanitizeAnswer(raw: string): string {
  return raw.replace(/[^0-9]/g, '').slice(0, MAX_ANSWER_LENGTH)
}

// Compared by numeric value, so "056" equals 56.
export function isCorrect(exercise: Exercise, answer: string): boolean {
  return answer !== '' && Number(answer) === exercise.factorA * exercise.factorB
}

// Same factors in the same order.
export function sameExercise(a: Exercise, b: Exercise): boolean {
  return a.factorA === b.factorA && a.factorB === b.factorB
}
