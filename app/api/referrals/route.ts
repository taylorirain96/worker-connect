/**
 * GET /api/referrals
 * Returns all referrals where the current user is the referrer.
 * Query param: userId (the referrer's UID)
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { Referral } from '@/types'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const snap = await adminDb
      .collection('referrals')
      .where('referrerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const referrals: Referral[] = snap.docs.map((d: QueryDocumentSnapshot) => ({
      id: d.id,
      ...(d.data() as Omit<Referral, 'id'>),
    }))

    return NextResponse.json({ referrals })
  } catch (err) {
    console.error('Failed to fetch referrals:', err)
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 })
  }
}
