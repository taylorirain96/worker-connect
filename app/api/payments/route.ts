import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET  /api/payments?userId=xxx  — list payments for a user
 * POST /api/payments             — create a Stripe payment intent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') ?? 'worker'

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // In production: query Firestore via paymentService
    // const payments = role === 'worker'
    //   ? await getWorkerPayments(userId)
    //   : await getEmployerPayments(userId)

    const mockPayments = [
      {
        id: 'pay_1',
        jobId: 'job_1',
        jobTitle: 'Plumbing Repair — Kitchen Sink',
        employerId: role === 'employer' ? userId : 'emp_1',
        workerId: role === 'worker' ? userId : 'worker_1',
        amount: 320,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: 'pi_mock_1',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'pay_2',
        jobId: 'job_2',
        jobTitle: 'Electrical Panel Upgrade',
        employerId: role === 'employer' ? userId : 'emp_2',
        workerId: role === 'worker' ? userId : 'worker_1',
        amount: 850,
        currency: 'usd',
        status: 'processing',
        stripePaymentIntentId: 'pi_mock_2',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    return NextResponse.json({ payments: mockPayments })
  } catch (error) {
    console.error('GET /api/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      amount?: number
      currency?: string
      jobId?: string
      employerId?: string
      workerId?: string
      description?: string
      paymentMethod?: string
    }

    const {
      amount,
      currency = 'usd',
      jobId,
      employerId,
      workerId,
      description,
    } = body

    if (!amount || !jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // In production:
    // const { getStripe } = await import('@/lib/payments/stripe')
    // const stripe = getStripe()
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100),
    //   currency,
    //   description,
    //   metadata: { jobId, employerId, workerId },
    //   automatic_payment_methods: { enabled: true },
    // })
    // return NextResponse.json({
    //   clientSecret: paymentIntent.client_secret,
    //   paymentIntentId: paymentIntent.id,
    //   amount: paymentIntent.amount,
    //   currency: paymentIntent.currency,
    // })

    return NextResponse.json({
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      paymentIntentId: `pi_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      description,
    })
  } catch (error) {
    console.error('POST /api/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
