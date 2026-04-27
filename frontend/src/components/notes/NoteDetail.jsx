import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate } from '../../utils/helpers.js'

export default function NoteDetail({ note, isOpen, onClose, onEdit, onDelete }) {
  if (!note) return null

  return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-bold text-zinc-100 leading-snug flex-1">
              {note.title || 'Untitled'}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="secondary" onClick={() => { onClose(); onEdit(note) }}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={() => { onClose(); onDelete(note) }}>Delete</Button>
            </div>
          </div>

          {/* Meta bar */}
          <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-zinc-800">
          <span className="text-xs text-zinc-600 font-mono flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(note.created_at)}
          </span>
            {note.updated_at && note.updated_at !== note.created_at && (
                <span className="text-xs text-zinc-600 font-mono">Updated {formatDate(note.updated_at)}</span>
            )}
            {note.similarity_score !== undefined && (
                <span className="text-xs text-amber-400 font-mono bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded-full">
              {Math.round(note.similarity_score * 100)}% semantic match
            </span>
            )}
            {note.rerank_score !== undefined && (
                <span className="text-[10px] text-zinc-600 font-mono">
              rerank: {note.rerank_score.toFixed(2)}
            </span>
            )}
          </div>

          {/* Tags */}
          {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
              </div>
          )}

          {/* Content */}
          <div className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap max-h-[55vh] overflow-y-auto">
            {note.content || <span className="text-zinc-700 italic">No content.</span>}
          </div>

          {/* Note ID */}
          <p className="text-[10px] text-zinc-800 font-mono border-t border-zinc-800/50 pt-3">
            id: {note.id}
          </p>
        </div>
      </Modal>
  )
}