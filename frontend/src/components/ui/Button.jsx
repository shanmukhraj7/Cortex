import { forwardRef } from 'react'

const variants = {
  primary: 'bg-primary text-on-primary hover:brightness-110 disabled:opacity-50',
  secondary: 'bg-transparent text-on-surface border border-white/15 hover:bg-white/5 hover:border-white/25 disabled:opacity-40',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high disabled:opacity-40',
  danger: 'bg-transparent text-error border border-error/30 hover:bg-error-container/20 hover:border-error/50 disabled:opacity-40',
  outline: 'bg-transparent border border-white/15 text-on-surface hover:bg-surface-container-high hover:border-white/25 disabled:opacity-40',
  'primary-ghost': 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 disabled:opacity-40',
}

const sizes = {
  xs: 'px-xs py-[4px]  text-[11px] rounded     gap-xs',
  sm: 'px-sm py-xs    text-label-caps rounded     gap-xs',
  md: 'px-md py-xs    text-label-caps rounded-lg  gap-sm',
  lg: 'px-md py-sm    text-body-md    rounded-full gap-sm',
  xl: 'px-lg py-md    text-body-lg    rounded-full gap-sm',
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
      'inline-flex items-center justify-center transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      'active:scale-[0.97] select-none cursor-pointer font-label-caps',
      'disabled:cursor-not-allowed disabled:pointer-events-none',
      variants[variant], sizes[size], className,
    ].join(' ')}
    {...props}
  >
    {isLoading ? (
      <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
      </svg>
    ) : leftIcon}
    {children}
    {!isLoading && rightIcon}
  </button>
))
Button.displayName = 'Button'
export default Button