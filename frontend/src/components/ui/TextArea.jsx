import { forwardRef } from 'react'

const Textarea = forwardRef(({ label, error, hint, className = '', containerClassName = '', ...props }, ref) => (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{label}</label>
        )}
        <textarea
            ref={ref}
            className={[
                'w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600',
                'border rounded-lg px-3.5 py-2.5 text-sm resize-none',
                'transition-all duration-150',
                'focus:outline-none amber-glow focus:border-amber-400/60',
                error
                    ? 'border-red-500/50 focus:border-red-500/80'
                    : 'border-zinc-700/60 hover:border-zinc-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className,
            ].join(' ')}
            {...props}
        />
        {error && <p className="text-xs text-red-400">⚠ {error}</p>}
        {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
))
Textarea.displayName = 'Textarea'
export default Textarea