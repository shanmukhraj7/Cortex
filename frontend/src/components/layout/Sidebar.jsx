import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  {
    label: 'Knowledge Base',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    label: 'Cortex Intelligence',
    path: '/intelligence',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14Z" />
      </svg>
    ),
  },
  {
    label: 'Folders',
    path: '/folders',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Tags',
    path: '/tags',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="h-[calc(100vh-64px)] w-spacing-xl fixed left-0 top-16 border-r border-white/5 bg-surface-container-lowest flex flex-col py-grid-margin z-40">
      <nav className="flex-1 flex flex-col gap-xs px-base">
        {navItems.map(({ label, path, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={[
              'flex items-center gap-base py-sm px-md text-left transition-all duration-300 w-full',
              isActive(path)
                ? 'bg-primary-container/10 text-primary border-r-2 border-primary translate-x-1'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
            ].join(' ')}
          >
            {icon}
            <span className="font-label-caps text-label-caps">{label}</span>
          </button>
        ))}

        {/* Settings at bottom */}
        <div className="pt-lg mt-lg border-t border-white/5">
          <button
            onClick={() => {}}
            className="flex items-center gap-base text-on-surface-variant py-sm px-md hover:bg-surface-container-high hover:text-on-surface transition-all duration-300 w-full"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-label-caps text-label-caps">Settings</span>
          </button>
        </div>
      </nav>

      {/* Upgrade CTA */}
      <div className="px-md mt-auto">
        <div className="glass-panel p-sm rounded-xl border border-primary/20">
          <p className="text-[10px] font-label-caps text-primary mb-xs tracking-widest uppercase">Pro Feature</p>
          <p className="text-xs text-on-surface mb-sm leading-relaxed">Connect 100+ sources with Cortex Pro.</p>
          <button className="w-full py-xs bg-primary/10 border border-primary text-primary text-xs font-bold rounded hover:bg-primary hover:text-on-primary transition-colors font-label-caps">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>
  )
}