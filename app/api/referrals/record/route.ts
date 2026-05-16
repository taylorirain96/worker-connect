/**
 * POST /api/referrals/record
 * Records a new referral when a user signs up via a referral link.
 *
 * Body: { referralCode, referredUserId, referredEmail, referredName }
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { referralCode, referredUserId, referredEmail, referredName } = await req.json()

    if (!referralCode || !referredUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Look up the referrer by their stored referral code
    const usersSnap = await adminDb
      .collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get()

    if (usersSnap.empty) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    const referrerId = usersSnap.docs[0].id

    // Don't allow self-referral
    if (referrerId === referredUserId) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    const now = new Date().toISOString()
    // Use referredUserId as the document ID — guarantees one referral per user atomically
    const referralRef = adminDb.collection('referrals').doc(referredUserId)
    const userRef = adminDb.collection('users').doc(referredUserId)

    let alreadyExists = false
    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(referralRef)
      if (existing.exists) {
        alreadyExists = true
        return
      }
      tx.set(referralRef, {
        referrerId,
        referredId: referredUserId,
        referralCode,
        status: 'signed_up',
        createdAt: now,
        updatedAt: now,
        earnedAmount: 0,
        ...(referredName ? { referredName } : {}),
        ...(referredEmail ? { referredEmail } : {}),
      })
      // Store referredBy on the user doc in the same transaction
      tx.update(userRef, {
        referredByCode: referralCode,
        referredBy: referrerId,
      })
    })

    if (alreadyExists) {
      return NextResponse.json({ message: 'Referral already recorded' }, { status: 200 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to record referral:', err)
    return NextResponse.json({ error: 'Failed to record referral' }, { status: 500 })
  }
}
