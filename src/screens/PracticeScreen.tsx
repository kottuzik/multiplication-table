import { TopBar } from '../components/TopBar'
import { useStrings } from '../i18n/strings'

type Props = {
  onBack: () => void
}

// Basic placeholder; the practice content is built in Milestone 2.
export function PracticeScreen({ onBack }: Props) {
  const t = useStrings()
  return (
    <main className="screen" data-screen="practice">
      <TopBar onBack={onBack} />
      <h1 className="screen-title">{t.appName}</h1>
    </main>
  )
}
