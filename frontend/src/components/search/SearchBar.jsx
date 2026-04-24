import { useEffect, useRef, useState } from 'react'
import useNotesStore from '../../store/notesStore.js'
import { debounce } from '../../utils/helpers.js'

export default function SearchBar() {
  const [value, setValue] = useState('')
  const { searchNotes, clearSearch, isSearching } = useNotesStore()
  const debouncedSearch = useRef(debounce(searchNotes, 400)).current

  useEffect(() => {
    if (!value.trim()) {
      clearSearch()
    } else {
      debouncedSearch(value)
    }
  }, [value])

  const handleClear = () => {
    setValue('')
    clearSearch()
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
        {isSearching ? (
          <svg className="w-4 h-4 text-primary-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search notes semantically…"
        className="w-full bg-surface-800 border border-surface-200/10 hover:border-surface-200/20 focus:border-primary-500 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-9 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}