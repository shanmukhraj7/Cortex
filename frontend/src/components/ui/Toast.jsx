import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastCtx = createContext(null)

const CONFIGS = {
  success: { icon: '✓', bg: 'border-emerald-500/30 bg-emerald-500/8', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  error:   { icon: '✕', bg: 'border-red-500/30 bg-red-500/8',         text: 'text-red-400',    bar: 'bg-red-500' },
  info:    { icon: '○', bg: 'border-amber-400/30 bg-amber-400/8',      text: 'text-amber-400',  bar: 'bg-amber-400' },
}

let _id = 0

function ToastItem({ id, message, type = 'info', onDismiss }) {
  const cfg = CONFIGS[type]
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4200)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
      <div
          className={[
            'relative flex items-start gap-3 px-4 py-3 rounded-xl border overflow-hidden',
            'shadow-panel min-w-[300px] max-w-sm animate-slide-in-r',
            'backdrop-blur-md text-zinc-200 text-sm',
            cfg.bg,
          ].join(' ')}
      >
        <span className={`mt-0.5 font-mono text-base font-bold shrink-0 ${cfg.text}`}>{cfg.icon}</span>
        <p className="flex-1 leading-snug">{message}</p>
        <button
            onClick={() => onDismiss(id)}
            className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
        >×</button>
        {/* progress bar */}
        <div
            className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} opacity-60`}
            style={{ animation: 'toastProgress 4.2s linear forwards' }}
        />
        <style>{`@keyframes toastProgress { from { width: 100% } to { width: 0% } }`}</style>
      </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, type = 'info') => {
    setToasts((p) => [...p, { id: ++_id, message, type }])
  }, [])
  const dismiss = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), [])

  return (
      <ToastCtx.Provider value={add}>
        {children}
        {createPortal(
            <div className="fixed bottom-5 right-5 z-[9000] flex flex-col gap-2 items-end">
              {toasts.map((t) => <ToastItem key={t.id} {...t} onDismiss={dismiss} />)}
            </div>,
            document.body,
        )}
      </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast outside ToastProvider')
  return {
    success: (m) => ctx(m, 'success'),
    error:   (m) => ctx(m, 'error'),
    info:    (m) => ctx(m, 'info'),
  }
}