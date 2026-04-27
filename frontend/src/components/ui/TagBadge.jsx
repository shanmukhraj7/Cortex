import { tagColor } from '../../utils/helpers.js'

export default function TagBadge({ tag, onClick, onRemove, size = 'sm' }) {
    const color = tagColor(tag)
    const sizes = {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2   py-0.5 text-xs',
        md: 'px-2.5 py-1   text-sm',
    }

    return (
        <span
            onClick={onClick}
            className={[
                'inline-flex items-center gap-1 rounded-full font-medium transition-all',
                sizes[size],
                onClick ? 'cursor-pointer hover:opacity-75' : '',
            ].join(' ')}
            style={{
                color,
                background: `${color}18`,
                border: `1px solid ${color}35`,
            }}
        >
      {tag}
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(tag) }}
                    className="hover:opacity-60 transition-opacity ml-0.5"
                    aria-label={`Remove ${tag}`}
                >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M8 2L2 8M2 2l6 6" strokeLinecap="round"/>
                    </svg>
                </button>
            )}
    </span>
    )
}