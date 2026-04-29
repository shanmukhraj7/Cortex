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
      <div className="relative flex items-center">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center z-10">
          {isSearching ? (
            <svg className="w-4 h-4 text-coral-500 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-carbon-400 group-focus-within:text-coral-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          placeholder="Search your knowledge base..."
          className={[
            'w-full bg-carbon-800 border text-carbon-50 placeholder-carbon-400',
            'rounded-xl pl-11 pr-20 py-3 text-sm',
            'transition-colors duration-200',
            'focus:outline-none focus:border-coral-500',
            'border-carbon-500 hover:border-carbon-400',
          ].join(' ')}
        />

        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
          {value && (
            <button
              onClick={() => { setValue(''); clearSearch(); inputRef.current?.focus() }}
              className="text-carbon-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-carbon-300 font-mono bg-carbon-700 border border-carbon-500 rounded px-2 py-0.5 select-none">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>
    </div>
  )
}