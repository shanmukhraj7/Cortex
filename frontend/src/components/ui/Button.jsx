import { forwardRef } from 'react'

const variants = {
    primary: [
        'bg-amber-400 text-zinc-950 font-semibold',
        'hover:bg-amber-300 active:bg-amber-500',
        'shadow-glow-sm hover:shadow-glow-amber',
        'disabled:bg-amber-400/40 disabled:text-zinc-800',
    ].join(' '),
    secondary: [
        'bg-zinc-800 text-zinc-200 font-medium',
        'border border-zinc-700 hover:border-zinc-600',
        'hover:bg-zinc-750 active:bg-zinc-900',
        'disabled:opacity-40',
    ].join(' '),
    ghost: [
        'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
        'disabled:opacity-40',
    ].join(' '),
    danger: [
        'bg-red-500/10 text-red-400 border border-red-500/25',
        'hover:bg-red-500/20 active:bg-red-500/30',
        'disabled:opacity-40',
    ].join(' '),
    amber_outline: [
        'border border-amber-400/40 text-amber-400',
        'hover:bg-amber-400/10 hover:border-amber-400/70',
        'disabled:opacity-40',
    ].join(' '),
}

const sizes = {
    xs: 'px-2.5 py-1    text-xs  rounded-md  gap-1.5',
    sm: 'px-3   py-1.5  text-sm  rounded-lg  gap-2',
    md: 'px-4   py-2    text-sm  rounded-lg  gap-2',
    lg: 'px-5   py-2.5  text-sm  rounded-xl  gap-2',
    xl: 'px-6   py-3    text-base rounded-xl gap-2.5',
}

const Button = forwardRef(({
                               children, variant = 'primary', size = 'md',
                               isLoading = false, leftIcon, rightIcon,
                               className = '', disabled, ...props
                           }, ref) => (
    <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
            'inline-flex items-center justify-center transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
            'active:scale-[0.97] select-none cursor-pointer',
            'disabled:cursor-not-allowed disabled:pointer-events-none',
            variants[variant], sizes[size], className,
        ].join(' ')}
        {...props}
    >
        {isLoading ? (
            <svg className="animate-spin-slow h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
            </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
    </button>
))
Button.displayName = 'Button'
export default Button