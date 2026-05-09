export type VerificationType = 'government_id' | 'background_check' | 'insurance' | 'certification' | 'bbb_rating'
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired'

export interface VerificationItem {
  id: string
  type: VerificationType
  status: VerificationStatus
  verifiedAt?: string
  expiresAt?: string
  documentUrl?: string
  notes?: string
}

export interface WorkerVerification {
  workerId: string
  items: VerificationItem[]
  verificationScore: number
  lastUpdated: string
}

export type ReputationTier = 'rookie' | 'professional' | 'expert' | 'master'

export interface ReputationScore {
  userId: string
  score: number
  tier: ReputationTier
  trustShields: number
  breakdown: {
    completionRate: number
    rating: number
    verification: number
    responseTime: number
    portfolio: number
  }
  calculatedAt: string
}

export interface ReputationLeaderboardEntry {
  userId: string
  name: string
  avatar?: string
  score: number
  tier: ReputationTier
  trustShields: number
  completionRate: number
  rank: number
}

export interface MoverSettings {
  workerId: string
  targetRelocationCity: string
  relocationReadiness: number
  isActive: boolean
  relocationAcceptanceRate: number
  relocationSuccessRate: number
  repeatClientRate: number
  hasRelocationBadge: boolean
  /** Whether the worker is open to relocating for work */
  willingToRelocate: boolean
  /** Whether the worker is available for FIFO (fly-in fly-out) rosters */
  fifoAvailable: boolean
  /** Countries the worker holds work rights in */
  targetCountries: ('NZ' | 'AU')[]
  /** Worker holds valid NZ work rights */
  workRightsNZ: boolean
  /** Worker holds valid AU work rights */
  workRightsAU: boolean
  /** Brief description of visa / work-rights status (e.g. "Citizen", "Work Visa", "457") */
  visaType?: string
  /** Whether the worker needs employer-provided accommodation */
  accommodationRequired: boolean
  /** Whether the worker needs travel assistance (flights, transport) */
  travelAssistanceRequired: boolean
  /** Preferred roster / work arrangement */
  rosterPreference?: 'fly_in_fly_out' | 'drive_in_drive_out' | 'residential'
  /** Whether the move would be temporary, permanent, or either */
  relocationPreference: 'temporary' | 'permanent' | 'either'
}

export interface MoverLeaderboardEntry {
  workerId: string
  name: string
  avatar?: string
  targetRelocationCity: string
  relocationSuccessRate: number
  completionRate: number
  rank: number
}

export interface MoverOpportunity {
  jobId: string
  title: string
  location: string
  budget: number
  urgency: 'low' | 'medium' | 'high'
  distance: number
  premiumMatch: boolean
}

export interface MoverStats {
  totalMoverWorkers: number
  avgRelocationSuccessRate: number
  topCities: string[]
  monthlyStats: { month: string; placements: number; avgSuccessRate: number }[]
}

export interface PortfolioItem {
  id: string
  workerId: string
  title: string
  description: string
  category: string
  beforeImageUrl?: string
  afterImageUrl?: string
  completedAt: string
  clientTestimonial?: {
    author: string
    rating: number
    text: string
  }
  tags: string[]
}

export interface WorkerPortfolio {
  workerId: string
  items: PortfolioItem[]
  totalProjects: number
  avgRating: number
  featuredItem?: PortfolioItem
}

export interface CompletionStats {
  workerId: string
  completionRate: number
  totalJobs: number
  completedJobs: number
  cancelledJobs: number
  label: 'pro' | 'job_hopper' | 'standard'
  trend: { month: string; rate: number }[]
}

export interface EarningsByTier {
  tier: ReputationTier
  avgEarnings: number
  totalWorkers: number
  premiumJobAccess: boolean
}
