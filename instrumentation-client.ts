import * as Sentry from '@sentry/nextjs'

/**
 * Browser-side Sentry initialisation.
 *
 * In Next.js 15+/16, this file is automatically loaded on the client by the
 * Sentry webpack/turbopack plugin (via `withSentryConfig`). It replaces the
 * legacy `sentry.client.config.ts`.
 *
 * No-op when `NEXT_PUBLIC_SENTRY_DSN` is not configured, so local dev keeps
 * working without a Sentry project.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email
        delete event.user.username
        delete event.user.ip_address
        if ('name' in event.user) delete (event.user as Record<string, unknown>).name
      }
      if (event.request?.cookies) {
        ;(event.request as Record<string, unknown>).cookies = '[Filtered]'
      }
      if (event.request?.headers) {
        const headers = event.request.headers as Record<string, string>
        for (const key of Object.keys(headers)) {
          if (['authorization', 'cookie', 'x-user-id'].includes(key.toLowerCase())) {
            headers[key] = '[Filtered]'
          }
        }
      }
      return event
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
