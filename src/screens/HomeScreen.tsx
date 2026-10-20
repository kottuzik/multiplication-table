import illustration from '../assets/home-illustration.svg'
import { NavButton } from '../components/NavButton'
import { TopBar } from '../components/TopBar'
import { useStrings } from '../i18n/strings'

type Props = {
  onPractice: () => void
  onAbout: () => void
}

export function HomeScreen({ onPractice, onAbout }: Props) {
  const t = useStrings()
  return (
    <main className="screen home">
      <TopBar />
      <div className="home__title-wrap">
        <h1 className="home__title">{t.appName}</h1>
        <p className="home__subtitle">{t.homeSubtitle}</p>
      </div>
      {/* Decorative: the meaning is already conveyed by the title and subtitle */}
      <img className="home__illustration" src={illustration} alt="" width={300} height={220} />
      <nav className="nav-buttons">
        <NavButton label={t.practiceButton} variant="primary" onClick={onPractice} />
        <NavButton label={t.aboutButton} variant="secondary" onClick={onAbout} />
      </nav>
    </main>
  )
}
