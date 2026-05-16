import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendNotification } from '@/lib/notificationService'

export const dynamic = 'force-dynamic'

/**
 * Hourly cron: refund instant bookings whose worker accept/decline window
 * (`respondDeadlineAt`) has passed without a response.
 *
 * Scheduled in `vercel.json`. Authenticated with `CRON_SECRET` like the other
 * cron routes in this repo.
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
      .limit(100)
      .get()

    if (snap.empty) {
      return NextResponse.json({ refunded: 0 })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

    let refunded = 0
    const errors: Array<{ id: string; error: string }> = []

    for (const doc of snap.docs) {
      const booking = doc.data() as {
        homeownerId?: string
        workerId?: string
        packageTitle?: string
        stripePaymentIntentId?: string
      }

      if (!booking.stripePaymentIntentId) {
        await doc.ref.update({
          status: 'refunded',
          decisionAt: nowIso,
          updatedAt: nowIso,
        })
        continue
      }

      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
        })

        await doc.ref.update({
          status: 'refunded',
          decisionAt: nowIso,
          refundId: refund.id,
          updatedAt: nowIso,
        })

        if (booking.homeownerId) {
          await sendNotification({
            userId: booking.homeownerId,
            type: 'application_rejected',
            title: 'Instant booking expired',
            message: `The worker did not respond in time for "${booking.packageTitle ?? 'your booking'}". Your deposit has been refunded.`,
            actionUrl: '/dashboard/homeowner',
            metadata: { bookingId: doc.id, refundId: refund.id },
          })
        }
        if (booking.workerId) {
          await sendNotification({
            userId: booking.workerId,
            type: 'general',
            title: 'Instant booking expired',
            message: `You did not respond to a booking for "${booking.packageTitle ?? 'a service'}" within 24h. The homeowner has been refunded.`,
            actionUrl: '/dashboard/worker/instant-bookings',
            metadata: { bookingId: doc.id },
          })
        }

        refunded++
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error(`Instant book timeout refund failed for ${doc.id}:`, message)
        errors.push({ id: doc.id, error: message })
      }
    }

    return NextResponse.json({ refunded, errors })
  } catch (error) {
    console.error('Instant book timeout cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
