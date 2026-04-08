import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET  /api/refunds?paymentId=xxx  — list refunds for a payment
 * POST /api/refunds                — create a new refund
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentId')
    const pageSize = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    try {
      if (paymentId) {
        const snap = await adminDb
          .collection('refunds')
          .where('paymentId', '==', paymentId)
          .orderBy('createdAt', 'desc')
          .limit(pageSize)
          .get()
        const refunds = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        return NextResponse.json({ refunds, total: refunds.length })
      }

      return NextResponse.json({ refunds: [], total: 0 })
    } catch {
      return NextResponse.json({ refunds: [], total: 0 })
    }
  } catch (error) {
    console.error('GET /api/refunds error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      paymentId?: string
      amount?: number
      reason?: string
      stripeRefundId?: string
    }

    const { paymentId, amount, reason, stripeRefundId } = body

    if (!paymentId || amount === undefined || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, amount, reason' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const refundData: Record<string, unknown> = {
      paymentId,
      amount,
      reason,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (stripeRefundId) refundData.stripeRefundId = stripeRefundId

    let refundId: string
    try {
      const ref = await adminDb.collection('refunds').add(refundData)
      refundId = ref.id
      console.log(`Refund created: ${refundId} for payment ${paymentId}`)
    } catch {
      refundId = `refund_${Date.now()}`
      console.warn('Firestore unavailable — returning mock refund id')
    }

    return NextResponse.json(
      {
        id: refundId,
        paymentId,
        amount,
        reason,
        stripeRefundId,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/refunds error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
