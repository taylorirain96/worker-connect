import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    // In production, fetch messages for this dispute from Firestore ordered by timestamp
    return NextResponse.json({ messages: [], disputeId: id })
  } catch (error) {
    console.error('GET /api/disputes/[id]/messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { senderId, senderName, senderRole, message, isInternal } = body

    if (!senderId || !senderName || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const docRef = await adminDb.collection('disputeMessages').add({ disputeId: id, ...body, read: false, timestamp: FieldValue.serverTimestamp() })

    const mockMessage = {
      id: `msg_${Date.now()}`,
      disputeId: id,
      senderId,
      senderName,
      senderRole: senderRole ?? 'client',
      message,
      isInternal: isInternal ?? false,
      read: false,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ message: mockMessage }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/[id]/messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
