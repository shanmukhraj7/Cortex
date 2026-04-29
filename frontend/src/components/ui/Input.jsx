import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, hint, leftIcon, rightIcon, className = '', containerClassName = '', ...props }, ref) => (
  <div className={`flex flex-col gap-2 ${containerClassName}`}>
    {label && (
      <label className="text-[10px] font-bold text-carbon-200 uppercase tracking-[0.15em]">
        {label}
      </label>
    )}
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="absolute left-3.5 text-carbon-400 pointer-events-none z-10">{leftIcon}</span>
      )}
      <input
        ref={ref}
        className={[
          'w-full bg-carbon-800 text-carbon-50 placeholder-carbon-400',
          'border rounded-xl px-4 py-3 text-sm',
          'transition-all duration-200',
          'focus:outline-none',
          error
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-carbon-500 hover:border-carbon-400 focus:border-coral-500',
          leftIcon  ? 'pl-10' : '',
          rightIcon ? 'pr-10' : '',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3.5 text-carbon-400">{rightIcon}</span>
      )}
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-carbon-400">{hint}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input