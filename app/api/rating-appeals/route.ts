import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')
    const status = searchParams.get('status')

    // In production, query Firestore:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // let q = adminDb.collection('ratingAppeals').orderBy('createdAt', 'desc')
    // if (workerId) q = q.where('workerId', '==', workerId)
    // if (status) q = q.where('status', '==', status)

    return NextResponse.json({ appeals: [], workerId, status })
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

    // In production:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const docRef = await adminDb.collection('ratingAppeals').add({ ...body, status: 'pending', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })

    const mockId = `appeal_${Date.now()}`
    return NextResponse.json({ id: mockId }, { status: 201 })
  } catch (error) {
    console.error('POST /api/rating-appeals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
