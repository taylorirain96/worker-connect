import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getNotifications } from '@/lib/notifications/firebase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications
 * Returns a paginated list of notifications for the authenticated user.
 * Query params: pageSize (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20', 10), 100)

    const { notifications, lastDoc } = await getNotifications(userId, pageSize)

    return NextResponse.json({
      notifications,
      hasMore: lastDoc !== null && notifications.length === pageSize,
    })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
