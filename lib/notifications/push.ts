/**
 * Firebase Cloud Messaging (FCM) push notification helpers.
 * Service worker registration and push subscription management.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? ''

/** Request permission and register service worker, returning FCM token or null. */
export async function registerPushNotifications(): Promise<string | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
    return null
  }
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const registration = await navigator.serviceWorker.register('/service-worker.js')
    await navigator.serviceWorker.ready

    if (!VAPID_PUBLIC_KEY) return null

    const { getMessaging, getToken } = await import('firebase/messaging')
    const { default: app } = await import('@/lib/firebase')
    if (!app) return null

    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration,
    })
    return token ?? null
  } catch (err) {
    console.warn('Push registration failed:', err)
    return null
  }
}

/** Save FCM token to Firestore for the user. */
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    if (!db) return
    const ref = doc(db, 'fcmTokens', userId)
    await setDoc(ref, { token, userId, updatedAt: serverTimestamp() }, { merge: true })
  } catch (err) {
    console.warn('Failed to save FCM token:', err)
  }
}

/** Delete FCM token from Firestore (on sign-out). */
export async function removeFCMToken(userId: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    if (!db) return
    const ref = doc(db, 'fcmTokens', userId)
    await deleteDoc(ref)
  } catch (err) {
    console.warn('Failed to remove FCM token:', err)
  }
}

/** Listen for foreground push messages and show browser notifications. */
export async function listenForForegroundMessages(
  onMsg: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): Promise<() => void> {
  if (typeof window === 'undefined') return () => {}
  try {
    const { getMessaging, onMessage } = await import('firebase/messaging')
    const { default: app } = await import('@/lib/firebase')
    if (!app) return () => {}
    const messaging = getMessaging(app)
    const unsub = onMessage(messaging, (payload) => {
      onMsg({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data as Record<string, string>,
      })
    })
    return unsub
  } catch {
    return () => {}
  }
}
