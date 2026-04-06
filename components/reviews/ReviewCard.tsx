'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ThumbsUp, ThumbsDown, Flag, User, ChevronDown, ChevronUp } from 'lucide-react'
import RatingStars from './RatingStars'
import CategoryRating from './CategoryRating'
import ReviewResponse from './ReviewResponse'
import { voteReview, reportReview } from '@/lib/reviews/firebase'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import type { DetailedReview } from '@/types'
import toast from 'react-hot-toast'

interface ReviewCardProps {
  review: DetailedReview
  /** Current logged-in user id (for voting/responding) */
  currentUserId?: string
  /** If the current user is the reviewee, show response UI */
  isReviewee?: boolean
  onReviewUpdate?: (updated: DetailedReview) => void
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake', label: 'Fake or misleading' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
] as const

export default function ReviewCard({
  review,
  currentUserId,
  isReviewee,
  onReviewUpdate,
}: ReviewCardProps) {
  const [localReview, setLocalReview] = useState(review)
  const [showCategories, setShowCategories] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [showReportMenu, setShowReportMenu] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [voting, setVoting] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const authorName = localReview.isAnonymous ? 'Anonymous' : localReview.reviewerName
  const hasCategories =
    localReview.categories &&
    Object.values(localReview.categories).some((v) => v > 0)
  const hasPhotos = localReview.photos?.length > 0
  const hasResponse = !!localReview.response

  async function handleVote(vote: 'helpful' | 'unhelpful') {
    if (!currentUserId || voting) return
    setVoting(true)
    try {
      await voteReview(localReview.id, currentUserId, vote)
      const updated = {
        ...localReview,
        helpfulCount:
          vote === 'helpful' ? localReview.helpfulCount + 1 : localReview.helpfulCount,
        unhelpfulCount:
          vote === 'unhelpful' ? localReview.unhelpfulCount + 1 : localReview.unhelpfulCount,
      }
      setLocalReview(updated)
      onReviewUpdate?.(updated)
      toast.success('Vote recorded')
    } catch {
      toast.error('Could not record vote')
    } finally {
      setVoting(false)
    }
  }

  async function handleReport(reason: ReviewReport['reason']) {
    if (!currentUserId) return
    setShowReportMenu(false)
    try {
      await reportReview(localReview.id, currentUserId, reason)
      toast.success('Review reported. Our team will review it.')
    } catch {
      toast.error('Could not submit report')
    }
  }

  function handleResponseSaved(text: string) {
    const response = {
      id: localReview.id,
      reviewId: localReview.id,
      authorId: currentUserId ?? '',
      authorName: 'You',
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = { ...localReview, response }
    setLocalReview(updated)
    onReviewUpdate?.(updated)
    setShowResponseForm(false)
  }

  function handleResponseDeleted() {
    const updated = { ...localReview, response: undefined }
    setLocalReview(updated)
    onReviewUpdate?.(updated)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {localReview.isAnonymous ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          ) : localReview.reviewerAvatar ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image src={localReview.reviewerAvatar} alt={authorName} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(authorName)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{authorName}</p>
            <p className="text-xs text-gray-500">{formatRelativeDate(localReview.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingStars rating={localReview.rating} size="sm" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{localReview.rating}.0</span>
        </div>
      </div>

      {/* Job context */}
      {localReview.jobTitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500">Re: {localReview.jobTitle}</p>
      )}

      {/* Comment */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{localReview.comment}</p>

      {/* Category breakdown toggle */}
      {hasCategories && (
        <div>
          <button
            type="button"
            onClick={() => setShowCategories((p) => !p)}
            className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            {showCategories ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showCategories ? 'Hide' : 'Show'} category ratings
          </button>
          {showCategories && (
            <div className="mt-3">
              <CategoryRating values={localReview.categories} compact />
            </div>
          )}
        </div>
      )}

      {/* Photos */}
      {hasPhotos && (
        <div>
          <button
            type="button"
            onClick={() => setShowPhotos((p) => !p)}
            className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            {showPhotos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showPhotos ? 'Hide' : 'Show'} {localReview.photos.length} photo{localReview.photos.length > 1 ? 's' : ''}
          </button>
          {showPhotos && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {localReview.photos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Image src={url} alt={`Review photo ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox (simple overlay) */}
      {lightboxIdx !== null && localReview.photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <div className="relative max-w-lg w-full aspect-square mx-4">
            <Image
              src={localReview.photos[lightboxIdx]}
              alt="Review photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Response */}
      {(hasResponse || (isReviewee && currentUserId)) && (
        <ReviewResponse
          review={localReview}
          currentUserId={currentUserId}
          isReviewee={isReviewee ?? false}
          showForm={showResponseForm}
          onShowForm={() => setShowResponseForm(true)}
          onHideForm={() => setShowResponseForm(false)}
          onSaved={handleResponseSaved}
          onDeleted={handleResponseDeleted}
        />
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Helpful?</span>
          <button
            type="button"
            disabled={!currentUserId || voting}
            onClick={() => handleVote('helpful')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-40"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{localReview.helpfulCount}</span>
          </button>
          <button
            type="button"
            disabled={!currentUserId || voting}
            onClick={() => handleVote('unhelpful')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{localReview.unhelpfulCount}</span>
          </button>
        </div>
        <div className="relative">
          {currentUserId && (
            <button
              type="button"
              onClick={() => setShowReportMenu((p) => !p)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="Report review"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}
          {showReportMenu && (
            <div className="absolute right-0 bottom-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleReport(r.value as ReviewReport['reason'])}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {r.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowReportMenu(false)}
                className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Required type import for the report handler
type ReviewReport = { reason: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other' }
