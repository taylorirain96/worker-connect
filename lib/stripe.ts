/**
 * Stripe API client — server-side singleton.
 * Import this only from API routes and server-side code, never from client components.
 */
import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Returns a Stripe instance. Throws if STRIPE_SECRET_KEY is not set.
 * The instance is cached across hot-reloads in development.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }

  _stripe = new Stripe(key, {
    apiVersion: '2024-06-20',
    typescript: true,
  })

  return _stripe
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a dollar amount to Stripe's integer cents representation. */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/** Convert Stripe cents to dollar amount. */
export function fromCents(cents: number): number {
  return cents / 100
}

/** Validate a Stripe webhook signature and return the parsed event. */
export async function constructWebhookEvent(
  body: string,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(body, signature, secret)
}

export default getStripe
