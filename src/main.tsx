import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Rubik is bundled locally (includes the Hebrew subset) so no external font requests are made
import '@fontsource/rubik/400.css'
import '@fontsource/rubik/700.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/practice.css'
import './styles/about.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
