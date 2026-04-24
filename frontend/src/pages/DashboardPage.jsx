import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import SearchBar from '../components/search/SearchBar.jsx'
import NoteList from '../components/notes/NoteList.jsx'
import NoteEditor from '../components/notes/NoteEditor.jsx'
import NoteDetail from '../components/notes/NoteDetail.jsx'
import TagBadge from '../components/ui/TagBadge.jsx'
import Button from '../components/ui/Button.jsx'
import useNotesStore from '../store/notesStore.js'
import { useToast } from '../components/ui/Toast.jsx'

export default function DashboardPage() {
  const {
    notes,
    searchResults,
    isLoading,
    isSearching,
    fetchNotes,
    deleteNote,
    pagination,
    activeTag,
  } = useNotesStore()

  const toast = useToast()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [detailNote, setDetailNote] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  // Derive displayed notes
  const isSearchMode = searchResults !== null
  const displayedNotes = isSearchMode ? searchResults : notes

  // Collect all unique tags from notes for the sidebar filter
  const allTags = [...new Set(notes.flatMap((n) => n.tags ?? []))].sort()

  const handleNewNote = () => {
    setEditingNote(null)
    setEditorOpen(true)
  }

  const handleEdit = useCallback((note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }, [])

  const handleOpenDetail = useCallback((note) => {
    setDetailNote(note)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    const result = await deleteNote(confirmDelete.id)
    if (result.success) {
      toast.success('Note deleted.')
    } else {
      toast.error('Failed to delete note.')
    }
    setConfirmDelete(null)
  }

  const handleTagFilter = (tag) => {
    if (tag === activeTag) {
      fetchNotes(1, null)
    } else {
      fetchNotes(1, tag)
    }
  }

  const loadMore = () => {
    fetchNotes(pagination.page + 1, activeTag)
  }

  const hasMore =
    pagination.total > notes.length && !isSearchMode

  return (
    <div className="min-h-dvh bg-surface-950 flex flex-col">
      <Navbar onNewNote={handleNewNote} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar — tag filter */}
        {allTags.length > 0 && (
          <aside className="hidden lg:flex flex-col gap-3 w-48 shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Filter by tag</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleTagFilter(null)}
                className={[
                  'text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                  !activeTag
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-slate-400 hover:bg-surface-800 hover:text-slate-200',
                ].join(' ')}
              >
                All notes
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={[
                    'text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2',
                    activeTag === tag
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-slate-400 hover:bg-surface-800 hover:text-slate-200',
                  ].join(' ')}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  {tag}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar />
            <Button
              onClick={handleNewNote}
              className="sm:hidden shrink-0"
              size="sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              New
            </Button>
          </div>

          {/* Section heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-300">
                {isSearchMode
                  ? `${displayedNotes.length} result${displayedNotes.length !== 1 ? 's' : ''}`
                  : activeTag
                  ? `Tagged: ${activeTag}`
                  : 'All Notes'}
              </h2>
              {!isSearchMode && !isLoading && (
                <span className="text-xs text-slate-600">({notes.length})</span>
              )}
            </div>

            {isSearchMode && (
              <button
                onClick={() => useNotesStore.getState().clearSearch()}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Note grid / empty / loading */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface-900 rounded-xl h-40 animate-pulse border border-surface-200/5" />
              ))}
            </div>
          ) : (
            <NoteList
              notes={displayedNotes}
              onOpen={handleOpenDetail}
              onEdit={handleEdit}
              onDelete={(note) => setConfirmDelete(note)}
              emptyMessage={
                isSearchMode
                  ? 'No notes matched your search.'
                  : 'No notes yet. Create your first one!'
              }
            />
          )}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={loadMore} isLoading={isLoading}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-surface-900 border border-surface-200/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <h3 className="font-semibold text-slate-100 mb-2">Delete note?</h3>
            <p className="text-sm text-slate-400 mb-5">
              "<span className="text-slate-300">{confirmDelete.title || 'Untitled'}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}