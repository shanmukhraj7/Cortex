import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'

export default function Navbar({ onNewNote }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'CX'

  return (
    <header className="bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 flex items-center justify-between px-grid-margin py-base w-full h-16">
      {/* Brand */}
      <div
        className="flex items-center gap-sm cursor-pointer shrink-0"
        onClick={() => navigate('/')}
      >
        <span className="font-h3 text-h3 font-bold tracking-tighter text-primary">Cortex</span>
      </div>

      {/* Centered Search Bar */}
      <div className="hidden md:flex flex-1 max-w-2xl px-md">
        <div className="relative w-full group">
          <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative flex items-center glass-panel rounded-full px-md py-xs border border-white/10 group-focus-within:border-primary/50 transition-all duration-300">
            <svg className="w-4 h-4 text-on-surface-variant mr-sm shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search your knowledge graph..."
              readOnly
              onClick={() => {/* search handled in SearchBar component */}}
              className="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant/50 cursor-pointer"
            />
            <div className="flex items-center gap-xs ml-sm">
              <kbd className="px-xs py-[2px] bg-white/5 border border-white/10 rounded text-[10px] font-code text-on-surface-variant">CMD</kbd>
              <kbd className="px-xs py-[2px] bg-white/5 border border-white/10 rounded text-[10px] font-code text-on-surface-variant">K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-md">
        <button
          onClick={onNewNote}
          className="hidden md:flex items-center gap-xs bg-primary text-on-primary px-md py-xs rounded-full font-label-caps text-label-caps hover:brightness-110 active:scale-95 transition-all duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Note
        </button>

        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-primary transition-colors duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
          </svg>
        </button>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold font-code flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-56 glass-panel-strong border border-white/10 rounded-xl shadow-panel py-1.5 animate-slide-up">
                <div className="px-md py-sm border-b border-white/5">
                  <p className="text-[10px] text-on-surface-variant/60 font-label-caps uppercase tracking-widest mb-xs">Signed in as</p>
                  <p className="text-sm text-on-surface truncate font-medium">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-md py-sm text-sm font-medium text-error hover:bg-error-container/20 transition-colors flex items-center gap-sm mt-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}