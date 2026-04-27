import { useEffect, useRef, useState } from 'react'
import useNotesStore from '../../store/notesStore.js'
import { debounce } from '../../utils/helpers.js'

export default function SearchBar() {
  const [value, setValue] = useState('')
  const { searchNotes, clearSearch, isSearching, searchResults } = useNotesStore()
  const debouncedSearch = useRef(debounce(searchNotes, 400)).current
  const inputRef = useRef(null)

  useEffect(() => {
    if (!value.trim()) clearSearch()
    else debouncedSearch(value)
  }, [value])

  // Keyboard shortcut: Cmd+K
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

  const isActive = searchResults !== null

  return (
      <div className="relative w-full max-w-lg group">
        {/* Glow effect when searching */}
        {isActive && (
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-transparent pointer-events-none" />
        )}

        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center z-10">
          {isSearching ? (
              <svg className="w-4 h-4 text-amber-400 animate-spin-slow" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
          ) : (
              <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
              </svg>
          )}
        </div>

        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search your knowledge base…"
            className={[
              'w-full bg-zinc-900/80 border text-zinc-100 placeholder-zinc-600',
              'rounded-xl pl-11 pr-24 py-2.5 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:ring-1 focus:ring-amber-400/30 focus:border-amber-400/50',
              isActive ? 'border-amber-400/30' : 'border-zinc-700/60 hover:border-zinc-600',
            ].join(' ')}
        />

        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
          {value && (
              <button
                  onClick={() => { setValue(''); clearSearch(); inputRef.current?.focus() }}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-zinc-700 font-mono bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 select-none">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>
  )
}