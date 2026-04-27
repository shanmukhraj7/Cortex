export default function CortexLogo({ size = 28, className = '' }) {
    return (
        <svg
            width={size} height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer ring */}
            <circle cx="16" cy="16" r="14" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.4"/>
            {/* Inner geometric */}
            <path
                d="M16 4 L28 22 L4 22 Z"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeOpacity="0.7"
            />
            {/* Center dot */}
            <circle cx="16" cy="16" r="2.5" fill="#fbbf24"/>
            {/* Cross hair lines */}
            <line x1="16" y1="10" x2="16" y2="8"  stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5"/>
            <line x1="16" y1="22" x2="16" y2="24" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5"/>
            <line x1="22" y1="16" x2="24" y2="16" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5"/>
            <line x1="10" y1="16" x2="8"  y2="16" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5"/>
        </svg>
    )
}