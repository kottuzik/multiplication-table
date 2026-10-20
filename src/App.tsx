import { useCallback, useEffect, useReducer, useState } from 'react'
import { Decorations } from './components/Decorations'
import { initialPracticeState, practiceReducer } from './practice/practiceState'
import { AboutScreen } from './screens/AboutScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PracticeScreen } from './screens/PracticeScreen'

export type Screen = 'home' | 'practice' | 'about'

function isScreen(value: unknown): value is Screen {
  return value === 'home' || value === 'practice' || value === 'about'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  // Practice state lives here (not in the practice screen) so it survives navigation.
  // Memory only: a reload starts a new session.
  const [practice, dispatch] = useReducer(practiceReducer, undefined, () => initialPracticeState())

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
    // Leaving practice (in-app Back, device Back) clears input, feedback and the summary dialog.
    if (screen !== 'practice') dispatch({ type: 'leaveScreen' })
  }, [screen])

  const openScreen = useCallback((target: Exclude<Screen, 'home'>) => {
    window.history.pushState({ screen: target }, '')
    setScreen(target)
  }, [])

  // The in-app Back button behaves exactly like the browser Back button.
  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  // "Done" in the summary: start a fresh session and go back home (same path as Back).
  const finishPractice = useCallback(() => {
    dispatch({ type: 'reset' })
    window.history.back()
  }, [])

  return (
    <div className="app">
      <Decorations />
      {screen === 'home' && (
        <HomeScreen onPractice={() => openScreen('practice')} onAbout={() => openScreen('about')} />
      )}
      {screen === 'practice' && <PracticeScreen state={practice} dispatch={dispatch} onBack={goBack} onDone={finishPractice} />}
      {screen === 'about' && <AboutScreen onBack={goBack} />}
    </div>
  )
}
