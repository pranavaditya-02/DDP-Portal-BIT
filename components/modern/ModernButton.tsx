import React from 'react'

interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

const variants = {
  primary:
    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border-0',
  secondary:
    'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 border-0',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600',
  glass:
    'glass rounded-xl text-slate-900 dark:text-slate-100 hover:shadow-lg border-0',
  outline:
    'bg-transparent text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950',
  danger:
    'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl border-0',
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = `${sizeMap[size]} ${variants[variant]} rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 inline-flex items-center justify-center gap-2 hover-scale`

  const finalClassName = `${baseStyles} ${fullWidth ? 'w-full' : ''} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`

  return (
    <button
      disabled={disabled || loading}
      className={finalClassName}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </button>
  )
}
