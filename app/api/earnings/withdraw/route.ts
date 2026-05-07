import { NextRequest, NextResponse } from 'next/server'
import { calculateNetWithdrawal, MIN_WITHDRAWAL } from '@/lib/earnings/calculateEarnings'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { rateLimit } from '@/lib/rateLimit'

interface WithdrawRequestBody {
  amount: number
  transferType: 'standard' | 'instant'
  bankAccountId: string
}

export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as WithdrawRequestBody
    const { amount, transferType, bankAccountId } = body

    // Basic validation
    if (!amount || !transferType || !bankAccountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(2)}` },
        { status: 400 }
      )
    }

    const { fee, instantFee, netAmount } = calculateNetWithdrawal(amount, transferType)

    // Verify user exists and check available balance
    const userSnap = await adminDb.collection('users').doc(uid).get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()!
    const availableBalance: number =
      typeof userData.availableBalance === 'number' ? userData.availableBalance : 0
    const workerStripeAccountId: string | undefined =
      userData.stripeAccountId as string | undefined

    if (availableBalance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    let stripePayoutId: string | undefined

    // Create Stripe payout via Connect if configured and worker has a connected account
    if (process.env.STRIPE_SECRET_KEY && workerStripeAccountId) {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
      const payout = await stripe.payouts.create(
        {
          amount: Math.round(netAmount * 100),
          currency: 'nzd',
          method: transferType === 'instant' ? 'instant' : 'standard',
          metadata: { uid, bankAccountId },
        },
        { stripeAccount: workerStripeAccountId }
      )
      stripePayoutId = payout.id
    }

    // Record withdrawal in Firestore
    const now = FieldValue.serverTimestamp()
    const ref = await adminDb.collection('withdrawals').add({
      uid,
      amount,
      fee,
      instantFee,
      netAmount,
      transferType,
      bankAccountId,
      status: 'pending',
      stripePayoutId: stripePayoutId ?? null,
      createdAt: now,
      updatedAt: now,
    })

    // Deduct from worker's available balance
    await adminDb.collection('users').doc(uid).update({
      availableBalance: FieldValue.increment(-amount),
      updatedAt: new Date().toISOString(),
    })

    const withdrawal = {
      id: ref.id,
      amount,
      fee,
      instantFee,
      netAmount,
      transferType,
      bankAccountId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, withdrawal }, { status: 201 })
  } catch (error) {
    console.error('POST /api/earnings/withdraw error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
