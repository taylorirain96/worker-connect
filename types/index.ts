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

export interface JobPhoto {
  id: string
  jobId: string
  workerId: string
  workerName: string
  url: string
  thumbnailUrl?: string
  caption: string
  type: 'before' | 'after' | 'progress'
  approvalStatus: 'pending' | 'approved' | 'flagged'
  qualityScore?: number
  moderatorNote?: string
  fileSize: number
  width?: number
  height?: number
  createdAt: string
  updatedAt: string
}

export interface PhotoUploadItem {
  file: File
  preview: string
  caption: string
  type: 'before' | 'after' | 'progress'
  progress: number
  status: 'idle' | 'uploading' | 'done' | 'error'
  errorMessage?: string
}

export interface PhotoStats {
  totalPhotos: number
  totalJobs: number
  jobsWithPhotos: number
  photoCompletionRate: number
  avgPhotosPerJob: number
  photoBadges: string[]
}
