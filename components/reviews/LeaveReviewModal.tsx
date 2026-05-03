'use client'

import { X, Star } from 'lucide-react'
import ReviewForm from './ReviewForm'
import type { DetailedReview } from '@/types'

interface LeaveReviewModalProps {
  /** Firestore job ID for the completed job */
  jobId: string
  jobTitle: string
  /** The person leaving the review (homeowner) */
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  /** The worker being reviewed */
  workerId: string
  workerName: string
  /** Called when the modal should close */
  onClose: () => void
  /** Called when the review has been successfully submitted */
  onSuccess?: (review: DetailedReview) => void
}

/**
 * Modal that wraps ReviewForm — triggered after a job is marked complete.
 * Allows a homeowner to rate a worker with an overall star score, per-category
 * scores (communication, quality, timeliness, professionalism), a written
 * comment and optional photos (up to 3).
 */
export default function LeaveReviewModal({
  jobId,
  jobTitle,
  reviewerId,
  reviewerName,
  reviewerAvatar,
  workerId,
  workerName,
  onClose,
  onSuccess,
}: LeaveReviewModalProps) {
  function handleSuccess(review: DetailedReview) {
    onSuccess?.(review)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-review-modal-title"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2
              id="leave-review-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Review {workerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close review modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subheading */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Share your experience for <span className="font-medium text-gray-700 dark:text-gray-300">{jobTitle}</span>.
            Your honest feedback helps others find great tradespeople.
          </p>
        </div>

        {/* Review form */}
        <div className="px-6 pb-6 pt-2">
          <ReviewForm
            jobId={jobId}
            jobTitle={jobTitle}
            reviewType="worker_review"
            reviewerId={reviewerId}
            reviewerName={reviewerName}
            reviewerAvatar={reviewerAvatar}
            reviewerRole="employer"
            revieweeId={workerId}
            revieweeName={workerName}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
