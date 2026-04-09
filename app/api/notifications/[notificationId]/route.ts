import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  markNotificationRead,
  deleteNotification,
} from '@/lib/notifications/firebase'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { notificationId: string }
}

/**
 * PUT /api/notifications/[notificationId]
 * Mark a single notification as read.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = params
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
    }

    await markNotificationRead(notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`PUT /api/notifications/${params.notificationId} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/notifications/[notificationId]
 * Mark a single notification as read (alias for PUT to match spec).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = params
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
    }

    await markNotificationRead(notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`PATCH /api/notifications/${params.notificationId} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/notifications/[notificationId]
 * Soft-delete a notification.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = params
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
    }

    await deleteNotification(notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/notifications/${params.notificationId} error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
