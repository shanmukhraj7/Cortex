import { forwardRef } from 'react'

const Textarea = forwardRef(({ label, error, hint, className = '', containerClassName = '', ...props }, ref) => (
  <div className={`flex flex-col gap-xs ${containerClassName}`}>
    {label && (
      <label className="text-[10px] font-label-caps text-on-surface-variant/80 uppercase tracking-widest">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={[
        'w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50',
        'border rounded px-sm py-sm text-body-md resize-none',
        'transition-all duration-200',
        'focus:outline-none focus:ring-0',
        error
          ? 'border-error/50 focus:border-error'
          : 'border-white/10 hover:border-white/20 focus:border-primary focus:border-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
      {...props}
    />
    {error && <p className="text-xs text-error font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-on-surface-variant/60">{hint}</p>}
  </div>
))
Textarea.displayName = 'Textarea'
export default Textarea