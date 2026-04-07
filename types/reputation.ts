export type VerificationType = 'government_id' | 'background_check' | 'insurance' | 'certification' | 'bbb_google'
export type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'failed' | 'expired'

export interface VerificationRecord {
  id: string
  workerId: string
  type: VerificationType
  status: VerificationStatus
  submittedAt: string
  verifiedAt?: string
  expiresAt?: string
  documentUrl?: string
  notes?: string
}

export type ReputationTier = 'rookie' | 'professional' | 'expert' | 'master'

export interface ReputationScore {
  userId: string
  score: number
  tier: ReputationTier
  trustShields: number
  completionRate: number
  averageRating: number
  verificationScore: number
  responseTimeScore: number
  portfolioScore: number
  calculatedAt: string
}

export interface WorkerMoverSettings {
  workerId: string
  targetRelocationCity?: string
  relocationReadiness: number
  isRelocationReady: boolean
  relocationAcceptanceRate: number
  relocationSuccessRate: number
  repeatClientRate: number
  updatedAt: string
}

export interface PortfolioItem {
  id: string
  workerId: string
  title: string
  description: string
  category: string
  beforeImageUrl?: string
  afterImageUrl?: string
  imageUrls: string[]
  completedAt: string
  clientTestimonial?: string
  tags: string[]
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl?: string
  score: number
  tier: ReputationTier
  completionRate: number
  trustShields: number
  isRelocationReady?: boolean
}

export interface MoverLeaderboardEntry extends LeaderboardEntry {
  targetRelocationCity?: string
  relocationSuccessRate: number
}

export interface ReputationPaymentMetrics {
  userId: string
  tier: ReputationTier
  totalEarnings: number
  earningsByTier: Record<ReputationTier, number>
  completionRate: number
  isPremiumMoverMatch: boolean
  subscriptionRecommendation: 'free' | 'pro' | 'enterprise'
}
