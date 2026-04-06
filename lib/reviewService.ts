/**
 * Review service – public façade over lib/reviews/firebase.ts.
 * Exposes the operations used by API routes and client code.
 */
export {
  // Photo
  uploadReviewPhoto,
  deleteReviewPhoto,
  // CRUD
  createReview,
  getReviewsForEntity,
  getReviewById,
  getPendingModerationReviews,
  getFlaggedReviews,
  // Moderation
  moderateReview,
  deleteReview,
  // Voting
  voteReview,
  getUserVote,
  // Reports / flags
  reportReview,
  // Responses
  addReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
  // Aggregates
  getReviewAggregates,
  updateAggregates,
  // Types
  type ReviewSortBy,
  type ReviewQueryOptions,
} from '@/lib/reviews/firebase'

export {
  validateReviewForm,
  submitReview,
  getReviewBadges,
  formatRating,
  getRatingLabel,
  getRatingColor,
  type ReviewFormData,
  type ValidationResult,
  type SubmitReviewParams,
} from '@/lib/reviews/service'
