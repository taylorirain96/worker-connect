import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

const MIN_PAYOUT_NZD = 50

/**
 * POST /api/affiliates/payout
 * Admin-only endpoint — triggers a Stripe Transfer to pay an affiliate.
 * Header: x-user-id (must be an admin)
 * Body: { targetUserId: string }
 */
export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const adminId = request.headers.get('x-user-id')
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the caller is an admin
  const adminSnap = await adminDb.collection('users').doc(adminId).get()
  if (adminSnap.data()?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  let body: { targetUserId?: string }
  try {
    body = await request.json() as { targetUserId?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { targetUserId } = body
  if (!targetUserId) {
    return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 })
  }

  const userSnap = await adminDb.collection('users').doc(targetUserId).get()
  if (!userSnap.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const userData = userSnap.data()!
  const affiliateBalance = (userData.affiliateBalance as number | undefined) ?? 0

  if (affiliateBalance < MIN_PAYOUT_NZD) {
    return NextResponse.json(
      { error: `Minimum payout is NZ$${MIN_PAYOUT_NZD}. Current balance: NZ$${affiliateBalance.toFixed(2)}` },
      { status: 400 }
    )
  }

  const stripeAccountId = userData.stripeAccountId as string | undefined
  let stripeTransferId: string | undefined

  if (stripeAccountId && process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
      const transfer = await stripe.transfers.create({
        amount: Math.round(affiliateBalance * 100),
        currency: 'nzd',
        destination: stripeAccountId,
        metadata: { type: 'affiliate_payout', userId: targetUserId },
      })
      stripeTransferId = transfer.id
    } catch (stripeErr) {
      console.error('[affiliates/payout] Stripe transfer error:', stripeErr)
      return NextResponse.json({ error: 'Stripe transfer failed' }, { status: 502 })
    }
  } else {
    console.warn('[affiliates/payout] No Stripe account or key — recording payout without Stripe transfer')
  }

  // Atomically deduct balance and increment paid-out
  await adminDb.runTransaction(async (tx) => {
    const ref = adminDb.collection('users').doc(targetUserId)
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error('User not found during transaction')
    const current = (snap.data()?.affiliateBalance as number | undefined) ?? 0
    if (current < MIN_PAYOUT_NZD) throw new Error('Balance dropped below minimum during transaction')
    tx.update(ref, {
      affiliateBalance: FieldValue.increment(-affiliateBalance),
      affiliatePaidOut: FieldValue.increment(affiliateBalance),
      updatedAt: new Date().toISOString(),
    })
  })

  // Audit trail
  await adminDb.collection('affiliatePayouts').add({
    userId: targetUserId,
    amount: affiliateBalance,
    currency: 'nzd',
    stripeTransferId: stripeTransferId ?? null,
    paidAt: new Date().toISOString(),
    paidBy: adminId,
  })

  return NextResponse.json({ success: true, amount: affiliateBalance, stripeTransferId })
}
