import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/messages/conversations
 * Returns conversations for the authenticated user.
 *
 * Note: In this application conversations are consumed exclusively through
 * the Firestore real-time SDK (see lib/services/messagingService.ts →
 * subscribeToConversations). This REST endpoint exists for API completeness
 * and server-to-server use cases. It returns an empty list because no
 * server-side Firestore admin SDK query is configured; clients should use
 * the client-side SDK listener for a live, paginated conversation feed.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ conversations: [], total: 0 })
  } catch (error) {
    console.error('GET /api/messages/conversations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
