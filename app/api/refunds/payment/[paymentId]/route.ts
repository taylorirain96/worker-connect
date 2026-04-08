import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/refunds/payment/[paymentId]
 * Return all refunds linked to a payment.
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
        .collection('refunds')
        .where('paymentId', '==', paymentId)
        .orderBy('createdAt', 'desc')
        .get()
      const refunds = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      return NextResponse.json({ refunds, total: refunds.length, paymentId })
    } catch {
      // Mock fallback when Firestore unavailable
      return NextResponse.json({ refunds: [], total: 0, paymentId })
    }
  } catch (error) {
    console.error('GET /api/refunds/payment/[paymentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
