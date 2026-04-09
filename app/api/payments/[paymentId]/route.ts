import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET  /api/payments/[paymentId]  — fetch a single payment
 * POST /api/payments/[paymentId]  — confirm / capture the payment
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    // In production: fetch from Firestore via paymentService.getPayment(paymentId)
    const mockPayment = {
      id: paymentId,
      jobId: 'job_1',
      jobTitle: 'Plumbing Repair — Kitchen Sink',
      employerId: 'emp_1',
      workerId: 'worker_1',
      amount: 320,
      currency: 'usd',
      status: 'completed',
      stripePaymentIntentId: `pi_${paymentId}`,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    }

    return NextResponse.json({ payment: mockPayment })
  } catch (error) {
    console.error('GET /api/payments/[paymentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params
    const body = await req.json() as { action?: string; paymentMethodId?: string }
    const { action = 'confirm', paymentMethodId: _paymentMethodId } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    if (action === 'confirm') {
      // In production:
      // const { getStripe } = await import('@/lib/payments/stripe')
      // const stripe = getStripe()
      // const paymentIntent = await stripe.paymentIntents.confirm(paymentId, {
      //   payment_method: _paymentMethodId,
      // })
      // await updatePaymentStatus(paymentIntent.metadata.paymentId, 'completed')
      // return NextResponse.json({ status: paymentIntent.status })

      // _paymentMethodId will be passed to stripe.paymentIntents.confirm() in production
      return NextResponse.json({ status: 'succeeded', paymentIntentId: paymentId })
    }

    if (action === 'refund') {
      // In production:
      // const stripe = getStripe()
      // const refund = await stripe.refunds.create({ payment_intent: paymentId })
      // await updatePaymentStatus(paymentId, 'refunded')

      return NextResponse.json({ status: 'refunded', paymentIntentId: paymentId })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/payments/[paymentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
