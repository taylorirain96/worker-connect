import { NextRequest, NextResponse } from 'next/server'
import { calculateNetWithdrawal, MIN_WITHDRAWAL } from '@/lib/earnings/calculateEarnings'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { DocumentReference } from 'firebase-admin/firestore'
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

    // Use a Firestore transaction to atomically verify balance and deduct
    let workerStripeAccountId: string | undefined
    let withdrawalRef: DocumentReference

    await adminDb.runTransaction(async (txn) => {
      const userRef = adminDb.collection('users').doc(uid)
      const userSnap = await txn.get(userRef)

      if (!userSnap.exists) {
        throw new Error('USER_NOT_FOUND')
      }

      const userData = userSnap.data()!
      const availableBalance: number =
        typeof userData.availableBalance === 'number' ? userData.availableBalance : 0
      workerStripeAccountId = userData.stripeAccountId as string | undefined

      if (availableBalance < amount) {
        throw new Error(`INSUFFICIENT_BALANCE:${availableBalance.toFixed(2)}`)
      }

      // Deduct balance inside the transaction
      txn.update(userRef, {
        availableBalance: FieldValue.increment(-amount),
        updatedAt: new Date().toISOString(),
      })

      // Create the withdrawal record inside the transaction
      withdrawalRef = adminDb.collection('withdrawals').doc()
      txn.set(withdrawalRef, {
        uid,
        amount,
        fee,
        instantFee,
        netAmount,
        transferType,
        bankAccountId,
        status: 'pending',
        stripePayoutId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

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

      // Update withdrawal record with Stripe payout ID
      await withdrawalRef!.update({
        stripePayoutId,
        status: 'processing',
        updatedAt: FieldValue.serverTimestamp(),
      })
    }

    const withdrawal = {
      id: withdrawalRef!.id,
      amount,
      fee,
      instantFee,
      netAmount,
      transferType,
      bankAccountId,
      status: stripePayoutId ? 'processing' : 'pending',
      stripePayoutId: stripePayoutId ?? null,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, withdrawal }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (msg.startsWith('INSUFFICIENT_BALANCE:')) {
      const bal = msg.split(':')[1]
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${bal}` },
        { status: 400 }
      )
    }
    console.error('POST /api/earnings/withdraw error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
