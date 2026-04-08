import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getConversation } from '@/lib/services/messagingService'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { conversationId: string }
}

/**
 * GET /api/messages/[conversationId]
 * Returns conversation metadata. Messages are fetched client-side
 * via the real-time Firestore listener (subscribeToMessages).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = params
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify the requesting user is a participant
    if (!conversation.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ conversation, messages: [], total: 0 })
  } catch (error) {
    console.error(`GET /api/messages/${params.conversationId} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
