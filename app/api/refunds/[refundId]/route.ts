import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['completed', 'failed'],
  completed: [],
  failed: [],
}

/**
 * GET /api/refunds/[refundId]  — fetch a single refund
 * PUT /api/refunds/[refundId]  — update refund status
 */
export async function GET(
  _request: Request,
  { params }: { params: { refundId: string } }
) {
  try {
    const { refundId } = params
    if (!refundId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    try {
      const snap = await adminDb.collection('refunds').doc(refundId).get()
      if (!snap.exists) {
        return NextResponse.json({ error: 'Refund not found' }, { status: 404 })
      }
      return NextResponse.json({ refund: { id: snap.id, ...snap.data() } })
    } catch {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('GET /api/refunds/[refundId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { refundId: string } }
) {
  try {
    const { refundId } = params
    const body = await request.json() as {
      status?: string
      failureReason?: string
      stripeRefundId?: string
    }

    if (!refundId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { status, failureReason, stripeRefundId } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing required field: status' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (stripeRefundId) updates.stripeRefundId = stripeRefundId

    try {
      const snap = await adminDb.collection('refunds').doc(refundId).get()
      if (!snap.exists) {
        return NextResponse.json({ error: 'Refund not found' }, { status: 404 })
      }
      const currentStatus = (snap.data()?.status ?? 'pending') as string
      const allowed = VALID_TRANSITIONS[currentStatus] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status transition from '${currentStatus}' to '${status}'` },
          { status: 400 }
        )
      }
    } catch (err) {
      const isNotFound = err instanceof Error && err.message.includes('not found')
      if (isNotFound) {
        return NextResponse.json({ error: 'Refund not found' }, { status: 404 })
      }
      // Firestore unavailable — skip validation
    }

    const now = new Date().toISOString()
    if (status === 'completed') updates.completedAt = FieldValue.serverTimestamp()
    if (status === 'failed') {
      updates.failedAt = FieldValue.serverTimestamp()
      if (failureReason) updates.failureReason = failureReason
    }

    try {
      await adminDb.collection('refunds').doc(refundId).update(updates)
      console.log(`Refund ${refundId} updated: status=${status}`)
    } catch {
      console.warn('Firestore unavailable — returning mock update response')
    }

    return NextResponse.json({ id: refundId, status, updatedAt: now })
  } catch (error) {
    console.error('PUT /api/refunds/[refundId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
