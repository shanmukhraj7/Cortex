import { useEffect, useRef, useState } from 'react'
import useNotesStore from '../../store/notesStore.js'
import { debounce } from '../../utils/helpers.js'

export default function SearchBar() {
  const [value, setValue] = useState('')
  const { searchNotes, clearSearch, isSearching, searchResults } = useNotesStore()
  const debouncedSearch = useRef(debounce(searchNotes, 400)).current
  const inputRef = useRef(null)
  const isActive = searchResults !== null || value.trim().length > 0

  useEffect(() => {
    if (!value.trim()) clearSearch()
    else debouncedSearch(value)
  }, [value])

  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  return (
    <div className="relative w-full group">
      {/* Synapse glow when active */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/8 blur-xl rounded-xl opacity-100 pointer-events-none transition-opacity duration-500" />
      )}

      <div className={[
        'relative flex items-center glass-panel rounded-xl transition-all duration-300',
        isActive
          ? 'border-primary/40 synapse-glow-sm'
          : 'border-white/10 hover:border-white/20',
      ].join(' ')}>
        {/* Search / spinner icon */}
        <div className="absolute left-sm flex items-center z-10">
          {isSearching ? (
            <svg className="w-4 h-4 text-secondary animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-on-surface-variant/50 group-focus-within:text-on-surface-variant transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search your knowledge graph..."
          className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder:text-on-surface-variant/40 pl-10 pr-24 py-sm"
        />

        <div className="absolute right-sm flex items-center gap-sm">
          {/* AI indicator */}
          {isActive ? (
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-soft" />
              <span className="font-label-caps text-[10px] text-secondary/80">AI READY</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-xs">
              <kbd className="px-xs py-[2px] bg-white/5 border border-white/10 rounded text-[10px] font-code text-on-surface-variant">CMD</kbd>
              <kbd className="px-xs py-[2px] bg-white/5 border border-white/10 rounded text-[10px] font-code text-on-surface-variant">K</kbd>
            </div>
          )}

          {value && (
            <button
              onClick={() => { setValue(''); clearSearch(); inputRef.current?.focus() }}
              className="text-on-surface-variant/50 hover:text-on-surface transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}