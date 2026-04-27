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
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        <div className={[
          'relative w-full bg-zinc-900 border border-zinc-700/60',
          'rounded-2xl shadow-panel flex flex-col max-h-[90dvh] animate-slide-up',
          sizes[size], className,
        ].join(' ')}>
          {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
                <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest">{title}</h2>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all text-lg"
                >×</button>
              </div>
          )}
          <div className="overflow-y-auto flex-1">{children}</div>
        </div>
      </div>,
      document.body,
  )
}