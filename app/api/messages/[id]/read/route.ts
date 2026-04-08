import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/messages/[id]/read
 * Mark a message or conversation as read.
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Clients use the Firestore SDK for real-time read-state updates.
    // This endpoint is provided for API completeness.
    return NextResponse.json({ success: true, id: params.id })
  } catch (error) {
    console.error('PUT /api/messages/[id]/read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
