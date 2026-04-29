import { forwardRef } from 'react'

const variants = {
  primary: [
    'bg-coral-500 text-white font-semibold',
    'hover:bg-coral-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  secondary: [
    'bg-transparent text-carbon-100 font-medium',
    'border border-carbon-500 hover:border-carbon-400 hover:bg-carbon-800',
    'disabled:opacity-40',
  ].join(' '),
  ghost: [
    'text-carbon-200 hover:text-white hover:bg-carbon-800',
    'disabled:opacity-40',
  ].join(' '),
  danger: [
    'bg-transparent text-red-500 border border-red-500/30',
    'hover:bg-red-500/10 hover:border-red-500',
    'disabled:opacity-40',
  ].join(' '),
  outline: [
    'bg-transparent border border-carbon-500 text-carbon-100 font-medium',
    'hover:bg-carbon-800 hover:border-carbon-400',
    'disabled:opacity-40',
  ].join(' '),
}

const sizes = {
  xs: 'px-2.5 py-1.5  text-xs  rounded-lg  gap-1.5',
  sm: 'px-3   py-2    text-sm  rounded-lg  gap-2',
  md: 'px-5   py-2.5  text-sm  rounded-xl  gap-2',
  lg: 'px-6   py-3    text-sm  rounded-xl  gap-2',
  xl: 'px-8   py-4    text-base rounded-xl gap-2.5',
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
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500/50',
      'active:scale-[0.98] select-none cursor-pointer',
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