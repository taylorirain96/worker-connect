/**
 * Admin Service
 * Provides admin authentication, permission checking, and audit logging.
 * Currently uses mock data — replace Firestore stubs with real queries when ready.
 */

import type { AdminUser } from '@/types'

// ─── Mock admin users ─────────────────────────────────────────────────────────

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin1',
    email: 'superadmin@workerconnect.com',
    role: 'super_admin',
    permissions: ['view', 'edit', 'delete', 'manage_users', 'manage_payments', 'manage_disputes', 'system_settings'],
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'admin2',
    email: 'moderator@workerconnect.com',
    role: 'moderator',
    permissions: ['view', 'edit', 'manage_disputes'],
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'admin3',
    email: 'analyst@workerconnect.com',
    role: 'analyst',
    permissions: ['view'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
]

// ─── Permission definitions ───────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AdminUser['role'], string[]> = {
  super_admin: ['view', 'edit', 'delete', 'manage_users', 'manage_payments', 'manage_disputes', 'system_settings'],
  moderator: ['view', 'edit', 'manage_disputes'],
  analyst: ['view'],
}

// ─── Admin Service Methods ────────────────────────────────────────────────────

/**
 * Verify that a user has admin access.
 * TODO: Replace with Firestore check using adminDb.
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 100))
  // In production: check Firestore adminUsers collection
  return MOCK_ADMIN_USERS.some((u) => u.id === userId)
}

/**
 * Check if an admin user has a specific permission.
 * TODO: Replace with Firestore check using adminDb.
 */
export async function checkAdminPermission(userId: string, permission: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 100))
  const admin = MOCK_ADMIN_USERS.find((u) => u.id === userId)
  if (!admin) return false
  const permissions = ROLE_PERMISSIONS[admin.role] ?? []
  return permissions.includes(permission)
}

/**
 * Log an admin action for audit trail.
 * TODO: Replace with Firestore write using adminDb.
 */
export async function logAdminAction(
  userId: string,
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  // In production: write to Firestore adminAuditLog collection
  console.info('[Admin Audit]', { userId, action, details, timestamp: new Date().toISOString() })
}

/**
 * Get all admin users.
 * TODO: Replace with Firestore query using adminDb.
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  await new Promise((r) => setTimeout(r, 200))
  return MOCK_ADMIN_USERS
}
