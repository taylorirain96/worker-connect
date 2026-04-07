// ─── Verification Types ────────────────────────────────────────────────────────

export type VerificationType =
  | 'governmentId'
  | 'backgroundCheck'
  | 'insurance'
  | 'certifications'
  | 'bbbRating'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface VerificationItem {
  status: VerificationStatus
  verified: boolean
  documentUrl?: string
  verifiedAt?: string
  provider?: string
  expiryDate?: string
  policyUrl?: string
  score?: number
  link?: string
}

export interface CertificationItem {
  name: string
  issuer: string
  url?: string
  verifiedAt: string
}

export interface VerificationProfile {
  userId: string
  governmentId: VerificationItem
  backgroundCheck: VerificationItem
  insurance: VerificationItem
  certifications: CertificationItem[]
  bbbRating: VerificationItem
  verificationLevel: number // 0-5 based on verified items
  updatedAt: string
}

// ─── Reputation Types ──────────────────────────────────────────────────────────

export type ReputationTier = 'Rookie' | 'Professional' | 'Expert' | 'Master'

export interface ReputationComponents {
  completionRate: number  // 0-100 (35% weight)
  rating: number          // 0-100 converted from 1-5 (30% weight)
  verification: number    // 0-100 converted from 0-5 (20% weight)
  responseTime: number    // 0-100 inverted from hours (10% weight)
  portfolio: number       // 0-100 (5% weight)
}

export interface ReputationScore {
  userId: string
  overallScore: number    // 0-100
  tier: ReputationTier
  completionRate: number  // percentage
  averageRating: number   // 1-5
  verificationLevel: number // 0-5
  responseTime: number    // hours
  portfolioQuality: number // 0-100
  components: ReputationComponents
  updatedAt: string
}

// ─── Badge Types ───────────────────────────────────────────────────────────────

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface EarnedBadge {
  id: string
  name: string
  icon: string
  description: string
  tier: BadgeTier
  earnedAt: string
  category: string
}

export interface AvailableBadge {
  id: string
  name: string
  icon: string
  description: string
  tier: BadgeTier
  category: string
  requirement: string
  progress: number // 0-100
}

export interface BadgeProfile {
  userId: string
  earned: EarnedBadge[]
  available: AvailableBadge[]
}

// ─── Portfolio Types ───────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string
  workerId: string
  title: string
  description: string
  category: string
  beforePhotoUrl?: string
  afterPhotoUrl?: string
  photos: string[]
  completedAt: string
  clientName?: string
  clientTestimonial?: string
  clientRating?: number
  tags: string[]
  featured: boolean
}

export interface PortfolioStats {
  totalProjects: number
  categories: string[]
  averageRating: number
  featuredProjects: number
  totalPhotos: number
}

export interface WorkerPortfolio {
  workerId: string
  projects: PortfolioProject[]
  stats: PortfolioStats
}

// ─── Mover Mode Types ──────────────────────────────────────────────────────────

export interface MoverModeSettings {
  userId: string
  targetRelocationCity: string
  relocationReadiness: number // 0-100
  availableForRelocation: boolean
  preferredJobTypes: string[]
  enabledAt: string
  updatedAt: string
}

export interface MoverStats {
  userId: string
  relocationContracts: number
  successfulRelocations: number
  successRate: number         // percentage
  acceptanceRate: number      // percentage
  repeatClientRate: number    // percentage
  totalRevenueFromRelocation: number
}

export interface MoverLeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl?: string
  targetCity: string
  successRate: number
  completedRelocations: number
  reputationScore: number
  tier: ReputationTier
}

// ─── Completion Rate Types ─────────────────────────────────────────────────────

export interface CompletionMetrics {
  userId: string
  completedContracts: number
  totalContracts: number
  completionRate: number // percentage
  abandonedJobs: number
  completionTrend: CompletionTrendPoint[]
  lastUpdated: string
}

export interface CompletionTrendPoint {
  date: string
  rate: number
}

// ─── Trust Badge Types ─────────────────────────────────────────────────────────

export interface TrustBadges {
  userId: string
  shieldCount: number   // 1-5
  reputationScore: number
  verificationLevel: number
  completionRate: number
  responseTimeLabel: string // 'Within 1 hour', 'Within 4 hours', etc.
  yearsActive?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl?: string
  score: number
  tier: ReputationTier
  completionRate: number
  verificationLevel: number
  shieldCount: number
}
