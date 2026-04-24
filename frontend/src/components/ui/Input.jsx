import { forwardRef } from 'react'

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={[
              'w-full bg-surface-800 border text-slate-100 placeholder-slate-500',
              'rounded-lg px-3.5 py-2.5 text-sm',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              error
                ? 'border-red-500/60 focus:ring-red-500/40 focus:border-red-500'
                : 'border-surface-200/10 hover:border-surface-200/20',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            ].join(' ')}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-500">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input