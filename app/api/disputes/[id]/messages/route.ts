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
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .get()
    const messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ messages, disputeId: id })
  } catch (error) {
    console.error('GET /api/disputes/[id]/messages error:', error)
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
    const { senderId, senderName, senderRole, message, isInternal } = body

    if (!senderId || !senderName || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const docRef = await adminDb
      .collection('disputes')
      .doc(id)
      .collection('messages')
      .add({
        disputeId: id,
        senderId,
        senderName,
        senderRole: senderRole ?? 'client',
        message,
        isInternal: isInternal ?? false,
        read: false,
        timestamp: FieldValue.serverTimestamp(),
      })

    const created = {
      id: docRef.id,
      disputeId: id,
      senderId,
      senderName,
      senderRole: senderRole ?? 'client',
      message,
      isInternal: isInternal ?? false,
      read: false,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ message: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/[id]/messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
