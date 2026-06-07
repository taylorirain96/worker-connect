/**
 * Stripe SDK client — server-side only.
 * Import this module only in API routes or server actions.
 */

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  if (!_stripe) {
    _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}

/** Returns true when the Stripe secret key is configured. */
export function isStripeConfigured(): boolean {
  if ((process.env.STRIPE_MODE ?? '').toLowerCase() === 'mock') {
    return false
  }
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
