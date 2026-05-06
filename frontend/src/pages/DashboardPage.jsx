import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import SearchBar from '../components/search/SearchBar.jsx'
import NoteList from '../components/notes/NoteList.jsx'
import NoteEditor from '../components/notes/NoteEditor.jsx'
import NoteDetail from '../components/notes/NoteDetail.jsx'
import TagBadge from '../components/ui/TagBadge.jsx'
import Button from '../components/ui/Button.jsx'
import useNotesStore from '../store/notesStore.js'
import { useToast } from '../components/ui/Toast.jsx'

// Animated node graph SVG for the knowledge map section
function KnowledgeMapPlaceholder() {
  return (
    <div className="relative w-full h-48 bg-surface-container-lowest rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200">
        <line stroke="#ffb3b0" strokeWidth="0.5" x1="200" y1="100" x2="100" y2="50" />
        <line stroke="#abcdcd" strokeWidth="0.5" x1="200" y1="100" x2="300" y2="60" />
        <line stroke="#c8bfff" strokeWidth="0.5" x1="200" y1="100" x2="280" y2="150" />
        <line stroke="#ffb3b0" strokeWidth="0.5" x1="200" y1="100" x2="80" y2="140" />
        <line stroke="#abcdcd" strokeWidth="0.5" x1="100" y1="50" x2="80" y2="140" />
        <line stroke="#c8bfff" strokeWidth="0.5" x1="300" y1="60" x2="280" y2="150" />
        <circle cx="200" cy="100" r="8" fill="rgba(226,108,108,0.3)" stroke="#ffb3b0" strokeWidth="1" />
        <circle cx="100" cy="50"  r="5" fill="rgba(171,205,205,0.2)" stroke="#abcdcd" strokeWidth="1" />
        <circle cx="300" cy="60"  r="5" fill="rgba(200,191,255,0.2)" stroke="#c8bfff" strokeWidth="1" />
        <circle cx="280" cy="150" r="4" fill="rgba(171,205,205,0.2)" stroke="#abcdcd" strokeWidth="1" />
        <circle cx="80"  cy="140" r="4" fill="rgba(200,191,255,0.2)" stroke="#c8bfff" strokeWidth="1" />
      </svg>
      <p className="relative z-10 font-label-caps text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
        Interactive Graph Visualization Active
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const {
    notes, searchResults, isLoading,
    fetchNotes, deleteNote, pagination, activeTag, clearSearch,
  } = useNotesStore()
  const toast = useToast()

  const [editorOpen,    setEditorOpen]    = useState(false)
  const [editingNote,   setEditingNote]   = useState(null)
  const [detailNote,    setDetailNote]    = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchNotes() }, [])

  const isSearchMode   = searchResults !== null
  const displayedNotes = isSearchMode ? searchResults : notes
  const allTags        = [...new Set(notes.flatMap(n => n.tags ?? []))].sort()
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
    <div className="min-h-dvh flex flex-col bg-background dark">
      <Navbar onNewNote={handleNewNote} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 ml-spacing-xl p-grid-margin flex flex-col gap-lg min-w-0">

          {/* Hero */}
          <div className="flex items-end justify-between gap-md">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface mb-xs">My Workspace</h1>
              <p className="font-body-md text-on-surface-variant">
                {notes.length} interconnected nodes active across {allTags.length} tags.
              </p>
            </div>
            {/* Collaborator avatars placeholder */}
            <div className="hidden md:flex items-center gap-xs shrink-0">
              {['JD', 'AR', 'SM'].map((init, i) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high text-on-surface-variant text-xs font-code flex items-center justify-center"
                  style={{ marginLeft: i > 0 ? '-8px' : '0' }}
                >
                  {init}
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <SearchBar />

          {/* Active filter / search status bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-md">
            <div className="flex items-center gap-md">
              {isSearchMode ? (
                <>
                  <div className="flex items-center gap-sm">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-soft" />
                    <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest">
                      Neural Search
                    </span>
                  </div>
                  <span className="text-sm text-on-surface-variant font-code">
                    {displayedNotes.length} results
                  </span>
                </>
              ) : activeTag ? (
                <>
                  <span className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                    Tag Filter
                  </span>
                  <TagBadge tag={activeTag} size="sm" />
                </>
              ) : (
                <>
                  <span className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                    All Notes
                  </span>
                  <span className="font-code text-sm text-on-surface-variant">
                    {notes.length} total
                  </span>
                </>
              )}
            </div>

            {isSearchMode && (
              <Button variant="secondary" size="sm" onClick={clearSearch}>Clear</Button>
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

          {hasMore && (
            <div className="flex justify-center pt-md">
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

          {/* Knowledge Map section */}
          <div className="mt-lg">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-h3 text-h3">Knowledge Map</h2>
              <div className="flex gap-sm">
                <Button variant="secondary" size="sm">Zoom Out</Button>
                <Button variant="secondary" size="sm">Center View</Button>
              </div>
            </div>
            <KnowledgeMapPlaceholder />
          </div>

          {/* Tag cloud sidebar for larger screens — in-page on smaller */}
          {allTags.length > 0 && (
            <div className="mt-sm">
              <p className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-sm">
                Filter by Tag
              </p>
              <div className="flex flex-wrap gap-xs">
                <button
                  onClick={() => handleTagFilter(null)}
                  className={[
                    'font-label-caps text-label-caps px-sm py-xs rounded-full border transition-all',
                    !activeTag
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'text-on-surface-variant border-white/10 hover:bg-surface-container-high hover:text-on-surface hover:border-white/20',
                  ].join(' ')}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={[
                      'font-label-caps text-label-caps px-sm py-xs rounded-full border transition-all',
                      activeTag === tag
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'text-on-surface-variant border-white/10 hover:bg-surface-container-high hover:text-on-surface hover:border-white/20',
                    ].join(' ')}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <NoteEditor isOpen={editorOpen} onClose={() => setEditorOpen(false)} note={editingNote} />
      <NoteDetail
        note={detailNote}
        isOpen={Boolean(detailNote)}
        onClose={() => setDetailNote(null)}
        onEdit={handleEdit}
        onDelete={(note) => setConfirmDelete(note)}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md animate-fade-in">
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative glass-panel-strong border border-white/10 rounded-xl p-md w-full max-w-sm shadow-panel animate-slide-up">
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-error/40 to-transparent" />
            <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-sm">
              Delete Note
            </h3>
            <p className="text-sm text-on-surface-variant mb-md leading-relaxed">
              Are you sure you want to delete "{confirmDelete.title || 'Untitled'}"? This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger"    size="sm" onClick={handleDeleteConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleNewNote}
        className="fixed bottom-md right-md w-14 h-14 bg-primary text-on-primary rounded-full shadow-panel flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 synapse-glow"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}