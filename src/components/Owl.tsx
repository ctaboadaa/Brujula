interface OwlProps {
  className?: string
}

export default function Owl({ className }: OwlProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* cuerpo */}
      <path
        d="M24 6c-8 0-13 6.5-13 15 0 8.5 5 15 13 15s13-6.5 13-15c0-8.5-5-15-13-15Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* orejas */}
      <path d="M13 13 10 6l6 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M35 13 38 6l-6 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      {/* ojos */}
      <circle cx="18" cy="21" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="30" cy="21" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="18" cy="21" r="1.4" fill="currentColor" />
      <circle cx="30" cy="21" r="1.4" fill="currentColor" />
      {/* pico */}
      <path d="M24 25.5 21.5 30h5L24 25.5Z" fill="currentColor" />
      {/* alas */}
      <path d="M13 26c-1.5 4-1.5 9 1 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M35 26c1.5 4 1.5 9-1 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
