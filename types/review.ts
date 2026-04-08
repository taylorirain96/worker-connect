/**
 * types/review.ts
 *
 * Re-exports all review-related TypeScript interfaces and types from the
 * canonical source (`types/index.ts`) so consumers can import from either path.
 */
export type {
  ReviewType,
  ReviewModerationStatus,
  CategoryRatings,
  DetailedReview,
  ReviewResponse,
  ReviewVote,
  ReviewReport,
  ReviewAggregates,
} from './index'
