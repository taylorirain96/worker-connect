'use client'

import { useMemo } from 'react'
import { Star, MapPin, Zap, Target } from 'lucide-react'

interface MatchScoreProps {
  score: number
  reasons?: string[]
  size?: 'sm' | 'md' | 'lg'
  showReasons?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 67) return 'text-indigo-300 dark:text-indigo-300'
  if (score >= 34) return 'text-indigo-400 dark:text-indigo-400'
  return 'text-slate-400 dark:text-slate-400'
}

const SCORE_BG = 'bg-indigo-500/15 dark:bg-indigo-500/15 border-indigo-500/30 dark:border-indigo-500/30'

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Match'
  if (score >= 75) return 'Great Match'
  if (score >= 67) return 'Good Match'
  if (score >= 50) return 'Fair Match'
  if (score >= 34) return 'Partial Match'
  return 'Low Match'
}

function getReasonIcon(reason: string) {
  if (reason.toLowerCase().includes('skill')) return <Star className="h-3 w-3" />
  if (reason.toLowerCase().includes('location') || reason.toLowerCase().includes('km'))
    return <MapPin className="h-3 w-3" />
  if (reason.toLowerCase().includes('mover')) return <Target className="h-3 w-3" />
  return <Zap className="h-3 w-3" />
}

export default function MatchScore({
  score,
  reasons = [],
  size = 'md',
  showReasons = false,
}: MatchScoreProps) {
  const scoreColor = useMemo(() => getScoreColor(score), [score])
  const label = useMemo(() => getScoreLabel(score), [score])

  const sizeClasses = {
    sm: { container: 'px-2 py-1', score: 'text-lg font-bold', label: 'text-xs', bar: 'h-1' },
    md: { container: 'px-3 py-2', score: 'text-2xl font-bold', label: 'text-xs', bar: 'h-1.5' },
    lg: { container: 'px-4 py-3', score: 'text-3xl font-bold', label: 'text-sm', bar: 'h-2' },
  }

  const cls = sizeClasses[size]

  return (
    <div className="space-y-2">
      {/* Score Badge */}
      <div className={`inline-flex flex-col items-center rounded-lg border ${SCORE_BG} ${cls.container}`}>
        <span className={`${cls.score} ${scoreColor} leading-tight`}>{score}</span>
        <span className={`${cls.label} font-medium ${scoreColor}`}>{label}</span>
      </div>

      {/* Progress Bar */}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${cls.bar}`}>
        <div
          className={`${cls.bar} rounded-full transition-all duration-500 ${
            score >= 67
              ? 'bg-indigo-400'
              : score >= 34
              ? 'bg-indigo-500'
              : 'bg-slate-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Match Reasons (Tooltip-style list) */}
      {showReasons && reasons.length > 0 && (
        <ul className="space-y-1">
          {reasons.slice(0, 5).map((reason, i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
            >
              <span className="flex-shrink-0 text-gray-400">{getReasonIcon(reason)}</span>
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
