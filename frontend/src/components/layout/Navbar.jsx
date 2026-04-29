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
    <header className="sticky top-0 z-40 w-full border-b border-carbon-500/30 bg-carbon-900/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <CortexLogo size={28} />
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl text-carbon-50 tracking-wide uppercase">Cortex</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            size="sm"
            onClick={onNewNote}
            leftIcon={
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 1v12M1 7h12" strokeLinecap="round" />
              </svg>
            }
          >
            New Note
          </Button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-carbon-800 border border-carbon-500 text-carbon-200 text-xs font-bold font-mono flex items-center justify-center hover:bg-carbon-700 hover:text-white transition-colors"
            >
              {initials}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-56 bg-carbon-800 border border-carbon-500 rounded-xl shadow-panel py-1.5 animate-slide-up">
                  <div className="px-4 py-3 border-b border-carbon-500/50">
                    <p className="text-[10px] text-carbon-400 font-bold uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm text-carbon-50 truncate font-medium">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-carbon-700 transition-colors flex items-center gap-2.5 mt-1"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
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