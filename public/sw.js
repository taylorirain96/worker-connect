/* eslint-disable no-undef */
/**
 * WorkerConnect PWA Service Worker
 * Caches key static assets and serves an offline fallback page when the
 * network is unavailable.  This worker is separate from the FCM service
 * worker (firebase-messaging-sw.js) which handles push notifications.
 */

const CACHE_NAME = 'workerconnect-v1'

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// --- Install ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// --- Activate ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// --- Fetch ---
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin or cdn resources
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Skip API routes, auth calls, and Firebase endpoints — let the browser handle them
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('stripe')
  ) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (
          response.ok &&
          (url.pathname.startsWith('/icons/') ||
            url.pathname === '/manifest.json' ||
            url.pathname.match(/\.(css|js|woff2?|png|jpg|svg|ico)$/))
        ) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        // Network failed — try cache, fall back to offline page for navigation
        caches.match(event.request).then(
          (cached) =>
            cached ||
            (event.request.mode === 'navigate'
              ? caches.match('/offline')
              : new Response('', { status: 503 }))
        )
      )
  )
})
