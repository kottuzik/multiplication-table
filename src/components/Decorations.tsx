// Purely decorative background shapes; hidden from assistive tech and not clickable.

function Star({ className }: { className: string }) {
  return (
    <svg className={`deco-star ${className}`} viewBox="0 0 24 24" fill="none" stroke="#4A5B8F" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
    </svg>
  )
}

export function Decorations() {
  return (
    <div className="decorations" aria-hidden="true">
      <div className="blob blob--yellow-top" />
      <div className="blob blob--blue-top" />
      <div className="blob blob--yellow-bottom" />
      <div className="blob blob--blue-bottom" />
      <Star className="deco-star--1" />
      <Star className="deco-star--2" />
    </div>
  )
}
