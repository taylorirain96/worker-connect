/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging service worker.
 * FCM requires this file to be at exactly /firebase-messaging-sw.js.
 * Handles background push notifications when the app tab is not in focus.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js')

// Receive Firebase config from the main thread via postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    initFirebase(event.data.config)
  }
})

let messagingInitialised = false

/** Show a notification from an FCM payload object. */
function showFCMNotification(payload) {
  const {
    title = 'QuickTrade',
    body = 'You have a new notification.',
    icon,
    badge,
  } = payload.notification ?? {}

  const clickAction =
    payload.data?.actionUrl || payload.data?.link || payload.data?.click_action || '/'

  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: badge || '/badge-72.png',
    data: { url: clickAction, ...payload.data },
    vibrate: [200, 100, 200],
    requireInteraction: payload.data?.requireInteraction === 'true',
    tag: payload.data?.tag || 'quicktrade-notification',
  })
}

function initFirebase(config) {
  if (messagingInitialised) return
  if (!config || !config.apiKey || !config.projectId) return

  try {
    firebase.initializeApp(config)
    const messaging = firebase.messaging()
    messagingInitialised = true

    // Handle background FCM messages
    messaging.onBackgroundMessage(showFCMNotification)
  } catch {
    // Firebase may already be initialised by service-worker.js
  }
}

// Attempt init immediately if a Firebase app is already registered
if (typeof firebase !== 'undefined') {
  try {
    const existing = firebase.apps?.[0]
    if (existing) {
      const messaging = firebase.messaging()
      messagingInitialised = true
      messaging.onBackgroundMessage(showFCMNotification)
    }
  } catch {
    // Silently ignore — config will be sent via postMessage
  }
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
