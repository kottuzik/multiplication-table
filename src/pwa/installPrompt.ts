import { useSyncExternalStore } from 'react'

// Chrome/Edge/Android fire `beforeinstallprompt` when the app can be installed.
// Safari (iPhone) never fires it, so the install button simply never appears there.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const subscribers = new Set<() => void>()

function setPrompt(value: BeforeInstallPromptEvent | null) {
  deferredPrompt = value
  subscribers.forEach((notify) => notify())
}

// Called once at startup (before React renders), because the event can fire very early.
export function listenForInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Keep the browser's own mini-bar away; our button shows the prompt instead
    event.preventDefault()
    setPrompt(event as BeforeInstallPromptEvent)
  })
  // Installed (from our button or from the browser menu): hide the button
  window.addEventListener('appinstalled', () => setPrompt(null))
}

async function install() {
  const prompt = deferredPrompt
  if (!prompt) return
  // A prompt can be shown only once; the browser fires a new event if installing is possible again
  setPrompt(null)
  await prompt.prompt()
  await prompt.userChoice
}

function subscribe(notify: () => void) {
  subscribers.add(notify)
  return () => subscribers.delete(notify)
}

export function useInstallPrompt() {
  const canInstall = useSyncExternalStore(subscribe, () => deferredPrompt !== null)
  return { canInstall, install }
}

// Tests only: forget a captured prompt between tests
export function resetInstallPrompt() {
  setPrompt(null)
}
