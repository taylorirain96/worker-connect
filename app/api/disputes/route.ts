import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET  /api/disputes?userId=xxx  — list disputes for a user
 * POST /api/disputes             — create a new dispute linked to a payment
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const paymentId = searchParams.get('paymentId')
    const pageSize = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    try {
      if (paymentId) {
        const snap = await adminDb
          .collection('disputes')
          .where('paymentId', '==', paymentId)
          .orderBy('createdAt', 'desc')
          .limit(pageSize)
          .get()
        const disputes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        return NextResponse.json({ disputes, total: disputes.length })
      }

      if (userId) {
        const [asWorker, asClient] = await Promise.all([
          adminDb
            .collection('disputes')
            .where('workerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(pageSize)
            .get(),
          adminDb
            .collection('disputes')
            .where('clientId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(pageSize)
            .get(),
        ])
        const map = new Map<string, Record<string, unknown>>()
        ;[...asWorker.docs, ...asClient.docs].forEach((d) =>
          map.set(d.id, { id: d.id, ...d.data() })
        )
        const disputes = Array.from(map.values())
        return NextResponse.json({ disputes, userId })
      }

      return NextResponse.json({ disputes: [], userId: null })
    } catch {
      return NextResponse.json({ disputes: [], userId })
    }
  } catch (error) {
    console.error('GET /api/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      paymentId?: string
      reason?: string
      description?: string
      evidence?: string[]
      // legacy fields
      jobId?: string
      workerId?: string
      clientId?: string
      filedBy?: string
    }

    const { paymentId, reason, description, evidence } = body

    if (!reason || !description) {
      return NextResponse.json({ error: 'Missing required fields: reason, description' }, { status: 400 })
    }

    if (!paymentId && !body.jobId) {
      return NextResponse.json({ error: 'Missing required field: paymentId' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const disputeData: Record<string, unknown> = {
      ...(paymentId ? { paymentId } : {}),
      ...(body.jobId ? { jobId: body.jobId } : {}),
      ...(body.workerId ? { workerId: body.workerId } : {}),
      ...(body.clientId ? { clientId: body.clientId } : {}),
      ...(body.filedBy ? { filedBy: body.filedBy } : {}),
      reason,
      description,
      evidence: evidence ?? [],
      status: 'open',
      notes: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    }

    let disputeId: string
    try {
      const ref = await adminDb.collection('disputes').add(disputeData)
      disputeId = ref.id
      console.log(`Dispute created: ${disputeId} for payment ${paymentId ?? body.jobId}`)
    } catch {
      disputeId = `dispute_${Date.now()}`
      console.warn('Firestore unavailable — returning mock dispute id')
    }

    return NextResponse.json(
      {
        id: disputeId,
        paymentId,
        reason,
        description,
        evidence: evidence ?? [],
        status: 'open',
        createdAt: now,
        updatedAt: now,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


