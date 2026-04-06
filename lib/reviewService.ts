/**
 * reviewService.ts – facade that re-exports everything from lib/reviews/service.ts
 * and lib/reviews/firebase.ts so consumers can import from a single path.
 */
export {
  validateReviewForm,
  submitReview,
  getReviewBadges,
  formatRating,
  getRatingLabel,
  getRatingColor,
} from './reviews/service'

export type {
  ReviewFormData,
  ValidationResult,
  SubmitReviewParams,
} from './reviews/service'

export {
  uploadReviewPhoto,
  deleteReviewPhoto,
  createReview,
  getReviewsForEntity,
  getReviewById,
  getPendingModerationReviews,
  getFlaggedReviews,
  moderateReview,
  deleteReview,
  voteReview,
  getUserVote,
  reportReview,
  addReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
  getReviewAggregates,
  updateAggregates,
} from './reviews/firebase'

export type {
  ReviewSortBy,
  ReviewQueryOptions,
} from './reviews/firebase'
