'use client'

import { Star, MessageSquare, BarChart2 } from 'lucide-react'
import RatingStars from './RatingStars'
import { formatRating, getRatingLabel, getRatingColor } from '@/lib/reviews/service'
import { cn } from '@/lib/utils'
import type { ReviewAggregates } from '@/types'

interface ReviewStatsProps {
  aggregates: ReviewAggregates
  className?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  communication: 'Communication',
  quality: 'Quality',
  timeliness: 'Timeliness',
  professionalism: 'Professionalism',
}

export default function ReviewStats({ aggregates, className }: ReviewStatsProps) {
  const { totalReviews, averageRating, ratingDistribution, categoryAverages, responseRate } = aggregates

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall score */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className={cn('text-5xl font-extrabold tabular-nums', getRatingColor(averageRating))}>
            {formatRating(averageRating)}
          </p>
          <RatingStars rating={averageRating} size="md" className="justify-center mt-1" />
          <p className="text-sm text-gray-500 mt-1">{getRatingLabel(averageRating)}</p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[String(star)] ?? 0
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-right text-gray-500">{star}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${star} star: ${pct}%`}
                  />
                </div>
                <span className="w-8 text-gray-500 tabular-nums">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{totalReviews}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Reviews</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{responseRate}%</p>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Response Rate</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <BarChart2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <p className={cn('text-xl font-bold tabular-nums', getRatingColor(averageRating))}>
              {formatRating(averageRating)}
            </p>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">Avg. Rating</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category Breakdown</h3>
        <div className="space-y-2">
          {(Object.keys(CATEGORY_LABELS) as (keyof typeof categoryAverages)[]).map((key) => {
            const value = categoryAverages[key] ?? 0
            const pct = (value / 5) * 100
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-32 text-xs text-gray-600 dark:text-gray-400 truncate">
                  {CATEGORY_LABELS[key]}
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={`${CATEGORY_LABELS[key]}: ${value} out of 5`}
                  />
                </div>
                <span className="w-8 text-xs font-medium text-gray-700 dark:text-gray-300 tabular-nums text-right">
                  {value.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
