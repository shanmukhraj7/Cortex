import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-4xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const fn = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-carbon-950/80 backdrop-blur-sm" />

      {/* Modal panel */}
      <div className={[
        'relative w-full bg-carbon-900 rounded-2xl shadow-panel flex flex-col max-h-[90dvh] animate-slide-up',
        'border border-carbon-500/50',
        sizes[size], className,
      ].join(' ')}>
        
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-carbon-500/30 shrink-0">
            <h2 className="font-display text-sm uppercase tracking-[0.1em] text-carbon-50">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-carbon-400 hover:text-white hover:bg-carbon-800 transition-colors text-lg"
            >×</button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  )
}