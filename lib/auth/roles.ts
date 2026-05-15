/**
 * Shared role types and helpers for the auth/session layer.
 *
 * Kept dependency-free so it can be imported from `middleware.ts`
 * (Edge runtime), API route handlers (Node runtime), and client code.
 */
export type AllowedRole =
  | 'worker'
  | 'employer'
  | 'admin'
  | 'homeowner'
  | 'tradie'
  | 'jobseeker'
  | 'property_manager'

export const ALLOWED_ROLES: AllowedRole[] = [
  'worker',
  'employer',
  'admin',
  'homeowner',
  'tradie',
  'jobseeker',
  'property_manager',
]

export function isAllowedRole(value: unknown): value is AllowedRole {
  return typeof value === 'string' && (ALLOWED_ROLES as string[]).includes(value)
}
