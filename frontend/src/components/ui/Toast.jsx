import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastCtx = createContext(null)

const CONFIGS = {
  success: { cls: 'border-primary/30 bg-surface-container-low',   bar: 'bg-primary',   icon: '✓', iconCls: 'text-primary' },
  error:   { cls: 'border-error/30 bg-surface-container-low',     bar: 'bg-error',     icon: '✕', iconCls: 'text-error' },
  info:    { cls: 'border-secondary/30 bg-surface-container-low', bar: 'bg-secondary', icon: 'i', iconCls: 'text-secondary' },
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
      'relative flex items-start gap-sm px-md py-sm rounded-xl border overflow-hidden',
      'shadow-panel min-w-[300px] max-w-sm animate-slide-up',
      'text-sm font-medium glass-panel',
      cfg.cls,
    ].join(' ')}>
      <span className={`font-code font-bold shrink-0 text-base ${cfg.iconCls}`}>{cfg.icon}</span>
      <p className="flex-1 leading-snug text-on-surface text-body-md">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors text-lg leading-none"
      >×</button>
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${cfg.bar} opacity-70`}
        style={{ animation: 'toastProgress 4.2s linear forwards' }}
      />
      <style>{`@keyframes toastProgress { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, type = 'info') => {
    setToasts(p => [...p, { id: ++_id, message, type }])
  }, [])
  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  return (
    <ToastCtx.Provider value={add}>
      {children}
      {createPortal(
        <div className="fixed bottom-md right-md z-[9000] flex flex-col gap-sm items-end">
          {toasts.map(t => <ToastItem key={t.id} {...t} onDismiss={dismiss} />)}
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