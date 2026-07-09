/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request timestamps per client IP (and optional route key) using a Map.
 * No external dependencies required.
 *
 * ⚠️  NOTE: This implementation is single-process only. On a multi-instance
 * deployment (e.g. Vercel with multiple serverless function instances) each
 * instance keeps its own in-memory store, so the effective limit is
 * max × number-of-instances. Replace the `store` Map with Upstash Redis or
 * Vercel KV before scaling beyond a single instance.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rateLimit'
 *
 *   export async function POST(req: Request) {
 *     const limited = rateLimit(req, { max: 10, windowMs: 60_000, key: 'auth' })
 *     if (limited) return new Response('Too many requests', { status: 429 })
 *     // ... rest of handler
 *   }
 */

interface WindowEntry {
  /** Unix timestamps (ms) of requests within the current window */
  requests: number[]
}

const store = new Map<string, WindowEntry>()
let lastCleanup = Date.now()

/** Extract the client IP from standard proxy headers. */
function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Check whether the given request exceeds the allowed rate.
 *
 * @param req       The incoming HTTP request.
 * @param options   `max` — maximum number of requests per window.
 *                  `windowMs` — sliding window size in milliseconds.
 *                  `key` — optional route-category key so different route
 *                           groups maintain independent counters per IP.
 *                           Without a key all routes share the same counter.
 * @returns `true` when the limit is exceeded (caller should respond 429),
 *          `false` when the request is within the limit.
 */
export function rateLimit(
  req: Request,
  options: { max: number; windowMs: number; key?: string }
): boolean {
  const { max, windowMs, key } = options
  const ip = getClientIp(req)
  const storeKey = key ? `${ip}:${key}` : ip
  const now = Date.now()
  const windowStart = now - windowMs

  // Periodically sweep stale entries to prevent unbounded memory growth.
  // Use a fixed 60-second cleanup threshold independent of the request window size.
  if (now - lastCleanup > 60_000) {
    const cutoff = now - 60_000
    for (const [entryKey, entry] of Array.from(store.entries())) {
      entry.requests = entry.requests.filter((t) => t > cutoff)
      if (entry.requests.length === 0) {
        store.delete(entryKey)
      }
    }
    lastCleanup = now
  }

  let entry = store.get(storeKey)
  if (!entry) {
    entry = { requests: [] }
    store.set(storeKey, entry)
  }

  // Discard timestamps that have fallen outside the sliding window.
  entry.requests = entry.requests.filter((t) => t > windowStart)

  if (entry.requests.length >= max) {
    return true // rate limit exceeded
  }

  entry.requests.push(now)
  return false // within limit
}
