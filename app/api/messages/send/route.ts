import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendMessage } from '@/lib/services/messagingService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/messages/send
 * Send a message in a conversation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, senderName, content, type, senderAvatar } = body

    if (!conversationId || !senderId || !senderName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const messageId = await sendMessage(
      conversationId,
      senderId,
      senderName,
      content,
      senderAvatar,
      type ?? 'text'
    )

    return NextResponse.json({ id: messageId, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/messages/send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
