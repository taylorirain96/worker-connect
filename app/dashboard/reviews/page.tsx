'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, MessageSquare, ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import RatingStars from '@/components/reviews/RatingStars'
import ReviewCard from '@/components/reviews/ReviewCard'
import { getWorkerReviews } from '@/lib/reviews/index'
import { getReviewAggregates } from '@/lib/reviews/firebase'
import { formatRating, getRatingLabel, getRatingColor } from '@/lib/reviews/service'
import type { DetailedReview, ReviewAggregates, CategoryRatings } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  communication: 'Communication',
  quality: 'Quality',
  timeliness: 'Timeliness',
  professionalism: 'Professionalism',
}

const PAGE_SIZE = 10

export default function WorkerReviewsDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [reviews, setReviews] = useState<DetailedReview[]>([])
  const [aggregates, setAggregates] = useState<ReviewAggregates | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filterRating, setFilterRating] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return

    async function fetchData() {
      try {
        const [fetchedReviews, agg] = await Promise.all([
          getWorkerReviews(user!.uid),
          getReviewAggregates(user!.uid),
        ])
        setReviews(fetchedReviews)
        setAggregates(agg)
      } catch {
        setReviews([])
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  function handleReviewUpdate(updated: DetailedReview) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews

  const displayed = filteredReviews.slice(0, visibleCount)
  const hasMore = visibleCount < filteredReviews.length

  const averageRating = aggregates?.averageRating ?? profile?.rating ?? 0
  const totalReviews = aggregates?.totalReviews ?? profile?.reviewCount ?? reviews.length
  const ratingDist = aggregates?.ratingDistribution ?? {}
  const categoryAverages = aggregates?.categoryAverages ?? {}

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Page heading */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600 fill-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All reviews received from clients
              </p>
            </div>
          </div>

          {/* Low-rating alert */}
          {averageRating > 0 && averageRating < 3.5 && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Your rating is below average</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Focus on communication, punctuality and quality of work to lift your score.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loadingData ? (
            <div className="animate-pulse space-y-4">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary card */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {totalReviews === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No reviews yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete jobs to start receiving reviews from clients.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Overall score */}
                      <div className="flex items-center gap-5">
                        <div className="text-center">
                          <p className={cn('text-5xl font-extrabold tabular-nums', getRatingColor(averageRating))}>
                            {formatRating(averageRating)}
                          </p>
                          <RatingStars
                            rating={averageRating}
                            size="md"
                            className="justify-center mt-1"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {getRatingLabel(averageRating)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {totalReviews} review{totalReviews === 1 ? '' : 's'}
                          </p>
                        </div>

                        {/* Star distribution */}
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDist[String(star)] ?? 0
                            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setFilterRating((prev) => (prev === star ? null : star))
                                }
                                className={cn(
                                  'w-full flex items-center gap-2 text-xs rounded px-1 py-0.5 transition-colors',
                                  filterRating === star
                                    ? 'bg-yellow-50 dark:bg-yellow-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                                )}
                              >
                                <span className="w-5 text-right text-gray-500">{star}</span>
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
                                <span className="w-8 text-right text-gray-500 tabular-nums">{count}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Category breakdown */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Category Breakdown
                        </p>
                        <div className="space-y-2">
                          {(Object.keys(CATEGORY_LABELS) as (keyof CategoryRatings)[]).map((key) => {
                            const value = (categoryAverages as CategoryRatings)[key] ?? 0
                            const pct = (value / 5) * 100
                            return (
                              <div key={key} className="flex items-center gap-3">
                                <span className="w-28 text-xs text-gray-600 dark:text-gray-400 truncate">
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
                                  {value > 0 ? value.toFixed(1) : '—'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Filter notice */}
              {filterRating && (
                <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Showing {filteredReviews.length} {filterRating}-star review{filteredReviews.length === 1 ? '' : 's'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilterRating(null)}
                    className="text-xs text-yellow-700 dark:text-yellow-400 hover:underline"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              {/* Review list */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {displayed.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      currentUserId={user.uid}
                      isReviewee
                      onReviewUpdate={handleReviewUpdate}
                    />
                  ))}

                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Load more ({filteredReviews.length - visibleCount} remaining)
                    </button>
                  )}
                </div>
              ) : (
                totalReviews > 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No reviews match the selected filter.</p>
                    <button
                      type="button"
                      onClick={() => setFilterRating(null)}
                      className="mt-2 text-sm text-primary-600 hover:underline"
                    >
                      Clear filter
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
