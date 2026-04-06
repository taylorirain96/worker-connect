/**
 * Review business logic: validation, badge integration, notification hooks.
 */
import { createReview, uploadReviewPhoto, deleteReviewPhoto } from './firebase'
import type { DetailedReview, CategoryRatings, ReviewType } from '@/types'

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ReviewFormData {
  rating: number
  categories: CategoryRatings
  comment: string
  photos: File[]
  isAnonymous: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateReviewForm(data: ReviewFormData): ValidationResult {
  const errors: Record<string, string> = {}

  if (data.rating < 1 || data.rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5 stars.'
  }

  const cats = data.categories
  for (const key of ['communication', 'quality', 'timeliness', 'professionalism'] as const) {
    if (cats[key] < 1 || cats[key] > 5) {
      errors[key] = `Please rate ${key} between 1 and 5 stars.`
    }
  }

  if (!data.comment || data.comment.trim().length < 10) {
    errors.comment = 'Comment must be at least 10 characters.'
  }
  if (data.comment && data.comment.length > 500) {
    errors.comment = 'Comment must be 500 characters or fewer.'
  }

  if (data.photos.length > 3) {
    errors.photos = 'You can upload up to 3 photos.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ─── Submit Review ────────────────────────────────────────────────────────────

export interface SubmitReviewParams {
  jobId: string
  jobTitle: string
  reviewType: ReviewType
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  reviewerRole: 'worker' | 'employer' | 'admin'
  revieweeId: string
  revieweeName: string
  formData: ReviewFormData
  onPhotoProgress?: (file: string, pct: number) => void
}

export async function submitReview(params: SubmitReviewParams): Promise<DetailedReview> {
  const { formData, onPhotoProgress, ...meta } = params

  const validation = validateReviewForm(formData)
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0]
    throw new Error(firstError)
  }

  // Upload photos
  const photos: string[] = []
  const photoStoragePaths: string[] = []

  for (const file of formData.photos) {
    try {
      const { url, storagePath } = await uploadReviewPhoto(
        meta.reviewerId,
        file,
        (pct) => onPhotoProgress?.(file.name, pct)
      )
      photos.push(url)
      photoStoragePaths.push(storagePath)
    } catch {
      // If photo upload fails, clean up already-uploaded ones
      for (const path of photoStoragePaths) {
        await deleteReviewPhoto(path).catch(() => null)
      }
      throw new Error('Photo upload failed. Please try again.')
    }
  }

  return createReview({
    ...meta,
    rating: formData.rating,
    categories: formData.categories,
    comment: formData.comment,
    photos,
    photoStoragePaths,
    isAnonymous: formData.isAnonymous,
  })
}

// ─── Gamification Badges ──────────────────────────────────────────────────────

/**
 * Returns badge IDs earned based on aggregate stats.
 * These should be applied to the reviewee's badge list.
 */
export function getReviewBadges(opts: {
  averageRating: number
  totalReviews: number
  responseRate: number
}): string[] {
  const badges: string[] = []
  if (opts.averageRating >= 4.5 && opts.totalReviews >= 5) {
    badges.push('highly_rated')
  }
  if (opts.totalReviews >= 50) {
    badges.push('customer_favorite')
  }
  if (opts.responseRate >= 90) {
    badges.push('responsive_pro')
  }
  return badges
}

// ─── Rating Display Helpers ───────────────────────────────────────────────────

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.0) return 'Good'
  if (rating >= 2.0) return 'Fair'
  return 'Poor'
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600 dark:text-green-400'
  if (rating >= 4.0) return 'text-emerald-600 dark:text-emerald-400'
  if (rating >= 3.0) return 'text-yellow-600 dark:text-yellow-400'
  if (rating >= 2.0) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}
