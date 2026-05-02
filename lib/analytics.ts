/**
 * Google Analytics conversion event tracking helpers.
 *
 * GA (gtag) is loaded globally via the <GoogleAnalytics> component in
 * app/layout.tsx (gaId: G-VNY47FMBTR).  These helpers provide a
 * type-safe, SSR-safe wrapper around window.gtag.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Send a custom GA4 event.
 *
 * @param eventName - The GA4 event name (snake_case).
 * @param params    - Optional event parameters forwarded to gtag.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params ?? {})
}
