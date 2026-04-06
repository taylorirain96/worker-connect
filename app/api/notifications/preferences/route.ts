import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notifications/firebase'
import type { NotificationPreferences } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications/preferences
 * Returns notification preferences for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await getNotificationPreferences(userId)
    return NextResponse.json(preferences)
  } catch (error) {
    console.error('GET /api/notifications/preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for the authenticated user.
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as Partial<NotificationPreferences>

    // Validate basic structure
    if (body.channels && typeof body.channels !== 'object') {
      return NextResponse.json({ error: 'Invalid channels structure' }, { status: 400 })
    }

    const existing = await getNotificationPreferences(userId)
    const merged: NotificationPreferences = {
      ...existing,
      ...body,
      userId,
      channels: { ...existing.channels, ...body.channels },
      categories: { ...existing.categories, ...body.categories },
      quietHours: { ...existing.quietHours, ...body.quietHours },
      updatedAt: new Date().toISOString(),
    }

    await saveNotificationPreferences(merged)
    return NextResponse.json(merged)
  } catch (error) {
    console.error('PUT /api/notifications/preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
