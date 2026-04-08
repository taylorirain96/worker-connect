'use client'

import RatingStars from './RatingStars'
import { cn } from '@/lib/utils'
import type { CategoryRatings } from '@/types'

const CATEGORY_LABELS: Record<keyof CategoryRatings, string> = {
  communication: 'Communication',
  quality: 'Quality',
  timeliness: 'Timeliness',
  professionalism: 'Professionalism',
}

interface CategoryRatingProps {
  /** Existing scores to display (read-only mode) */
  values?: Partial<CategoryRatings>
  /** Interactive mode – called when a category rating changes */
  onChange?: (key: keyof CategoryRatings, value: number) => void
  interactive?: boolean
  compact?: boolean
  className?: string
}

export default function CategoryRating({
  values = {},
  onChange,
  interactive = false,
  compact = false,
  className,
}: CategoryRatingProps) {
  const categories = Object.keys(CATEGORY_LABELS) as (keyof CategoryRatings)[]

  if (compact) {
    // Display-only compact bar view
    return (
      <div className={cn('space-y-1.5', className)}>
        {categories.map((cat) => {
          const score = values[cat] ?? 0
          const pct = (score / 5) * 100
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">
                {CATEGORY_LABELS[cat]}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-yellow-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-7 text-right">
                {score > 0 ? score.toFixed(1) : '—'}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {categories.map((cat) => {
        const score = values[cat] ?? 0
        return (
          <div key={cat} className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300 w-28 shrink-0">
              {CATEGORY_LABELS[cat]}
            </span>
            {interactive ? (
              <RatingStars
                rating={score}
                interactive
                onRate={(v) => onChange?.(cat, v)}
                size="sm"
              />
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                  {score > 0 ? score.toFixed(1) : '—'}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
