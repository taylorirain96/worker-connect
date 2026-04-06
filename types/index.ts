export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: 'worker' | 'employer' | 'admin'
  createdAt: string
  profileComplete: boolean
  bio?: string
  location?: string
  phone?: string
  website?: string
  skills?: string[]
  hourlyRate?: number
  availability?: 'available' | 'busy' | 'unavailable'
  rating?: number
  reviewCount?: number
  completedJobs?: number
  totalEarnings?: number
  weeklyPoints?: number
  allTimePoints?: number
  badges?: string[]
  level?: 'bronze' | 'silver' | 'gold' | 'platinum'
  verified?: boolean
  verifiedDetails?: {
    id: boolean
    responded: boolean
    reviews: boolean
  }
  verificationLevel?: 'unverified' | 'basic' | 'trusted'
  stripeCustomerId?: string
  stripeAccountId?: string
}

export interface Job {
  id: string
  title: string
  description: string
  category: JobCategory
  employerId: string
  employerName: string
  employerAvatar?: string
  location: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  skills: string[]
  applicantsCount: number
  completionCount?: number
  totalEarnings?: number
  weeklyPoints?: number
  badges?: string[]
  createdAt: string
  updatedAt: string
  deadline?: string
  assignedWorkerId?: string
  images?: string[]
}

export type JobCategory =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'hvac'
  | 'roofing'
  | 'landscaping'
  | 'painting'
  | 'flooring'
  | 'cleaning'
  | 'moving'
  | 'general'

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  workerId: string
  workerName: string
  workerAvatar?: string
  employerId: string
  coverLetter: string
  proposedRate: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file'
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  participantAvatars?: Record<string, string>
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: Record<string, number>
  jobId?: string
  jobTitle?: string
  createdAt: string
}

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

export type ReviewType = 'worker_review' | 'enterprise_review'
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

export interface Payment {
  id: string
  jobId: string
  jobTitle: string
  employerId: string
  workerId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'failed'
  stripePaymentIntentId: string
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  jobId: string
  jobTitle: string
  employerId: string
  workerId: string
  workerName: string
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  createdAt: string
  paidAt?: string
}

export interface BusinessProfile {
  id: string
  userId: string
  // Company Information
  companyName: string
  slug: string
  logoURL?: string
  coverImageURL?: string
  industry: string
  companySize: 'solo' | '2-10' | '11-50' | '50+'
  yearsInBusiness: number
  serviceAreas: string[]
  website?: string
  linkedIn?: string
  facebook?: string
  description: string
  missionStatement?: string
  // Verification & Credentials
  licenseNumber?: string
  licenseVerified: boolean
  hasGeneralLiability: boolean
  hasWorkersComp: boolean
  backgroundCheckStatus: 'clear' | 'pending' | 'not_completed'
  bbbRating?: string
  googleRating?: number
  certifications?: string[]
  // Subscription
  subscriptionTier: 'basic' | 'premium' | 'professional' | 'enterprise'
  isVerifiedContractor: boolean
  isEnterprisePartner: boolean
  // Stats
  totalJobsPosted: number
  workersHiredYTD: number
  avgJobValue?: number
  successRate?: number
  avgTimeToFill?: number
  repeatHireRate?: number
  // Ratings
  overallRating: number
  reviewCount: number
  ratingBreakdown?: {
    communication: number
    quality: number
    timeliness: number
    fairPay: number
  }
  responseRate?: number
  // Meta
  profileCompletionPct: number
  createdAt: string
  updatedAt: string
}

export interface BusinessReview {
  id: string
  businessId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  jobTitle: string
  rating: number
  communication: number
  quality: number
  timeliness: number
  fairPay: number
  comment: string
  createdAt: string
}

export interface LicenseDetails {
  licenseNumber: string
  licenseType: string
  state: string
  expirationDate: string
  verified: boolean
  verifiedAt?: string
}

export interface InsuranceDetails {
  hasGeneralLiability: boolean
  generalLiabilityPolicyNumber?: string
  generalLiabilityExpiration?: string
  generalLiabilityCoverage?: number
  hasWorkersComp: boolean
  workersCompPolicyNumber?: string
  workersCompExpiration?: string
  verified: boolean
  verifiedAt?: string
}

export interface BackgroundCheckDetails {
  status: 'not_started' | 'pending' | 'clear' | 'issues'
  provider?: string
  completedAt?: string
  expiresAt?: string
}

export interface ExternalRatingDetails {
  bbbNumber?: string
  bbbLink?: string
  bbbRating?: string
  bbbReviewCount?: number
  googleProfileLink?: string
  googleRating?: number
  googleReviewCount?: number
  lastSyncedAt?: string
}

export interface CertificationRecord {
  id: string
  name: string
  issuingOrganization?: string
  certificateNumber?: string
  issueDate?: string
  expirationDate?: string
  verified: boolean
  createdAt?: string
}

export interface BusinessVerification {
  id: string
  businessId: string
  license: LicenseDetails | null
  insurance: InsuranceDetails | null
  backgroundCheck: BackgroundCheckDetails
  externalRatings: ExternalRatingDetails
  certifications: CertificationRecord[]
  trustScore: number
  verifiedCount: number
  updatedAt: string
}

export interface AdminStats {
  totalUsers: number
  totalWorkers: number
  totalEmployers: number
  totalJobs: number
  openJobs: number
  completedJobs: number
  totalRevenue: number
  monthlyRevenue: number
  activeConversations: number
  pendingApplications: number
}

export interface CategoryInfo {
  id: JobCategory
  label: string
  icon: string
  description: string
  color: string
}

export interface Notification {
  id: string
  userId: string
  jobId?: string
  message: string
  type: 'new_job' | 'new_review' | 'application' | 'message'
  read: boolean
  createdAt: string
}

export interface UserStats {
  completedJobs: number
  totalEarnings: number
  weeklyPoints: number
  allTimePoints: number
  badges: string[]
  verified: {
    id: boolean
    responded: boolean
    reviews: boolean
  }
}

// ─── Referral & Rewards Types ─────────────────────────────────────────────────

export type ReferralStatus = 'pending' | 'signed_up' | 'completed_3' | 'completed_50' | 'trusted_pro'

export interface Referral {
  id: string
  referrerId: string
  referredId?: string
  referralCode: string
  status: ReferralStatus
  createdAt: string
  updatedAt: string
  earnedAmount: number
  referredName?: string
  referredEmail?: string
  jobsCompleted?: number
}

export interface ReferralStats {
  totalReferred: number
  totalCompleted: number
  conversionRate: number
  totalEarned: number
  pendingEarnings: number
  activeReferrals: number
  milestoneProgress: {
    current: number
    nextMilestone: number
    nextBonus: number
  }
}

export type CashbackSource = 'job' | 'referral_bonus' | 'milestone' | 'bonus'

export interface EarningsTransaction {
  id: string
  workerId: string
  type: CashbackSource
  amount: number
  description: string
  jobId?: string
  referralId?: string
  status: 'pending' | 'available' | 'withdrawn'
  createdAt: string
  weekOf?: string
}

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type TransferType = 'standard' | 'instant'

export interface Withdrawal {
  id: string
  workerId: string
  amount: number
  fee: number
  netAmount: number
  bankAccountId: string
  bankAccountLast4: string
  bankName: string
  transferType: TransferType
  status: WithdrawalStatus
  stripeTransferId?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  failureReason?: string
}

export interface BankAccount {
  id: string
  workerId: string
  bankName: string
  last4: string
  routingNumber?: string
  accountType: 'checking' | 'savings'
  isDefault: boolean
  stripeExternalAccountId?: string
  verified: boolean
  createdAt: string
}

export interface EarningsSummary {
  totalLifetime: number
  totalThisMonth: number
  totalLastMonth: number
  cashbackEarned: number
  referralEarned: number
  bonusEarned: number
  pendingBalance: number
  availableBalance: number
  monthlyBreakdown: MonthlyEarnings[]
}

export interface MonthlyEarnings {
  month: string        // e.g. "2024-01"
  label: string        // e.g. "Jan 2024"
  total: number
  cashback: number
  referral: number
  bonus: number
  jobCount: number
}

// ─── Photo Reviews Types ──────────────────────────────────────────────────────

export type PhotoType = 'before' | 'after' | 'general'
export type PhotoApprovalStatus = 'pending' | 'approved' | 'flagged'

export interface JobPhoto {
  id: string
  jobId: string
  workerId: string
  workerName: string
  url: string
  storagePath: string
  type: PhotoType
  caption: string
  approvalStatus: PhotoApprovalStatus
  qualityScore?: number
  moderatorNote?: string
  uploadedAt: string
}

export interface JobPhotoUpload {
  file: File
  type: PhotoType
  caption: string
  preview: string
}

export interface PhotoStats {
  totalPhotos: number
  totalJobsWithPhotos: number
  totalJobsCompleted: number
  photoCompletionRate: number
  avgPhotosPerJob: number
  avgUploadResponseHours: number
}

export interface PhotoModerationAction {
  photoId: string
  action: 'approve' | 'flag'
  moderatorId: string
  note?: string
  qualityScore?: number
  actionAt: string
}

// ─── Payment Processing Types ─────────────────────────────────────────────────

export type PayoutSchedule = 'daily' | 'weekly' | 'monthly' | 'manual'
export type PayoutMethod = 'bank_account' | 'debit_card'
export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'

export interface Payout {
  id: string
  workerId: string
  amount: number
  currency: string
  method: PayoutMethod
  status: PayoutStatus
  stripePayoutId?: string
  bankAccountLast4?: string
  bankName?: string
  estimatedArrival?: string
  failureMessage?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

export interface PayoutSettings {
  workerId: string
  schedule: PayoutSchedule
  minimumAmount: number
  method: PayoutMethod
  bankAccountId?: string
  stripeConnectId?: string
  updatedAt: string
}

export type DisputeStatus = 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost' | 'warning_closed'
export type DisputeReason = 'bank_cannot_process' | 'check_returned' | 'credit_not_processed' | 'customer_initiated' | 'debit_not_authorized' | 'duplicate' | 'fraudulent' | 'general' | 'incorrect_account_details' | 'insufficient_funds' | 'product_not_received' | 'product_unacceptable' | 'subscription_canceled' | 'unrecognized'

export interface PaymentDispute {
  id: string
  paymentId: string
  jobId: string
  workerId: string
  employerId: string
  amount: number
  currency: string
  reason: DisputeReason
  status: DisputeStatus
  stripeDisputeId: string
  dueBy?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentAnalytics {
  totalRevenue: number
  totalPayouts: number
  pendingPayouts: number
  successfulPayments: number
  failedPayments: number
  disputeCount: number
  averagePaymentValue: number
  revenueByMonth: { month: string; label: string; revenue: number; payouts: number }[]
}

// ─── Dispute Resolution Types ─────────────────────────────────────────────────

export type DisputeResolutionStatus =
  | 'open'
  | 'under_review'
  | 'awaiting_evidence'
  | 'resolved'
  | 'closed'
  | 'escalated'

export type DisputeResolutionReason =
  | 'quality_issues'
  | 'non_payment'
  | 'non_delivery'
  | 'misrepresentation'
  | 'safety_concern'
  | 'overcharge'
  | 'incomplete_work'
  | 'other'

export type DisputeDecision = 'approved' | 'denied' | 'partial_refund' | 'escalated'

export type EvidenceType = 'photo' | 'document' | 'message_history' | 'other'

export type AppealStatus = 'pending' | 'under_review' | 'approved' | 'denied'

export interface Dispute {
  id: string
  jobId: string
  jobTitle: string
  workerId: string
  workerName: string
  clientId: string
  clientName: string
  reason: DisputeResolutionReason
  description: string
  status: DisputeResolutionStatus
  filedBy: string
  mediatorId?: string
  mediatorName?: string
  refundAmount?: number
  refundStatus?: 'pending' | 'processing' | 'completed' | 'none'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  dueDate: string
}

export interface DisputeEvidence {
  id: string
  disputeId: string
  type: EvidenceType
  fileUrl?: string
  storagePath?: string
  fileName?: string
  fileSize?: number
  description: string
  uploadedBy: string
  uploaderName: string
  timestamp: string
}

export interface DisputeMessage {
  id: string
  disputeId: string
  senderId: string
  senderName: string
  senderRole: 'worker' | 'client' | 'mediator' | 'admin'
  message: string
  isInternal: boolean
  read: boolean
  timestamp: string
}

export interface DisputeResolution {
  id: string
  disputeId: string
  decision: DisputeDecision
  refundAmount: number
  mediatorId: string
  mediatorName: string
  reasoning: string
  timestamp: string
}

export interface RatingAppeal {
  id: string
  jobId: string
  jobTitle: string
  workerId: string
  workerName: string
  clientId: string
  currentRating: number
  appealReason: string
  disputeId?: string
  status: AppealStatus
  mediatorId?: string
  mediatorNote?: string
  decision?: 'rating_removed' | 'rating_adjusted' | 'rating_upheld'
  adjustedRating?: number
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}
