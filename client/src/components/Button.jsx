import React from 'react'
import { cn } from '../utils/cn'

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'bg-error text-white hover:bg-error/90 focus:ring-error',
    success: 'bg-success text-white hover:bg-success/90 focus:ring-success',
    warning: 'bg-warning text-white hover:bg-warning/90 focus:ring-warning',
  }
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'h-10 px-4 py-2',
    lg: 'btn-lg',
    xl: 'h-12 px-10 text-base',
  }

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  )

  const renderIcon = () => {
    if (!icon) return null
    
    const iconClasses = cn(
      'flex-shrink-0',
      size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
      iconPosition === 'right' ? 'ml-2' : 'mr-2'
    )

    return React.cloneElement(icon, { className: iconClasses })
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className={cn(
          'loading-spinner mr-2',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      )}
      {!loading && icon && iconPosition === 'left' && renderIcon()}
      {children}
      {!loading && icon && iconPosition === 'right' && renderIcon()}
    </button>
  )
})

Button.displayName = 'Button'

export default Button 