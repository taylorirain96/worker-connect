import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/messages/list
 * Returns chats/communications for a user.
 * Clients can also use the Firestore SDK listener for real-time updates.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') ?? request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    // Clients should use the real-time Firestore SDK for live updates.
    // This REST endpoint returns an empty list for API completeness.
    return NextResponse.json({ chats: [], total: 0 })
  } catch (error) {
    console.error('GET /api/messages/list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
