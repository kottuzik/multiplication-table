import { ChevronIcon } from './icons'

type Props = {
  label: string
  variant: 'primary' | 'secondary'
  onClick: () => void
}

export function NavButton({ label, variant, onClick }: Props) {
  return (
    <button type="button" className={`nav-button nav-button--${variant}`} onClick={onClick}>
      <span>{label}</span>
      <ChevronIcon direction="forward" />
    </button>
  )
}
