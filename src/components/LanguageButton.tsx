import { otherLanguage } from '../i18n/language'
import { useLanguage } from '../i18n/LanguageContext'
import { useStrings } from '../i18n/strings'
import { GlobeIcon } from './icons'

// A single button that shows the other language's name and switches to it.
export function LanguageButton() {
  const t = useStrings()
  const { language, toggleLanguage } = useLanguage()
  return (
    <button type="button" className="lang-button" lang={otherLanguage(language)} onClick={toggleLanguage}>
      {/* Globe sits at the outer edge of the top bar, as in the wireframes */}
      <span>{t.languageButton}</span>
      <GlobeIcon />
    </button>
  )
}
