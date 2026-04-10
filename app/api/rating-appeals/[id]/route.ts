import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    // In production, fetch appeal from Firestore:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const snap = await adminDb.collection('ratingAppeals').doc(id).get()
    return NextResponse.json({ appeal: null, id })
  } catch (error) {
    console.error('GET /api/rating-appeals/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const body = await request.json()
    const { status, mediatorId, mediatorNote, decision, adjustedRating } = body

    const validStatuses = ['pending', 'under_review', 'approved', 'denied']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const validDecisions = ['rating_removed', 'rating_adjusted', 'rating_upheld']
    if (decision && !validDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
    }

    // In production:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // await adminDb.collection('ratingAppeals').doc(id).update({ status, mediatorId, mediatorNote, decision, adjustedRating, updatedAt: FieldValue.serverTimestamp() })

    return NextResponse.json({ id, success: true, updates: { status, mediatorId, mediatorNote, decision, adjustedRating } })
  } catch (error) {
    console.error('PATCH /api/rating-appeals/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
