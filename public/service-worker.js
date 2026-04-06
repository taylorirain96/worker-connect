/* eslint-disable no-undef */
/**
 * QuickTrade Service Worker — handles background Firebase Cloud Messaging (FCM) push.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js')

// Firebase config is injected at runtime via postMessage, or falls back to env placeholders.
// These will be replaced by actual values in production.
const firebaseConfig = {
  apiKey: self.__FIREBASE_API_KEY__ || '',
  authDomain: self.__FIREBASE_AUTH_DOMAIN__ || '',
  projectId: self.__FIREBASE_PROJECT_ID__ || '',
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__ || '',
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ || '',
  appId: self.__FIREBASE_APP_ID__ || '',
}

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()

  // Handle background push messages
  messaging.onBackgroundMessage((payload) => {
    const { title = 'QuickTrade', body = 'You have a new notification.', icon, badge, data } = payload.notification ?? {}
    const clickAction = data?.actionUrl || data?.click_action || '/'

    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: badge || '/badge-72.png',
      data: { url: clickAction, ...payload.data },
      vibrate: [200, 100, 200],
      requireInteraction: payload.data?.requireInteraction === 'true',
      tag: payload.data?.tag || 'quicktrade-notification',
    })
  })
}

// Notification click handler — open the app at the correct URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Push event fallback for non-FCM payloads
self.addEventListener('push', (event) => {
  if (!event.data) return
  try {
    const data = event.data.json()
    event.waitUntil(
      self.registration.showNotification(data.title || 'QuickTrade', {
        body: data.body || data.message || 'New notification',
        icon: data.icon || '/icon-192.png',
        data: { url: data.actionUrl || data.url || '/' },
        tag: data.tag || 'quicktrade',
      })
    )
  } catch {
    // ignore malformed payloads
  }
})
