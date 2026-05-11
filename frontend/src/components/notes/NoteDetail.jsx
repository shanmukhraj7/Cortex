import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import TagBadge from '../ui/TagBadge.jsx'
import { formatDate } from '../../utils/helpers.js'

export default function NoteDetail({ note, isOpen, onClose, onEdit, onDelete }) {
  if (!note) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-md flex flex-col gap-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-md pt-xs">
          <div className="flex-1">
            {note.tags?.[0] && (
              <p className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-xs">
                {note.tags[0]}
              </p>
            )}
            <h1 className="font-h2 text-h3 font-bold text-on-surface leading-tight">
              {note.title || 'Untitled'}
            </h1>
          </div>
          <div className="flex items-center gap-sm shrink-0">
            <Button size="sm" variant="secondary" onClick={() => { onClose(); onEdit(note) }}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => { onClose(); onDelete(note) }}>Delete</Button>
          </div>
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-md flex-wrap pb-md border-b border-white/5">
          <span className="text-[11px] text-on-surface-variant/60 font-code flex items-center gap-xs">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(note.created_at)}
          </span>

          {note.similarity_score !== undefined && (
            <span className="font-code text-[11px] text-primary bg-primary/10 border border-primary/20 px-xs py-[2px] rounded">
              {Math.round(note.similarity_score * 100)}% Similarity
            </span>
          )}
          {note.rerank_score != null && (
            <span className="font-code text-[11px] text-secondary bg-secondary-container/20 border border-secondary/20 px-xs py-[2px] rounded">
              Rerank: {note.rerank_score.toFixed(2)}
            </span>
          )}
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {note.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        {/* Content */}
        <div className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap max-h-[55vh] overflow-y-auto pr-sm">
          {note.content || <span className="text-on-surface-variant/40 italic">No content.</span>}
        </div>

        {/* ML metadata */}
        {(note.similarity_score != null || note.rerank_score != null) && (
          <div className="glass-panel rounded-lg p-sm flex items-center gap-md border border-secondary/10">
            <div className="w-1 h-8 bg-secondary rounded-full opacity-50" />
            <div>
              <p className="font-label-caps text-[10px] text-secondary/80 uppercase tracking-widest mb-xs">
                Neural Reranking Complete
              </p>
              <p className="text-xs text-on-surface-variant/60">
                Bi-encoder + cross-encoder semantic match
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}