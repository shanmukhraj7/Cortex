export default function TagBadge({ tag, icon, onClick, onRemove, size = 'md' }) {
  const sizes = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  }

  // A random but consistent icon if none is provided
  const defaultIcon = (
    <svg className="w-3 h-3 text-coral-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L22 20H2L12 2Z" />
    </svg>
  )

  return (
    <span
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors border',
        sizes[size],
        onClick ? 'cursor-pointer hover:bg-carbon-700 hover:border-carbon-400' : '',
        'bg-carbon-800/80 text-carbon-200 border-carbon-500'
      ].join(' ')}
    >
      {icon || defaultIcon}
      <span className="translate-y-[0.5px]">{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(tag) }}
          className="hover:text-red-500 transition-colors ml-0.5 text-carbon-400"
          aria-label={`Remove ${tag}`}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  )
}