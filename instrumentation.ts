import * as Sentry from '@sentry/nextjs'

/**
 * Next.js calls `register()` once per runtime (Node.js and Edge) on cold start.
 * We initialise Sentry here for the server-side runtimes.
 *
 * Client-side initialisation lives in `instrumentation-client.ts`.
 *
 * Sentry is a no-op when `SENTRY_DSN` (or `NEXT_PUBLIC_SENTRY_DSN`) is not set,
 * so local development without monitoring keeps working as before.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
      environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
      release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
      sendDefaultPii: false,
      beforeSend: scrubEvent,
      beforeSendTransaction: scrubEvent,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
      environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
      release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
      sendDefaultPii: false,
      beforeSend: scrubEvent,
      beforeSendTransaction: scrubEvent,
    })
  }
}

export const onRequestError = Sentry.captureRequestError

/**
 * Strip personally identifiable information from outgoing events.
 * QuickTrade handles homeowner / worker details + auth cookies, so we
 * defensively scrub anything that could leak user identity.
 *
 * Typed as `any` because Sentry's `beforeSend` / `beforeSendTransaction`
 * hooks use different event shapes that can't be unified with a generic.
 */
function scrubEvent(event: any): any {
  if (event.user) {
    delete event.user.email
    delete event.user.username
    delete event.user.ip_address
    delete event.user.name
  }

  if (event.request) {
    if (event.request.cookies) event.request.cookies = '[Filtered]'
    if (event.request.headers) {
      const headers = event.request.headers as Record<string, string>
      const sensitive = ['authorization', 'cookie', 'x-user-id', 'x-user-role', 'x-api-key']
      for (const key of Object.keys(headers)) {
        if (sensitive.includes(key.toLowerCase())) headers[key] = '[Filtered]'
      }
    }
    if (event.request.data && typeof event.request.data === 'object') {
      const body = event.request.data as Record<string, unknown>
      for (const key of ['email', 'name', 'phone', 'password', 'idToken']) {
        if (key in body) body[key] = '[Filtered]'
      }
    }
  }

  return event
}
