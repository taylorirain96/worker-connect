import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const snap = await adminDb
      .collection('disputes')
      .doc(id)
      .collection('resolutions')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
    const resolution = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
    return NextResponse.json({ resolution, disputeId: id })
  } catch (error) {
    console.error('GET /api/disputes/[id]/resolution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const body = await request.json()
    const { decision, refundAmount, mediatorId, mediatorName, reasoning } = body

    if (!decision || !mediatorId || !reasoning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validDecisions = ['approved', 'denied', 'partial_refund', 'escalated']
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const newStatus = decision === 'escalated' ? 'under_review' : 'resolved'

    const [docRef] = await Promise.all([
      adminDb
        .collection('disputes')
        .doc(id)
        .collection('resolutions')
        .add({
          disputeId: id,
          decision,
          refundAmount: refundAmount ?? 0,
          mediatorId,
          mediatorName: mediatorName ?? 'Mediator',
          reasoning,
          timestamp: FieldValue.serverTimestamp(),
        }),
      adminDb
        .collection('disputes')
        .doc(id)
        .update({ status: newStatus, resolvedAt: decision !== 'escalated' ? FieldValue.serverTimestamp() : null, updatedAt: FieldValue.serverTimestamp() }),
    ])

    const created = {
      id: docRef.id,
      disputeId: id,
      decision,
      refundAmount: refundAmount ?? 0,
      mediatorId,
      mediatorName: mediatorName ?? 'Mediator',
      reasoning,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ resolution: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/[id]/resolution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
