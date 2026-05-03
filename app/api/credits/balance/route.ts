/**
 * GET /api/credits/balance?userId=xxx
 *
 * Returns the current NZD credit balance for a user.
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

    const data = userDoc.data()
    const credit: number = data?.credit ?? 0

    // Fetch recent transactions
    const txSnap = await adminDb
      .collection('creditTransactions')
      .doc(userId)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()

    const transactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    return NextResponse.json({ credit, transactions })
  } catch (err) {
    console.error('GET /api/credits/balance error:', err)
    return NextResponse.json({ error: 'Failed to fetch credit balance' }, { status: 500 })
  }
}
