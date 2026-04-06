'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Eye, EyeOff, Send, Loader2 } from 'lucide-react'
import RatingStars from './RatingStars'
import CategoryRating from './CategoryRating'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { submitReview, validateReviewForm } from '@/lib/reviews/service'
import type { CategoryRatings, ReviewType, DetailedReview } from '@/types'
import toast from 'react-hot-toast'

const EMPTY_CATEGORIES: CategoryRatings = {
  communication: 0,
  quality: 0,
  timeliness: 0,
  professionalism: 0,
}

interface ReviewFormProps {
  jobId: string
  jobTitle: string
  reviewType: ReviewType
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  reviewerRole: 'worker' | 'employer' | 'admin'
  revieweeId: string
  revieweeName: string
  onSuccess?: (review: DetailedReview) => void
  onCancel?: () => void
}

export default function ReviewForm({
  jobId,
  jobTitle,
  reviewType,
  reviewerId,
  reviewerName,
  reviewerAvatar,
  reviewerRole,
  revieweeId,
  revieweeName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [categories, setCategories] = useState<CategoryRatings>({ ...EMPTY_CATEGORIES })
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleCategoryChange(key: keyof CategoryRatings, value: number) {
    setCategories((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const combined = [...photos, ...files].slice(0, 3)
    setPhotos(combined)
    const previews = combined.map((f) => URL.createObjectURL(f))
    setPhotoPreviews(previews)
    setErrors((prev) => { const next = { ...prev }; delete next.photos; return next })
  }

  function removePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx)
    setPhotos(next)
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateReviewForm({ rating, categories, comment, photos, isAnonymous })
    if (!result.valid) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const review = await submitReview({
        jobId,
        jobTitle,
        reviewType,
        reviewerId,
        reviewerName,
        reviewerAvatar,
        reviewerRole,
        revieweeId,
        revieweeName,
        formData: { rating, categories, comment, photos, isAnonymous },
      })
      toast.success('Review submitted!')
      onSuccess?.(review)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const charCount = comment.length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <RatingStars
          rating={rating}
          size="lg"
          interactive
          onRate={(v) => { setRating(v); setErrors((p) => { const n = { ...p }; delete n.rating; return n }) }}
        />
        {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
      </div>

      {/* Category ratings */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Category Ratings <span className="text-red-500">*</span>
        </label>
        <CategoryRating values={categories} interactive onChange={handleCategoryChange} />
        {['communication', 'quality', 'timeliness', 'professionalism'].map((k) =>
          errors[k] ? <p key={k} className="mt-1 text-sm text-red-600">{errors[k]}</p> : null
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Review <span className="text-red-500">*</span>
          <span className="font-normal text-gray-400 ml-2">(10–500 characters)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            setErrors((p) => { const n = { ...p }; delete n.comment; return n })
          }}
          rows={4}
          maxLength={500}
          placeholder={`Share your experience with ${revieweeName}…`}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500',
            errors.comment
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600'
          )}
        />
        <div className="flex justify-between mt-1">
          {errors.comment ? (
            <p className="text-sm text-red-600">{errors.comment}</p>
          ) : (
            <span />
          )}
          <span className={cn('text-xs', charCount > 480 ? 'text-orange-500' : 'text-gray-400')}>
            {charCount}/500
          </span>
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Photo Evidence <span className="text-gray-400 font-normal">(optional, max 3)</span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {photoPreviews.map((src, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image src={src} alt={`Preview ${idx + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs">Add</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {isAnonymous ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Post anonymously</p>
            <p className="text-xs text-gray-500">Your name will be hidden from the reviewee</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          onClick={() => setIsAnonymous((p) => !p)}
          className={cn(
            'relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
            isAnonymous ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5',
              isAnonymous ? 'translate-x-4' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="h-4 w-4" /> Submit Review</>
          )}
        </Button>
      </div>
    </form>
  )
}
