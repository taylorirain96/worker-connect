/**
 * Admin Service
 * Provides admin authentication, permission checking, and audit logging.
 * Backed by Firestore `adminUsers` and `adminAuditLog` collections via the Admin SDK.
 */

import { adminDb } from '@/lib/firebase-admin'
import type { AdminUser } from '@/types'

// ─── Permission definitions ───────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AdminUser['role'], string[]> = {
  super_admin: ['view', 'edit', 'delete', 'manage_users', 'manage_payments', 'manage_disputes', 'system_settings'],
  moderator: ['view', 'edit', 'manage_disputes'],
  analyst: ['view'],
}

// ─── Admin Service Methods ────────────────────────────────────────────────────

/**
 * Verify that a user has admin access by checking the Firestore `adminUsers` collection.
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  const snap = await adminDb.collection('adminUsers').doc(userId).get()
  return snap.exists
}

/**
 * Check if an admin user has a specific permission.
 */
export async function checkAdminPermission(userId: string, permission: string): Promise<boolean> {
  const snap = await adminDb.collection('adminUsers').doc(userId).get()
  if (!snap.exists) return false
  const data = snap.data() as Pick<AdminUser, 'role'> | undefined
  const role = data?.role
  if (!role) return false
  const permissions = ROLE_PERMISSIONS[role] ?? []
  return permissions.includes(permission)
}

/**
 * Log an admin action for audit trail by writing to the `adminAuditLog` collection.
 */
export async function logAdminAction(
  userId: string,
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  await adminDb.collection('adminAuditLog').add({
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Get all admin users from Firestore.
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const snap = await adminDb.collection('adminUsers').get()
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AdminUser))
}
