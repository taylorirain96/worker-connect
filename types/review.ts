/**
 * TypeScript interfaces for the Rating & Reviews System.
 * Re-exports core types from types/index.ts and adds additional
 * review-specific interfaces used across the application.
 */

export type {
  DetailedReview,
  ReviewResponse,
  ReviewVote,
  ReviewReport,
  ReviewAggregates,
  CategoryRatings,
  ReviewModerationStatus,
  ReviewType,
} from './index'

// ─── Review Status ────────────────────────────────────────────────────────────

export type ReviewStatus = 'published' | 'flagged' | 'hidden'

// ─── Photo proof ──────────────────────────────────────────────────────────────

export interface ReviewPhoto {
  url: string
  storagePath: string
  /** File size in bytes */
  size?: number
  /** MIME type */
  type?: string
}

// ─── Flag system ──────────────────────────────────────────────────────────────

export type FlagReason =
  | 'spam'
  | 'inappropriate'
  | 'fake'
  | 'harassment'
  | 'other'

export interface ReviewFlag {
  id: string
  reviewId: string
  reporterId: string
  reason: FlagReason
  description?: string
  createdAt: string
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreateReviewPayload {
  workerId: string
  clientId: string
  jobId: string
  rating: number
  title?: string
  content: string
  photos?: string[]
}

export interface UpdateReviewPayload {
  rating?: number
  title?: string
  content?: string
}

export interface CreateResponsePayload {
  content: string
}

export interface FlagReviewPayload {
  reason: FlagReason
  description?: string
}

export interface ModerationAction {
  action: 'hide' | 'unhide' | 'approve' | 'remove'
  note?: string
}

// ─── Sort / Filter ────────────────────────────────────────────────────────────

export type ReviewSortOption = 'recent' | 'highest' | 'lowest' | 'most_helpful'

export interface ReviewFilters {
  workerId?: string
  clientId?: string
  jobId?: string
  rating?: number
  sort?: ReviewSortOption
  limit?: number
  offset?: number
  status?: ReviewStatus
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<string, number>
  responseRate: number
}
