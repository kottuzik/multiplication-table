import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { useStrings } from '../i18n/strings'
import type { Exercise } from '../practice/exercise'
import { StarIcon } from './icons'

type Props = {
  skipped: Exercise[]
  onSolve: () => void
  onDone: () => void
  onClose: () => void
}

const FOCUSABLE = 'button, [href], input, [tabindex]:not([tabindex="-1"])'

// Custom modal instead of native <dialog>: on Android the device Back button would
// only close a native dialog, while the PRD requires it to return home (ADR-4).
export function SummaryDialog({ skipped, onSolve, onDone, onClose }: Props) {
  const t = useStrings()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const hasSkipped = skipped.length > 0

  useEffect(() => {
    firstButtonRef.current?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !dialogRef.current) return
    // Keep keyboard focus inside the dialog.
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="summary-overlay">
      <div
        ref={dialogRef}
        className="summary-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <h2 id={titleId} className="summary-dialog__title">
          {t.summaryTitle}
        </h2>
        {hasSkipped ? (
          <>
            <h3 className="summary-dialog__subtitle">{t.summaryListTitle}</h3>
            {/* Exercises only, without answers: the child can choose to solve them */}
            <ul className="summary-dialog__list" tabIndex={0} aria-label={t.summaryListTitle}>
              {skipped.map((e) => (
                <li key={`${e.factorA}x${e.factorB}`} className="summary-dialog__item" dir="ltr">
                  {e.factorA} × {e.factorB}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="summary-dialog__empty">
            <StarIcon />
            <span>{t.summaryEmpty}</span>
          </p>
        )}
        <div className="summary-dialog__actions">
          {hasSkipped && (
            <button ref={firstButtonRef} type="button" className="summary-dialog__solve" onClick={onSolve}>
              {t.solveSkipped}
            </button>
          )}
          <button
            ref={hasSkipped ? undefined : firstButtonRef}
            type="button"
            className="summary-dialog__done"
            onClick={onDone}
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  )
}
