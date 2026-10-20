import { useId } from 'react'
import { MultiplicationTable } from '../components/MultiplicationTable'
import { TopBar } from '../components/TopBar'
import { useStrings } from '../i18n/strings'

type Props = {
  onBack: () => void
}

export function AboutScreen({ onBack }: Props) {
  const t = useStrings()
  const tableTitleId = useId()
  return (
    <main className="screen about" data-screen="about">
      <TopBar onBack={onBack} />
      <h1 className="screen-title">{t.aboutTitle}</h1>
      <p className="about__text">{t.aboutText}</p>
      <hr className="about__divider" />
      <section className="about__table-section">
        <h2 id={tableTitleId} className="about__table-title">
          {t.aboutTableTitle}
        </h2>
        <MultiplicationTable labelledBy={tableTitleId} />
      </section>
    </main>
  )
}
