import NoteCard from './NoteCard.jsx'

function Skeleton() {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="shimmer-bg rounded h-4 w-3/4" />
            <div className="shimmer-bg rounded h-3 w-full" />
            <div className="shimmer-bg rounded h-3 w-5/6" />
            <div className="shimmer-bg rounded h-3 w-2/3" />
            <div className="flex gap-1 mt-auto">
                <div className="shimmer-bg rounded-full h-4 w-12" />
                <div className="shimmer-bg rounded-full h-4 w-10" />
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
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4 animate-fade-in">
                {/* Empty state icon */}
                <div className="w-16 h-16 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    <svg className="w-7 h-7 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div>
                    <p className="text-zinc-400 text-sm font-medium">{emptyMessage || 'Nothing here yet'}</p>
                    <p className="text-zinc-700 text-xs mt-1 font-mono">Create a note to get started</p>
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