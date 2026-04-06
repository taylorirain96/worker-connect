/**
 * Point multiplier stacking logic.
 * Multipliers are cumulative but capped at MAX_MULTIPLIER (3.0x).
 */

export const BASE_MULTIPLIER = 1.0
export const MAX_MULTIPLIER = 3.0

export interface MultiplierSource {
  id: string
  label: string
  value: number          // additive bonus, e.g. 0.1 means +10%
  expiresAt?: string     // ISO date if time-limited
  active: boolean
}

export interface MultiplierContext {
  /** 1st, 2nd, or 3rd on leaderboard this week */
  leaderboardRank?: 1 | 2 | 3
  /** Completed a referral within the last 30 days */
  recentReferral?: boolean
  recentReferralExpiresAt?: string
  /** Worker has 100+ completed jobs */
  loyaltyUnlocked?: boolean
  /** Worker has 50+ photo-documented jobs */
  photoDocumentation?: boolean
}

/** Returns all active multiplier sources for the given context. */
export function getMultiplierSources(ctx: MultiplierContext): MultiplierSource[] {
  const sources: MultiplierSource[] = []

  if (ctx.leaderboardRank === 1) {
    sources.push({ id: 'leaderboard_1st', label: '🥇 #1 Leaderboard', value: 0.5, active: true })
  } else if (ctx.leaderboardRank === 2) {
    sources.push({ id: 'leaderboard_2nd', label: '🥈 #2 Leaderboard', value: 0.25, active: true })
  } else if (ctx.leaderboardRank === 3) {
    sources.push({ id: 'leaderboard_3rd', label: '🥉 #3 Leaderboard', value: 0.1, active: true })
  }

  if (ctx.recentReferral) {
    const expiry = ctx.recentReferralExpiresAt
    const active = expiry ? new Date(expiry) > new Date() : true
    sources.push({
      id: 'referral_bonus',
      label: '👥 Referral Bonus (30 days)',
      value: 0.1,
      expiresAt: expiry,
      active,
    })
  }

  if (ctx.loyaltyUnlocked) {
    sources.push({ id: 'loyalty_100', label: '💼 100+ Jobs Loyalty', value: 0.05, active: true })
  }

  if (ctx.photoDocumentation) {
    sources.push({ id: 'photo_doc', label: '📸 50+ Photo Docs', value: 0.1, active: true })
  }

  return sources
}

/**
 * Calculates the stacked multiplier (capped at MAX_MULTIPLIER).
 * All active sources are added on top of the BASE_MULTIPLIER.
 */
export function calculateMultiplier(ctx: MultiplierContext): number {
  const sources = getMultiplierSources(ctx)
  const activeSources = sources.filter((s) => s.active)
  const total = BASE_MULTIPLIER + activeSources.reduce((sum, s) => sum + s.value, 0)
  return Math.min(total, MAX_MULTIPLIER)
}

/** Returns the multiplier rounded to 2 decimal places for display. */
export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`
}
