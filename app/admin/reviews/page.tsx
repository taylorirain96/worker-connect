'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RatingStars from '@/components/reviews/RatingStars'
import { moderateReview, getFlaggedReviews, deleteReview } from '@/lib/reviews/firebase'
import { formatRelativeDate } from '@/lib/utils'
import type { DetailedReview, ReviewModerationStatus } from '@/types'
import {
  Shield, CheckCircle, Trash2, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'

// Mock data for when Firebase is not configured
const MOCK_FLAGGED: DetailedReview[] = [
  {
    id: 'r1',
    jobId: 'j1',
    jobTitle: 'Plumbing Repair',
    reviewType: 'worker_review',
    reviewerId: 'u2',
    reviewerName: 'Alex Chen',
    reviewerRole: 'employer',
    revieweeId: 'w1',
    revieweeName: 'Marcus Johnson',
    rating: 1,
    categories: { communication: 1, quality: 1, timeliness: 2, professionalism: 1 },
    comment: 'Terrible work, did not fix anything. Complete waste of money and time!!!',
    photos: [],
    photoStoragePaths: [],
    isAnonymous: false,
    moderationStatus: 'flagged',
    helpfulCount: 2,
    unhelpfulCount: 5,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r2',
    jobId: 'j2',
    jobTitle: 'Electrical Panel Upgrade',
    reviewType: 'enterprise_review',
    reviewerId: 'w3',
    reviewerName: 'Sarah Williams',
    reviewerRole: 'worker',
    revieweeId: 'e1',
    revieweeName: 'BuildCorp Inc',
    rating: 2,
    categories: { communication: 2, quality: 3, timeliness: 1, professionalism: 2 },
    comment: 'This company is a scam! They never paid on time and the manager was rude.',
    photos: [],
    photoStoragePaths: [],
    isAnonymous: false,
    moderationStatus: 'flagged',
    helpfulCount: 0,
    unhelpfulCount: 1,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

const STATUS_BADGE: Record<ReviewModerationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  removed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

export default function AdminReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<DetailedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState<'flagged' | 'all'>('flagged')

  async function loadReviews() {
    setLoading(true)
    try {
      const data = await getFlaggedReviews()
      setReviews(data.length > 0 ? data : MOCK_FLAGGED)
    } catch {
      setReviews(MOCK_FLAGGED)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReviews() }, [])

  async function handleAction(reviewId: string, action: 'approve' | 'remove', note?: string) {
    if (!user) return
    setActionLoading((p) => ({ ...p, [reviewId]: true }))
    try {
      if (action === 'remove') {
        await deleteReview(reviewId)
        setReviews((p) => p.filter((r) => r.id !== reviewId))
        toast.success('Review removed')
      } else {
        await moderateReview(reviewId, 'approved', user.uid, note)
        setReviews((p) =>
          p.map((r) => (r.id === reviewId ? { ...r, moderationStatus: 'approved' as ReviewModerationStatus } : r))
        )
        toast.success('Review approved')
      }
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setActionLoading((p) => ({ ...p, [reviewId]: false }))
    }
  }

  const displayed = reviews.filter((r) =>
    tab === 'flagged' ? r.moderationStatus === 'flagged' : true
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Moderation</h1>
                <p className="text-sm text-gray-500">Review flagged content and take action</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadReviews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Flagged', count: reviews.filter((r) => r.moderationStatus === 'flagged').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
              { label: 'Approved', count: reviews.filter((r) => r.moderationStatus === 'approved').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
              { label: 'Total', count: reviews.length, color: 'text-gray-800 dark:text-white', bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {(['flagged', 'all'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                  tab === t
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {t === 'flagged' ? 'Flagged' : 'All Reviews'}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && displayed.length === 0 && (
            <div className="py-16 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">All clear!</p>
              <p className="text-sm text-gray-500">No flagged reviews to moderate.</p>
            </div>
          )}

          {/* Review cards */}
          {!loading && displayed.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[review.moderationStatus]}`}>
                      {review.moderationStatus}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {review.reviewType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {review.isAnonymous ? 'Anonymous' : review.reviewerName}
                    <span className="font-normal text-gray-500"> reviewed </span>
                    {review.revieweeName}
                  </p>
                  <p className="text-xs text-gray-400">{review.jobTitle} · {formatRelativeDate(review.createdAt)}</p>
                </div>
                <RatingStars rating={review.rating} size="sm" />
              </div>

              {/* Comment */}
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 italic mb-4">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAction(review.id, 'approve')}
                  disabled={actionLoading[review.id] || review.moderationStatus === 'approved'}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-40 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(review.id, 'remove')}
                  disabled={actionLoading[review.id]}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
