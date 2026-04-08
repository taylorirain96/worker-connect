import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/messages/[id]
 * Delete a message.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Clients use the Firestore SDK to delete messages.
    // This endpoint is provided for API completeness.
    return NextResponse.json({ success: true, id: params.id })
  } catch (error) {
    console.error('DELETE /api/messages/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
