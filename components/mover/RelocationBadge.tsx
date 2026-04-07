'use client'

import { cn } from '@/lib/utils'
import { isRelocationReady } from '@/lib/utils/reputationAlgorithm'

interface Props {
  targetRelocationCity?: string
  completionRate: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function RelocationBadge({ targetRelocationCity, completionRate, size = 'md', className }: Props) {
  const isReady = isRelocationReady(targetRelocationCity, completionRate)

  if (!targetRelocationCity) return null

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }

  if (!isReady) {
    return (
      <div className={cn(
        'inline-flex items-center rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
        sizeClasses[size],
        className
      )}>
        <span>✈️</span>
        <span>Targeting {targetRelocationCity}</span>
        <span className="text-xs opacity-60">({completionRate}% / 80% needed)</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-semibold',
      'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm',
      sizeClasses[size],
      className
    )}>
      <span>🏅</span>
      <span>Relocation Ready</span>
      <span className="opacity-80">→ {targetRelocationCity}</span>
    </div>
  )
}
