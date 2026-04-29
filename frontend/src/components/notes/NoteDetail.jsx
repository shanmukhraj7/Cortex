import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate } from '../../utils/helpers.js'

export default function NoteDetail({ note, isOpen, onClose, onEdit, onDelete }) {
  if (!note) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight flex-1 tracking-wide">
            {note.title || 'Untitled'}
          </h1>
          <div className="flex items-center gap-3 shrink-0">
            <Button size="sm" variant="outline" onClick={() => { onClose(); onEdit(note) }}>Edit</Button>
            <Button size="sm" variant="danger"  onClick={() => { onClose(); onDelete(note) }}>Delete</Button>
          </div>
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-carbon-500/50">
          <span className="text-xs text-carbon-400 font-medium flex items-center gap-1.5 uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(note.created_at)}
          </span>
          {note.updated_at && note.updated_at !== note.created_at && (
            <span className="text-xs text-carbon-500 font-medium uppercase tracking-widest">
              Updated {formatDate(note.updated_at)}
            </span>
          )}
          {note.similarity_score !== undefined && (
            <span className="text-[10px] font-mono font-bold text-coral-500 bg-coral-500/10 px-2 py-0.5 rounded-md">
              {Math.round(note.similarity_score * 100)}% Match
            </span>
          )}
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        {/* Content */}
        <div className="text-sm text-carbon-100 leading-relaxed whitespace-pre-wrap max-h-[55vh] overflow-y-auto pr-2">
          {note.content || <span className="text-carbon-500 italic">No content.</span>}
        </div>
      </div>
    </Modal>
  )
}