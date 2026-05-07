import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { WorkerAvailability } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/availability
 * Returns the availability for the authenticated user (worker).
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = userDoc.data()
    const availability = data?.availability ?? null

    return NextResponse.json({ availability })
  } catch (err) {
    console.error('GET /api/availability error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/availability
 * Saves the worker's availability schedule to their user document.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as Partial<WorkerAvailability>

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

    const availability: WorkerAvailability = {
      monday:    { available: false, start: '08:00', end: '17:00' },
      tuesday:   { available: false, start: '08:00', end: '17:00' },
      wednesday: { available: false, start: '08:00', end: '17:00' },
      thursday:  { available: false, start: '08:00', end: '17:00' },
      friday:    { available: false, start: '08:00', end: '17:00' },
      saturday:  { available: false, start: '08:00', end: '17:00' },
      sunday:    { available: false, start: '08:00', end: '17:00' },
      blockedDates: [],
      minNoticeHours: 24,
    }

    for (const day of days) {
      if (body[day]) {
        availability[day] = {
          available: Boolean(body[day]?.available),
          start: typeof body[day]?.start === 'string' ? body[day]!.start : '08:00',
          end:   typeof body[day]?.end   === 'string' ? body[day]!.end   : '17:00',
        }
      }
    }

    if (Array.isArray(body.blockedDates)) {
      availability.blockedDates = body.blockedDates.filter((d) => typeof d === 'string')
    }

    if (typeof body.minNoticeHours === 'number' && body.minNoticeHours >= 0) {
      availability.minNoticeHours = body.minNoticeHours
    }

    await adminDb.collection('users').doc(userId).update({ availability })

    return NextResponse.json({ success: true, availability })
  } catch (err) {
    console.error('POST /api/availability error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
