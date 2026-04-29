import { useState } from 'react'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate, truncate } from '../../utils/helpers.js'

export default function NoteCard({ note, onOpen, onEdit, onDelete, index = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <article
      onClick={() => onOpen(note)}
      className="group relative bg-carbon-800 hover:bg-[#1a1a1a] border border-carbon-500 hover:border-carbon-400 rounded-xl p-6 cursor-pointer transition-colors duration-200 flex flex-col gap-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 relative">
        <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2 flex-1 tracking-wide">
          {note.title || 'Untitled'}
        </h3>

        {/* 3-dot menu */}
        <div className="relative shrink-0 -mt-1 -mr-1">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-carbon-400 hover:text-white hover:bg-carbon-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="8" cy="13" r="1.3" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
              <div className="absolute right-0 top-9 z-20 w-36 bg-carbon-800 border border-carbon-500 rounded-lg shadow-panel py-1.5 animate-slide-up">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(note) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-carbon-100 hover:bg-carbon-700 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
                    <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
                  </svg>
                  Edit note
                </button>
                <div className="mx-3 my-1 h-px bg-carbon-500/50" />
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(note) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
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

      {/* Content preview */}
      {note.content && (
        <p className="text-sm text-carbon-200 leading-relaxed line-clamp-3 flex-1">
          {truncate(note.content, 180)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 gap-2 border-t border-carbon-500/50">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {note.tags?.slice(0, 2).map((tag) => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {note.tags?.length > 2 && (
            <span className="text-[10px] text-carbon-400 font-bold self-center ml-1">+{note.tags.length - 2}</span>
          )}
        </div>
        <time className="text-[11px] text-carbon-400 shrink-0 font-medium">
          {formatDate(note.created_at)}
        </time>
      </div>

      {/* Similarity badge */}
      {note.similarity_score !== undefined && (
        <div className="absolute top-4 right-10 flex items-center">
          <span className="text-[10px] font-mono font-bold text-coral-500 bg-coral-500/10 px-2 py-1 rounded-md">
            {Math.round(note.similarity_score * 100)}% Match
          </span>
        </div>
      )}
    </article>
  )
}