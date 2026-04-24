import { useState } from 'react'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate, truncate } from '../../utils/helpers.js'

export default function NoteCard({ note, onOpen, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)

  const handleMenuClick = (e) => {
    e.stopPropagation()
    setShowMenu((v) => !v)
  }

  return (
    <article
      onClick={() => onOpen(note)}
      className="group relative bg-surface-900 hover:bg-surface-800 border border-surface-200/10 hover:border-surface-200/20 rounded-xl p-4 cursor-pointer transition-all duration-150 flex flex-col gap-3 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 flex-1">
          {note.title || 'Untitled'}
        </h3>

        {/* Actions menu */}
        <div className="relative shrink-0">
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-surface-200/10 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Note options"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
              <div className="absolute right-0 top-7 z-20 w-36 bg-surface-900 border border-surface-200/10 rounded-xl shadow-xl py-1 animate-slide-up">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(note) }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-surface-200/10 flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(note) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 11v6m4-6v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round" />
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
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
          {truncate(note.content, 160)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex flex-wrap gap-1">
          {note.tags?.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} size="xs" />
          ))}
          {note.tags?.length > 3 && (
            <span className="text-xs text-slate-600">+{note.tags.length - 3}</span>
          )}
        </div>
        <time className="text-xs text-slate-600 shrink-0 ml-2">
          {formatDate(note.created_at)}
        </time>
      </div>

      {/* Similarity score badge (search results) */}
      {note.similarity_score !== undefined && (
        <div className="absolute top-3 right-3">
          <span className="text-xs bg-primary-500/20 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded-full font-medium">
            {Math.round(note.similarity_score * 100)}%
          </span>
        </div>
      )}
    </article>
  )
}