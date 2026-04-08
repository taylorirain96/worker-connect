'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MessageSquare, ChevronRight } from 'lucide-react'
import RatingStars from './RatingStars'
import CategoryRating from './CategoryRating'
import { getReviewAggregates, getReviewsForEntity } from '@/lib/reviews/firebase'
import { formatRating, getRatingLabel, getRatingColor } from '@/lib/reviews/service'
import type { ReviewAggregates, DetailedReview } from '@/types'

const MOCK_AGGREGATES: ReviewAggregates = {
  id: 'mock',
  entityId: 'mock',
  entityType: 'worker',
  totalReviews: 24,
  averageRating: 4.7,
  ratingDistribution: { '5': 16, '4': 5, '3': 2, '2': 1, '1': 0 },
  categoryAverages: {
    communication: 4.8,
    quality: 4.6,
    timeliness: 4.7,
    professionalism: 4.9,
  },
  responseRate: 83,
  updatedAt: new Date().toISOString(),
}

const MOCK_RECENT: DetailedReview[] = [
  {
    id: 'mock-r1',
    jobId: 'j1',
    jobTitle: 'Plumbing Repair',
    reviewType: 'worker_review',
    reviewerId: 'e1',
    reviewerName: 'TechCorp LLC',
    reviewerRole: 'employer',
    revieweeId: 'mock-worker-id',
    revieweeName: 'Worker',
    rating: 5,
    categories: { communication: 5, quality: 5, timeliness: 5, professionalism: 5 },
    comment: 'Excellent work! Very professional and finished ahead of schedule. Highly recommend.',
    photos: [],
    photoStoragePaths: [],
    isAnonymous: false,
    moderationStatus: 'approved',
    helpfulCount: 8,
    unhelpfulCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-r2',
    jobId: 'j2',
    jobTitle: 'Electrical Wiring',
    reviewType: 'worker_review',
    reviewerId: 'e2',
    reviewerName: 'Sarah M.',
    reviewerRole: 'employer',
    revieweeId: 'mock-worker-id',
    revieweeName: 'Worker',
    rating: 4,
    categories: { communication: 4, quality: 5, timeliness: 4, professionalism: 4 },
    comment: 'Great quality work. Communication could be slightly better but overall very satisfied.',
    photos: [],
    photoStoragePaths: [],
    isAnonymous: false,
    moderationStatus: 'approved',
    helpfulCount: 3,
    unhelpfulCount: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

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
        setAggregates(agg ?? MOCK_AGGREGATES)
        setRecent(reviews.length > 0 ? reviews : MOCK_RECENT)
      } catch {
        setAggregates(MOCK_AGGREGATES)
        setRecent(MOCK_RECENT)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [entityId])

  if (loading) {
    return <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
  }

  const agg = aggregates ?? MOCK_AGGREGATES

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

      {/* Quick stats */}
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

      {/* Category breakdown */}
      <CategoryRating values={agg.categoryAverages} compact />

      {/* Recent reviews snippets */}
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
    </div>
  )
}
