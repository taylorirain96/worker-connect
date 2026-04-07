import type { ReputationTier, ReputationComponents, ReputationScore } from '@/types/reputation'

// ─── Scoring Weights ───────────────────────────────────────────────────────────

export const SCORING_WEIGHTS = {
  completionRate: 0.35,  // 35%
  rating: 0.30,          // 30%
  verification: 0.20,    // 20%
  responseTime: 0.10,    // 10%
  portfolio: 0.05,       // 5%
} as const

// ─── Tier Thresholds ──────────────────────────────────────────────────────────

export const TIER_THRESHOLDS: Record<ReputationTier, [number, number]> = {
  Rookie: [0, 40],
  Professional: [41, 70],
  Expert: [71, 85],
  Master: [86, 100],
}

// ─── Shield Thresholds ────────────────────────────────────────────────────────

export const SHIELD_THRESHOLDS = [
  { shields: 5, min: 91 },
  { shields: 4, min: 76 },
  { shields: 3, min: 61 },
  { shields: 2, min: 41 },
  { shields: 1, min: 0 },
] as const

// ─── Tier Calculation ─────────────────────────────────────────────────────────

export function getReputationTier(score: number): ReputationTier {
  if (score >= 86) return 'Master'
  if (score >= 71) return 'Expert'
  if (score >= 41) return 'Professional'
  return 'Rookie'
}

// ─── Shield Count ─────────────────────────────────────────────────────────────

export function getShieldCount(score: number): number {
  for (const { shields, min } of SHIELD_THRESHOLDS) {
    if (score >= min) return shields
  }
  return 1
}

// ─── Component Score Conversions ──────────────────────────────────────────────

/**
 * Convert average rating (1–5) to a 0–100 score.
 */
export function ratingToScore(averageRating: number): number {
  const clamped = Math.max(1, Math.min(5, averageRating))
  return ((clamped - 1) / 4) * 100
}

/**
 * Convert verification level (0–5) to a 0–100 score.
 */
export function verificationToScore(verificationLevel: number): number {
  const clamped = Math.max(0, Math.min(5, verificationLevel))
  return (clamped / 5) * 100
}

/**
 * Convert response time in hours to a 0–100 score (faster = higher).
 * Score = 100 - (responseTimeHours / 24) * 100, clamped to [0, 100].
 */
export function responseTimeToScore(responseTimeHours: number): number {
  const raw = 100 - (responseTimeHours / 24) * 100
  return Math.max(0, Math.min(100, raw))
}

// ─── Main Algorithm ───────────────────────────────────────────────────────────

export interface ReputationInputs {
  completionRate: number    // 0–100 percentage
  averageRating: number     // 1–5
  verificationLevel: number // 0–5
  responseTimeHours: number // hours to first response
  portfolioQuality: number  // 0–100
}

export function calculateReputationScore(inputs: ReputationInputs): {
  overallScore: number
  tier: ReputationTier
  shieldCount: number
  components: ReputationComponents
} {
  const components: ReputationComponents = {
    completionRate: Math.max(0, Math.min(100, inputs.completionRate)),
    rating: ratingToScore(inputs.averageRating),
    verification: verificationToScore(inputs.verificationLevel),
    responseTime: responseTimeToScore(inputs.responseTimeHours),
    portfolio: Math.max(0, Math.min(100, inputs.portfolioQuality)),
  }

  const overallScore =
    components.completionRate * SCORING_WEIGHTS.completionRate +
    components.rating * SCORING_WEIGHTS.rating +
    components.verification * SCORING_WEIGHTS.verification +
    components.responseTime * SCORING_WEIGHTS.responseTime +
    components.portfolio * SCORING_WEIGHTS.portfolio

  const rounded = Math.round(overallScore)

  return {
    overallScore: rounded,
    tier: getReputationTier(rounded),
    shieldCount: getShieldCount(rounded),
    components,
  }
}

// ─── Relocation Ready Badge Eligibility ───────────────────────────────────────

export function isRelocationReady(
  targetRelocationCity: string | undefined,
  completionRate: number
): boolean {
  return Boolean(targetRelocationCity?.trim()) && completionRate >= 80
}

// ─── Mock Full Score Builder ───────────────────────────────────────────────────

export function buildReputationScore(
  userId: string,
  inputs: ReputationInputs
): ReputationScore {
  const { overallScore, tier, components } = calculateReputationScore(inputs)
  return {
    userId,
    overallScore,
    tier,
    completionRate: inputs.completionRate,
    averageRating: inputs.averageRating,
    verificationLevel: inputs.verificationLevel,
    responseTime: inputs.responseTimeHours,
    portfolioQuality: inputs.portfolioQuality,
    components,
    updatedAt: new Date().toISOString(),
  }
}
