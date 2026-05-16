import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

type AvailabilityStatus = 'available' | 'busy' | 'unavailable'

/**
 * PATCH /api/workers/status
 * Quickly updates a worker's availability status.
 * Body: { status: 'available' | 'busy' | 'unavailable' }
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as { status?: unknown }
    const { status } = body

    const VALID: AvailabilityStatus[] = ['available', 'busy', 'unavailable']
    if (!status || !VALID.includes(status as AvailabilityStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "available", "busy", or "unavailable".' },
        { status: 400 },
      )
    }

    const userRef = adminDb.collection('users').doc(userId)
    const snap = await userRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = snap.data()
    if (data?.role !== 'worker') {
      return NextResponse.json({ error: 'Only workers can update availability status' }, { status: 403 })
    }

    await userRef.update({
      availability: status as AvailabilityStatus,
      availabilityUpdatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, status })
  } catch (err) {
    console.error('PATCH /api/workers/status error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
