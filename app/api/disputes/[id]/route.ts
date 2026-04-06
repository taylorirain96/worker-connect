import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // In production, fetch from Firestore:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const snap = await adminDb.collection('disputes').doc(id).get()
    // if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ dispute: null, id })
  } catch (error) {
    console.error('GET /api/disputes/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const allowedFields = ['status', 'mediatorId', 'mediatorName', 'refundAmount', 'refundStatus', 'resolvedAt']
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field]
    }

    // In production:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // await adminDb.collection('disputes').doc(id).update({ ...updates, updatedAt: FieldValue.serverTimestamp() })

    return NextResponse.json({ id, updates, success: true })
  } catch (error) {
    console.error('PATCH /api/disputes/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
