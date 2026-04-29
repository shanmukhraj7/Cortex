import { forwardRef } from 'react'

const Textarea = forwardRef(({ label, error, hint, className = '', containerClassName = '', ...props }, ref) => (
  <div className={`flex flex-col gap-2 ${containerClassName}`}>
    {label && (
      <label className="text-[10px] font-bold text-carbon-200 uppercase tracking-[0.15em]">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={[
        'w-full bg-carbon-800 text-carbon-50 placeholder-carbon-400',
        'border rounded-xl px-4 py-3 text-sm resize-none',
        'transition-all duration-200',
        'focus:outline-none',
        error
          ? 'border-red-500/50 focus:border-red-500'
          : 'border-carbon-500 hover:border-carbon-400 focus:border-coral-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
      {...props}
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-carbon-400">{hint}</p>}
  </div>
))
Textarea.displayName = 'Textarea'
export default Textarea