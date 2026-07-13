import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendDirectJobRequestEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import {
  getQuoteFeePaymentByIntent,
  updateQuoteFeePayment,
} from '@/lib/services/quoteFeeService'
import { normalizeCurrencyAmount } from '@/lib/utils/money'

export const dynamic = 'force-dynamic'

/**
 * POST /api/jobs/direct
 * Creates a direct job request from a homeowner to a specific worker.
 * Body: { workerId, description, date, address }
 */
export async function POST(req: NextRequest) {
  try {
    const homeownerId = req.headers.get('x-user-id')
    if (!homeownerId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as {
      workerId?: string
      description?: string
      date?: string
      address?: string
      paymentIntentId?: string
    }

    const { workerId, description, date, address, paymentIntentId } = body

    if (!workerId || !description || !date || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch homeowner and worker profiles in parallel
    const [homeownerDoc, workerDoc] = await Promise.all([
      adminDb.collection('users').doc(homeownerId).get(),
      adminDb.collection('users').doc(workerId).get(),
    ])

    if (!homeownerDoc.exists) {
      return NextResponse.json({ error: 'Homeowner not found' }, { status: 404 })
    }
    if (!workerDoc.exists) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    const homeownerData = homeownerDoc.data() as { displayName?: string; email?: string; role?: string }
    const workerData = workerDoc.data()!
    if (homeownerData.role !== 'homeowner') {
      return NextResponse.json({ error: 'Only homeowners can send direct requests.' }, { status: 403 })
    }
    const requiresQuoteFee = Boolean(workerData.chargesQuoteFee && Number(workerData.quoteFeeAmount ?? 0) > 0)
    const currentQuoteFeeAmount = normalizeCurrencyAmount(Number(workerData.quoteFeeAmount ?? 0))
    const now = new Date().toISOString()
    let quoteFeePayment = null as Awaited<ReturnType<typeof getQuoteFeePaymentByIntent>>

    if (requiresQuoteFee) {
      if (!paymentIntentId) {
        return NextResponse.json(
          { error: 'This worker requires the quote fee to be paid before the request is sent.' },
          { status: 400 }
        )
      }

      if (isStripeConfigured()) {
        const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
        const expectedQuoteFeeAmount = Number(paymentIntent.metadata?.quoteFeeAmount ?? 0)
        if (paymentIntent.metadata?.type !== 'quote_fee') {
          return NextResponse.json({ error: 'Invalid quote-fee payment.' }, { status: 400 })
        }
        if (paymentIntent.metadata?.workerId !== workerId || paymentIntent.metadata?.employerId !== homeownerId) {
          return NextResponse.json({ error: 'Quote-fee payment does not match this request.' }, { status: 400 })
        }
        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json({ error: 'Quote-fee payment has not completed yet.' }, { status: 400 })
        }
        if (normalizeCurrencyAmount(expectedQuoteFeeAmount) !== currentQuoteFeeAmount) {
          return NextResponse.json({ error: 'Quote-fee amount has changed since payment was initiated.' }, { status: 400 })
        }
        if (paymentIntent.amount !== Math.round(currentQuoteFeeAmount * 100)) {
          return NextResponse.json({ error: 'Stripe payment amount does not match the expected quote fee.' }, { status: 400 })
        }
      } else if (!paymentIntentId.startsWith('pi_mock_')) {
        return NextResponse.json({ error: 'Invalid mock quote-fee payment.' }, { status: 400 })
      }

      quoteFeePayment = await getQuoteFeePaymentByIntent(paymentIntentId)
      if (!quoteFeePayment) {
        return NextResponse.json({ error: 'Quote-fee payment record not found.' }, { status: 404 })
      }
      if (quoteFeePayment.workerId !== workerId || quoteFeePayment.employerId !== homeownerId) {
        return NextResponse.json({ error: 'Quote-fee payment does not match this request.' }, { status: 400 })
      }
      if (quoteFeePayment.status === 'failed' || quoteFeePayment.status === 'refunded') {
        return NextResponse.json({ error: 'Quote-fee payment is not valid.' }, { status: 400 })
      }
      if (normalizeCurrencyAmount(quoteFeePayment.amount) !== currentQuoteFeeAmount) {
        return NextResponse.json({ error: 'Quote-fee payment amount does not match the payment record.' }, { status: 400 })
      }

      if (quoteFeePayment.directRequestId) {
        return NextResponse.json({
          success: true,
          requestId: quoteFeePayment.directRequestId,
          alreadyProcessed: true,
        })
      }
    }

    const requestRef = requiresQuoteFee && quoteFeePayment
      ? adminDb.collection('directRequests').doc(quoteFeePayment.id)
      : adminDb.collection('directRequests').doc()

    if (requiresQuoteFee) {
      const existingRequest = await requestRef.get()
      if (existingRequest.exists) {
        return NextResponse.json({ success: true, requestId: requestRef.id, alreadyProcessed: true })
      }
    }

    const request = {
      homeownerId,
      homeownerName: homeownerData.displayName ?? 'Homeowner',
      homeownerEmail: homeownerData.email ?? '',
      workerId,
      workerName: workerData.displayName ?? 'Worker',
      workerEmail: workerData.email ?? '',
      description,
      date,
      address,
      status: 'pending' as const,
      quoteFeeRequired: requiresQuoteFee,
      quoteFeePaid: requiresQuoteFee,
      quoteFeeAmount: requiresQuoteFee ? quoteFeePayment?.amount ?? 0 : 0,
      quoteFeeCurrency: requiresQuoteFee ? quoteFeePayment?.currency ?? 'nzd' : null,
      quoteFeePaymentIntentId: requiresQuoteFee ? paymentIntentId ?? null : null,
      quoteFeePaymentId: quoteFeePayment?.id ?? null,
      createdAt: now,
      updatedAt: now,
    }

    await requestRef.set(request)

    if (requiresQuoteFee && quoteFeePayment) {
      await updateQuoteFeePayment(quoteFeePayment.id, {
        status: 'completed',
        directRequestId: requestRef.id,
        completedAt: now,
      })
    }

    // Send email to worker (non-blocking)
    sendDirectJobRequestEmail({
      workerEmail: request.workerEmail,
      workerName: request.workerName,
      homeownerName: request.homeownerName,
      description,
      date,
      address,
      requestId: requestRef.id,
    }).catch((err) => console.error('sendDirectJobRequestEmail failed:', err))

    // Push notification to worker (non-blocking)
    sendAdminNotification({
      userId: workerId,
      title: `${request.homeownerName} wants to book you again!`,
      body: `New direct job request: ${description.slice(0, 80)}${description.length > 80 ? '…' : ''}`,
      type: 'direct_request',
      link: `/dashboard/worker`,
    }).catch(() => {})

    return NextResponse.json({ success: true, requestId: requestRef.id })
  } catch (err) {
    console.error('POST /api/jobs/direct error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
