import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastCtx = createContext(null)

const CONFIGS = {
  success: { icon: '✓', cls: 'border-carbon-500 bg-carbon-800 text-carbon-100', bar: 'bg-coral-500' },
  error:   { icon: '✕', cls: 'border-red-500/30 bg-carbon-800 text-red-400', bar: 'bg-red-500' },
  info:    { icon: 'i', cls: 'border-carbon-500 bg-carbon-800 text-carbon-100', bar: 'bg-coral-500' },
}

let _id = 0

function ToastItem({ id, message, type = 'info', onDismiss }) {
  const cfg = CONFIGS[type]
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4200)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <div className={[
      'relative flex items-start gap-3 px-4 py-4 rounded-xl border overflow-hidden',
      'shadow-panel min-w-[300px] max-w-sm animate-slide-up',
      'text-sm font-medium',
      cfg.cls,
    ].join(' ')}>
      <span className="font-display font-bold shrink-0">{cfg.icon}</span>
      <p className="flex-1 leading-snug text-carbon-100">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 text-carbon-400 hover:text-white transition-colors text-lg leading-none"
      >×</button>
      <div
        className={`absolute bottom-0 left-0 h-[3px] ${cfg.bar} opacity-80`}
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
        <div className="fixed bottom-5 right-5 z-[9000] flex flex-col gap-3 items-end">
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