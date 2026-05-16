import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')
    const status = searchParams.get('status')

    let q = adminDb.collection('ratingAppeals').orderBy('createdAt', 'desc') as FirebaseFirestore.Query
    if (workerId) q = q.where('workerId', '==', workerId)
    if (status) q = q.where('status', '==', status)

    const snap = await q.get()
    const appeals = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ appeals, workerId, status })
  } catch (error) {
    console.error('GET /api/rating-appeals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, workerId, currentRating, appealReason } = body

    if (!jobId || !workerId || currentRating === undefined || !appealReason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (currentRating < 1 || currentRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const docRef = await adminDb.collection('ratingAppeals').add({
      ...body,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ id: docRef.id }, { status: 201 })
  } catch (error) {
    console.error('POST /api/rating-appeals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
