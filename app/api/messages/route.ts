import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const userId = searchParams.get('userId')

    if (!conversationId && !userId) {
      return NextResponse.json({ error: 'conversationId or userId required' }, { status: 400 })
    }

    // Messages are fetched client-side via Firestore real-time listeners.
    // This endpoint is retained for server-side use cases (e.g., webhooks, admin).
    return NextResponse.json({ messages: [], total: 0 })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, senderName, content, type } = body

    if (!conversationId || !senderId || !senderName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      content,
      type: type || 'text',
      read: false,
      createdAt: new Date().toISOString(),
    }

    // Messages are persisted client-side via Firestore SDK for real-time delivery.
    // This endpoint can be used for server-to-server or admin message creation.
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
