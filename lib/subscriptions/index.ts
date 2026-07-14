/**
 * Subscription tier helpers.
 * In production these would check Firestore / Stripe subscription status.
 * For now read from the user profile field `subscriptionTier`.
 */
import { getWorkerTier as getCompletedJobsWorkerTier } from '@/types'
import type { UserProfile, ActiveTrial } from '@/types'
import { hasActiveTrial } from '@/lib/services/boostTrialService'

export type WorkerTier = 'free' | 'pro' | 'elite'
export type EmployerTier = 'free' | 'pro' | 'business' | 'enterprise'

export function getWorkerTier(profile: UserProfile | null | undefined): WorkerTier {
  if (!profile) return 'free'
  const tier = profile.workerSubscriptionTier
  if (tier === 'elite') return 'elite'
  if (tier === 'pro') return 'pro'
  return 'free'
}

export function getEmployerTier(profile: UserProfile | null | undefined): EmployerTier {
  if (!profile) return 'free'
  const tier = profile.employerSubscriptionTier
  if (tier === 'enterprise') return 'enterprise'
  if (tier === 'business') return 'business'
  if (tier === 'pro') return 'pro'
  return 'free'
}

export function hasWorkerAI(profile: UserProfile | null | undefined): boolean {
  const tier = getWorkerTier(profile)
  return tier === 'pro' || tier === 'elite'
}

export function hasEmployerAI(profile: UserProfile | null | undefined): boolean {
  const tier = getEmployerTier(profile)
  return tier === 'pro' || tier === 'business' || tier === 'enterprise'
}

// ─── Trial-aware feature checks ───────────────────────────────────────────────

/**
 * True if the worker has Early Job Alerts via a Pro/Elite subscription OR an
 * active `early_job_alerts` Boost trial.
 */
export function hasEarlyJobAlerts(
  profile: UserProfile | null | undefined,
  trials?: ActiveTrial[]
): boolean {
  const tier = getWorkerTier(profile)
  if (tier === 'pro' || tier === 'elite') return true
  return hasActiveTrial(trials ?? profile?.activeTrials, 'early_job_alerts')
}

/**
 * True if the worker has Featured Profile placement via an Elite subscription
 * OR an active `featured_profile` Boost trial.
 */
export function hasFeaturedProfile(
  profile: UserProfile | null | undefined,
  trials?: ActiveTrial[]
): boolean {
  const tier = getWorkerTier(profile)
  if (tier === 'elite') return true
  return hasActiveTrial(trials ?? profile?.activeTrials, 'featured_profile')
}

export function getBaseWorkerCommissionRate(
  profile: UserProfile | null | undefined
): number {
  const tier = getWorkerTier(profile)
  if (tier === 'elite') return 0.06
  if (tier === 'pro') return 0.08
  return getCompletedJobsWorkerTier(profile?.completedJobs ?? 0).commissionRate
}

/**
 * Returns the best active commission-rate override for the worker. The
 * `commission_8pct` trial can help free-tier workers, while
 * `commission_discount_stack` shaves an extra 2% off the worker's current
 * rate, including Pro and Elite subscriptions.
 */
export function getTrialCommissionRate(
  profile: UserProfile | null | undefined,
  trials?: ActiveTrial[]
): number | null {
  const activeTrials = trials ?? profile?.activeTrials
  const baseRate = getBaseWorkerCommissionRate(profile)

  let bestRate: number | null = null

  if (baseRate > 0.08 && hasActiveTrial(activeTrials, 'commission_8pct')) {
    bestRate = 0.08
  }

  if (hasActiveTrial(activeTrials, 'commission_discount_stack')) {
    const stackedRate = Math.max(0, baseRate - 0.02)
    bestRate = bestRate === null ? stackedRate : Math.min(bestRate, stackedRate)
  }

  return bestRate !== null && bestRate < baseRate ? bestRate : null
}
