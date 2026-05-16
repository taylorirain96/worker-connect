/**
 * lib/fcm.ts
 *
 * Firebase Cloud Messaging client helpers.
 * Requests notification permission, retrieves an FCM registration token,
 * and persists it to `users/{uid}.fcmTokens` in Firestore so the server
 * can send targeted push notifications.
 *
 * Usage (client-side only):
 *   import { requestFCMPermission, removeFCMToken } from '@/lib/fcm'
 */
'use client'

import app, { db } from '@/lib/firebase'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ''

let _cachedToken: string | null = null

/**
 * Request push notification permission, register the FCM service worker,
 * retrieve a registration token and save it to `users/{uid}.fcmTokens[]`.
 *
 * @returns The FCM token, or null if permission was denied or FCM is unavailable.
 */
export async function requestFCMPermission(userId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    if (!app) return null

    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(app)

    // Register the firebase-messaging-sw.js service worker
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    await navigator.serviceWorker.ready

    // Send Firebase config to the service worker so it can initialise FCM
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
    swReg.active?.postMessage({ type: 'FIREBASE_CONFIG', config })

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY || undefined,
      serviceWorkerRegistration: swReg,
    })

    if (!token) return null

    _cachedToken = token

    // Persist to users/{uid}.fcmTokens[] in Firestore
    if (db) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
      })
    }

    return token
  } catch (err) {
    console.warn('[FCM] requestFCMPermission failed:', err)
    return null
  }
}

/**
 * Remove the current FCM token from `users/{uid}.fcmTokens[]`.
 * Call this on sign-out.
 */
export async function removeFCMToken(userId: string): Promise<void> {
  if (!_cachedToken) return
  try {
    if (db) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        fcmTokens: arrayRemove(_cachedToken),
      })
    }
    _cachedToken = null
  } catch (err) {
    console.warn('[FCM] removeFCMToken failed:', err)
  }
}

/**
 * Listen for foreground push messages and call the provided handler.
 * Returns an unsubscribe function.
 */
export async function onForegroundMessage(
  handler: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): Promise<() => void> {
  if (typeof window === 'undefined' || !app) return () => {}
  try {
    const { getMessaging, onMessage } = await import('firebase/messaging')
    const messaging = getMessaging(app)
    return onMessage(messaging, (payload) => {
      handler({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data as Record<string, string> | undefined,
      })
    })
  } catch {
    return () => {}
  }
}
