import { useState } from 'react'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate, truncate } from '../../utils/helpers.js'

export default function NoteCard({ note, onOpen, onEdit, onDelete, index = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
      <article
          onClick={() => onOpen(note)}
          className="group relative bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col gap-3 animate-fade-in"
          style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/3 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

        {/* Header row */}
        <div className="flex items-start justify-between gap-2 relative">
          <h3 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2 flex-1 group-hover:text-white transition-colors">
            {note.title || 'Untitled'}
          </h3>

          {/* 3-dot menu */}
          <div className="relative shrink-0 -mt-0.5">
            <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
                className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-700 hover:text-zinc-300 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="8" cy="13" r="1.3"/>
              </svg>
            </button>

            {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
                  <div className="absolute right-0 top-7 z-20 w-36 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-panel py-1 animate-slide-up">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(note) }}
                        className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/>
                        <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
                      </svg>
                      Edit note
                    </button>
                    <div className="mx-2 my-1 h-px bg-zinc-800" />
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(note) }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round"/>
                        <path d="M10 11v6m4-6v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </>
            )}
          </div>
        </div>

        {/* Content preview */}
        {note.content && (
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 flex-1">
              {truncate(note.content, 180)}
            </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
          <div className="flex flex-wrap gap-1 min-w-0">
            {note.tags?.slice(0, 2).map((tag) => (
                <TagBadge key={tag} tag={tag} size="xs" />
            ))}
            {note.tags?.length > 2 && (
                <span className="text-[10px] text-zinc-700 font-mono self-center">+{note.tags.length - 2}</span>
            )}
          </div>
          <time className="text-[10px] text-zinc-700 font-mono shrink-0">
            {formatDate(note.created_at)}
          </time>
        </div>

        {/* Similarity badge for search results */}
        {note.similarity_score !== undefined && (
            <div className="absolute top-3 right-8 flex items-center">
          <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 rounded-full">
            {Math.round(note.similarity_score * 100)}%
          </span>
            </div>
        )}
      </article>
  )
}