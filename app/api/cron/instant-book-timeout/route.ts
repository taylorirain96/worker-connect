import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getStripe } from '@/lib/stripe'
import { sendNotification } from '@/lib/notificationService'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/instant-book-timeout
 *
 * Hourly cron (see vercel.json) that auto-refunds Instant Bookings whose
 * 24-hour worker response window has elapsed without an accept/decline.
 * Bookings move to status `expired` and the homeowner is notified.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const nowIso = new Date().toISOString()

    const snap = await adminDb
      .collection('instantBookings')
      .where('status', '==', 'awaiting_worker_response')
      .where('respondDeadlineAt', '<=', nowIso)
      .limit(50)
      .get()

    let refunded = 0
    let failed = 0
    const stripe = getStripe()

    for (const doc of snap.docs) {
      const booking = doc.data() as {
        stripePaymentIntentId?: string
        homeownerId?: string
        workerName?: string
        packageTitle?: string
      }

      let refundId: string | undefined
      if (booking.stripePaymentIntentId) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            metadata: { type: 'instant_book_timeout', bookingId: doc.id },
          })
          refundId = refund.id
        } catch (err) {
          console.error(`Instant book timeout refund failed for ${doc.id}:`, err)
          failed++
          continue
        }
      }

      await doc.ref.update({
        status: 'expired',
        ...(refundId ? { refundId, refundedAt: nowIso } : {}),
        updatedAt: nowIso,
      })

      if (booking.homeownerId) {
        await sendNotification({
          userId: booking.homeownerId,
          type: 'application_rejected',
          title: 'Instant Booking Expired',
          message: `${booking.workerName ?? 'The worker'} didn't respond in time to your booking for "${booking.packageTitle ?? 'your package'}". Your deposit has been refunded.`,
          metadata: { bookingId: doc.id },
        })
      }

      refunded++
    }

    return NextResponse.json({ processed: snap.size, refunded, failed })
  } catch (error) {
    console.error('Instant book timeout cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
