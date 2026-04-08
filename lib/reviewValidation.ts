import { z } from 'zod'

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_PHOTOS = 10
export const MAX_TOTAL_PHOTO_BYTES = 50 * 1024 * 1024 // 50 MB
export const MAX_COMMENT_LENGTH = 500
export const MIN_COMMENT_LENGTH = 10
export const MAX_RESPONSE_LENGTH = 1000

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake', label: 'Fake or misleading' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]['value']

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const categoryRatingsSchema = z.object({
  communication: z.number().int().min(1).max(5),
  quality: z.number().int().min(1).max(5),
  timeliness: z.number().int().min(1).max(5),
  professionalism: z.number().int().min(1).max(5),
})

export const createReviewSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  jobTitle: z.string().min(1, 'jobTitle is required'),
  reviewType: z.enum(['worker_review', 'enterprise_review']),
  reviewerId: z.string().min(1, 'reviewerId is required'),
  reviewerName: z.string().min(1, 'reviewerName is required'),
  reviewerAvatar: z.string().url().optional(),
  reviewerRole: z.enum(['worker', 'employer', 'admin']),
  revieweeId: z.string().min(1, 'revieweeId is required'),
  revieweeName: z.string().min(1, 'revieweeName is required'),
  rating: z.number().int().min(1).max(5),
  categories: categoryRatingsSchema,
  comment: z
    .string()
    .min(MIN_COMMENT_LENGTH, `Comment must be at least ${MIN_COMMENT_LENGTH} characters`)
    .max(MAX_COMMENT_LENGTH, `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`),
  photos: z.array(z.string().url()).max(MAX_PHOTOS, `Maximum ${MAX_PHOTOS} photos allowed`).default([]),
  photoStoragePaths: z.array(z.string()).default([]),
  isAnonymous: z.boolean().default(false),
})

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z
    .string()
    .min(MIN_COMMENT_LENGTH)
    .max(MAX_COMMENT_LENGTH)
    .optional(),
  moderationStatus: z.enum(['pending', 'approved', 'flagged', 'removed']).optional(),
  moderatorId: z.string().optional(),
  moderatorNote: z.string().optional(),
})

export const flagReviewSchema = z.object({
  reporterId: z.string().min(1, 'reporterId is required'),
  reason: z.enum(['spam', 'inappropriate', 'fake', 'harassment', 'other']),
  description: z.string().max(500).optional(),
})

export const reviewResponseSchema = z.object({
  authorId: z.string().min(1, 'authorId is required'),
  authorName: z.string().min(1, 'authorName is required'),
  authorAvatar: z.string().url().optional(),
  text: z
    .string()
    .min(1, 'Response text is required')
    .max(MAX_RESPONSE_LENGTH, `Response must be ${MAX_RESPONSE_LENGTH} characters or fewer`),
})

export const updateResponseSchema = z.object({
  text: z
    .string()
    .min(1, 'Response text is required')
    .max(MAX_RESPONSE_LENGTH, `Response must be ${MAX_RESPONSE_LENGTH} characters or fewer`),
})

export const moderationActionSchema = z.object({
  moderatorId: z.string().min(1, 'moderatorId is required'),
  action: z.enum(['approve', 'hide', 'delete']),
  note: z.string().max(500).optional(),
})

// ─── Form Validation (client-side, no Zod) ────────────────────────────────────

export interface ReviewFormErrors {
  rating?: string
  communication?: string
  quality?: string
  timeliness?: string
  professionalism?: string
  comment?: string
  photos?: string
}

export function validateReviewFormData(data: {
  rating: number
  categories: { communication: number; quality: number; timeliness: number; professionalism: number }
  comment: string
  photos: File[]
}): { valid: boolean; errors: ReviewFormErrors } {
  const errors: ReviewFormErrors = {}

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5 stars.'
  }

  for (const key of ['communication', 'quality', 'timeliness', 'professionalism'] as const) {
    if (data.categories[key] < 1 || data.categories[key] > 5) {
      errors[key] = `Please rate ${key} between 1 and 5 stars.`
    }
  }

  if (!data.comment || data.comment.trim().length < MIN_COMMENT_LENGTH) {
    errors.comment = `Comment must be at least ${MIN_COMMENT_LENGTH} characters.`
  } else if (data.comment.length > MAX_COMMENT_LENGTH) {
    errors.comment = `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`
  }

  if (data.photos.length > MAX_PHOTOS) {
    errors.photos = `You can upload up to ${MAX_PHOTOS} photos.`
  }

  const totalSize = data.photos.reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_PHOTO_BYTES) {
    errors.photos = `Total photo size must be under ${MAX_TOTAL_PHOTO_BYTES / (1024 * 1024)}MB.`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
