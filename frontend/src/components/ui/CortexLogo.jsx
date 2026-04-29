export default function CortexLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left hemisphere */}
      <path
        d="M24 8
           C20 8, 14 10, 11 15
           C8 20, 8 26, 10 31
           C12 36, 17 40, 22 40
           L24 40 L24 8Z"
        stroke="#ff5722"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right hemisphere */}
      <path
        d="M24 8
           C28 8, 34 10, 37 15
           C40 20, 40 26, 38 31
           C36 36, 31 40, 26 40
           L24 40 L24 8Z"
        stroke="#ff5722"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Center divide */}
      <line x1="24" y1="12" x2="24" y2="36" stroke="#ff5722" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 4" />

      {/* Internal Folds */}
      <path d="M12 24 C14 22, 17 23, 19 21" stroke="#ff5722" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M36 24 C34 22, 31 23, 29 21" stroke="#ff5722" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  )
}