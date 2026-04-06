'use client'

import { Star, TrendingUp, MessageSquare, Users } from 'lucide-react'
import RatingStars from './RatingStars'
import { formatRating, getRatingLabel, getRatingColor } from '@/lib/reviews/service'
import type { ReviewAggregates } from '@/types'

interface ReviewStatsProps {
  aggregates: ReviewAggregates
  className?: string
}

export default function ReviewStats({ aggregates, className = '' }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(aggregates.ratingDistribution).map(Number), 1)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall score */}
        <div className="flex flex-col items-center justify-center gap-3">
          <p className={`text-6xl font-extrabold tabular-nums ${getRatingColor(aggregates.averageRating)}`}>
            {formatRating(aggregates.averageRating)}
          </p>
          <RatingStars rating={aggregates.averageRating} size="lg" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {getRatingLabel(aggregates.averageRating)}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>
              {aggregates.totalReviews} review{aggregates.totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Star distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = Number(aggregates.ratingDistribution[String(star)] ?? 0)
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2" aria-label={`${star} star: ${count} reviews`}>
                <div className="flex items-center gap-1 w-10 shrink-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{star}</span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </div>
                <div
                  className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right tabular-nums">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category averages + response rate */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category scores */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            Category Scores
          </h3>
          <div className="space-y-2">
            {(
              [
                ['Communication', aggregates.categoryAverages.communication],
                ['Quality', aggregates.categoryAverages.quality],
                ['Timeliness', aggregates.categoryAverages.timeliness],
                ['Professionalism', aggregates.categoryAverages.professionalism],
              ] as [string, number][]
            ).map(([label, score]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-28 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-7 text-right tabular-nums">
                  {score > 0 ? score.toFixed(1) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Response rate */}
        <div className="flex flex-col justify-center items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {aggregates.responseRate}%
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500">Response Rate</p>
        </div>
      </div>
    </div>
  )
}
