'use client'

import { useState } from 'react'
import { MessageSquare, Edit2, Trash2, Send, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { addReviewResponse, updateReviewResponse, deleteReviewResponse } from '@/lib/reviews/firebase'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import type { DetailedReview } from '@/types'
import toast from 'react-hot-toast'

interface ReviewResponseProps {
  review: DetailedReview
  currentUserId?: string
  isReviewee: boolean
  showForm: boolean
  onShowForm: () => void
  onHideForm: () => void
  onSaved: (text: string) => void
  onDeleted: () => void
}

export default function ReviewResponse({
  review,
  currentUserId,
  isReviewee,
  showForm,
  onShowForm,
  onHideForm,
  onSaved,
  onDeleted,
}: ReviewResponseProps) {
  const [editMode, setEditMode] = useState(false)
  const [responseText, setResponseText] = useState(review.response?.text ?? '')
  const [loading, setLoading] = useState(false)

  const existing = review.response
  const isAuthor = existing && currentUserId && existing.authorId === currentUserId

  async function handleSubmit() {
    if (!responseText.trim() || responseText.trim().length < 5) {
      toast.error('Response must be at least 5 characters.')
      return
    }
    if (responseText.length > 500) {
      toast.error('Response must be 500 characters or fewer.')
      return
    }
    setLoading(true)
    try {
      if (existing && editMode) {
        await updateReviewResponse(review.id, responseText.trim())
        toast.success('Response updated')
        setEditMode(false)
      } else {
        await addReviewResponse(
          review.id,
          currentUserId ?? '',
          review.revieweeName,
          undefined,
          responseText.trim()
        )
        toast.success('Response posted')
        onSaved(responseText.trim())
      }
    } catch {
      toast.error('Could not save response.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete your response?')) return
    setLoading(true)
    try {
      await deleteReviewResponse(review.id)
      toast.success('Response deleted')
      setResponseText('')
      setEditMode(false)
      onDeleted()
    } catch {
      toast.error('Could not delete response.')
    } finally {
      setLoading(false)
    }
  }

  if (!existing && !showForm) {
    // Show "Reply" button only to the reviewee
    if (isReviewee && currentUserId) {
      return (
        <button
          type="button"
          onClick={onShowForm}
          className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Reply to this review
        </button>
      )
    }
    return null
  }

  if ((showForm && !existing) || (editMode && existing)) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-primary-200 dark:border-primary-800 space-y-2">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 uppercase tracking-wide">
          {editMode ? 'Edit Response' : 'Your Response'}
        </p>
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Write a professional response…"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">{responseText.length}/500</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setEditMode(false); onHideForm(); }}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !responseText.trim()}
              className="flex items-center gap-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {editMode ? 'Update' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (existing) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {existing.authorAvatar ? (
              <div className="relative h-6 w-6 rounded-full overflow-hidden">
                <Image src={existing.authorAvatar} alt={existing.authorName} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 text-xs font-bold">
                {getInitials(existing.authorName)}
              </div>
            )}
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{existing.authorName}</span>
            <span className="text-xs text-gray-400">responded · {formatRelativeDate(existing.updatedAt)}</span>
          </div>
          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setResponseText(existing.text); setEditMode(true) }}
                className="text-gray-400 hover:text-primary-500 transition-colors"
                title="Edit response"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                title="Delete response"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{existing.text}</p>
      </div>
    )
  }

  return null
}
