/**
 * GET /api/boosts/balance?userId=xxx
 *
 * Returns the current Boost balance for a worker plus recent Boost transaction history.
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const boosts: number = userDoc.data()?.boosts ?? 0

    const txSnap = await adminDb
      .collection('boostTransactions')
      .doc(userId)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()

    const transactions = txSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))

    return NextResponse.json({ boosts, transactions })
  } catch (err) {
    console.error('GET /api/boosts/balance error:', err)
    return NextResponse.json({ error: 'Failed to fetch boost balance' }, { status: 500 })
  }
}
