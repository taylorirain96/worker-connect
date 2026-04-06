import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { markAllNotificationsRead } from '@/lib/notifications/firebase'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await markAllNotificationsRead(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/notifications/read-all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
