import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface ModernStatCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: number
  trendLabel?: string
  icon?: React.ElementType
  description?: string
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  variant?: 'default' | 'glass' | 'gradient'
}

const colorMap = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300',
  emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-300',
  amber: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300',
  rose: 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 text-rose-700 dark:text-rose-300',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-700 dark:text-purple-300',
}

const iconColorMap = {
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  rose: 'text-rose-600 dark:text-rose-400',
  purple: 'text-purple-600 dark:text-purple-400',
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendLabel,
  icon: Icon,
  description,
  color = 'blue',
  variant = 'default',
}) => {
  const isPositive = trend ? trend > 0 : false

  if (variant === 'glass') {
    return (
      <div className="glass rounded-2xl p-6 backdrop-blur-xl animate-fadeInUp">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {label}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
              </p>
              {unit && <span className="text-sm text-slate-500 dark:text-slate-400">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            )}
          </div>
          {Icon && <Icon className={`w-6 h-6 ${iconColorMap[color]}`} />}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-4">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {Math.abs(trend)}% {trendLabel || (isPositive ? 'increase' : 'decrease')}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <div className="bg-gradient-brand rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp hover-lift">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
              {label}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
              </p>
              {unit && <span className="text-sm text-white/70">{unit}</span>}
            </div>
          </div>
          {Icon && <Icon className="w-6 h-6 text-white/80" />}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeInUp`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-70 uppercase tracking-wide">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {value}
            </p>
            {unit && <span className="text-sm opacity-70">{unit}</span>}
          </div>
          {description && (
            <p className="text-xs opacity-70 mt-1">{description}</p>
          )}
        </div>
        {Icon && <Icon className={`w-6 h-6 ${iconColorMap[color]} opacity-80`} />}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-4">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {Math.abs(trend)}% {trendLabel || (isPositive ? 'increase' : 'decrease')}
          </span>
        </div>
      )}
    </div>
  )
}
