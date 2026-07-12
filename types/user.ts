export type Country = 'NZ' | 'AU'

/** Which Pro/Elite feature a worker can trial with Boosts */
export type TrialType = 'early_job_alerts' | 'featured_profile' | 'commission_8pct'

/** A single active (or recently expired) trial stored on the worker's profile */
export interface ActiveTrial {
  type: TrialType
  activatedAt: string // ISO timestamp
  expiresAt: string   // ISO timestamp — when the trial lapses
}

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
  region?: string
  city?: string
  website?: string
  skills?: string[]
  hourlyRate?: number
  availability?: 'available' | 'busy' | 'unavailable'
  availabilityUpdatedAt?: string
  rating?: number
  reviewCount?: number
  /** Average rating received as an employer/homeowner from workers (employer_review type) */
  employerRating?: number
  /** Number of reviews received as an employer/homeowner from workers */
  employerReviewCount?: number
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
  /** NZD balance available for withdrawal (maintained by escrow release transactions) */
  availableBalance?: number
  /** Whether this worker has Mover Mode enabled (targets relocation jobs) */
  moverMode?: boolean
  /** Whether the worker holds public liability insurance */
  hasLiabilityInsurance?: boolean
  /** Name of the worker's liability insurance provider (optional) */
  insuranceProvider?: string
<<<<<<< HEAD
  /** Whether the worker charges a separate site-visit / in-person quote fee */
  chargesQuoteFee?: boolean
  /** Worker-set site-visit / in-person quote fee amount */
  quoteFeeAmount?: number
=======
  /** Boost balance — earned via achievements/leaderboard, spent on add-ons and trials */
  boosts?: number
  /** Currently active (or recently activated) feature trials */
  activeTrials?: ActiveTrial[]
>>>>>>> origin/main
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
  verificationSource?: 'mbie_api' | 'lbp_register' | 'electrical_register' | 'plumbing_register' | 'manual'
  createdAt: string
  updatedAt: string
}
