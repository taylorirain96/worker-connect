'use client'

import { useState, useEffect, useCallback } from 'react'
import RatingStars from './RatingStars'
import { moderateReview, getFlaggedReviews, deleteReview, getPendingModerationReviews } from '@/lib/reviews/firebase'
import { formatRelativeDate } from '@/lib/utils'
import type { DetailedReview, ReviewModerationStatus } from '@/types'
import {
  Shield, CheckCircle, Trash2, RefreshCw, EyeOff, Eye, AlertTriangle,
  MessageSquare, Clock, Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'

// ─── Mock data (fallback when Firebase is not configured) ─────────────────────

const MOCK_REVIEWS: DetailedReview[] = [
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
    comment: 'Terrible work, did not fix anything. Complete waste of money!!!',
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
    comment: 'This company is a scam! They never paid on time.',
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

// ─── Status badge colours ─────────────────────────────────────────────────────

const STATUS_BADGE: Record<ReviewModerationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  removed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = 'flagged' | 'pending' | 'all'

interface ModerationDashboardProps {
  /** Override to control which tab is active */
  defaultTab?: Tab
}

export default function ModerationDashboard({ defaultTab = 'flagged' }: ModerationDashboardProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<DetailedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const [flagged, pending] = await Promise.all([
        getFlaggedReviews(),
        getPendingModerationReviews(),
      ])
      const combined = [...flagged, ...pending.filter((r) => !flagged.some((f) => f.id === r.id))]
      setReviews(combined.length > 0 ? combined : MOCK_REVIEWS)
    } catch {
      setReviews(MOCK_REVIEWS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadReviews() }, [loadReviews])

  async function handleAction(
    reviewId: string,
    action: 'approve' | 'remove' | 'hide' | 'unhide',
    note?: string
  ) {
    if (!user) return
    setActionLoading((p) => ({ ...p, [reviewId]: true }))
    try {
      if (action === 'remove') {
        await deleteReview(reviewId)
        setReviews((p) => p.filter((r) => r.id !== reviewId))
        toast.success('Review removed')
      } else if (action === 'hide') {
        await moderateReview(reviewId, 'removed', user.uid, note)
        setReviews((p) => p.map((r) => (r.id === reviewId ? { ...r, moderationStatus: 'removed' as ReviewModerationStatus } : r)))
        toast.success('Review hidden')
      } else if (action === 'unhide') {
        await moderateReview(reviewId, 'approved', user.uid, note)
        setReviews((p) => p.map((r) => (r.id === reviewId ? { ...r, moderationStatus: 'approved' as ReviewModerationStatus } : r)))
        toast.success('Review restored')
      } else {
        await moderateReview(reviewId, 'approved', user.uid, note)
        setReviews((p) => p.map((r) => (r.id === reviewId ? { ...r, moderationStatus: 'approved' as ReviewModerationStatus } : r)))
        toast.success('Review approved')
      }
      setShowNoteFor(null)
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setActionLoading((p) => ({ ...p, [reviewId]: false }))
    }
  }

  const displayed = reviews.filter((r) => {
    if (tab === 'flagged') return r.moderationStatus === 'flagged'
    if (tab === 'pending') return r.moderationStatus === 'pending'
    return true
  })

  const counts = {
    flagged: reviews.filter((r) => r.moderationStatus === 'flagged').length,
    pending: reviews.filter((r) => r.moderationStatus === 'pending').length,
    total: reviews.length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Moderation</h2>
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Flagged', count: counts.flagged, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: <AlertTriangle className="h-5 w-5 text-red-500" /> },
          { label: 'Pending', count: counts.pending, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', icon: <Clock className="h-5 w-5 text-yellow-500" /> },
          { label: 'Total', count: counts.total, color: 'text-gray-800 dark:text-white', bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700', icon: <MessageSquare className="h-5 w-5 text-gray-400" /> },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center flex flex-col items-center gap-1 ${s.bg}`}>
            {s.icon}
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['flagged', 'pending', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg capitalize transition-colors ${
              tab === t
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            {t === 'all' ? 'All Reviews' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t !== 'all' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tab === t ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {counts[t as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div className="py-16 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">All clear!</p>
          <p className="text-sm text-gray-500">No {tab === 'all' ? '' : tab + ' '}reviews to moderate.</p>
        </div>
      )}

      {/* Review cards */}
      {!loading && displayed.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
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
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 italic">
            &ldquo;{review.comment}&rdquo;
          </p>

          {/* Note input */}
          {showNoteFor === review.id && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Moderation note (optional)
              </label>
              <input
                type="text"
                value={noteInputs[review.id] ?? ''}
                onChange={(e) => setNoteInputs((p) => ({ ...p, [review.id]: e.target.value }))}
                placeholder="Add a note…"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {review.moderationStatus !== 'approved' && (
              <button
                type="button"
                onClick={() => handleAction(review.id, 'approve', noteInputs[review.id])}
                disabled={actionLoading[review.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </button>
            )}
            {review.moderationStatus !== 'removed' ? (
              <button
                type="button"
                onClick={() => handleAction(review.id, 'hide', noteInputs[review.id])}
                disabled={actionLoading[review.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hide
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(review.id, 'unhide', noteInputs[review.id])}
                disabled={actionLoading[review.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                Unhide
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAction(review.id, 'remove')}
              disabled={actionLoading[review.id]}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setShowNoteFor(showNoteFor === review.id ? null : review.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {showNoteFor === review.id ? 'Hide note' : 'Add note'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
