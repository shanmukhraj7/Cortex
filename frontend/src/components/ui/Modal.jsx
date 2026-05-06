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
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-md animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />

      {/* Modal panel */}
      <div className={[
        'relative w-full glass-panel-strong rounded-xl shadow-panel flex flex-col max-h-[90dvh] animate-slide-up',
        'border border-white/10',
        sizes[size], className,
      ].join(' ')}>
        {/* Synapse accent line at top */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {title && (
          <div className="flex items-center justify-between px-md py-sm border-b border-white/5 shrink-0">
            <h2 className="font-label-caps text-label-caps tracking-widest text-on-surface uppercase">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-lg"
            >×</button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-sm right-sm w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors z-10"
          >×</button>
        )}

        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  )
}