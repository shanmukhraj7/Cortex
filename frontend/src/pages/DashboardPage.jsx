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

  useEffect(() => { fetchNotes() }, [])

  const isSearchMode   = searchResults !== null
  const displayedNotes = isSearchMode ? searchResults : notes
  const allTags        = [...new Set(notes.flatMap((n) => n.tags ?? []))].sort()
  const hasMore        = !isSearchMode && pagination.total > notes.length

  const handleNewNote = () => { setEditingNote(null); setEditorOpen(true) }
  const handleEdit    = useCallback((note) => { setEditingNote(note); setEditorOpen(true) }, [])
  const handleOpen    = useCallback((note) => setDetailNote(note), [])

  const handleTagFilter = (tag) => {
    fetchNotes(1, tag === activeTag ? null : tag)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    const res = await deleteNote(confirmDelete.id)
    if (res.success) toast.success('Note deleted.')
    else toast.error('Failed to delete note.')
    setConfirmDelete(null)
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar onNewNote={handleNewNote} />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* ── Left Sidebar ──────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 border-r border-carbon-500/50 min-h-full py-6 px-4 gap-6 bg-[#080808]">
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-carbon-900 border border-carbon-500 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-carbon-400 font-bold uppercase tracking-widest">Notes</span>
              <span className="font-display text-2xl font-bold text-white">{notes.length}</span>
            </div>
            <div className="bg-carbon-900 border border-carbon-500 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-carbon-400 font-bold uppercase tracking-widest">Tags</span>
              <span className="font-display text-2xl font-bold text-white">{allTags.length}</span>
            </div>
          </div>

          {/* Tag filter nav */}
          {allTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-carbon-400 font-bold uppercase tracking-widest px-2 mb-2">Filters</p>

              <button
                onClick={() => handleTagFilter(null)}
                className={[
                  'text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                  !activeTag
                    ? 'bg-carbon-800 text-white border border-carbon-500'
                    : 'text-carbon-400 hover:bg-carbon-800 hover:text-carbon-100 border border-transparent',
                ].join(' ')}
              >
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                All notes
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={[
                    'text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 truncate',
                    activeTag === tag
                      ? 'bg-carbon-800 text-white border border-carbon-500'
                      : 'text-carbon-400 hover:bg-carbon-800 hover:text-carbon-100 border border-transparent',
                  ].join(' ')}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTag === tag ? 'bg-coral-500' : 'bg-carbon-500'}`} />
                  <span className="truncate">{tag}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main Content ──────────────────────────────────── */}
        <main className="flex-1 flex flex-col gap-6 min-w-0 px-4 sm:px-8 py-8">
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar />
            </div>
            <Button onClick={handleNewNote} size="md" className="lg:hidden shrink-0">
              New
            </Button>
          </div>

          <div className="flex items-center justify-between border-b border-carbon-500/50 pb-4 mt-2">
            <div className="flex items-center gap-3">
              {isSearchMode ? (
                <>
                  <span className="text-[11px] font-bold text-coral-500 uppercase tracking-widest">Semantic Search</span>
                  <span className="text-sm text-carbon-200">
                    {displayedNotes.length} results
                  </span>
                </>
              ) : activeTag ? (
                <>
                  <span className="text-[11px] font-bold text-carbon-400 uppercase tracking-widest">Tag Filter</span>
                  <TagBadge tag={activeTag} size="sm" />
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-carbon-400 uppercase tracking-widest">All Notes</span>
                  <span className="text-sm text-carbon-200">{notes.length} total</span>
                </>
              )}
            </div>

            {isSearchMode && (
              <Button variant="outline" size="xs" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>

          <NoteList
            notes={displayedNotes}
            onOpen={handleOpen}
            onEdit={handleEdit}
            onDelete={(note) => setConfirmDelete(note)}
            isLoading={isLoading}
            emptyMessage={
              isSearchMode
                ? 'No matches found.'
                : activeTag
                  ? `No notes tagged "${activeTag}"`
                  : 'No notes yet. Create your first one!'
            }
          />

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={() => fetchNotes(pagination.page + 1, activeTag)} isLoading={isLoading}>
                Load more
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <NoteEditor isOpen={editorOpen} onClose={() => setEditorOpen(false)} note={editingNote} />
      <NoteDetail note={detailNote} isOpen={Boolean(detailNote)} onClose={() => setDetailNote(null)} onEdit={handleEdit} onDelete={(note) => setConfirmDelete(note)} />

      {/* ── Delete Confirm ──────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-carbon-950/80 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-carbon-900 border border-carbon-500 rounded-2xl p-6 w-full max-w-sm shadow-panel animate-slide-up">
            <h3 className="font-display font-bold text-white mb-2 uppercase tracking-widest">Delete Note</h3>
            <p className="text-sm text-carbon-200 mb-6 leading-relaxed">
              Are you sure you want to delete "{confirmDelete.title || 'Untitled'}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger"  size="sm" onClick={handleDeleteConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}