'use client'

import { useState } from 'react'
import { Flag, X, Loader2, AlertCircle } from 'lucide-react'
import { reportReview } from '@/lib/reviews/firebase'
import toast from 'react-hot-toast'

interface FlagReviewModalProps {
  reviewId: string
  currentUserId: string
  onClose: () => void
  onFlagged?: () => void
}

const FLAG_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake', label: 'Fake or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'other', label: 'Other' },
] as const

type FlagReason = (typeof FLAG_REASONS)[number]['value']

export default function FlagReviewModal({
  reviewId,
  currentUserId,
  onClose,
  onFlagged,
}: FlagReviewModalProps) {
  const [reason, setReason] = useState<FlagReason | ''>('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) {
      setError('Please select a reason.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await reportReview(reviewId, currentUserId, reason as FlagReason, description.trim() || undefined)
      toast.success('Review reported. Our team will investigate.')
      onFlagged?.()
      onClose()
    } catch {
      setError('Could not submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Flag className="h-5 w-5" />
            <h2 id="flag-modal-title" className="text-lg font-semibold">Flag Review</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Help us keep the platform safe. Select the reason this review violates our guidelines.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason options */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason <span aria-hidden="true" className="text-red-500">*</span>
            </legend>
            <div className="space-y-2">
              {FLAG_REASONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="flag-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {label}
                  </span>
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
              rows={3}
              maxLength={500}
              placeholder="Describe why this review is problematic…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-0.5 text-right">{description.length}/500</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
