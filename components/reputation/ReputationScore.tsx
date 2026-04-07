'use client'

import { cn } from '@/lib/utils'
import type { ReputationScore, ReputationTier } from '@/types/reputation'

const TIER_CONFIG: Record<ReputationTier, { color: string; bg: string; label: string }> = {
  Rookie: { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', label: '🌱 Rookie' },
  Professional: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: '💼 Professional' },
  Expert: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', label: '🏅 Expert' },
  Master: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: '👑 Master' },
}

interface Props {
  score: ReputationScore
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ReputationScore({ score, size = 'md', className }: Props) {
  const tierConf = TIER_CONFIG[score.tier]
  const circumference = 2 * Math.PI * 44
  const offset = circumference - (score.overallScore / 100) * circumference

  const gaugeSize = size === 'sm' ? 80 : size === 'lg' ? 140 : 110

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6', className)}>
      <div className="flex flex-col items-center gap-4">
        {/* Circular gauge */}
        <div className="relative" style={{ width: gaugeSize, height: gaugeSize }}>
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-100 dark:text-gray-700"
            />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn(
                'transition-all duration-700',
                score.overallScore >= 86 ? 'stroke-amber-500' :
                score.overallScore >= 71 ? 'stroke-purple-500' :
                score.overallScore >= 41 ? 'stroke-blue-500' :
                'stroke-gray-400'
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              'font-bold leading-none',
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-3xl'
            )}>
              {score.overallScore}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">/100</span>
          </div>
        </div>

        {/* Tier badge */}
        <span className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
          tierConf.bg, tierConf.color
        )}>
          {tierConf.label}
        </span>

        {/* Quick stats */}
        {size !== 'sm' && (
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            <Stat label="Completion" value={`${score.completionRate}%`} />
            <Stat label="Avg Rating" value={score.averageRating.toFixed(1)} />
            <Stat label="Verification" value={`${score.verificationLevel}/5`} />
            <Stat label="Response" value={`${score.responseTime}h`} />
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  )
}
