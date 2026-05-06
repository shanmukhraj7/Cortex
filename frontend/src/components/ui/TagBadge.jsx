// Deterministic tag category from string hash
function getTagVariant(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  const idx = Math.abs(hash) % 3
  return ['teal', 'violet', 'default'][idx]
}

const variantClasses = {
  teal:    'tag-teal',
  violet:  'tag-violet',
  default: 'tag-default',
  primary: 'tag-primary',
}

const sizes = {
  sm: 'px-xs py-[3px] text-[10px]',
  md: 'px-sm py-xs text-[11px]',
}

export default function TagBadge({ tag, variant, size = 'md', onClick, onRemove }) {
  const cls = variantClasses[variant ?? getTagVariant(tag)] ?? 'tag-default'

  return (
    <span
      onClick={onClick}
      className={[
        'inline-flex items-center gap-xs rounded-full font-label-caps uppercase tracking-widest transition-all',
        sizes[size],
        cls,
        onClick ? 'cursor-pointer hover:brightness-110' : '',
      ].join(' ')}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(tag) }}
          className="hover:text-error transition-colors ml-[2px]"
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