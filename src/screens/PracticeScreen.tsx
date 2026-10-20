import { useEffect, useRef } from 'react'
import type { Dispatch, FormEvent } from 'react'
import { CheckIcon, CrossIcon } from '../components/icons'
import { SummaryDialog } from '../components/SummaryDialog'
import { TableSelector } from '../components/TableSelector'
import { TopBar } from '../components/TopBar'
import { useStrings } from '../i18n/strings'
import type { PracticeAction, PracticeState } from '../practice/practiceState'

type Props = {
  state: PracticeState
  dispatch: Dispatch<PracticeAction>
  onBack: () => void
  onDone: () => void
}

export function PracticeScreen({ state, dispatch, onBack, onDone }: Props) {
  const t = useStrings()
  const inputRef = useRef<HTMLInputElement>(null)
  const finishRef = useRef<HTMLButtonElement>(null)
  const wasSummaryOpen = useRef(state.isSummaryOpen)
  // Where focus goes once the summary has closed (the page is inert while it is open).
  const focusAfterClose = useRef<'finish' | 'input'>('finish')
  const { exercise, feedback } = state

  useEffect(() => {
    if (wasSummaryOpen.current && !state.isSummaryOpen) {
      if (focusAfterClose.current === 'input') inputRef.current?.focus()
      else finishRef.current?.focus()
      focusAfterClose.current = 'finish'
    }
    wasSummaryOpen.current = state.isSummaryOpen
  }, [state.isSummaryOpen])

  const onSolve = () => {
    focusAfterClose.current = 'input'
    dispatch({ type: 'startReview' })
  }

  // Keep the mobile keyboard open after every check / skip.
  const focusInput = () => inputRef.current?.focus()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    dispatch({ type: 'check' })
    focusInput()
  }

  const onSkip = () => {
    dispatch({ type: 'skip' })
    focusInput()
  }

  const feedbackText =
    feedback === 'correct'
      ? t.feedbackCorrect
      : feedback === 'wrong'
        ? t.feedbackWrong
        : feedback === 'empty'
          ? t.feedbackEmpty
          : ''

  return (
    <main className="screen practice" data-screen="practice">
      <div className="practice__content" inert={state.isSummaryOpen}>
        <TopBar onBack={onBack} />
        <h1 className="visually-hidden">{t.appName}</h1>

        <TableSelector selected={state.selectedTable} onSelect={(table) => dispatch({ type: 'selectTable', table })} />

        <section className="card practice-card">
          {/* The math sequence always reads left to right, also in RTL */}
          <p className="exercise" dir="ltr" data-testid="exercise">
            {exercise.factorA} × {exercise.factorB} = ?
          </p>

          <form className="answer-form" onSubmit={onSubmit} noValidate>
            <label htmlFor="answer" className="visually-hidden">
              {t.answerLabel}
            </label>
            <input
              ref={inputRef}
              id="answer"
              className="answer-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder={t.answerPlaceholder}
              value={state.answerInput}
              onChange={(event) => dispatch({ type: 'input', value: event.target.value })}
            />
            <div className="answer-actions">
              <button type="submit" className="check-button">
                {t.check}
              </button>
              <button type="button" className="skip-button" onClick={onSkip}>
                {t.skip}
              </button>
            </div>
          </form>

          <div className={`feedback${feedback ? ` feedback--${feedback}` : ''}`} role="status">
            {feedback === 'correct' && <CheckIcon />}
            {feedback === 'wrong' && <CrossIcon />}
            {feedbackText && <span>{feedbackText}</span>}
          </div>
        </section>

        <section className="card counter-card" aria-label={`${t.correctCountLabel} ${state.correctCount}`}>
          <p className="counter-card__label" aria-hidden="true">
            {t.correctCountLabel}
          </p>
          <p className="counter-card__value" aria-hidden="true" data-testid="correct-count">
            {state.correctCount}
          </p>
        </section>

        <button ref={finishRef} type="button" className="finish-button" onClick={() => dispatch({ type: 'openSummary' })}>
          {t.finish}
        </button>
      </div>

      {state.isSummaryOpen && (
        <SummaryDialog
          skipped={state.skipped}
          onSolve={onSolve}
          onDone={onDone}
          onClose={() => dispatch({ type: 'closeSummary' })}
        />
      )}
    </main>
  )
}
