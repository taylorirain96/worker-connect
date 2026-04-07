'use client'

import { cn } from '@/lib/utils'
import type { ReputationScore } from '@/types/reputation'
import { SCORING_WEIGHTS } from '@/lib/utils/reputationAlgorithm'

const FACTORS = [
  {
    key: 'completionRate' as const,
    label: 'Contract Completion Rate',
    icon: '✅',
    weight: SCORING_WEIGHTS.completionRate,
    color: 'bg-green-500',
  },
  {
    key: 'rating' as const,
    label: 'Average Rating',
    icon: '⭐',
    weight: SCORING_WEIGHTS.rating,
    color: 'bg-yellow-500',
  },
  {
    key: 'verification' as const,
    label: 'Verification Level',
    icon: '🛡️',
    weight: SCORING_WEIGHTS.verification,
    color: 'bg-blue-500',
  },
  {
    key: 'responseTime' as const,
    label: 'Response Time',
    icon: '⚡',
    weight: SCORING_WEIGHTS.responseTime,
    color: 'bg-purple-500',
  },
  {
    key: 'portfolio' as const,
    label: 'Portfolio Quality',
    icon: '📸',
    weight: SCORING_WEIGHTS.portfolio,
    color: 'bg-pink-500',
  },
]

interface Props {
  score: ReputationScore
  className?: string
}

export default function ReputationBreakdown({ score, className }: Props) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Score Breakdown</h3>
      <ul className="space-y-4">
        {FACTORS.map(({ key, label, icon, weight, color }) => {
          const rawScore = score.components[key]
          const weighted = rawScore * weight

          return (
            <li key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{(weight * 100).toFixed(0)}% weight</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-10 text-right">
                    {weighted.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full transition-all duration-500', color)}
                  style={{ width: `${Math.min(rawScore, 100)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Score</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{score.overallScore}</span>
      </div>
    </div>
  )
}
