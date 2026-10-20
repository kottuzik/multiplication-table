import { TopBar } from '../components/TopBar'
import { useStrings } from '../i18n/strings'

type Props = {
  onBack: () => void
}

// Basic placeholder; the explanation and 10×10 table are built in Milestone 3.
export function AboutScreen({ onBack }: Props) {
  const t = useStrings()
  return (
    <main className="screen" data-screen="about">
      <TopBar onBack={onBack} />
      <h1 className="screen-title">{t.aboutTitle}</h1>
    </main>
  )
}
