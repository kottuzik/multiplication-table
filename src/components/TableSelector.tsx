import { useId } from 'react'
import { useStrings } from '../i18n/strings'
import { TABLE_NUMBERS } from '../practice/exercise'
import type { Table } from '../practice/exercise'

type Props = {
  selected: Table
  onSelect: (table: Table) => void
}

const OPTIONS: Table[] = ['all', ...TABLE_NUMBERS]

// Two rows (6 + 5) laid out by CSS grid; order follows the text direction.
export function TableSelector({ selected, onSelect }: Props) {
  const t = useStrings()
  const titleId = useId()
  return (
    <section className="table-selector">
      <h2 id={titleId} className="table-selector__title">
        {t.chooseTable}
      </h2>
      <div className="table-selector__options" role="group" aria-labelledby={titleId}>
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className="table-chip"
            aria-pressed={option === selected}
            onClick={() => onSelect(option)}
          >
            {option === 'all' ? t.tableAll : option}
          </button>
        ))}
      </div>
    </section>
  )
}
