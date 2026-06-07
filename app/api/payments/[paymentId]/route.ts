import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getStripe, confirmPaymentIntent } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { toIsoTimestamp } from '@/lib/server/firestoreSerializers'

/**
 * GET  /api/payments/[paymentId]  — fetch a single payment
 * POST /api/payments/[paymentId]  — confirm / refund the payment
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ paymentId: string }> },
) {
  const params = await context.params
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    const snap = await adminDb.collection('payments').doc(paymentId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const data = snap.data() as Record<string, unknown>
    return NextResponse.json({
      payment: {
        id: snap.id,
        ...data,
        createdAt: toIsoTimestamp(data.createdAt) ?? new Date().toISOString(),
        updatedAt: toIsoTimestamp(data.updatedAt) ?? new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('GET /api/payments/[paymentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ paymentId: string }> },
) {
  const params = await context.params
  try {
    const { paymentId } = params
    const body = await req.json() as { action?: string; paymentMethodId?: string }
    const { action = 'confirm', paymentMethodId } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const ref = adminDb.collection('payments').doc(paymentId)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    const payment = snap.data() as { stripePaymentIntentId?: string }
    if (!payment.stripePaymentIntentId) {
      return NextResponse.json({ error: 'Payment is missing stripePaymentIntentId' }, { status: 409 })
    }

    if (action === 'confirm') {
      if (!paymentMethodId) {
        return NextResponse.json({ error: 'paymentMethodId is required' }, { status: 400 })
      }

      const result = await confirmPaymentIntent(payment.stripePaymentIntentId, paymentMethodId)
      if (result.status === 'succeeded') {
        await ref.update({ status: 'completed', updatedAt: new Date().toISOString() })
      }

      return NextResponse.json({ status: result.status, paymentIntentId: result.paymentIntentId })
    }

    if (action === 'refund') {
      const stripe = getStripe()
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      })
      await ref.update({
        status: refund.status === 'succeeded' ? 'refunded' : 'failed',
        updatedAt: new Date().toISOString(),
      })
      return NextResponse.json({
        status: refund.status,
        paymentIntentId: payment.stripePaymentIntentId,
        refundId: refund.id,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/payments/[paymentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
