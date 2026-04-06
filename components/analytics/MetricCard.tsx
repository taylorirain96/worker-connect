'use client'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: number          // positive = up, negative = down, 0/undefined = neutral
  trendLabel?: string
  iconBg?: string
  iconColor?: string
  className?: string
}

export default function MetricCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  iconBg = 'bg-primary-100 dark:bg-primary-900/30',
  iconColor = 'text-primary-600',
  className,
}: MetricCardProps) {
  const hasTrend = trend !== undefined && trend !== null
  const trendPositive = hasTrend && trend! > 0
  const trendNegative = hasTrend && trend! < 0

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5',
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <span className={iconColor}>{icon}</span>
          </div>
        )}
      </div>

      {hasTrend && (
        <div className="mt-3 flex items-center gap-1.5">
          {trendPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : trendNegative ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className={cn(
            'text-xs font-medium',
            trendPositive ? 'text-emerald-600 dark:text-emerald-400' :
            trendNegative ? 'text-red-600 dark:text-red-400' :
            'text-gray-400'
          )}>
            {trend! > 0 ? '+' : ''}{trend!.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
