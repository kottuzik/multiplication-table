import { useStrings } from '../i18n/strings'
import { ChevronIcon } from './icons'
import { LanguageButton } from './LanguageButton'

type Props = {
  onBack?: () => void
}

export function TopBar({ onBack }: Props) {
  const t = useStrings()
  return (
    <header className="top-bar">
      {onBack && (
        <button type="button" className="back-button" onClick={onBack}>
          <ChevronIcon direction="back" />
          <span>{t.back}</span>
        </button>
      )}
      <div className="top-bar__end">
        <LanguageButton />
      </div>
    </header>
  )
}
