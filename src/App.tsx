import { useCallback, useEffect, useState } from 'react'
import { Decorations } from './components/Decorations'
import { AboutScreen } from './screens/AboutScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PracticeScreen } from './screens/PracticeScreen'

export type Screen = 'home' | 'practice' | 'about'

function isScreen(value: unknown): value is Screen {
  return value === 'home' || value === 'practice' || value === 'about'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  // ADR-1: keep the device/browser Back button in sync with in-app navigation
  // without changing the URL and without a router.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const target = (event.state as { screen?: unknown } | null)?.screen
      setScreen(isScreen(target) ? target : 'home')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const openScreen = useCallback((target: Exclude<Screen, 'home'>) => {
    window.history.pushState({ screen: target }, '')
    setScreen(target)
  }, [])

  // The in-app Back button behaves exactly like the browser Back button.
  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  return (
    <div className="app">
      <Decorations />
      {screen === 'home' && (
        <HomeScreen onPractice={() => openScreen('practice')} onAbout={() => openScreen('about')} />
      )}
      {screen === 'practice' && <PracticeScreen onBack={goBack} />}
      {screen === 'about' && <AboutScreen onBack={goBack} />}
    </div>
  )
}
