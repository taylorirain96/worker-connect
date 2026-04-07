/**
 * Firebase Cloud Messaging (FCM) helpers.
 *
 * Provides utilities for requesting notification permissions, obtaining FCM
 * tokens, and storing them in Firestore so that the server can send targeted
 * push notifications.
 *
 * Usage (client components only):
 *   import { requestPushPermission } from '@/lib/firebase/messaging'
 *   const token = await requestPushPermission(userId)
 */
'use client'

import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import app from '@/lib/firebase'
import { db } from '@/lib/firebase'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ''

let messaging: Messaging | null = null

function getMessagingInstance(): Messaging | null {
  if (messaging) return messaging
  if (!app) return null
  try {
    messaging = getMessaging(app)
    return messaging
  } catch {
    return null
  }
}

/**
 * Request push notification permission and obtain an FCM registration token.
 * Stores the token in Firestore under `fcmTokens/{userId}` for server use.
 *
 * @returns The FCM token string, or null if permission was denied / FCM unavailable.
 */
export async function requestPushPermission(userId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const m = getMessagingInstance()
    if (!m) return null

    const token = await getToken(m, {
      vapidKey: VAPID_KEY || undefined,
      serviceWorkerRegistration: await getServiceWorkerRegistration(),
    })

    if (token && db) {
      // Persist the token so the server can target this device
      await setDoc(
        doc(db, 'fcmTokens', userId),
        {
          token,
          userId,
          userAgent: navigator.userAgent,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return token ?? null
  } catch (error) {
    console.error('[FCM] requestPushPermission error:', error)
    return null
  }
}

/**
 * Listen for foreground push messages and call the provided handler.
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  handler: (payload: {
    title?: string
    body?: string
    data?: Record<string, string>
  }) => void
): () => void {
  const m = getMessagingInstance()
  if (!m) return () => {}

  const unsub = onMessage(m, (payload) => {
    handler({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data as Record<string, string> | undefined,
    })
  })

  return unsub
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined
  try {
    return await navigator.serviceWorker.getRegistration('/') ?? undefined
  } catch {
    return undefined
  }
}
