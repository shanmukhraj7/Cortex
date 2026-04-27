import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, hint, leftIcon, rightIcon, className = '', containerClassName = '', ...props }, ref) => (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                {label}
            </label>
        )}
        <div className="relative flex items-center">
            {leftIcon && (
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none z-10">{leftIcon}</span>
            )}
            <input
                ref={ref}
                className={[
                    'w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600',
                    'border rounded-lg px-3.5 py-2.5 text-sm',
                    'transition-all duration-150',
                    'focus:outline-none amber-glow focus:border-amber-400/60',
                    error
                        ? 'border-red-500/50 focus:border-red-500/80'
                        : 'border-zinc-700/60 hover:border-zinc-600',
                    leftIcon  ? 'pl-10' : '',
                    rightIcon ? 'pr-10' : '',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    className,
                ].join(' ')}
                {...props}
            />
            {rightIcon && (
                <span className="absolute right-3.5 text-zinc-500">{rightIcon}</span>
            )}
        </div>
        {error && <p className="text-xs text-red-400 flex items-center gap-1"><span>⚠</span>{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
))
Input.displayName = 'Input'
export default Input