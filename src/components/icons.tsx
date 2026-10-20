// Simple outline icons in the Style Guide manner (dark blue stroke).

export function GlobeIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8" />
    </svg>
  )
}

// Chevron drawn pointing right; CSS flips it by direction (see .arrow--forward / .arrow--back).
export function ChevronIcon({ direction }: { direction: 'forward' | 'back' }) {
  return (
    <svg
      className={`icon arrow--${direction}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}
