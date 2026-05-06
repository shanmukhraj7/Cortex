import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, hint, leftIcon, rightIcon, className = '', containerClassName = '', ...props }, ref) => (
  <div className={`flex flex-col gap-xs ${containerClassName}`}>
    {label && (
      <label className="text-[10px] font-label-caps text-on-surface-variant/80 uppercase tracking-widest">
        {label}
      </label>
    )}
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="absolute left-sm text-on-surface-variant pointer-events-none z-10">{leftIcon}</span>
      )}
      <input
        ref={ref}
        className={[
          'w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50',
          'border rounded px-sm py-sm text-body-md',
          'transition-all duration-200',
          'focus:outline-none focus:ring-0',
          error
            ? 'border-error/50 focus:border-error'
            : 'border-white/10 hover:border-white/20 focus:border-primary focus:border-2',
          leftIcon  ? 'pl-10' : '',
          rightIcon ? 'pr-10' : '',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-sm text-on-surface-variant">{rightIcon}</span>
      )}
    </div>
    {error && <p className="text-xs text-error font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-on-surface-variant/60">{hint}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input