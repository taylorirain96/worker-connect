import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  createAdminNotification,
  getAdminNotifications,
} from '@/lib/notifications/firebase'
import type { NotificationType, NotificationChannel } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/notifications
 * Returns the list of admin broadcast notifications.
 */
export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id')
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await getAdminNotifications()
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('GET /api/admin/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/notifications/send
 * Send a broadcast notification to a target user segment.
 *
 * Body: { title, message, type, targetSegment, targetUserIds?, channels, scheduledAt? }
 */
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id')
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
      title: string
      message: string
      type: NotificationType
      targetSegment: 'all' | 'workers' | 'employers' | 'specific'
      targetUserIds?: string[]
      channels: NotificationChannel[]
      scheduledAt?: string
    }

    const { title, message, type, targetSegment, channels } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
    }
    if (!Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json({ error: 'At least one channel is required' }, { status: 400 })
    }

    const id = await createAdminNotification({
      title: title.trim(),
      message: message.trim(),
      type,
      targetSegment,
      targetUserIds: body.targetUserIds,
      channels,
      scheduledAt: body.scheduledAt,
      status: body.scheduledAt ? 'scheduled' : 'sent',
      sentAt: body.scheduledAt ? undefined : new Date().toISOString(),
      createdBy: adminId,
    })

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
