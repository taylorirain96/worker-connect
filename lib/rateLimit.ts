/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request timestamps per client IP using a Map.
 * No external dependencies required.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rateLimit'
 *
 *   export async function POST(req: Request) {
 *     const limited = rateLimit(req, { max: 10, windowMs: 60_000 })
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
 * @returns `true` when the limit is exceeded (caller should respond 429),
 *          `false` when the request is within the limit.
 */
export function rateLimit(
  req: Request,
  options: { max: number; windowMs: number }
): boolean {
  const { max, windowMs } = options
  const ip = getClientIp(req)
  const now = Date.now()
  const windowStart = now - windowMs

  // Periodically sweep stale entries to prevent unbounded memory growth.
  // Use a fixed 60-second cleanup threshold independent of the request window size.
  if (now - lastCleanup > 60_000) {
    const cutoff = now - 60_000
    for (const [key, entry] of store.entries()) {
      entry.requests = entry.requests.filter((t) => t > cutoff)
      if (entry.requests.length === 0) {
        store.delete(key)
      }
    }
    lastCleanup = now
  }

  let entry = store.get(ip)
  if (!entry) {
    entry = { requests: [] }
    store.set(ip, entry)
  }

  // Discard timestamps that have fallen outside the sliding window.
  entry.requests = entry.requests.filter((t) => t > windowStart)

  if (entry.requests.length >= max) {
    return true // rate limit exceeded
  }

  entry.requests.push(now)
  return false // within limit
}
