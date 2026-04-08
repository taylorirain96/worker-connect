import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createNotification } from '@/lib/notifications/firebase'
import type { NotificationType, NotificationCategory } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/create
 * Internal endpoint to create a notification for a user.
 * Intended for server-to-server use (e.g., webhooks, job events).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      type,
      title,
      message,
      category,
      actionUrl,
      imageUrl,
      jobId,
      metadata,
    } = body as {
      userId: string
      type: NotificationType
      title: string
      message: string
      category?: NotificationCategory
      actionUrl?: string
      imageUrl?: string
      jobId?: string
      metadata?: Record<string, string | number | boolean>
    }

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      )
    }

    const id = await createNotification({
      userId,
      type,
      title,
      message,
      category: category ?? 'system',
      read: false,
      channel: 'in_app',
      ...(actionUrl && { actionUrl }),
      ...(imageUrl && { imageUrl }),
      ...(jobId && { jobId }),
      ...(metadata && { metadata }),
      deliveryStatus: { in_app: 'delivered' },
    })

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/notifications/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
