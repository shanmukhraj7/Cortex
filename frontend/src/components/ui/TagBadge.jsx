import { stringToColour } from '../../utils/helpers.js'

export default function TagBadge({ tag, onClick, onRemove, size = 'sm' }) {
  const colour = stringToColour(tag)

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
        sizes[size],
        onClick ? 'cursor-pointer hover:opacity-80' : '',
      ].join(' ')}
      style={{
        backgroundColor: `${colour}22`,
        color: colour,
        borderWidth: 1,
        borderColor: `${colour}44`,
      }}
      onClick={onClick}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(tag)
          }}
          className="ml-0.5 rounded-full hover:opacity-60 transition-opacity"
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