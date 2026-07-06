/**
 * lib/notifications/admin.ts
 *
 * Server-side notification helpers using Firebase Admin SDK.
 * Use these from API routes (Next.js route handlers) — they do NOT depend on
 * the client-side Firebase SDK and do not need relative fetch() calls.
 *
 * Features:
 * - Creates an in-app notification document in Firestore
 * - Sends FCM push notifications to all registered device tokens
 * - Cleans up invalid FCM tokens automatically
 */
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

export interface AdminNotificationOptions {
  userId: string
  title: string
  body: string
  type?: string
  link?: string
  data?: Record<string, string>
}

/**
 * Save a notification document to `notifications/{notifId}` in Firestore
 * and send an FCM push to all of the user's registered device tokens.
 *
 * Both operations are non-blocking from the caller's perspective — failures
 * are caught internally and logged.
 */
export async function sendAdminNotification(opts: AdminNotificationOptions): Promise<void> {
  const { userId, title, body, type = 'system', link, data } = opts

  // 1. Persist in-app notification in Firestore
  try {
    await adminDb.collection('notifications').add({
      userId,
      title,
      message: body,
      body,
      type,
      link: link ?? null,
      read: false,
      channel: 'in_app',
      actionUrl: link ?? null,
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error('[notifications/admin] Failed to create notification doc:', err)
  }

  // 2. Send FCM push to all registered tokens
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) return

    const tokens: string[] = userDoc.data()?.fcmTokens ?? []
    if (tokens.length === 0) return

    const messaging = getMessaging()
    const messageData: Record<string, string> = {
      ...(data ?? {}),
      ...(link ? { actionUrl: link, link } : {}),
    }

    await Promise.all(
      tokens.map(async (token) => {
        try {
          await messaging.send({
            token,
            notification: { title, body },
            data: messageData,
            webpush: {
              notification: {
                title,
                body,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
              },
              fcmOptions: link ? { link } : undefined,
            },
          })
        } catch (err) {
          const code = (err as { code?: string })?.code ?? ''
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            // Remove stale token
            adminDb
              .collection('users')
              .doc(userId)
              .update({ fcmTokens: FieldValue.arrayRemove(token) })
              .catch(() => {})
          }
        }
      })
    )
  } catch (err) {
    console.error('[notifications/admin] Failed to send FCM push:', err)
  }
}
