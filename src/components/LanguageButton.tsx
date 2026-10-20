import { useStrings } from '../i18n/strings'
import { GlobeIcon } from './icons'

// Shows the other language's name. Switching is implemented in Milestone 3.
export function LanguageButton() {
  const t = useStrings()
  return (
    <button type="button" className="lang-button" lang="en">
      {/* Globe sits at the outer edge of the top bar, as in the wireframes */}
      <span>{t.languageButton}</span>
      <GlobeIcon />
    </button>
  )
}
