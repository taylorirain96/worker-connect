/**
 * lib/stripe.ts — Server-side Stripe client & helpers.
 * Import this module only in API routes or server actions.
 *
 * This is a convenience re-export of lib/payments/stripe.ts combined with
 * higher-level helpers used by the payment API routes.
 */

/** Converts a dollar amount to cents (Stripe uses the smallest currency unit). */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/** Converts cents back to a dollar amount. */
export function fromCents(cents: number): number {
  return cents / 100
}

import Stripe from 'stripe'

let _stripe: Stripe | null = null

/** Returns a singleton Stripe client. Throws if STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  if (!_stripe) {
    _stripe = new Stripe(key, { apiVersion: '2024-06-20' })
  }
  return _stripe
}

/** Returns true when the Stripe secret key is configured. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/**
 * Creates a Stripe PaymentIntent.
 * Returns a mock response when Stripe is not configured.
 */
export async function createPaymentIntent(params: {
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, string>
}): Promise<{ clientSecret: string; paymentIntentId: string; amount: number; currency: string }> {
  const { amount, currency, description, metadata } = params

  if (!isStripeConfigured()) {
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      paymentIntentId: `pi_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
    }
  }

  const stripe = getStripe()
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    description,
    metadata,
    automatic_payment_methods: { enabled: true },
  })

  return {
    clientSecret: intent.client_secret ?? '',
    paymentIntentId: intent.id,
    amount: intent.amount,
    currency: intent.currency,
  }
}

/**
 * Confirms a Stripe PaymentIntent.
 * In production this is typically done client-side via Stripe.js.
 * This server helper is provided for server-to-server confirmation flows.
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{ status: string; paymentIntentId: string }> {
  if (!isStripeConfigured()) {
    return { status: 'succeeded', paymentIntentId }
  }

  const stripe = getStripe()
  const intent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  })

  return { status: intent.status, paymentIntentId: intent.id }
}

/**
 * Verifies a Stripe webhook signature and returns the parsed event.
 * Throws if the signature is invalid.
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, signature, secret)
}
