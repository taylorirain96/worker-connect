import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET  /api/payments/[id]  — fetch a single payment
 * POST /api/payments/[id]  — confirm / capture the payment
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    // In production: fetch from Firestore via paymentService.getPayment(id)
    const mockPayment = {
      id,
      jobId: 'job_1',
      jobTitle: 'Plumbing Repair — Kitchen Sink',
      employerId: 'emp_1',
      workerId: 'worker_1',
      amount: 320,
      currency: 'usd',
      status: 'completed',
      stripePaymentIntentId: `pi_${id}`,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    }

    return NextResponse.json({ payment: mockPayment })
  } catch (error) {
    console.error('GET /api/payments/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json() as { action?: string; paymentMethodId?: string }
    const { action = 'confirm', paymentMethodId } = body

    if (!id) {
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
      // const paymentIntent = await stripe.paymentIntents.confirm(id, {
      //   payment_method: paymentMethodId,
      // })
      // await updatePaymentStatus(paymentIntent.metadata.paymentId, 'completed')
      // return NextResponse.json({ status: paymentIntent.status })

      // paymentMethodId will be passed to stripe.paymentIntents.confirm() in production
    void paymentMethodId
      return NextResponse.json({ status: 'succeeded', paymentIntentId: id })
    }

    if (action === 'refund') {
      // In production:
      // const stripe = getStripe()
      // const refund = await stripe.refunds.create({ payment_intent: id })
      // await updatePaymentStatus(paymentId, 'refunded')

      return NextResponse.json({ status: 'refunded', paymentIntentId: id })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/payments/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
