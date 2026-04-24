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
          <h1 className="text-xl font-bold text-slate-100 leading-snug">{note.title || 'Untitled'}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={() => { onClose(); onEdit(note) }}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => { onClose(); onDelete(note) }}>
              Delete
            </Button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-surface-200/10 pb-4">
          <span>Created {formatDate(note.created_at)}</span>
          {note.updated_at && note.updated_at !== note.created_at && (
            <span>Updated {formatDate(note.updated_at)}</span>
          )}
          {note.similarity_score !== undefined && (
            <span className="text-primary-400">
              {Math.round(note.similarity_score * 100)}% match
            </span>
          )}
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
          {note.content || <span className="text-slate-600 italic">No content.</span>}
        </div>
      </div>
    </Modal>
  )
}