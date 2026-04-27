import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import CortexLogo from '../ui/CortexLogo.jsx'
import Button from '../ui/Button.jsx'

export default function Navbar({ onNewNote }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'CX'

  return (
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        {/* Top accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <CortexLogo size={26} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-lg text-zinc-100 tracking-tight">Cortex</span>
              <span className="text-[10px] text-amber-400/60 font-mono uppercase tracking-[0.2em] hidden sm:inline">
              knowledge
            </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Button
                variant="primary"
                size="sm"
                onClick={onNewNote}
                className="hidden sm:flex"
                leftIcon={
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
                  </svg>
                }
            >
              New Note
            </Button>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-bold font-mono flex items-center justify-center hover:bg-amber-400/20 transition-all"
              >
                {initials}
              </button>

              {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-10 z-20 w-56 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-panel py-1.5 animate-slide-up">
                      <div className="px-4 py-2.5 border-b border-zinc-800">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">Signed in as</p>
                        <p className="text-sm text-zinc-200 truncate font-medium">{user?.email}</p>
                      </div>
                      <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 mt-0.5"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
              )}
            </div>
          </div>
        </div>
      </header>
  )
}