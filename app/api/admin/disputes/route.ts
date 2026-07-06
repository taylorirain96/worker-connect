import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/disputes
 * Query params: status, reason, limit, offset, sortBy, order, startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const reason = searchParams.get('reason')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const sortBy = searchParams.get('sortBy') ?? 'createdAt'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'

    let q = adminDb.collection('disputes') as FirebaseFirestore.Query

    if (status) q = q.where('status', '==', status)
    if (reason) q = q.where('reason', '==', reason)
    q = q.orderBy(sortBy, order)

    const snap = await q.get()
    const items = snap.docs.map((doc: QueryDocumentSnapshot) => {
      const d = doc.data()
      return {
        id: doc.id,
        workerId: d.workerId ?? '',
        workerName: d.workerName ?? '',
        employerId: d.employerId ?? d.clientId ?? '',
        employerName: d.employerName ?? d.clientName ?? '',
        amount: d.amount ?? 0,
        reason: d.reason ?? '',
        status: d.status ?? '',
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? (d.createdAt as string | undefined) ?? '',
        dueDate: d.dueDate ?? null,
        resolvedAt: d.resolvedAt?.toDate?.()?.toISOString?.() ?? (d.resolvedAt as string | undefined) ?? null,
      }
    })

    const total = items.length
    const paginated = items.slice(offset, offset + limit)

    return NextResponse.json({ items: paginated, total, limit, offset })
  } catch (error) {
    console.error('GET /api/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/disputes
 * Body: { disputeId, status, note }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as { disputeId: string; status: string; note?: string }
    const { disputeId, status, note } = body

    if (!disputeId || !status) {
      return NextResponse.json({ error: 'disputeId and status are required' }, { status: 400 })
    }

    const update: Record<string, unknown> = { status, updatedAt: FieldValue.serverTimestamp() }
    if (note) update.note = note
    if (status === 'resolved' || status === 'closed') {
      update.resolvedAt = FieldValue.serverTimestamp()
    }

    await adminDb.collection('disputes').doc(disputeId).update(update)
    console.info('[Admin] Dispute updated', { disputeId, status, note })

    return NextResponse.json({ success: true, disputeId, status })
  } catch (error) {
    console.error('PUT /api/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/disputes
 * Body: { disputeId, note, authorId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { disputeId: string; note: string; authorId: string }
    const { disputeId, note, authorId } = body

    if (!disputeId || !note || !authorId) {
      return NextResponse.json({ error: 'disputeId, note, and authorId are required' }, { status: 400 })
    }

    const docRef = await adminDb
      .collection('disputes')
      .doc(disputeId)
      .collection('notes')
      .add({ disputeId, note, authorId, createdAt: FieldValue.serverTimestamp() })

    return NextResponse.json({ success: true, note: { id: docRef.id, disputeId, note, authorId } })
  } catch (error) {
    console.error('POST /api/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
