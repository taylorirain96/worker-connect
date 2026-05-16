import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendBookingConfirmedEmail, sendBookingDeclinedEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'
import { sendSMS as sendTwilioSMS } from '@/lib/sms'
import { buildSMSMessage } from '@/lib/notifications/sms'
import type { BookingStatus } from '@/types'

export const dynamic = 'force-dynamic'

/** Send an SMS to the homeowner when their booking is confirmed or declined. Best-effort, never throws. */
async function sendBookingStatusSMS(
  homeownerId: string,
  workerName: string,
  requestedDate: string,
  status: 'confirmed' | 'declined',
): Promise<void> {
  try {
    const homeownerSnap = await adminDb.collection('users').doc(homeownerId).get()
    const homeownerPhone = homeownerSnap.data()?.phone as string | undefined
    if (homeownerPhone) {
      const smsType = status === 'confirmed' ? 'booking_confirmed' : 'booking_declined'
      const smsBody = buildSMSMessage(smsType, { workerName, date: requestedDate })
      await sendTwilioSMS({ to: homeownerPhone, body: smsBody })
    }
  } catch {
    // SMS is best-effort
  }
}

/**
 * GET /api/bookings/[id]
 * Returns a single booking by ID.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const doc = await adminDb.collection('bookings').doc(params.id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const bookingData = doc.data() as { workerId: string; homeownerId: string } | undefined
    if (!bookingData) {
      return NextResponse.json({ error: 'Booking data missing' }, { status: 500 })
    }

    const booking: { id: string; workerId: string; homeownerId: string } & Record<string, unknown> = {
      id: doc.id,
      ...bookingData,
    }
    if (!booking.workerId || !booking.homeownerId) {
      return NextResponse.json({ error: 'Booking is missing ownership data' }, { status: 500 })
    }

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
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    const nextStatus = status as 'confirmed' | 'declined'

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
      status: nextStatus,
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

      // Push notification to homeowner
      sendAdminNotification({
        userId: booking.homeownerId,
        title: 'Booking Confirmed ✅',
        body: `${booking.workerName} confirmed your booking for ${booking.requestedDate}.`,
        type: 'job_status_change',
        link: `/dashboard/homeowner/bookings`,
      }).catch(() => {})
    } else {
      sendBookingDeclinedEmail({
        homeownerEmail: booking.homeownerEmail,
        homeownerName: booking.homeownerName,
        workerName: booking.workerName,
        requestedDate: booking.requestedDate,
        workerMessage: workerMessage,
        bookingId: params.id,
      }).catch((err) => console.error('sendBookingDeclinedEmail failed:', err))

      // Push notification to homeowner
      sendAdminNotification({
        userId: booking.homeownerId,
        title: 'Booking Declined',
        body: `${booking.workerName} was unable to accept your booking for ${booking.requestedDate}.`,
        type: 'job_status_change',
        link: `/dashboard/homeowner/bookings`,
      }).catch(() => {})
    }

    // SMS to homeowner (non-blocking)
    sendBookingStatusSMS(
      booking.homeownerId,
      booking.workerName,
      booking.requestedDate,
      nextStatus,
    ).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/bookings/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
