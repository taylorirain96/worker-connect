/**
 * lib/fcm/requestPermission.ts
 *
 * Firebase Cloud Messaging — permission request and token management.
 * Requests browser notification permission, retrieves an FCM registration token
 * and saves it to `users/{uid}.fcmTokens[]` in Firestore.
 *
 * Gracefully handles:
 * - Browsers that do not support the Notifications API
 * - Users who deny permission
 * - SSR / non-browser environments
 */
'use client'

import { requestFCMPermission, removeFCMToken, onForegroundMessage } from '@/lib/fcm'

/**
 * Request notification permission and obtain an FCM token.
 * Saves the token to `users/{uid}.fcmTokens[]` in Firestore.
 *
 * @param userId - The authenticated user's UID
 * @returns The FCM token if permission was granted, or null otherwise
 */
export async function requestPermission(userId: string): Promise<string | null> {
  return requestFCMPermission(userId)
}

/**
 * Remove the current FCM token from Firestore for the given user.
 * Call this on sign-out to stop push notifications on this device.
 */
export async function revokePermission(userId: string): Promise<void> {
  return removeFCMToken(userId)
}

/**
 * Listen for foreground push messages and invoke a callback.
 * Returns an unsubscribe function.
 */
export { onForegroundMessage }

export default requestPermission
