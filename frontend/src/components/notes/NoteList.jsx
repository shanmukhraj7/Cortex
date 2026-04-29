import NoteCard from './NoteCard.jsx'

function Skeleton() {
  return (
    <div className="bg-carbon-800 border border-carbon-500 rounded-xl p-6 flex flex-col gap-4 h-[180px]">
      <div className="shimmer-bg rounded h-5 w-3/4" />
      <div className="flex flex-col gap-2 mt-2">
        <div className="shimmer-bg rounded h-3 w-full" />
        <div className="shimmer-bg rounded h-3 w-5/6" />
      </div>
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-carbon-500/50">
        <div className="shimmer-bg rounded h-5 w-16" />
        <div className="shimmer-bg rounded h-3 w-12" />
      </div>
    </div>
  )
}

export default function NoteList({ notes, onOpen, onEdit, onDelete, isLoading, emptyMessage }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-carbon-800 text-carbon-400 flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-bold uppercase tracking-widest">{emptyMessage || 'Nothing here yet'}</p>
          <p className="text-carbon-400 text-sm mt-1">Create a note to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note, i) => (
        <NoteCard
          key={note.id}
          note={note}
          index={i}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}