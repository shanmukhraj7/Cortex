import NoteCard from './NoteCard.jsx'

function Skeleton() {
  return (
    <div className="glass-panel rounded-xl p-md flex flex-col gap-sm h-[180px]">
      <div className="shimmer-bg rounded h-3 w-24" />
      <div className="shimmer-bg rounded h-5 w-3/4" />
      <div className="flex flex-col gap-xs mt-xs flex-1">
        <div className="shimmer-bg rounded h-3 w-full" />
        <div className="shimmer-bg rounded h-3 w-5/6" />
        <div className="shimmer-bg rounded h-3 w-4/6" />
      </div>
      <div className="flex justify-between items-center pt-sm border-t border-white/5">
        <div className="flex gap-xs">
          <div className="shimmer-bg rounded-full h-5 w-16" />
          <div className="shimmer-bg rounded-full h-5 w-12" />
        </div>
        <div className="shimmer-bg rounded h-3 w-12" />
      </div>
    </div>
  )
}

export default function NoteList({ notes, onOpen, onEdit, onDelete, isLoading, emptyMessage }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid-gutter">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-md animate-fade-in">
        {/* Node visualization placeholder */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center synapse-glow-sm">
            <svg className="w-6 h-6 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Decorative satellite nodes */}
          <div className="absolute top-0 right-0 w-4 h-4 rounded-full border border-secondary/30 bg-secondary/10" />
          <div className="absolute bottom-2 left-0 w-3 h-3 rounded-full border border-tertiary/30 bg-tertiary/10" />
        </div>
        <div>
          <p className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
            {emptyMessage || 'No nodes in graph'}
          </p>
          <p className="text-sm text-on-surface-variant/60 mt-xs font-code">
            Create a note to begin building your knowledge graph.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid-gutter">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}