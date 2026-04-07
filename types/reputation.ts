/**
 * Reputation & Verification System type definitions.
 */
import type { SubscriptionPlan } from '@/types/payment'

// ─── Verification ────────────────────────────────────────────────────────────

export type VerificationType =
  | 'government_id'
  | 'background_check'
  | 'insurance'
  | 'certification'
  | 'bbb_google'

export type VerificationStatus =
  | 'pending'
  | 'in_review'
  | 'verified'
  | 'rejected'
  | 'expired'

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
  providerData?: Record<string, unknown>
}

export interface VerificationProfile {
  workerId: string
  records: VerificationRecord[]
  /** Number of currently verified records (0-5) */
  verificationLevel: 0 | 1 | 2 | 3 | 4 | 5
  lastUpdated: string
}

// ─── Reputation ──────────────────────────────────────────────────────────────

export type ReputationTier = 'Rookie' | 'Professional' | 'Expert' | 'Master'

export interface ReputationScore {
  workerId: string
  /** Overall weighted score 0-100 */
  overallScore: number
  tier: ReputationTier
  /** 1-5 trust shields */
  trustShields: 1 | 2 | 3 | 4 | 5
  breakdown: {
    completionRate: number
    rating: number
    verification: number
    responseTime: number
    portfolioQuality: number
  }
  lastCalculated: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  category: 'achievement' | 'verification' | 'performance' | 'milestone'
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string
  workerId: string
  title: string
  description: string
  category: string
  beforePhotos: string[]
  afterPhotos: string[]
  completedAt: string
  clientTestimonial?: string
  featured: boolean
}

// ─── Mover ───────────────────────────────────────────────────────────────────

export interface MoverSettings {
  workerId: string
  targetRelocationCity: string | null
  /** 0-100 readiness score */
  relocationReadiness: number
  isActive: boolean
  jobTypePreferences: string[]
  relocationAcceptanceRate: number
  relocationSuccessRate: number
  repeatClientRate: number
}

export interface MoverLeaderboardEntry {
  workerId: string
  workerName: string
  workerAvatar?: string
  targetRelocationCity: string
  relocationSuccessRate: number
  completionRate: number
  reputationScore: number
}

// ─── Completion Rate ─────────────────────────────────────────────────────────

export interface CompletionRateData {
  workerId: string
  completedContracts: number
  totalContracts: number
  completionRate: number
  trend: 'up' | 'down' | 'stable'
  classification: 'Pro' | 'Job-Hopper' | 'New'
  history: { month: string; rate: number }[]
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface ReputationLeaderboardEntry {
  workerId: string
  workerName: string
  workerAvatar?: string
  reputationScore: number
  tier: ReputationTier
  trustShields: 1 | 2 | 3 | 4 | 5
  completionRate: number
}

export interface EarningsByTier {
  tier: ReputationTier
  averageEarnings: number
  totalWorkers: number
  topEarner: number
  suggestedPlan?: SubscriptionPlan
}
