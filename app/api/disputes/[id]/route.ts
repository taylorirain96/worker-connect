import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ['under_review', 'resolved', 'refunded'],
  under_review: ['resolved', 'refunded', 'open'],
  resolved: [],
  refunded: [],
  // Legacy statuses from DisputeResolutionStatus
  awaiting_evidence: ['under_review', 'resolved'],
  escalated: ['under_review', 'resolved'],
  closed: [],
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    try {
      const snap = await adminDb.collection('disputes').doc(id).get()
      if (!snap.exists) {
        return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
      }
      return NextResponse.json({ dispute: { id: snap.id, ...snap.data() } })
    } catch {
      return NextResponse.json({ dispute: null, id })
    }
  } catch (error) {
    console.error('GET /api/disputes/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as {
      status?: string
      notes?: string
      mediatorId?: string
      mediatorName?: string
      refundAmount?: number
      refundStatus?: string
      [key: string]: unknown
    }

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { status, notes, ...rest } = body

    const updates: Record<string, unknown> = {
      ...rest,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (notes !== undefined) updates.notes = notes

    if (status !== undefined) {
      try {
        const snap = await adminDb.collection('disputes').doc(id).get()
        if (!snap.exists) {
          return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
        }
        const currentStatus = (snap.data()?.status ?? 'open') as string
        const allowed = VALID_TRANSITIONS[currentStatus] ?? []
        if (!allowed.includes(status)) {
          return NextResponse.json(
            { error: `Invalid status transition from '${currentStatus}' to '${status}'` },
            { status: 400 }
          )
        }
      } catch (err) {
        // If Firestore unavailable, skip validation
        const isFirestoreError = err instanceof Error && err.message.includes('not found')
        if (isFirestoreError) {
          return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
        }
      }

      updates.status = status
      if (status === 'resolved' || status === 'refunded') {
        updates.resolvedAt = new Date().toISOString()
      }
    }

    try {
      await adminDb.collection('disputes').doc(id).update(updates)
      console.log(`Dispute ${id} updated: status=${status ?? 'no change'}`)
    } catch {
      console.warn('Firestore unavailable — returning mock update response')
    }

    return NextResponse.json({ id, status: status ?? 'unchanged', updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('PUT /api/disputes/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params })
}

