import { useStrings } from '../i18n/strings'
import { useInstallPrompt } from '../pwa/installPrompt'
import { DownloadIcon } from './icons'

// Shown only when the browser allows a one-tap install (not on iPhone, not once installed).
export function InstallButton() {
  const t = useStrings()
  const { canInstall, install } = useInstallPrompt()
  if (!canInstall) return null
  return (
    <button type="button" className="install-button" onClick={install}>
      <DownloadIcon />
      {/* The text is visually hidden on very narrow screens but stays the button's accessible name */}
      <span className="install-button__text">{t.installButton}</span>
    </button>
  )
}
