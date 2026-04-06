'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, CheckCircle, Trash2, EyeOff, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import RatingStars from './RatingStars'
import { getFlaggedReviews, getPendingModerationReviews, moderateReview, deleteReview } from '@/lib/reviews/firebase'
import { formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DetailedReview, ReviewModerationStatus } from '@/types'
import toast from 'react-hot-toast'

interface ModerationDashboardProps {
  moderatorId: string
  className?: string
}

const STATUS_BADGE: Record<ReviewModerationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  removed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

type Tab = 'flagged' | 'pending' | 'all'

export default function ModerationDashboard({ moderatorId, className }: ModerationDashboardProps) {
  const [tab, setTab] = useState<Tab>('flagged')
  const [reviews, setReviews] = useState<DetailedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [flagged, pending] = await Promise.all([
        getFlaggedReviews(50),
        getPendingModerationReviews(50),
      ])
      const combined = [...flagged, ...pending]
      // Deduplicate by id
      const seen = new Set<string>()
      setReviews(combined.filter((r) => { if (seen.has(r.id)) return false; seen.add(r.id); return true }))
    } catch {
      toast.error('Failed to load moderation queue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(reviewId: string, action: 'approve' | 'hide' | 'delete', note?: string) {
    setBusy((p) => ({ ...p, [reviewId]: true }))
    try {
      if (action === 'delete') {
        await deleteReview(reviewId)
        setReviews((p) => p.filter((r) => r.id !== reviewId))
        toast.success('Review permanently deleted.')
      } else {
        const newStatus: ReviewModerationStatus = action === 'approve' ? 'approved' : 'removed'
        await moderateReview(reviewId, newStatus, moderatorId, note)
        setReviews((p) =>
          p.map((r) => (r.id === reviewId ? { ...r, moderationStatus: newStatus } : r))
        )
        toast.success(action === 'approve' ? 'Review approved.' : 'Review hidden.')
      }
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setBusy((p) => ({ ...p, [reviewId]: false }))
    }
  }

  const displayed = reviews.filter((r) => {
    if (tab === 'flagged') return r.moderationStatus === 'flagged'
    if (tab === 'pending') return r.moderationStatus === 'pending'
    return true
  })

  const flaggedCount = reviews.filter((r) => r.moderationStatus === 'flagged').length
  const pendingCount = reviews.filter((r) => r.moderationStatus === 'pending').length

  return (
    <div className={cn('space-y-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review Moderation</h2>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          aria-label="Refresh moderation queue"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Flagged', count: flaggedCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
          { label: 'Pending', count: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
          { label: 'Total', count: reviews.length, color: 'text-gray-800 dark:text-white', bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-3 text-center', s.bg)}>
            <p className={cn('text-2xl font-bold tabular-nums', s.color)}>{s.count}</p>
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
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg capitalize transition-colors',
              tab === t
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'flagged' && flaggedCount > 0 && (
              <span className="ml-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full px-1.5 py-0.5 tabular-nums">
                {flaggedCount}
              </span>
            )}
            {t === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-full px-1.5 py-0.5 tabular-nums">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div className="py-14 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">All clear!</p>
          <p className="text-sm text-gray-500">
            {tab === 'all' ? 'No reviews in the queue.' : `No ${tab} reviews to moderate.`}
          </p>
        </div>
      )}

      {/* Review list */}
      {!loading && displayed.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[review.moderationStatus])}>
                  {review.moderationStatus}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {review.reviewType.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {review.isAnonymous ? 'Anonymous' : review.reviewerName}
                <span className="font-normal text-gray-500"> → </span>
                {review.revieweeName}
              </p>
              <p className="text-xs text-gray-400">{review.jobTitle} · {formatRelativeDate(review.createdAt)}</p>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>

          {/* Comment */}
          <blockquote className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700 italic">
            &ldquo;{review.comment}&rdquo;
          </blockquote>

          {/* Moderator note */}
          <div>
            <input
              type="text"
              placeholder="Add a moderator note (optional)…"
              value={noteMap[review.id] ?? ''}
              onChange={(e) => setNoteMap((p) => ({ ...p, [review.id]: e.target.value }))}
              maxLength={300}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <ActionButton
              label="Approve"
              icon={<CheckCircle className="h-4 w-4" />}
              busy={!!busy[review.id]}
              disabled={review.moderationStatus === 'approved'}
              colorClass="bg-green-600 hover:bg-green-700"
              onClick={() => handleAction(review.id, 'approve', noteMap[review.id])}
            />
            <ActionButton
              label={review.moderationStatus === 'removed' ? 'Unhide' : 'Hide'}
              icon={<EyeOff className="h-4 w-4" />}
              busy={!!busy[review.id]}
              colorClass="bg-yellow-500 hover:bg-yellow-600"
              onClick={() =>
                handleAction(
                  review.id,
                  review.moderationStatus === 'removed' ? 'approve' : 'hide',
                  noteMap[review.id]
                )
              }
            />
            <ActionButton
              label="Delete"
              icon={<Trash2 className="h-4 w-4" />}
              busy={!!busy[review.id]}
              colorClass="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!confirm('Permanently delete this review? This cannot be undone.')) return
                handleAction(review.id, 'delete')
              }}
            />
          </div>

          {/* Existing moderator note */}
          {review.moderatorNote && (
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span><strong>Note:</strong> {review.moderatorNote}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Small helper ─────────────────────────────────────────────────────────────

function ActionButton({
  label,
  icon,
  busy,
  disabled = false,
  colorClass,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  busy: boolean
  disabled?: boolean
  colorClass: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg disabled:opacity-40 transition-colors',
        colorClass
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  )
}
