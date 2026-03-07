import React from 'react'

interface ModernSectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ElementType
}

export const ModernSectionHeader: React.FC<ModernSectionHeaderProps> = ({
  title,
  description,
  action,
  icon: Icon,
}) => {
  return (
    <div className="flex items-start justify-between mb-8 animate-fadeInUp">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {description && (
            <p className="text-slate-600 dark:text-slate-400 mt-2">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
