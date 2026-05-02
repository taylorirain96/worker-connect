import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendBookingConfirmedEmail, sendBookingDeclinedEmail } from '@/lib/email/transactional'
import type { BookingStatus } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/bookings/[id]
 * Returns a single booking by ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const doc = await adminDb.collection('bookings').doc(params.id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = { id: doc.id, ...doc.data() } as { workerId: string; homeownerId: string } & Record<string, unknown>

    // Only the worker or homeowner can view the booking
    if (booking.workerId !== userId && booking.homeownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (err) {
    console.error('GET /api/bookings/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/bookings/[id]
 * Updates the booking status (worker accepts or declines).
 * Body: { status: 'confirmed' | 'declined', workerMessage?: string }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as { status?: BookingStatus; workerMessage?: string }
    const { status, workerMessage } = body

    if (!status || !['confirmed', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be confirmed or declined.' }, { status: 400 })
    }

    const bookingRef = adminDb.collection('bookings').doc(params.id)
    const doc = await bookingRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = doc.data() as {
      workerId: string
      workerName: string
      workerEmail: string
      homeownerId: string
      homeownerName: string
      homeownerEmail: string
      requestedDate: string
      requestedTime: string
      duration: number
      status: BookingStatus
    }

    // Only the worker can accept/decline
    if (booking.workerId !== userId) {
      return NextResponse.json({ error: 'Forbidden — only the worker can update this booking' }, { status: 403 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Booking has already been actioned' }, { status: 409 })
    }

    await bookingRef.update({
      status,
      workerMessage: workerMessage ?? '',
      updatedAt: new Date().toISOString(),
    })

    // Send email to homeowner (non-blocking)
    if (status === 'confirmed') {
      sendBookingConfirmedEmail({
        homeownerEmail: booking.homeownerEmail,
        homeownerName: booking.homeownerName,
        workerName: booking.workerName,
        requestedDate: booking.requestedDate,
        requestedTime: booking.requestedTime,
        duration: booking.duration,
        workerMessage: workerMessage,
        bookingId: params.id,
      }).catch((err) => console.error('sendBookingConfirmedEmail failed:', err))
    } else {
      sendBookingDeclinedEmail({
        homeownerEmail: booking.homeownerEmail,
        homeownerName: booking.homeownerName,
        workerName: booking.workerName,
        requestedDate: booking.requestedDate,
        workerMessage: workerMessage,
        bookingId: params.id,
      }).catch((err) => console.error('sendBookingDeclinedEmail failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/bookings/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
