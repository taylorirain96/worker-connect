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
  const requesterId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  if (!requesterId) {
    return NextResponse.json({ error: 'Missing requester identity' }, { status: 401 })
  }

  try {
    if (requesterId !== userId) {
      const requesterDoc = await adminDb.collection('users').doc(requesterId).get()
      if (requesterDoc.data()?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

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
