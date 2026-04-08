import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getNotifications } from '@/lib/notifications/firebase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/send-digest
 * Gathers unread notifications for the user and sends a summary.
 * Email delivery is handled via the /api/notifications/email route.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, frequency, email } = body as {
      userId: string
      frequency?: 'daily' | 'weekly'
      email?: string
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const digestFrequency = frequency ?? 'daily'
    const lookbackDays = digestFrequency === 'weekly' ? 7 : 1

    // Fetch recent unread notifications
    const { notifications } = await getNotifications(userId, 50)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - lookbackDays)

    const recentUnread = notifications.filter(
      (n) => !n.read && new Date(n.createdAt) >= cutoff
    )

    if (recentUnread.length === 0) {
      return NextResponse.json({ sent: false, reason: 'No unread notifications in period' })
    }

    // Dispatch email digest
    const emailPayload = {
      userId,
      email,
      frequency: digestFrequency,
      notificationCount: recentUnread.length,
      notifications: recentUnread.slice(0, 10).map((n) => ({
        title: n.title ?? n.type,
        message: n.message,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt,
      })),
    }

    // Fire-and-forget to the email route
    const baseUrl = request.nextUrl.origin
    fetch(`${baseUrl}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    }).catch(() => {})

    return NextResponse.json({
      sent: true,
      frequency: digestFrequency,
      notificationCount: recentUnread.length,
    })
  } catch (error) {
    console.error('POST /api/notifications/send-digest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
