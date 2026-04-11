/**
 * Subscription tier helpers.
 * In production these would check Firestore / Stripe subscription status.
 * For now read from the user profile field `subscriptionTier`.
 */
import type { UserProfile } from '@/types'

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
  if (tier === 'pro' || tier === 'elite') return true
  // Also check one-off AI Writing Add-on purchase
  return !!(profile?.aiWritingAddon)
}

export function hasEmployerAI(profile: UserProfile | null | undefined): boolean {
  const tier = getEmployerTier(profile)
  if (tier === 'pro' || tier === 'business' || tier === 'enterprise') return true
  // Also check one-off AI Writing Add-on purchase
  return !!(profile?.aiWritingAddon)
}

export function hasAIAddonOnly(profile: UserProfile | null | undefined): boolean {
  return !!(profile?.aiWritingAddon) && getWorkerTier(profile) === 'free' && getEmployerTier(profile) === 'free'
}
