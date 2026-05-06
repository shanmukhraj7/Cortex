import { useState } from 'react'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate, truncate } from '../../utils/helpers.js'

export default function NoteCard({ note, onOpen, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <article
      onClick={() => onOpen(note)}
      className="group relative glass-panel rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-300 flex flex-col gap-sm p-md"
    >
      {/* Synapse glow on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

      {/* Category label */}
      {note.tags?.[0] && (
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] tracking-widest uppercase text-on-surface-variant/60">
            {note.tags[0]}
          </span>
          {note.similarity_score !== undefined && (
            <span className="font-code text-[11px] text-primary font-bold">
              {Math.round(note.similarity_score * 100)}%
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="font-h3 text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
        {note.title || 'Untitled'}
      </h3>

      {/* Preview */}
      {note.content && (
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1">
          {truncate(note.content, 160)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-sm border-t border-white/5 gap-sm relative">
        <div className="flex flex-wrap gap-xs min-w-0">
          {note.tags?.slice(0, 2).map(tag => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {note.tags?.length > 2 && (
            <span className="text-[10px] text-on-surface-variant/50 font-code self-center">
              +{note.tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-sm shrink-0">
          <time className="text-[11px] text-on-surface-variant/50 font-code">
            {formatDate(note.created_at)}
          </time>

          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
              className="text-on-surface-variant/40 hover:text-on-surface transition-colors w-6 h-6 flex items-center justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.2" />
                <circle cx="8" cy="8" r="1.2" />
                <circle cx="8" cy="13" r="1.2" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
                <div className="absolute right-0 bottom-8 z-20 w-36 glass-panel-strong border border-white/10 rounded-xl py-xs animate-slide-up shadow-panel">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(note) }}
                    className="w-full text-left px-md py-sm text-sm text-on-surface hover:bg-surface-container-high hover:text-primary flex items-center gap-sm transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
                      <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
                    </svg>
                    Edit
                  </button>
                  <div className="mx-md my-[2px] h-px bg-white/5" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(note) }}
                    className="w-full text-left px-md py-sm text-sm text-error hover:bg-error-container/20 flex items-center gap-sm transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" />
                      <path d="M10 11v6m4-6v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rerank badge */}
      {note.rerank_score !== undefined && (
        <div className="absolute top-md right-md">
          <span className="font-code text-[10px] text-secondary bg-secondary-container/20 border border-secondary/20 px-xs py-[2px] rounded">
            Rerank: {note.rerank_score.toFixed(2)}
          </span>
        </div>
      )}
    </article>
  )
}