'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ReviewList from '@/components/reviews/ReviewList'
import RatingStars from '@/components/reviews/RatingStars'
import CategoryRating from '@/components/reviews/CategoryRating'
import { getReviewAggregates } from '@/lib/reviews/firebase'
import { formatRating, getRatingLabel, getRatingColor } from '@/lib/reviews/service'
import { ArrowLeft, Star, MessageSquare, TrendingUp } from 'lucide-react'
import type { ReviewAggregates } from '@/types'

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

export default function ProfileReviewsPage() {
  const params = useParams()
  const entityId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const [aggregates, setAggregates] = useState<ReviewAggregates | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getReviewAggregates(entityId)
        setAggregates(data ?? MOCK_AGGREGATES)
      } catch {
        setAggregates(MOCK_AGGREGATES)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [entityId])

  const agg = aggregates ?? MOCK_AGGREGATES
  const maxCount = Math.max(...Object.values(agg.ratingDistribution))

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <Link
            href={`/profile/${entityId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reviews</h1>

          {/* Summary card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            {loading ? (
              <div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Overall rating */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className={`text-6xl font-extrabold ${getRatingColor(agg.averageRating)}`}>
                    {formatRating(agg.averageRating)}
                  </p>
                  <RatingStars rating={agg.averageRating} size="lg" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getRatingLabel(agg.averageRating)}
                  </p>
                  <p className="text-sm text-gray-500">{agg.totalReviews} review{agg.totalReviews !== 1 ? 's' : ''}</p>
                </div>

                {/* Star distribution */}
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = agg.ratingDistribution[String(star)] ?? 0
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-10 shrink-0">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{star}</span>
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Category averages + response rate */}
            {!loading && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-500" />
                    Category Scores
                  </h3>
                  <CategoryRating values={agg.categoryAverages} compact />
                </div>
                <div className="flex flex-col justify-center items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {agg.responseRate}%
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500">Response Rate</p>
                </div>
              </div>
            )}
          </div>

          {/* Review list */}
          <ReviewList entityId={entityId} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
