import React from 'react'

interface ModernGlassPanelProps {
  children: React.ReactNode
  className?: string
  icon?: React.ElementType
  title?: string
  description?: string
}

export const ModernGlassPanel: React.FC<ModernGlassPanelProps> = ({
  children,
  className = '',
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className={`glass dark:glass-dark rounded-2xl p-8 backdrop-blur-xl animate-fadeInUp ${className}`}>
      {(Icon || title) && (
        <div className="flex items-center gap-4 mb-6">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            {title && <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>}
            {description && <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
