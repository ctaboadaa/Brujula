interface CompassRoseProps {
  className?: string
}

export default function CompassRose({ className }: CompassRoseProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      <path d="M50 6 L56 50 L50 94 L44 50 Z" fill="currentColor" />
      <path
        d="M6 50 L50 44 L94 50 L50 56 Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <text x="50" y="18" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-mono)">N</text>
      <text x="50" y="90" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-mono)">S</text>
      <text x="12" y="53" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-mono)">O</text>
      <text x="88" y="53" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-mono)">E</text>
    </svg>
  )
}
