import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/subscribe
 * Save a push subscription (FCM token or Web Push subscription) for the user.
 *
 * Body: { token: string } — FCM registration token
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { token?: string }
    const { token } = body

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 })
    }

    // Save FCM token server-side using Firebase Admin SDK
    // (In production replace with Admin SDK; using client-side helper here
    //  since Admin SDK requires a service account key.)
    const { saveFCMToken } = await import('@/lib/notifications/push')
    await saveFCMToken(userId, token.trim())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/notifications/subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Remove a push subscription for the user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { removeFCMToken } = await import('@/lib/notifications/push')
    await removeFCMToken(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/notifications/subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
