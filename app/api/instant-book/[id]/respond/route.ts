import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'
import { sendNotification } from '@/lib/notificationService'

export const dynamic = 'force-dynamic'

/**
 * Worker accept/decline for an instant booking that is awaiting their response.
 *
 * Accept:  marks the booking `confirmed` and notifies the homeowner.
 * Decline: refunds the homeowner's deposit via Stripe, marks the booking
 *          `declined`, records the refund id, and notifies both parties.
 *
 * Only the assigned worker can respond, and only while the booking is in
 * `awaiting_worker_response` status (set by the Stripe webhook after the
 * deposit PaymentIntent succeeds). Responses past `respondDeadlineAt` are
 * rejected — the hourly `instant-book-timeout` cron handles those instead.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
  }

  let body: { action?: unknown }
  try {
    body = (await request.json()) as { action?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const action = body.action
  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json(
      { error: "action must be 'accept' or 'decline'" },
      { status: 400 },
    )
  }

  try {
    const bookingRef = adminDb.collection('instantBookings').doc(id)
    const snap = await bookingRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    const booking = snap.data() as {
      workerId?: string
      homeownerId?: string
      packageTitle?: string
      depositAmount?: number
      status?: string
      stripePaymentIntentId?: string
      respondDeadlineAt?: string
    }

    if (booking.workerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (booking.status !== 'awaiting_worker_response') {
      return NextResponse.json(
        { error: `Booking is not awaiting a response (status: ${booking.status})` },
        { status: 409 },
      )
    }
    if (
      booking.respondDeadlineAt &&
      new Date(booking.respondDeadlineAt).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: 'Response window has expired' },
        { status: 409 },
      )
    }

    const nowIso = new Date().toISOString()

    if (action === 'accept') {
      await bookingRef.update({
        status: 'confirmed',
        decisionAt: nowIso,
        updatedAt: nowIso,
      })

      if (booking.homeownerId) {
        await sendNotification({
          userId: booking.homeownerId,
          type: 'application_accepted',
          title: 'Instant booking confirmed',
          message: `Your booking for "${booking.packageTitle ?? 'your service'}" was confirmed.`,
          actionUrl: '/dashboard/homeowner',
          metadata: { bookingId: id },
        })
      }

      return NextResponse.json({ success: true, status: 'confirmed' })
    }

    // Decline → refund deposit
    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Cannot refund — booking has no Stripe PaymentIntent' },
        { status: 500 },
      )
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
    })

    await bookingRef.update({
      status: 'declined',
      decisionAt: nowIso,
      refundId: refund.id,
      updatedAt: nowIso,
    })

    if (booking.homeownerId) {
      await sendNotification({
        userId: booking.homeownerId,
        type: 'application_rejected',
        title: 'Instant booking declined',
        message: `The worker declined your booking for "${booking.packageTitle ?? 'your service'}". Your deposit has been refunded.`,
        actionUrl: '/dashboard/homeowner',
        metadata: { bookingId: id, refundId: refund.id },
      })
    }

    return NextResponse.json({ success: true, status: 'declined', refundId: refund.id })
  } catch (error) {
    console.error('Instant book respond error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
