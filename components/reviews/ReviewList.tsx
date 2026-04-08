'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import ReviewCard from './ReviewCard'
import { getReviewsForEntity, type ReviewSortBy } from '@/lib/reviews/firebase'
import type { DetailedReview } from '@/types'
import { cn } from '@/lib/utils'

interface ReviewListProps {
  entityId: string
  currentUserId?: string
  isReviewee?: boolean
}

const SORT_OPTIONS: { value: ReviewSortBy; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'most_helpful', label: 'Most Helpful' },
]

const RATING_FILTERS = [0, 5, 4, 3, 2, 1]

const PAGE_SIZE = 10

export default function ReviewList({ entityId, currentUserId, isReviewee }: ReviewListProps) {
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<ReviewSortBy>('recent')
  const [filterRating, setFilterRating] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // For simplicity we fetch all and paginate client-side when using keyword search
  const [allReviews, setAllReviews] = useState<DetailedReview[]>([])

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const { reviews: fetched } = await getReviewsForEntity(entityId, {
        sortBy,
        filterRating: filterRating || undefined,
        pageSize: 100, // fetch enough for client-side search pagination
      })
      setAllReviews(fetched)
    } catch (err) {
      console.error('[ReviewList] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [entityId, sortBy, filterRating])

  useEffect(() => {
    fetchReviews()
    setPage(1)
  }, [fetchReviews])

  // Client-side keyword filter + pagination
  const filtered = keyword.trim()
    ? allReviews.filter(
        (r) =>
          r.comment.toLowerCase().includes(keyword.toLowerCase()) ||
          (!r.isAnonymous && r.reviewerName.toLowerCase().includes(keyword.toLowerCase()))
      )
    : allReviews

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageReviews = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleReviewUpdate(updated: DetailedReview) {
    setAllReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
            placeholder="Search reviews…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as ReviewSortBy); setPage(1) }}
          className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters((p) => !p)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
            showFilters
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {filterRating > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
          )}
        </button>
      </div>

      {/* Rating filter chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 py-2">
          {RATING_FILTERS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setFilterRating(r === filterRating ? 0 : r); setPage(1) }}
              className={cn(
                'px-3 py-1 text-sm rounded-full border transition-colors',
                filterRating === r && r !== 0
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'
              )}
            >
              {r === 0 ? 'All' : `${r}★`}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {filtered.length} review{filtered.length !== 1 ? 's' : ''}
          {keyword && ` matching "${keyword}"`}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && pageReviews.length === 0 && (
        <div className="py-16 text-center text-gray-400 dark:text-gray-600">
          <p className="text-base font-medium">No reviews found</p>
          {keyword && (
            <p className="text-sm mt-1">Try a different keyword or clear the search</p>
          )}
        </div>
      )}

      {/* Review cards */}
      {!loading && pageReviews.map((r) => (
        <ReviewCard
          key={r.id}
          review={r}
          currentUserId={currentUserId}
          isReviewee={isReviewee}
          onReviewUpdate={handleReviewUpdate}
        />
      ))}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
