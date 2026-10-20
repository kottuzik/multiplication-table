import { createExercise, isCorrect, sameExercise, sanitizeAnswer } from './exercise'
import type { Exercise, RandomFn, Table } from './exercise'

export type Feedback = 'correct' | 'wrong' | 'empty' | null

// Session-only practice state. Never persisted to any storage.
export type PracticeState = {
  selectedTable: Table
  exercise: Exercise
  answerInput: string
  correctCount: number
  feedback: Feedback
  skipped: Exercise[]
  // Skipped exercises still to be shown in the current "I want to solve" pass, in skip order.
  reviewQueue: Exercise[]
  isSummaryOpen: boolean
}

export type PracticeAction =
  | { type: 'input'; value: string }
  | { type: 'check' }
  | { type: 'skip' }
  | { type: 'selectTable'; table: Table }
  | { type: 'openSummary' }
  | { type: 'closeSummary' }
  | { type: 'startReview' }
  | { type: 'reset' }
  | { type: 'leaveScreen' }

export function initialPracticeState(random: RandomFn = Math.random): PracticeState {
  return {
    selectedTable: 'all',
    exercise: createExercise('all', random),
    answerInput: '',
    correctCount: 0,
    feedback: null,
    skipped: [],
    reviewQueue: [],
    isSummaryOpen: false,
  }
}

export function createPracticeReducer(random: RandomFn = () => Math.random()) {
  // During a review pass the next exercise comes from the queue; afterwards, random ones resume.
  function next(state: PracticeState): Pick<PracticeState, 'exercise' | 'reviewQueue'> {
    if (state.reviewQueue.length > 0) {
      return { exercise: state.reviewQueue[0], reviewQueue: state.reviewQueue.slice(1) }
    }
    return { exercise: createExercise(state.selectedTable, random), reviewQueue: [] }
  }

  return function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
    switch (action.type) {
      case 'input':
        // Any typing clears the feedback message.
        return { ...state, answerInput: sanitizeAnswer(action.value), feedback: null }

      case 'check': {
        if (state.answerInput === '') {
          // Right after a correct answer the field is already empty: a fast repeated
          // click must not replace the success message (and is never counted).
          if (state.feedback === 'correct') return state
          return { ...state, feedback: 'empty' }
        }
        if (isCorrect(state.exercise, state.answerInput)) {
          return {
            ...state,
            ...next(state),
            correctCount: state.correctCount + 1,
            skipped: state.skipped.filter((e) => !sameExercise(e, state.exercise)),
            answerInput: '',
            feedback: 'correct',
          }
        }
        return { ...state, answerInput: '', feedback: 'wrong' }
      }

      case 'skip': {
        const alreadySkipped = state.skipped.some((e) => sameExercise(e, state.exercise))
        return {
          ...state,
          ...next(state),
          skipped: alreadySkipped ? state.skipped : [...state.skipped, state.exercise],
          answerInput: '',
          feedback: null,
        }
      }

      case 'selectTable':
        if (action.table === state.selectedTable) return state
        // Switching table ends a review pass.
        return {
          ...state,
          selectedTable: action.table,
          exercise: createExercise(action.table, random),
          reviewQueue: [],
          answerInput: '',
          feedback: null,
        }

      case 'openSummary':
        return { ...state, isSummaryOpen: true }

      case 'closeSummary':
        return { ...state, isSummaryOpen: false }

      case 'startReview':
        // "I want to solve": show the skipped exercises one by one, in skip order.
        if (state.skipped.length === 0) return { ...state, isSummaryOpen: false }
        return {
          ...state,
          exercise: state.skipped[0],
          reviewQueue: state.skipped.slice(1),
          answerInput: '',
          feedback: null,
          isSummaryOpen: false,
        }

      case 'reset':
        // "Done": start a fresh practice session.
        return initialPracticeState(random)

      case 'leaveScreen':
        if (state.answerInput === '' && state.feedback === null && !state.isSummaryOpen) return state
        return { ...state, answerInput: '', feedback: null, isSummaryOpen: false }
    }
  }
}

export const practiceReducer = createPracticeReducer()
