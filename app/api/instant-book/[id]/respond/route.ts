import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getStripe } from '@/lib/stripe'
import { sendNotification } from '@/lib/notificationService'
import { rateLimit } from '@/lib/rateLimit'
import type { InstantBooking } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/instant-book/[id]/respond
 *
 * Worker accept/decline endpoint for an Instant Booking that's currently in
 * `awaiting_worker_response`. Decline issues a Stripe refund of the deposit.
 * Headers: x-user-id (must match the booking's workerId).
 * Body: { action: 'accept' | 'decline' }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: bookingId } = await context.params

  let body: { action?: string }
  try {
    body = (await request.json()) as { action?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = body.action
  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json({ error: 'action must be "accept" or "decline"' }, { status: 400 })
  }

  try {
    const ref = adminDb.collection('instantBookings').doc(bookingId)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    const booking = { id: snap.id, ...(snap.data() as Omit<InstantBooking, 'id'>) } as InstantBooking

    if (booking.workerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'awaiting_worker_response') {
      return NextResponse.json(
        { error: `Booking cannot be responded to in status "${booking.status}"` },
        { status: 409 },
      )
    }

    const nowIso = new Date().toISOString()

    if (action === 'accept') {
      await ref.update({
        status: 'confirmed',
        respondedAt: nowIso,
        updatedAt: nowIso,
      })

      await sendNotification({
        userId: booking.homeownerId,
        type: 'application_accepted',
        title: 'Instant Booking Confirmed',
        message: `${booking.workerName} accepted your booking for "${booking.packageTitle}".`,
        metadata: { bookingId: booking.id },
      })

      return NextResponse.json({ status: 'confirmed', bookingId: booking.id })
    }

    // Decline → refund the deposit
    let refundId: string | undefined
    if (booking.stripePaymentIntentId) {
      try {
        const stripe = getStripe()
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          metadata: { type: 'instant_book_decline', bookingId: booking.id },
        })
        refundId = refund.id
      } catch (err) {
        console.error('Instant book decline refund failed:', err)
        return NextResponse.json(
          { error: 'Failed to refund deposit. Please try again.' },
          { status: 502 },
        )
      }
    }

    await ref.update({
      status: 'declined',
      respondedAt: nowIso,
      ...(refundId ? { refundId, refundedAt: nowIso } : {}),
      updatedAt: nowIso,
    })

    await sendNotification({
      userId: booking.homeownerId,
      type: 'application_rejected',
      title: 'Instant Booking Declined',
      message: `${booking.workerName} couldn't take your booking for "${booking.packageTitle}". Your deposit has been refunded.`,
      metadata: { bookingId: booking.id },
    })

    return NextResponse.json({ status: 'declined', bookingId: booking.id, refundId })
  } catch (error) {
    console.error('Instant book respond error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
