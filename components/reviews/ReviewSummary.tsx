'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MessageSquare, ChevronRight } from 'lucide-react'
import RatingStars from './RatingStars'
import CategoryRating from './CategoryRating'
import { getReviewAggregates, getReviewsForEntity } from '@/lib/reviews/firebase'
import { formatRating, getRatingLabel, getRatingColor } from '@/lib/reviews/service'
import type { ReviewAggregates, DetailedReview } from '@/types'

function createEmptyAggregates(entityId: string): ReviewAggregates {
  return {
    id: entityId,
    entityId,
    entityType: 'worker',
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
    categoryAverages: {
      communication: 0,
      quality: 0,
      timeliness: 0,
      professionalism: 0,
    },
    responseRate: 0,
    updatedAt: new Date().toISOString(),
  }
}

interface ReviewSummaryProps {
  entityId: string
  profileId: string
}

export default function ReviewSummary({ entityId, profileId }: ReviewSummaryProps) {
  const [aggregates, setAggregates] = useState<ReviewAggregates | null>(null)
  const [recent, setRecent] = useState<DetailedReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [agg, { reviews }] = await Promise.all([
          getReviewAggregates(entityId),
          getReviewsForEntity(entityId, { sortBy: 'recent', pageSize: 2 }),
        ])
        setAggregates(agg ?? createEmptyAggregates(entityId))
        setRecent(reviews)
      } catch {
        setAggregates(createEmptyAggregates(entityId))
        setRecent([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [entityId])

  if (loading) {
    return <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
  }

  const agg = aggregates ?? createEmptyAggregates(entityId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Reviews & Ratings</h2>
        </div>
        <Link
          href={`/profile/${profileId}/reviews`}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {agg.totalReviews > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${getRatingColor(agg.averageRating)}`}>
                {formatRating(agg.averageRating)}
              </p>
              <RatingStars rating={agg.averageRating} size="sm" className="justify-center mt-0.5" />
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">{getRatingLabel(agg.averageRating)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agg.totalReviews}</p>
              <p className="text-xs text-gray-500 mt-0.5">Reviews</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{agg.responseRate}%</p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Response Rate</p>
            </div>
          </div>

          <CategoryRating values={agg.categoryAverages} compact />

          {recent.length > 0 && (
            <div className="space-y-3">
              {recent.map((r) => (
                <div key={r.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {r.isAnonymous ? 'Anonymous' : r.reviewerName}
                    </span>
                    <RatingStars rating={r.rating} size="sm" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          No reviews yet.
        </div>
      )}
    </div>
  )
}
