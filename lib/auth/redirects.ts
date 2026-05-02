import type { UserProfile } from '@/types'

/**
 * Returns the correct dashboard path for a given user profile.
 * Falls back to the generic /dashboard which handles routing internally.
 */
export function getDashboardPath(profile: UserProfile | null): string {
  if (!profile) return '/dashboard'
  if (profile.role === 'homeowner') return '/dashboard/homeowner'
  if (profile.role === 'employer') return '/dashboard/employer'
  if (profile.role === 'admin') return '/admin'
  if (profile.role === 'tradie') return '/dashboard/worker'
  if (profile.role === 'jobseeker') return '/dashboard/worker'
  return '/dashboard/worker'
}
