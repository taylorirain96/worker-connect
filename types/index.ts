export type Country = 'NZ' | 'AU'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: 'worker' | 'employer' | 'admin' | 'homeowner' | 'tradie' | 'jobseeker' | 'property_manager'
  createdAt: string
  updatedAt?: string
  profileComplete: boolean
  bio?: string
  location?: string
  phone?: string
  website?: string
  skills?: string[]
  hourlyRate?: number
  availability?: 'available' | 'busy' | 'unavailable'
  availabilityUpdatedAt?: string
  rating?: number
  reviewCount?: number
  completedJobs?: number
  completionRate?: number // 0–1 fraction of accepted jobs completed (used for Mover Mode ranking)
  totalEarnings?: number
  weeklyPoints?: number
  allTimePoints?: number
  badges?: string[]
  level?: 'bronze' | 'silver' | 'gold' | 'platinum'
  verified?: boolean
  verificationStatus?: 'pending' | 'approved' | 'rejected'
  verificationRejectionReason?: string
  verifiedDetails?: {
    id: boolean
    responded: boolean
    reviews: boolean
  }
  verificationLevel?: 'unverified' | 'basic' | 'trusted'
  stripeCustomerId?: string
  stripeAccountId?: string
  companyName?: string
  workerSubscriptionTier?: 'free' | 'pro' | 'elite'
  employerSubscriptionTier?: 'free' | 'pro' | 'business' | 'enterprise'
  /** Array of worker UIDs this homeowner has favourited */
  favourites?: string[]
  /** YouTube or Vimeo URL for the worker's intro/profile video */
  videoUrl?: string
  /** ABN for Australian employers (11 digits) */
  abn?: string

  /** Referral code unique to this user, stored in Firestore */
  referralCode?: string
  /** UID of the user who referred this user */
  referredBy?: string
  /** Referral code used when this user signed up */
  referredByCode?: string
  /** NZD credit balance available to spend at checkout */
  credit?: number
  /** Legacy referral credits field (kept for backwards compatibility) */
  referralCredits?: number
  /** Total NZD affiliate earnings accumulated (from referrals that converted to paid jobs) */
  affiliateBalance?: number
  /** Total NZD paid out to this affiliate via Stripe Transfer */
  affiliatePaidOut?: number
  /** Country the user operates in */
  country?: Country
  /** Australian Business Number (AU users only) */
  abnNumber?: string
  /** URL of the worker's video profile stored in Firebase Storage */
  videoProfileUrl?: string
  /** NZ Police vetting / background check status */
  backgroundCheckStatus?: 'notStarted' | 'pending' | 'approved' | 'rejected'
  /** ISO date string when the background check was approved */
  backgroundCheckApprovedAt?: string
  /** ISO date string when the background check certificate expires */
  backgroundCheckExpiry?: string
  /** WorkSafe NZ compliance checklist */
  worksafeCompliance?: {
    inductionComplete: boolean
    ppeConfirmed: boolean
    hazardRegisterViewed: boolean
    safetyPlanUploaded: boolean
    completedAt?: string
  }
}

// ─── Worker Trade Licences ────────────────────────────────────────────────────

export type TradeLicenceType =
  | 'lbp'
  | 'electrical'
  | 'plumbing'
  | 'gasfitting'
  | 'drainlaying'
  | 'hvac'
  | 'scaffolding'
  | 'site_safe'
  | 'first_aid'
  | 'asbestos'
  | 'forklift'
  | 'other'

export const TRADE_LICENCE_LABELS: Record<TradeLicenceType, string> = {
  lbp: 'LBP — Licensed Building Practitioner',
  electrical: 'Registered Electrician',
  plumbing: 'Registered Plumber',
  gasfitting: 'Gasfitter Licence',
  drainlaying: 'Drainlayer Licence',
  hvac: 'HVAC / Refrigeration Certificate',
  scaffolding: 'Scaffolding Certificate',
  site_safe: 'Site Safe Certificate',
  first_aid: 'First Aid Certificate',
  asbestos: 'Asbestos Removal Licence',
  forklift: 'Forklift Licence',
  other: 'Other Certification',
}

export interface WorkerTradeLicence {
  id: string
  uid: string
  licenceType: TradeLicenceType
  licenceNumber?: string
  issuingBody?: string
  issueDate?: string
  expiryDate?: string
  /** Firebase Storage download URL of the uploaded certificate document */
  documentUrl?: string
  /** Worker-provided notes */
  notes?: string
  /** Whether this licence has been verified against the government register */
  governmentVerified?: boolean
  /** ISO timestamp of when government verification was confirmed */
  governmentVerifiedAt?: string
  /** Which government register was used for verification */
  verificationSource?: 'lbp_register' | 'electrical_register' | 'plumbing_register' | 'manual'
  createdAt: string
  updatedAt: string
}

export interface DirectRequest {
  id: string
  homeownerId: string
  homeownerName: string
  homeownerEmail: string
  workerId: string
  workerName: string
  workerEmail: string
  description: string
  date: string
  address: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  updatedAt: string
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
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
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
  /** Whether the job posting fee has been paid (draft = unpaid, active = live, expired = listing period ended) */
  paymentStatus?: 'draft' | 'active' | 'expired'
  /** Type of job — 'employment' = staff role posted by employer, 'gig' = one-off task posted by homeowner */
  jobType?: 'employment' | 'gig'
  /** Reference to the job posting payment record */
  postingPaymentId?: string
  /** Whether the job has a featured listing upsell */
  featuredListing?: boolean
  /** Whether the job has an urgent badge upsell */
  urgentBadge?: boolean
  /** ISO timestamp when the job was activated (posting fee paid) */
  activatedAt?: string
  /** ID of the current escrow payment record */
  escrowId?: string
  /** Current escrow status */
  escrowStatus?: 'pending' | 'held' | 'released' | 'disputed' | 'refunded'
  /** ISO timestamp when the job was marked as completed */
  completedAt?: string
  /** ISO deadline (completedAt + 24h) within which the worker may dispute completion */
  workerDisputeDeadline?: string
  /** Country the job is located in */
  country?: Country
  /** Whether this job recurs automatically */
  recurring?: boolean
  /** How often to re-create this job */
  recurrenceInterval?: 'weekly' | 'fortnightly' | 'monthly'
  /** ISO date of the next scheduled recurrence */
  nextRecurrenceAt?: string
  /** ID of the parent (original) recurring job */
  parentJobId?: string
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
  | 'apprenticeship'
  | 'training'

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
  imageUrls?: string[]
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

export interface ChatConversation {
  id: string
  participants: Record<string, true>
  participantNames: Record<string, string>
  participantAvatars?: Record<string, string | null>
  lastMessage?: string
  lastMessageAt?: number
  jobId?: string
  jobTitle?: string
  unreadCount?: Record<string, number>
  createdAt: number
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

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber?: string // INV-YYYYMMDD-XXXX
  jobId: string
  jobTitle?: string
  employerId: string
  workerId: string
  workerName?: string
  amount: number
  items?: InvoiceItem[]
  subtotal?: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'completed' | 'overdue' | 'cancelled'
  dueDate: string
  createdAt: string
  updatedAt?: string
  paidAt?: string
}

export interface Refund {
  id: string
  paymentId: string
  amount: number
  reason: string
  stripeRefundId?: string
  status: 'pending' | 'completed' | 'failed'
  failureReason?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  failedAt?: string
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
  hasPublicLiability?: boolean
  hasACCEmployerLevy?: boolean
  isRatedTrader?: boolean
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

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType =
  // Job alerts
  | 'new_job'
  | 'application_received'
  | 'job_status_change'
  | 'job_completed'
  // Message alerts
  | 'new_message'
  | 'message_reply'
  | 'conversation_started'
  // Legacy compatibility
  | 'application'
  | 'new_review'
  | 'message'
  // Payment alerts
  | 'payment_received'
  | 'invoice_created'
  | 'payout_processed'
  | 'payment_failed'
  | 'dispute_opened'
  // Review alerts
  | 'review_received'
  | 'review_response_needed'
  | 'rating_changed'
  // Verification alerts
  | 'document_uploaded'
  | 'verification_approved'
  | 'verification_rejected'
  | 'badge_earned'
  // System alerts
  | 'account_update'
  | 'security_alert'
  | 'maintenance'
  // Application alerts
  | 'application_accepted'
  | 'application_rejected'
  | 'job_posted'
  | 'general'
  // Gamification alerts
  | 'points_earned'
  | 'badge_unlocked'
  | 'milestone_reached'
  | 'leaderboard_change'
  // Placement / employment check-in alerts
  | 'placement_checkin_worker'
  | 'placement_checkin_employer'
  | 'placement_ended_worker'
  | 'placement_ended_employer'

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app'

export type NotificationFrequency = 'instant' | 'daily_digest' | 'weekly_digest' | 'off'

export type NotificationCategory =
  | 'jobs'
  | 'messages'
  | 'payments'
  | 'reviews'
  | 'verification'
  | 'system'
  | 'gamification'

export interface Notification {
  id: string
  userId: string
  jobId?: string
  message: string
  title?: string
  type: NotificationType
  category?: NotificationCategory
  channel?: NotificationChannel
  read: boolean
  actionUrl?: string
  imageUrl?: string
  metadata?: Record<string, string | number | boolean>
  deliveryStatus?: NotificationDeliveryStatus
  createdAt: string
  readAt?: string
}

/** Simplified notification type for the in-app notification system (Lot 6). */
export interface AppNotification {
  id: string
  userId: string
  type: 'application_received' | 'application_accepted' | 'application_rejected' | 'job_posted' | 'general'
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
  relatedJobId?: string
  relatedApplicationId?: string
}

export interface NotificationDeliveryStatus {
  push?: 'pending' | 'sent' | 'delivered' | 'failed'
  email?: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed'
  sms?: 'pending' | 'sent' | 'delivered' | 'failed'
  in_app?: 'delivered' | 'read'
}

export interface NotificationPreferences {
  userId: string
  channels: {
    push: boolean
    email: boolean
    sms: boolean
    in_app: boolean
  }
  categories: {
    jobs: NotificationCategoryPreference
    messages: NotificationCategoryPreference
    payments: NotificationCategoryPreference
    reviews: NotificationCategoryPreference
    verification: NotificationCategoryPreference
    system: NotificationCategoryPreference
    gamification: NotificationCategoryPreference
  }
  quietHours: {
    enabled: boolean
    startTime: string  // "HH:MM" 24h format
    endTime: string    // "HH:MM" 24h format
    timezone: string
  }
  updatedAt: string
}

export interface NotificationCategoryPreference {
  push: boolean
  email: boolean
  sms: boolean
  frequency: NotificationFrequency
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string
  body: string
  htmlBody?: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminNotificationRequest {
  id?: string
  title: string
  message: string
  type: NotificationType
  targetSegment: 'all' | 'workers' | 'employers' | 'specific'
  targetUserIds?: string[]
  channels: NotificationChannel[]
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  sentCount?: number
  deliveredCount?: number
  failedCount?: number
  createdBy: string
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
  /** Set to true once referral credit has been awarded to both parties */
  creditAwarded?: boolean
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

// ─── Worker Availability & Booking Types ─────────────────────────────────────

export interface DayAvailability {
  available: boolean
  start: string  // e.g. '08:00'
  end: string    // e.g. '17:00'
}

export interface WorkerAvailability {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
  blockedDates: string[]  // ISO date strings e.g. '2026-06-01'
  minNoticeHours: number
}

export type BookingStatus = 'pending' | 'confirmed' | 'declined'

export interface BookingRequest {
  id: string
  workerId: string
  workerName: string
  workerEmail: string
  homeownerId: string
  homeownerName: string
  homeownerEmail: string
  requestedDate: string   // ISO date e.g. '2026-06-15'
  requestedTime: string   // e.g. '09:00'
  duration: number        // hours
  description: string
  address: string
  status: BookingStatus
  workerMessage?: string
  createdAt: string
  updatedAt?: string
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


export type PhotoType = 'before' | 'after' | 'progress' | 'other' | 'general'

export type PhotoApprovalStatus = 'pending' | 'approved' | 'flagged'

export interface JobPhoto {
  id: string
  jobId: string
  workerId: string
  workerName: string
  url: string
  thumbnailUrl?: string
  caption: string
  type: PhotoType
  approvalStatus: PhotoApprovalStatus
  qualityScore?: number
  uploadedAt: string
  fileSize?: number
  width?: number
  height?: number
  storagePath?: string
  moderatorNote?: string
}

export interface PhotoUploadResult {
  success: boolean
  photoId?: string
  url?: string
  error?: string
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
  | 'refunded'

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
  paymentId?: string // link to a payment for payment-based disputes
  jobId?: string
  jobTitle?: string
  workerId?: string
  workerName?: string
  clientId?: string
  clientName?: string
  reason: string
  description: string
  evidence?: string[]
  status: DisputeResolutionStatus
  notes?: string
  filedBy?: string
  mediatorId?: string
  mediatorName?: string
  refundAmount?: number
  refundStatus?: 'pending' | 'processing' | 'completed' | 'none'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  dueDate?: string
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

// ─── Onboarding ─────────────────────────────────────────────────────────────

export interface OnboardingProgress {
  workerId: string
  completion: number // 0-100
  requiredFields: {
    name: boolean
    email: boolean
    phone: boolean
    location: boolean
    skills: boolean
    hourlyRate: boolean
    bio: boolean
    profilePhoto: boolean
  }
  completedAt?: string
}

export interface WorkerVerificationRecord {
  id: string
  workerId: string
  type: 'government_id' | 'background_check' | 'insurance' | 'certification' | 'bbb'
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  documentUrl?: string
  token?: string
  submittedAt?: string
  reviewedAt?: string
  approvedAt?: string
  rejectionReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StripeConnectStatus {
  accountId: string
  status: 'incomplete' | 'pending_review' | 'active'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirements?: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
  }
}

export interface OnboardingChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
  required: boolean
  order: number
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

// ─── Job Matching System ──────────────────────────────────────────────────────

export interface JobLocation {
  city: string
  state: string
  coordinates: [number, number]
  remote: boolean
}

export interface MatchedJob extends Job {
  matchScore: number
  matchReasons: string[]
  isRemote: boolean
  distanceKm?: number
}

export interface JobApplication {
  id: string
  jobId: string
  jobTitle?: string
  employerId?: string
  employerName?: string
  workerId: string
  workerName?: string
  workerPhotoURL?: string
  workerRating?: number
  workerVerified?: boolean
  coverLetter?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  appliedAt: string
  updatedAt?: string
  respondedAt?: string
  rejectionReason?: string
}

export interface WorkerMatchProfile {
  workerId: string
  skills: string[]
  hourlyRate: number
  reputation: number
  completionRate: number
  location: { city: string; state: string; coordinates: [number, number] }
  availability: 'full_time' | 'part_time' | 'contract'
  moverMode?: {
    targetCity: string
    relocationReadiness: number
    active: boolean
  }
}

// ─── Admin Dashboard Types ────────────────────────────────────────────────────

export interface RevenueMetrics {
  totalRevenue: number
  platformCommission: number
  workerEarnings: number
  employerSpent: number
  averageTransactionValue: number
  transactionCount: number
  successRate: number
  previousPeriodRevenue: number
  revenueGrowth: number // percentage
}

export interface PaymentMetrics {
  total: number
  succeeded: number
  failed: number
  pending: number
  byMethod: { method: string; count: number; amount: number }[]
  averageValue: number
}

export interface DisputeMetrics {
  total: number
  open: number
  resolved: number
  averageResolutionTime: number // hours
  resolutionSuccessRate: number
  topReasons: { reason: string; count: number }[]
}

export interface SystemMetrics {
  apiResponseTime: { avg: number; p95: number; p99: number }
  errorRate: number
  uptime: number
  activeUsers: number
  concurrentSessions: number
}

export interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'moderator' | 'analyst'
  permissions: string[]
  createdAt: string
  lastLogin?: string
}

export interface WorkerMetrics {
  totalWorkers: number
  activeWorkers: number
  newWorkersThisPeriod: number
  verifiedWorkers: number
  avgRating: number
  avgJobsCompleted: number
  avgEarnings: number
  topCategories: { category: string; count: number }[]
}

export interface EmployerMetrics {
  totalEmployers: number
  activeEmployers: number
  newEmployersThisPeriod: number
  verifiedEmployers: number
  avgJobsPosted: number
  avgSpend: number
  topCategories: { category: string; count: number }[]
}

export interface DailyRevenue {
  date: string
  revenue: number
  transactions: number
  commission: number
}

export interface PaymentMethodBreakdown {
  method: string
  count: number
  amount: number
  percentage: number
}

export interface DisputeReasonStat {
  reason: string
  count: number
  percentage: number
}

export interface ErrorTrend {
  date: string
  count: number
  endpoint: string
}

export interface AdminWorkerRow {
  id: string
  name: string
  email: string
  rating: number
  jobsCompleted: number
  totalEarnings: number
  verificationStatus: 'unverified' | 'basic' | 'trusted'
  isActive: boolean
  region: string
  joinedAt: string
}

export interface AdminEmployerRow {
  id: string
  companyName: string
  email: string
  jobsPosted: number
  totalSpent: number
  activeJobs: number
  verificationStatus: 'unverified' | 'basic' | 'trusted'
  joinedAt: string
}

export interface AdminPaymentRow {
  id: string
  userId: string
  userName: string
  amount: number
  status: 'succeeded' | 'failed' | 'pending' | 'refunded'
  type: 'payment' | 'refund' | 'payout'
  method: string
  date: string
  jobId?: string
  jobTitle?: string
}

// ─── Platform Financial Types (NZ GST Compliant) ─────────────────────────────

export interface PlatformFinancials {
  id: string
  month: string // "2026-05"
  year: number
  totalJobsCompleted: number
  totalJobValue: number
  platformCommissionPercentage: number
  platformCommission: number
  stripeProcessingFee: number
  netPlatformRevenue: number
  expenses: ExpenseRecord[]
  totalExpenses: number
  totalExpenseGST: number
  expensesByCategory: {
    hosting: number
    software: number
    officeSupplies: number
    professionalServices: number
    infrastructure: number
    other: number
  }
  gst: {
    isRegistered: boolean
    registeredDate?: string
    registrationThreshold: number
    annualRunRateTowardThreshold: number
    thresholdProgress: number
    gstOnPlatformCommission?: number
    gstClaimableOnExpenses?: number
    netGSTOwedToIRD?: number
    gstReturnReady?: boolean
  }
  netProfit: number
  netProfitAfterGST?: number
  createdAt: string
  updatedAt: string
}

export interface ExpenseRecord {
  id: string
  date: string
  category: 'hosting' | 'software' | 'officeSupplies' | 'professionalServices' | 'infrastructure' | 'other'
  description: string
  amount: number
  gst: number
  totalCost: number
  receipt?: string
  claimableForGST: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface GSTReturn {
  id: string
  year: number
  period: 'bimonthly' | 'monthly'
  startDate: string
  endDate: string
  gstCollected: number
  gstClaimable: number
  netGSTOwed: number
  status: 'draft' | 'ready' | 'filed' | 'submitted'
  readyForIRD: boolean
  downloadURL?: string
  filedDate?: string
  createdAt: string
}

export interface YearlyPlatformSummary {
  year: number
  totalRevenue: number
  totalExpenses: number
  totalGSTCollected?: number
  totalGSTClaimable?: number
  totalGSTOwed?: number
  netProfit: number
  netProfitAfterGST?: number
  byMonth: PlatformFinancials[]
  gstReturnsGenerated: GSTReturn[]
  readyForAccountant: boolean
  exportURL?: string
}

// ─── Quotes & Estimates ──────────────────────────────────────────────────────

export interface Quote {
  id: string
  jobId: string
  jobTitle: string
  employerId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  workerVerified?: boolean
  basePrice: number
  laborHours?: number
  laborRate?: number
  materials?: { description: string; cost: number }[]
  travel?: { distance: number; cost: number }
  tax?: number
  totalPrice: number
  description: string
  timeline?: string
  availability?: string
  conditions?: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered'
  expiresAt: string
  createdAt: string
  updatedAt: string
  acceptedAt?: string
  attachments?: { url: string; name: string; type: 'image' | 'document' }[]
  counterOfferPrice?: number
  counterOfferNote?: string
  counterOfferAt?: string
  /** Up to 3 portfolio photos attached as "examples of my work" */
  portfolioPhotos?: { id: string; url: string; title: string }[]
}

export interface QuoteRequest {
  jobId: string
  jobTitle: string
  employerId: string
  requestMessage?: string
  createdAt: string
}

// ─── Tax & Earnings Types ────────────────────────────────────────────────────

export interface EarningsRecord {
  id: string
  workerId: string
  jobId: string
  jobTitle: string
  grossAmount: number
  platformFee: number
  netAmount: number
  tax?: number
  status: 'pending' | 'available' | 'withdrawn'
  createdAt: string
  recordedDate: string
}

export interface QuarterlyEarnings {
  workerId: string
  year: number
  quarter: 1 | 2 | 3 | 4
  totalEarnings: number
  totalJobs: number
  monthBreakdown: {
    month: string
    earnings: number
    jobs: number
  }[]
  estimatedTax?: number
}

export interface YearlyEarnings {
  workerId: string
  year: number
  totalEarnings: number
  totalJobs: number
  byQuarter: QuarterlyEarnings[]
  estimatedTotalTax?: number
}

export interface TaxForm1099NEC {
  id: string
  workerId: string
  workerName: string
  workerEmail: string
  workerAddress: string
  year: number
  boxNC2: number
  businessName: string
  businessEIN: string
  generatedAt: string
  sentAt?: string
  status: 'generated' | 'sent' | 'archived'
}

// ─── Task 8: Communication, Learning & Career Development ────────────────────

export interface Proposal {
  id: string
  jobId: string
  workerId: string
  employerId: string
  workerName?: string
  employerName?: string
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected'
  proposedTerms: {
    rate: number
    hours: number
    duration: string
    specialRequests?: string
  }
  counterOffers: CounterOffer[]
  createdAt: string
  expiresAt: string
  updatedAt: string
}

export interface CounterOffer {
  id: string
  proposedBy: 'worker' | 'employer'
  rate: number
  hours: number
  duration: string
  specialRequests?: string
  message?: string
  createdAt: string
}

export interface Agreement {
  id: string
  proposalId: string
  jobId: string
  workerId: string
  employerId: string
  workerName?: string
  employerName?: string
  agreedTerms: {
    rate: number
    hours: number
    duration: string
    deliverables: string[]
    payment_schedule: string
  }
  signatureStatus: {
    workerSigned: boolean
    employerSigned: boolean
    workerSignedAt?: string
    employerSignedAt?: string
  }
  documentUrl?: string
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface SkillAspiration {
  id: string
  workerId: string
  targetSkill: string
  currentLevel: 'none' | 'beginner' | 'intermediate'
  targetLevel: 'intermediate' | 'advanced' | 'expert'
  motivation: string
  trainingPath: string[]
  progress: number
  resourcesUsed: {
    type: string
    title: string
    provider: string
    status: 'planned' | 'in_progress' | 'completed'
    completedAt?: string
  }[]
  status: 'active' | 'paused' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface LearningJob {
  id: string
  workerId: string
  supervisorId: string
  employerId: string
  originalJobId?: string
  requiredSkill: string
  skillBeingTaught: string
  supervisorFeedback?: string
  learningArrangement: {
    supervisorId: string
    trainingComponent: string
    estimatedHours: number
  }
  skillGainedUpon: 'completion' | 'ongoing'
  certificationEligible: boolean
  status: 'active' | 'completed' | 'learning_failed' | 'mastered'
  title: string
  description: string
  location: string
  rate: number
  createdAt: string
  updatedAt: string
}

export interface SupervisorReport {
  id: string
  supervisorId: string
  learningJobId: string
  workerId: string
  competencyAssessment: number
  strengths: string[]
  improvementAreas: string[]
  readyForIndependent: boolean
  certifyingSkill: boolean
  notes?: string
  createdAt: string
}

export interface CareerPath {
  id: string
  fromSkill: string
  toSkill: string
  steps: {
    step: number
    title: string
    skillsNeeded: string[]
    jobs: string[]
    timeEstimate: string
  }[]
  successRate: number
  averageTimeToComplete: number
  description?: string
}

export interface Communication {
  id: string
  proposalId?: string
  jobId: string
  workerId: string
  employerId: string
  workerName?: string
  employerName?: string
  messages: ChatMessage[]
  lastMessage?: string
  unreadCount: number
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sender: string
  senderName: string
  content: string
  timestamp: string
  read: boolean
  type?: 'text' | 'image' | 'file'
}

export interface Certification {
  id: string
  workerId: string
  workerName?: string
  skill: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  issuedBy: string
  issuedAt: string
  expiresAt?: string
  learningJobId?: string
  supervisorId?: string
  verified: boolean
  badgeUrl?: string
}

export interface SkillLevel {
  skill: string
  level: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
  certifications: Certification[]
  lastUpdated: string
}

// ─── Growth & Intelligence Types ──────────────────────────────────────────────

export interface GrowthScore {
  score: number
  trend: 'up' | 'down' | 'stable'
  breakdown: {
    earnings: number
    completionRate: number
    rating: number
    engagement: number
    growth: number
  }
  calculatedAt: string
}

export interface EarningsTrend {
  period: string
  earnings: number
  jobs: number
  avgPerJob: number
}

export interface JobRecommendation {
  id: string
  jobId: string
  title: string
  employer: string
  budget: number
  location: string
  category: string
  skills: string[]
  score: number
  breakdown: {
    skills: number
    rating: number
    location: number
    availability: number
    specialization: number
  }
  postedAt: string
  expiresAt?: string
}

export interface RecommendationFeedback {
  workerId: string
  jobId: string
  action: 'like' | 'dislike' | 'applied' | 'dismissed'
  timestamp: string
}

export interface EarningsProjection {
  month: string
  projected: number
  low: number
  high: number
  confidence: number
}

export interface RateBenchmark {
  skill: string
  workerRate: number
  marketAvg: number
  topPercentile: number
  region: string
  trend: 'up' | 'down' | 'stable'
}

export interface PerformanceMetrics {
  category: string
  completionRate: number
  avgRating: number
  totalJobs: number
  earnings: number
  avgDuration: number
}

export interface PeerComparison {
  metric: string
  workerValue: number
  peerAvg: number
  topPercentile: number
  percentile: number
}

export interface ChurnRiskProfile {
  workerId: string
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: Array<{
    factor: string
    impact: number
    description: string
  }>
  lastActivity: string
  recommendations: string[]
}

export interface LifecycleStage {
  stage: 'new' | 'active' | 'pro' | 'master' | 'at-risk'
  label: string
  description: string
  nextStage?: string
  progressToNext: number
  requirements: string[]
}

export interface EngagementScore {
  score: number
  trend: 'up' | 'down' | 'stable'
  factors: {
    loginFrequency: number
    jobApplications: number
    completionRate: number
    responseTime: number
    profileCompleteness: number
  }
  period: string
}

// ─── Stripe / Escrow Payment System ──────────────────────────────────────────

/** Posting fee tier based on estimated job value (in NZD) */
export type JobPostingFeeTier = 'small' | 'medium' | 'large' | 'commercial'

/** Payment status for a job listing */
export type JobPaymentStatus = 'draft' | 'active' | 'expired'

/**
 * Status of an escrow payment — covers both escrow system variants.
 * - 'pending' / 'pending_deposit': awaiting employer deposit (new vs legacy naming)
 * - 'held' / 'in_escrow': funds are captured and held securely (new vs legacy naming)
 * - 'released': funds transferred to worker after commission deduction
 * - 'disputed': funds frozen pending admin resolution
 * - 'refunded': funds returned to employer
 */
export type EscrowStatus =
  | 'pending'
  | 'held'
  | 'pending_deposit'
  | 'in_escrow'
  | 'released'
  | 'disputed'
  | 'refunded'

/** Worker commission tier based on completed jobs */
export type CommissionTier = 'new' | 'established' | 'pro' | 'elite'

export interface JobPostingFee {
  tier: JobPostingFeeTier
  label: string
  /** Minimum job value for this tier (NZD) */
  minValue: number
  /** Maximum job value for this tier (NZD). null = no upper bound */
  maxValue: number | null
  /** Posting fee in NZD */
  fee: number
}

export const JOB_POSTING_FEES: JobPostingFee[] = [
  { tier: 'small',      label: 'Small Job',       minValue: 0,      maxValue: 499.99,  fee: 14.99 },
  { tier: 'medium',     label: 'Medium Job',       minValue: 500,    maxValue: 1999.99, fee: 29.99 },
  { tier: 'large',      label: 'Large Job',        minValue: 2000,   maxValue: 9999.99, fee: 54.99 },
  { tier: 'commercial', label: 'Commercial / Major', minValue: 10000, maxValue: null,    fee: 89.99 },
]

export interface CommissionTierConfig {
  tier: CommissionTier
  label: string
  /** Minimum completed jobs (inclusive) */
  minJobs: number
  /** Maximum completed jobs (inclusive). null = no upper bound */
  maxJobs: number | null
  /** Commission percentage (0–1) */
  rate: number
  /** Next tier for display purposes */
  nextTier?: CommissionTier
}

export const COMMISSION_TIERS: CommissionTierConfig[] = [
  { tier: 'new',         label: 'New Worker',   minJobs: 0,  maxJobs: 5,  rate: 0.18, nextTier: 'established' },
  { tier: 'established', label: 'Established',  minJobs: 6,  maxJobs: 20, rate: 0.15, nextTier: 'pro'         },
  { tier: 'pro',         label: 'Pro Worker',   minJobs: 21, maxJobs: 50, rate: 0.12, nextTier: 'elite'       },
  { tier: 'elite',       label: 'Elite Worker', minJobs: 51, maxJobs: null, rate: 0.10 },
]

/** An escrow record stored in Firestore */
export interface EscrowPayment {
  id: string
  jobId: string
  quoteId: string
  employerId: string
  workerId: string
  /** Total amount held in escrow (NZD) */
  amount: number
  currency: 'nzd'
  status: EscrowStatus
  stripePaymentIntentId?: string
  /** Platform commission percentage applied on release */
  commissionRate: number
  /** Commission amount (NZD) */
  commissionAmount: number
  /** Amount worker will receive (NZD) */
  workerAmount: number
  /** Stripe Connect transfer ID after release */
  stripeTransferId?: string
  /** Reason for dispute */
  disputeReason?: string
  createdAt: string
  updatedAt: string
  releasedAt?: string
  disputedAt?: string
  refundedAt?: string
}

/** A job posting payment record stored in Firestore */
export interface JobPostingPayment {
  id: string
  jobId: string
  employerId: string
  tier: JobPostingFeeTier
  amount: number
  currency: 'nzd'
  status: 'pending' | 'completed' | 'failed'
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  /** Optional upsells */
  featuredListing?: boolean
  urgentBadge?: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string
}

/** Worker earnings summary for the earnings dashboard */
export interface WorkerEarningsSummary {
  workerId: string
  totalEarned: number
  pendingEscrow: number
  commissionTier: CommissionTier
  commissionRate: number
  completedJobs: number
  jobsToNextTier: number | null
  nextTierRate: number | null
  currency: 'nzd'
}

/** A single escrow transaction entry for the worker earnings dashboard */
export interface EscrowEarningsTransaction {
  id: string
  jobId: string
  jobTitle: string
  employerName: string
  grossAmount: number
  commissionAmount: number
  commissionRate: number
  netAmount: number
  status: EscrowStatus
  createdAt: string
  releasedAt?: string
}

// ─── QuickTrade Escrow & Posting Fee Types ────────────────────────────────────

export type WorkerTier = 'new' | 'established' | 'pro' | 'elite'

export interface WorkerTierInfo {
  tier: WorkerTier
  label: string
  minJobs: number
  maxJobs: number | null
  commissionRate: number
  description: string
}

export const WORKER_TIERS: WorkerTierInfo[] = [
  { tier: 'new',         label: 'New Worker',    minJobs: 0,  maxJobs: 5,  commissionRate: 0.18, description: '0–5 jobs completed' },
  { tier: 'established', label: 'Established',   minJobs: 6,  maxJobs: 20, commissionRate: 0.15, description: '6–20 jobs completed' },
  { tier: 'pro',         label: 'Pro Worker',    minJobs: 21, maxJobs: 50, commissionRate: 0.12, description: '21–50 jobs completed' },
  { tier: 'elite',       label: 'Elite Worker',  minJobs: 51, maxJobs: null, commissionRate: 0.10, description: '51+ jobs completed' },
]

export function getWorkerTier(completedJobs: number): WorkerTierInfo {
  return (
    WORKER_TIERS.slice().reverse().find((t) => completedJobs >= t.minJobs) ??
    WORKER_TIERS[0]
  )
}

export type PostingFeeSize = 'small' | 'medium' | 'large' | 'commercial'

export interface PostingFeeInfo {
  size: PostingFeeSize
  label: string
  minBudget: number
  maxBudget: number | null
  fee: number
  description: string
}

export const POSTING_FEES: PostingFeeInfo[] = [
  { size: 'small',      label: 'Small Job',         minBudget: 0,     maxBudget: 499,   fee: 14.99, description: 'Under $500 NZD' },
  { size: 'medium',     label: 'Medium Job',         minBudget: 500,   maxBudget: 1999,  fee: 29.99, description: '$500–$2,000 NZD' },
  { size: 'large',      label: 'Large Job',          minBudget: 2000,  maxBudget: 9999,  fee: 54.99, description: '$2,000–$10,000 NZD' },
  { size: 'commercial', label: 'Commercial / Major', minBudget: 10000, maxBudget: null,  fee: 89.99, description: '$10,000+ NZD' },
]

export function getPostingFee(estimatedBudgetNZD: number): PostingFeeInfo {
  return (
    POSTING_FEES.slice().reverse().find((f) => estimatedBudgetNZD >= f.minBudget) ??
    POSTING_FEES[0]
  )
}

export type JobPaymentType = 'posting_fee' | 'escrow' | 'release'

export interface JobPaymentRecord {
  id: string
  jobId: string
  employerId: string
  workerId?: string
  amount: number
  currency: string
  stripePaymentIntentId: string
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'failed'
  type: JobPaymentType
  createdAt: string
  updatedAt: string
}

export interface EscrowRecord {
  id: string
  jobId: string
  jobTitle: string
  workerId: string
  employerId: string
  amount: number
  commission: number
  commissionRate: number
  workerReceives: number
  currency: string
  status: EscrowStatus
  stripePaymentIntentId?: string
  workerTier: WorkerTier
  createdAt: string
  updatedAt: string
  releasedAt?: string
  autoReleaseAt?: string
}

// ─── Worker Portfolio Photo Types ─────────────────────────────────────────────

/** A single photo in a worker's portfolio (stored at portfolio/{uid}/photos/{photoId}) */
export interface PortfolioPhoto {
  id: string
  uid: string
  url: string
  thumbnailUrl?: string
  title: string
  category: string
  description?: string
  order: number
  createdAt: string
}

// ─── Promo Code Types ─────────────────────────────────────────────────────────

export type PromoDiscountType = 'percent' | 'fixed'
export type PromoApplicableTo = 'first_job' | 'all_jobs' | string

export interface PromoCode {
  code: string
  discountType: PromoDiscountType
  discountAmount: number
  maxUses: number
  usedCount: number
  expiresAt: string | null
  createdBy: string
  active: boolean
  applicableTo: PromoApplicableTo
  createdAt: string
  updatedAt?: string
}

// ─── Job Milestone & Progress Tracking Types ──────────────────────────────────

/** Status lifecycle: pending → in_progress → submitted → approved | rejected */
export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected'

/**
 * A billing milestone on a job.
 * Stored at: jobs/{jobId}/milestones/{milestoneId}
 */
export interface JobMilestone {
  id: string
  jobId: string
  /** Human-readable title, e.g. "Frame & rough-in" */
  title: string
  description?: string
  /** Amount to release to the worker on approval (NZD) */
  amount: number
  /** 0-100 — what percentage of total job value this milestone represents */
  percentage: number
  status: MilestoneStatus
  /** Expected completion date */
  dueDate?: string
  /** ISO timestamp when the worker submitted the milestone for approval */
  submittedAt?: string
  /** ISO timestamp when the employer approved the milestone */
  approvedAt?: string
  /** Stripe Transfer ID created when this milestone was paid out */
  stripeTransferId?: string
  /** Message left by the worker when submitting */
  submissionNote?: string
  /** Message left by the employer when approving or rejecting */
  reviewNote?: string
  /** URLs of photos attached to the submission */
  submissionPhotos?: string[]
  /** Order index for display */
  order: number
  createdAt: string
  updatedAt: string
}

/**
 * A progress update posted by the worker during an active job.
 * Stored at: jobs/{jobId}/progressUpdates/{updateId}
 */
export interface JobProgressUpdate {
  id: string
  jobId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  message: string
  /** Optional photos attached to this update */
  photos?: string[]
  /** Linked milestone ID (if this update relates to a specific milestone) */
  milestoneId?: string
  createdAt: string
}

// ─── Credit Transaction Types ─────────────────────────────────────────────────

export type CreditTransactionType = 'referral_reward' | 'credit_applied' | 'manual_adjustment' | 'referral_signup'

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: CreditTransactionType
  description: string
  jobId?: string
  referralId?: string
  promoCode?: string
  createdAt: string
}

// ─── Service Package Types ────────────────────────────────────────────────────

/**
 * A fixed-price service package created by a worker (e.g. "1BR clean – $80").
 * Homeowners can browse and instantly book a package without quoting.
 * Firestore: servicePackages/{packageId}
 */
export interface ServicePackage {
  id: string
  workerId: string
  workerName: string
  workerPhotoURL?: string | null
  workerRating?: number
  workerReviewCount?: number
  workerCompletedJobs?: number
  /** Short title shown on the card */
  title: string
  /** Longer description of what is included */
  description: string
  /** Fixed price in NZD */
  price: number
  /** Job category matching JOB_CATEGORIES ids */
  category: string
  /** NZ region where the service is available */
  region: string
  /** Bullet-point inclusions shown on the card (max 8) */
  inclusions: string[]
  /** Estimated hours to complete the job */
  estimatedDurationHours: number
  /** Whether the package is publicly visible */
  active: boolean
  /** Whether this package supports instant booking (skip quote, pay deposit) */
  instantBook?: boolean
  /** Deposit percentage (0-100) required to instant-book; defaults to 20 */
  instantBookDepositPercent?: number
  createdAt: string
  updatedAt: string
}

/** Status of an instant-book service package order */
export type ServicePackageBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/**
 * A booking created when a homeowner clicks "Book Now" on a ServicePackage.
 * Firestore: servicePackageBookings/{bookingId}
 */
export interface ServicePackageBooking {
  id: string
  packageId: string
  packageTitle: string
  workerId: string
  workerName: string
  workerEmail: string
  homeownerId: string
  homeownerName: string
  homeownerEmail: string
  price: number
  category: string
  region: string
  /** Preferred date (ISO date string, e.g. '2026-07-01') */
  preferredDate: string
  /** Preferred time slot, e.g. '09:00' */
  preferredTime: string
  /** Homeowner's service address */
  address: string
  /** Optional extra notes from the homeowner */
  notes?: string
  status: ServicePackageBookingStatus
  /** ID of the job document created from this booking */
  jobId?: string
  createdAt: string
  updatedAt: string
}


export interface QuoteTemplate {
  id: string
  workerId: string
  name: string
  basePrice: number
  laborHours: number
  laborRate: number
  materials: { description: string; cost: number }[]
  travelCost: number
  description: string
  timeline: string
  conditions: string
  createdAt: string
  updatedAt: string
}

export interface JobTemplate {
  id: string
  /** Human-friendly name for this template, e.g. "Monthly lawn mow" */
  name: string
  title: string
  description: string
  category: string
  location: string
  budgetMin: number
  budgetMax: number
  budgetType: 'fixed' | 'hourly'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  skills: string
  createdAt: string
  updatedAt: string
}

// ─── Instant Booking ─────────────────────────────────────────────────────────

export interface InstantBooking {
  id: string
  packageId: string
  packageTitle: string
  workerId: string
  workerName: string
  homeownerId: string
  homeownerName: string
  homeownerEmail: string
  totalPrice: number
  depositAmount: number
  depositPercent: number
  address: string
  requestedDate: string
  requestedTime: string
  notes?: string
  status: 'deposit_pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt: string
}

// ─── Recurring Jobs ───────────────────────────────────────────────────────────

export interface RecurringJobSchedule {
  jobId: string
  employerId: string
  interval: 'weekly' | 'fortnightly' | 'monthly'
  nextRunAt: string
  lastRunAt?: string
  active: boolean
  totalRuns: number
  createdAt: string
  updatedAt: string
}

// ─── NPS Survey ───────────────────────────────────────────────────────────────

export interface NPSSurvey {
  id: string
  userId: string
  jobId: string
  role: 'worker' | 'homeowner' | 'employer'
  score: number
  comment?: string
  triggeredAt: string
  submittedAt?: string
  createdAt: string
}

// ─── Property Manager ─────────────────────────────────────────────────────────

export interface Property {
  id: string
  managerId: string
  address: string
  suburb: string
  city: string
  postcode: string
  propertyType: 'residential' | 'commercial' | 'industrial'
  notes?: string
  tenantName?: string
  tenantPhone?: string
  activeJobCount: number
  totalJobsPosted: number
  createdAt: string
  updatedAt: string
}
