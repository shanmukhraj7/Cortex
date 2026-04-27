import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import SearchBar from '../components/search/SearchBar.jsx'
import NoteList from '../components/notes/NoteList.jsx'
import NoteEditor from '../components/notes/NoteEditor.jsx'
import NoteDetail from '../components/notes/NoteDetail.jsx'
import TagBadge from '../components/ui/TagBadge.jsx'
import Button from '../components/ui/Button.jsx'
import useNotesStore from '../store/notesStore.js'
import useAuthStore from '../store/authStore.js'
import { useToast } from '../components/ui/Toast.jsx'

export default function DashboardPage() {
  const {
    notes, searchResults, isLoading,
    fetchNotes, deleteNote, pagination, activeTag, clearSearch,
  } = useNotesStore()
  const { user } = useAuthStore()
  const toast = useToast()

  const [editorOpen,    setEditorOpen]    = useState(false)
  const [editingNote,   setEditingNote]   = useState(null)
  const [detailNote,    setDetailNote]    = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  useEffect(() => { fetchNotes() }, [])

  const isSearchMode    = searchResults !== null
  const displayedNotes  = isSearchMode ? searchResults : notes
  const allTags         = [...new Set(notes.flatMap((n) => n.tags ?? []))].sort()
  const hasMore         = !isSearchMode && pagination.total > notes.length

  const handleNewNote = () => { setEditingNote(null); setEditorOpen(true) }
  const handleEdit    = useCallback((note) => { setEditingNote(note); setEditorOpen(true) }, [])
  const handleOpen    = useCallback((note) => setDetailNote(note), [])

  const handleTagFilter = (tag) => {
    setSidebarOpen(false)
    fetchNotes(1, tag === activeTag ? null : tag)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    const res = await deleteNote(confirmDelete.id)
    if (res.success) toast.success('Note deleted.')
    else toast.error('Failed to delete note.')
    setConfirmDelete(null)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
      <div className="min-h-dvh bg-zinc-950 flex flex-col">
        <Navbar onNewNote={handleNewNote} />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">

          {/* ─── Sidebar ─────────────────────────────── */}
          <aside className={[
            'hidden lg:flex flex-col gap-5 w-52 shrink-0',
          ].join(' ')}>
            {/* Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Corpus</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-500">Notes</span>
                  <span className="font-display text-lg font-bold text-amber-400">{notes.length}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-500">Tags</span>
                  <span className="font-display text-lg font-bold text-zinc-400">{allTags.length}</span>
                </div>
              </div>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest px-1">Filter</p>
                  <button
                      onClick={() => handleTagFilter(null)}
                      className={[
                        'text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2',
                        !activeTag
                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/25'
                            : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300',
                      ].join(' ')}
                  >
                    <span className="w-1 h-1 rounded-full bg-current" />
                    All notes
                  </button>
                  {allTags.map((tag) => (
                      <button
                          key={tag}
                          onClick={() => handleTagFilter(tag)}
                          className={[
                            'text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 truncate',
                            activeTag === tag
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/25'
                                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300',
                          ].join(' ')}
                      >
                        <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                        <span className="truncate">{tag}</span>
                      </button>
                  ))}
                </div>
            )}

            {/* New note shortcut */}
            <button
                onClick={handleNewNote}
                className="mt-auto flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-800 hover:border-amber-400/30 text-zinc-700 hover:text-amber-400 text-xs transition-all group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              New note
            </button>
          </aside>

          {/* ─── Main content ────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* Greeting + search row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="hidden sm:block shrink-0">
                <p className="text-xs text-zinc-600 font-mono">{greeting()}</p>
                <p className="text-sm font-semibold text-zinc-300 truncate max-w-[180px]">
                  {user?.email?.split('@')[0]}
                </p>
              </div>
              <div className="flex-1">
                <SearchBar />
              </div>
              <Button
                  onClick={handleNewNote}
                  size="sm"
                  className="sm:hidden"
                  leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 1v12M1 7h12" strokeLinecap="round"/></svg>}
              >
                New
              </Button>
            </div>

            {/* Section label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Label */}
                <div className="flex items-center gap-2">
                  {isSearchMode ? (
                      <>
                        <span className="text-[10px] font-mono text-amber-400/60 uppercase tracking-widest">Search</span>
                        <span className="text-xs text-zinc-400">
                      {displayedNotes.length} result{displayedNotes.length !== 1 ? 's' : ''}
                    </span>
                      </>
                  ) : activeTag ? (
                      <>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Tag</span>
                        <TagBadge tag={activeTag} size="sm" />
                        <span className="text-xs text-zinc-600">({notes.length})</span>
                      </>
                  ) : (
                      <>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">All</span>
                        <span className="text-xs text-zinc-500">{notes.length} notes</span>
                      </>
                  )}
                </div>
              </div>

              {isSearchMode && (
                  <button
                      onClick={clearSearch}
                      className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                    Clear
                  </button>
              )}
            </div>

            {/* Notes grid */}
            <NoteList
                notes={displayedNotes}
                onOpen={handleOpen}
                onEdit={handleEdit}
                onDelete={(note) => setConfirmDelete(note)}
                isLoading={isLoading}
                emptyMessage={
                  isSearchMode
                      ? 'No semantic matches found.'
                      : activeTag
                          ? `No notes tagged "${activeTag}"`
                          : 'No notes yet. Create your first one!'
                }
            />

            {/* Load more */}
            {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchNotes(pagination.page + 1, activeTag)}
                      isLoading={isLoading}
                  >
                    Load more
                  </Button>
                </div>
            )}
          </div>
        </main>

        {/* ─── Modals ─────────────────────────────────── */}
        <NoteEditor
            isOpen={editorOpen}
            onClose={() => setEditorOpen(false)}
            note={editingNote}
        />

        <NoteDetail
            note={detailNote}
            isOpen={Boolean(detailNote)}
            onClose={() => setDetailNote(null)}
            onEdit={handleEdit}
            onDelete={(note) => setConfirmDelete(note)}
        />

        {/* ─── Delete confirm ──────────────────────────── */}
        {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
              <div className="relative bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 w-full max-w-sm shadow-panel animate-slide-up">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-100 mb-1.5">Delete this note?</h3>
                <p className="text-sm text-zinc-500 mb-5">
                  <span className="text-zinc-300">"{confirmDelete.title || 'Untitled'}"</span> will be permanently removed.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                  <Button variant="danger"    size="sm" onClick={handleDeleteConfirm}>Delete permanently</Button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}