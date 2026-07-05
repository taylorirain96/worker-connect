export interface Review {
  id: string
  jobId: string
  jobTitle: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: string
}

// ─── Rating & Reviews System ──────────────────────────────────────────────────

export type ReviewType = 'worker_review' | 'enterprise_review' | 'employer_review'
export type ReviewModerationStatus = 'pending' | 'approved' | 'flagged' | 'removed'

export interface CategoryRatings {
  communication: number
  quality: number
  timeliness: number
  professionalism: number
}

export interface DetailedReview {
  id: string
  jobId: string
  jobTitle: string
  reviewType: ReviewType
  /** The person writing the review */
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  reviewerRole: 'worker' | 'employer' | 'admin'
  /** The person/enterprise being reviewed */
  revieweeId: string
  revieweeName: string
  /** Overall 1-5 star rating */
  rating: number
  /** Per-category 1-5 scores */
  categories: CategoryRatings
  comment: string
  /** Up to 3 photo URLs as proof */
  photos: string[]
  /** Storage paths for cleanup */
  photoStoragePaths: string[]
  isAnonymous: boolean
  moderationStatus: ReviewModerationStatus
  moderatorId?: string
  moderatorNote?: string
  /** How many users found this review helpful */
  helpfulCount: number
  /** How many users found this review unhelpful */
  unhelpfulCount: number
  /** Response from the reviewee */
  response?: ReviewResponse
  createdAt: string
  updatedAt: string
}

export interface ReviewResponse {
  id: string
  reviewId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  text: string
  createdAt: string
  updatedAt: string
}

export interface ReviewVote {
  id: string
  reviewId: string
  userId: string
  vote: 'helpful' | 'unhelpful'
  createdAt: string
}

export interface ReviewReport {
  id: string
  reviewId: string
  reporterId: string
  reason: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other'
  description?: string
  createdAt: string
}

export interface ReviewAggregates {
  id: string          // same as userId/enterpriseId
  entityId: string
  entityType: 'worker' | 'enterprise'
  totalReviews: number
  averageRating: number
  /** Distribution: { '1': count, '2': count, ... '5': count } */
  ratingDistribution: Record<string, number>
  categoryAverages: CategoryRatings
  responseRate: number
  updatedAt: string
}
