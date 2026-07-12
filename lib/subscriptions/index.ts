/**
 * Subscription tier helpers.
 * In production these would check Firestore / Stripe subscription status.
 * For now read from the user profile field `subscriptionTier`.
 */
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

/**
 * Returns the effective commission rate override for the worker if a
 * `commission_8pct` Boost trial is currently active. Returns `null` when no
 * trial is active and the normal tier rate should be applied.
 */
export function getTrialCommissionRate(
  profile: UserProfile | null | undefined,
  trials?: ActiveTrial[]
): number | null {
  // Workers already on Pro (8%) or Elite (6%) don't benefit from the trial
  const tier = getWorkerTier(profile)
  if (tier === 'pro' || tier === 'elite') return null
  if (hasActiveTrial(trials ?? profile?.activeTrials, 'commission_8pct')) return 0.08
  return null
}
