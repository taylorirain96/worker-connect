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

    // Check for duplicate — one referral per referred user
    const existingSnap = await adminDb
      .collection('referrals')
      .where('referredId', '==', referredUserId)
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      return NextResponse.json({ message: 'Referral already recorded' }, { status: 200 })
    }

    const now = new Date().toISOString()
    await adminDb.collection('referrals').add({
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

    // Also store referredByCode on the new user's profile for future reward processing
    await adminDb.collection('users').doc(referredUserId).update({
      referredByCode: referralCode,
      referredBy: referrerId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to record referral:', err)
    return NextResponse.json({ error: 'Failed to record referral' }, { status: 500 })
  }
}
