import React from 'react'

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'glass' | 'gradient' | 'neumorphic'
  hover?: boolean
  animated?: boolean
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
  hover = true,
  animated = true,
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300'
  const hoverStyles = hover ? 'hover-lift hover:shadow-card-hover' : ''
  const animationStyles = animated ? 'animate-fadeInUp' : ''

  const variants = {
    default: 'card-modern',
    glass: 'card-modern-glass',
    gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl',
    neumorphic: 'neumorphic',
  }

  const combinedStyles = `${baseStyles} ${variants[variant]} ${hoverStyles} ${animationStyles} ${className}`

  return (
    <div onClick={onClick} className={combinedStyles}>
      {children}
    </div>
  )
}
