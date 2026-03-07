import React from 'react'

interface ModernGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const columnMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const gapMap = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export const ModernGrid: React.FC<ModernGridProps> = ({
  children,
  columns = 3,
  gap = 'lg',
}) => {
  return (
    <div className={`grid ${columnMap[columns]} ${gapMap[gap]}`}>
      {children}
    </div>
  )
}
