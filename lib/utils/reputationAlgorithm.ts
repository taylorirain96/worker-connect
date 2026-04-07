/**
 * Reputation scoring algorithm.
 *
 * overallScore = completionRate * 0.35 + ratingScore * 0.30
 *              + verificationScore * 0.20 + responseTimeScore * 0.10
 *              + portfolioScore * 0.05
 */
import type { ReputationTier } from '@/types/reputation'

// ─── Sub-score converters ────────────────────────────────────────────────────

/** Convert a 1-5 star rating to a 0-100 score. */
export function ratingToScore(rating: number): number {
  const clamped = Math.min(5, Math.max(1, rating))
  return Math.round(((clamped - 1) / 4) * 100)
}

/** Convert a verified-count (0-5) to a 0-100 score. */
export function verificationToScore(count: number): number {
  const clamped = Math.min(5, Math.max(0, count))
  return Math.round((clamped / 5) * 100)
}

/**
 * Convert average response time (hours) to a 0-100 score.
 * Instant (0 h) → 100; 72 h or more → 0.
 */
export function responseTimeToScore(hours: number): number {
  const cap = 72
  const clamped = Math.min(cap, Math.max(0, hours))
  return Math.round(((cap - clamped) / cap) * 100)
}

/**
 * Convert portfolio project count to a 0-100 score.
 * Saturates at 20 projects → 100.
 */
export function portfolioToScore(count: number): number {
  const sat = 20
  const clamped = Math.min(sat, Math.max(0, count))
  return Math.round((clamped / sat) * 100)
}

// ─── Tier & shield helpers ───────────────────────────────────────────────────

/** Map an overall score (0-100) to a reputation tier. */
export function getTier(score: number): ReputationTier {
  if (score >= 86) return 'Master'
  if (score >= 71) return 'Expert'
  if (score >= 41) return 'Professional'
  return 'Rookie'
}

/** Map an overall score (0-100) to a trust-shield count (1-5). */
export function getTrustShields(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 91) return 5
  if (score >= 76) return 4
  if (score >= 61) return 3
  if (score >= 41) return 2
  return 1
}

// ─── Main scorer ─────────────────────────────────────────────────────────────

export interface ScoreParams {
  /** Worker's completion rate 0-100 */
  completionRate: number
  /** Average star rating 1-5 */
  averageRating: number
  /** Number of verified record types 0-5 */
  verificationCount: number
  /** Average response time in hours (lower is better, capped at 72) */
  avgResponseTimeHours: number
  /** Number of portfolio projects */
  portfolioCount: number
}

export interface ScoreBreakdown {
  completionRate: number
  rating: number
  verification: number
  responseTime: number
  portfolioQuality: number
  overallScore: number
}

/** Calculate the weighted reputation breakdown. */
export function calculateReputationScore(params: ScoreParams): ScoreBreakdown {
  const completionRate = Math.min(100, Math.max(0, params.completionRate))
  const rating = ratingToScore(params.averageRating)
  const verification = verificationToScore(params.verificationCount)
  const responseTime = responseTimeToScore(params.avgResponseTimeHours)
  const portfolioQuality = portfolioToScore(params.portfolioCount)

  const overallScore = Math.round(
    completionRate * 0.35 +
      rating * 0.3 +
      verification * 0.2 +
      responseTime * 0.1 +
      portfolioQuality * 0.05
  )

  return {
    completionRate,
    rating,
    verification,
    responseTime,
    portfolioQuality,
    overallScore: Math.min(100, Math.max(0, overallScore)),
  }
}
