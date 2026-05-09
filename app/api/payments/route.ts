import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getStripe } from '@/lib/stripe'

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

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

    const field = role === 'employer' ? 'employerId' : 'workerId'
    const snap = await adminDb
      .collection('payments')
      .where(field, '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const payments = snap.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return {
        id: doc.id,
        ...data,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('GET /api/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description,
      metadata: { jobId, employerId, workerId },
      automatic_payment_methods: { enabled: true },
    })

    const now = FieldValue.serverTimestamp()
    const paymentRecord = {
      jobId,
      jobTitle: description ?? '',
      employerId,
      workerId,
      amount,
      currency,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: now,
      updatedAt: now,
    }
    const paymentDoc = await adminDb.collection('payments').add(paymentRecord)

    return NextResponse.json({
      id: paymentDoc.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      description,
    })
  } catch (error) {
    console.error('POST /api/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
