import type { ReputationTier } from '@/types/reputation'

export const REPUTATION_WEIGHTS = {
  completionRate: 0.35,
  rating: 0.30,
  verification: 0.20,
  responseTime: 0.10,
  portfolio: 0.05,
} as const

export const TIER_THRESHOLDS = {
  rookie: { min: 0, max: 40 },
  professional: { min: 41, max: 70 },
  expert: { min: 71, max: 85 },
  master: { min: 86, max: 100 },
} as const

export function calculateReputationScore(params: {
  completionRate: number
  rating: number
  verificationScore: number
  responseTimeScore: number
  portfolioScore: number
}): number {
  const raw =
    params.completionRate * REPUTATION_WEIGHTS.completionRate +
    params.rating * REPUTATION_WEIGHTS.rating +
    params.verificationScore * REPUTATION_WEIGHTS.verification +
    params.responseTimeScore * REPUTATION_WEIGHTS.responseTime +
    params.portfolioScore * REPUTATION_WEIGHTS.portfolio
  return Math.min(100, Math.max(0, Math.round(raw)))
}

export function getReputationTier(score: number): ReputationTier {
  if (score >= 86) return 'master'
  if (score >= 71) return 'expert'
  if (score >= 41) return 'professional'
  return 'rookie'
}

export function getTrustShields(score: number): number {
  return Math.min(5, Math.max(1, Math.round(score / 20)))
}
