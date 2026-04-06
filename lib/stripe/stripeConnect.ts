/**
 * Stripe Connect integration utilities.
 * Real Stripe API calls require server-side execution.
 * Client code should call the API routes, not these helpers directly.
 */

export const STRIPE_CONNECT_CONFIG = {
  /** Minimum withdrawal amount in cents */
  minWithdrawalCents: 2500,
  /** Supported payout currencies */
  supportedCurrencies: ['usd'],
  /** Stripe Connect account type used for workers */
  accountType: 'express' as const,
}

export interface StripeAccountStatus {
  accountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requiresAction: boolean
  actionUrl?: string
}

/** Returns the Stripe Connect onboarding URL for a worker. Server-side only. */
export async function createStripeConnectAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  const res = await fetch('/api/stripe/connect/account-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, refreshUrl, returnUrl }),
  })
  if (!res.ok) throw new Error('Failed to create Stripe account link')
  const data = await res.json()
  return data.url as string
}

/** Fetches the Stripe Connect account status for a worker. */
export async function getStripeAccountStatus(accountId: string): Promise<StripeAccountStatus> {
  const res = await fetch(`/api/stripe/connect/status?accountId=${encodeURIComponent(accountId)}`)
  if (!res.ok) throw new Error('Failed to fetch Stripe account status')
  return res.json() as Promise<StripeAccountStatus>
}
