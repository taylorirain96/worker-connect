import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/disputes/payment/[paymentId]
 * Return all disputes linked to a payment.
 */
export async function GET(
  _request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    try {
      const snap = await adminDb
        .collection('disputes')
        .where('paymentId', '==', paymentId)
        .orderBy('createdAt', 'desc')
        .get()
      const disputes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      return NextResponse.json({ disputes, total: disputes.length, paymentId })
    } catch {
      // Mock fallback when Firestore unavailable
      return NextResponse.json({ disputes: [], total: 0, paymentId })
    }
  } catch (error) {
    console.error('GET /api/disputes/payment/[paymentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
