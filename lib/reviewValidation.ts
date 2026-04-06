/**
 * Zod validation schemas for the Rating & Reviews System.
 */
import { z } from 'zod'

// ─── Constants ────────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB per photo
export const MAX_TOTAL_PHOTO_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB total
export const MAX_PHOTOS = 10
export const REVIEW_CONTENT_MIN = 10
export const REVIEW_CONTENT_MAX = 500

// ─── Review schemas ───────────────────────────────────────────────────────────

export const ratingSchema = z
  .number({ required_error: 'Rating is required' })
  .int('Rating must be a whole number')
  .min(1, 'Rating must be at least 1 star')
  .max(5, 'Rating must be at most 5 stars')

export const reviewContentSchema = z
  .string({ required_error: 'Review content is required' })
  .min(REVIEW_CONTENT_MIN, `Review must be at least ${REVIEW_CONTENT_MIN} characters`)
  .max(REVIEW_CONTENT_MAX, `Review must be at most ${REVIEW_CONTENT_MAX} characters`)
  .trim()

export const reviewTitleSchema = z
  .string()
  .max(100, 'Title must be at most 100 characters')
  .trim()
  .optional()

export const createReviewSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  jobId: z.string().min(1, 'Job ID is required'),
  rating: ratingSchema,
  title: reviewTitleSchema,
  content: reviewContentSchema,
  photos: z
    .array(z.string().url('Photo must be a valid URL'))
    .max(MAX_PHOTOS, `Maximum ${MAX_PHOTOS} photos allowed`)
    .optional()
    .default([]),
})

export const updateReviewSchema = z
  .object({
    rating: ratingSchema.optional(),
    title: reviewTitleSchema,
    content: reviewContentSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  })

export const flagReviewSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'fake', 'harassment', 'other'], {
    required_error: 'Flag reason is required',
    invalid_type_error: 'Invalid flag reason',
  }),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
})

// ─── Response schemas ─────────────────────────────────────────────────────────

export const createResponseSchema = z.object({
  content: z
    .string({ required_error: 'Response content is required' })
    .min(5, 'Response must be at least 5 characters')
    .max(500, 'Response must be at most 500 characters')
    .trim(),
})

export const updateResponseSchema = createResponseSchema

// ─── Moderation schemas ───────────────────────────────────────────────────────

export const moderationActionSchema = z.object({
  action: z.enum(['hide', 'unhide', 'approve', 'remove'], {
    required_error: 'Action is required',
  }),
  note: z.string().max(500).trim().optional(),
})

// ─── Query schemas ────────────────────────────────────────────────────────────

export const reviewQuerySchema = z.object({
  workerId: z.string().optional(),
  clientId: z.string().optional(),
  jobId: z.string().optional(),
  rating: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).max(5).optional()),
  sort: z.enum(['recent', 'highest', 'lowest', 'most_helpful']).optional().default('recent'),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0))
    .pipe(z.number().int().min(0)),
})

export const moderationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0))
    .pipe(z.number().int().min(0)),
})

// ─── Type exports ─────────────────────────────────────────────────────────────

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type FlagReviewInput = z.infer<typeof flagReviewSchema>
export type CreateResponseInput = z.infer<typeof createResponseSchema>
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>
export type ModerationActionInput = z.infer<typeof moderationActionSchema>
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>
