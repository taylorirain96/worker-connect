'use client'

import { useState } from 'react'
import { Flag, X, Loader2, AlertCircle } from 'lucide-react'
import { reportReview } from '@/lib/reviews/firebase'
import { REPORT_REASONS } from '@/lib/reviewValidation'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FlagReviewModalProps {
  reviewId: string
  reporterId: string
  onClose: () => void
  onFlagged?: () => void
}

export default function FlagReviewModal({
  reviewId,
  reporterId,
  onClose,
  onFlagged,
}: FlagReviewModalProps) {
  const [reason, setReason] = useState<string>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!reason) {
      setError('Please select a reason.')
      return
    }

    setSubmitting(true)
    try {
      await reportReview(
        reviewId,
        reporterId,
        reason as Parameters<typeof reportReview>[2],
        description.trim() || undefined
      )
      toast.success('Review reported. Our team will look into it.')
      onFlagged?.()
      onClose()
    } catch {
      toast.error('Could not submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-modal-title"
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <h2 id="flag-modal-title" className="text-base font-semibold text-gray-900 dark:text-white">
              Report Review
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Help us keep the platform trustworthy. Tell us why this review is inappropriate.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason selection */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    reason === r.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Optional description */}
          <div>
            <label
              htmlFor="flag-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Additional details <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="flag-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Provide more context if needed…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">{description.length}/500</p>
          </div>

          {/* Inline error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
