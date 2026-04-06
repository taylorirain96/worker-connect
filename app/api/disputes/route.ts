import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // In production, query Firestore admin SDK:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const [workerSnap, clientSnap] = await Promise.all([
    //   adminDb.collection('disputes').where('workerId', '==', userId)...get(),
    //   adminDb.collection('disputes').where('clientId', '==', userId)...get(),
    // ])

    return NextResponse.json({ disputes: [], userId })
  } catch (error) {
    console.error('GET /api/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, workerId, clientId, reason, description, filedBy } = body

    if (!jobId || !workerId || !clientId || !reason || !description || !filedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production, write to Firestore via admin SDK:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const docRef = await adminDb.collection('disputes').add({ ...body, status: 'open', createdAt: FieldValue.serverTimestamp() })

    const mockId = `dispute_${Date.now()}`
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString()

    return NextResponse.json({ id: mockId, dueDate }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

