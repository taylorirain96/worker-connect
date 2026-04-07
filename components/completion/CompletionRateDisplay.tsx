'use client'

import { cn } from '@/lib/utils'
import {
  getCompletionRateLabel,
  getCompletionRateColor,
  classifyWorker,
} from '@/lib/utils/completionRateCalc'

interface Props {
  completionRate: number
  completedContracts: number
  totalContracts: number
  size?: 'sm' | 'md' | 'lg'
  showClassification?: boolean
  className?: string
}

export default function CompletionRateDisplay({
  completionRate,
  completedContracts,
  totalContracts,
  size = 'md',
  showClassification = true,
  className,
}: Props) {
  const label = getCompletionRateLabel(completionRate)
  const colorClass = getCompletionRateColor(completionRate)
  const classification = classifyWorker(completionRate)

  const classificationConfig = {
    Pro: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', icon: '🏆' },
    Reliable: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', icon: '✅' },
    Average: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', icon: '📊' },
    'Job-Hopper': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', icon: '⚠️' },
  }
  const classConf = classificationConfig[classification]

  const fontSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center', className)}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Contract Completion Rate
      </p>

      <p className={cn('font-bold leading-none', fontSizes[size], colorClass)}>
        {completionRate}%
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-700',
            completionRate >= 95 ? 'bg-green-500' :
            completionRate >= 85 ? 'bg-emerald-500' :
            completionRate >= 75 ? 'bg-yellow-500' :
            completionRate >= 60 ? 'bg-orange-500' : 'bg-red-500'
          )}
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Contract count */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {completedContracts} of {totalContracts} contracts completed
      </p>

      {/* Classification */}
      {showClassification && (
        <div className={cn('inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold', classConf.bg, classConf.text)}>
          <span>{classConf.icon}</span>
          <span>{classification}</span>
        </div>
      )}
    </div>
  )
}
