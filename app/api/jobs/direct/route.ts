import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendDirectJobRequestEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import {
  calculateQuoteFeeCommission,
  createQuoteFeePaymentRecord,
  getQuoteFeePaymentByIntent,
  updateQuoteFeePayment,
} from '@/lib/services/quoteFeeService'

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

    const homeownerData = homeownerDoc.data()!
    const workerData = workerDoc.data()!
    const requiresQuoteFee = Boolean(workerData.chargesQuoteFee && Number(workerData.quoteFeeAmount ?? 0) > 0)
    const quoteFeeAmount = Math.round(Number(workerData.quoteFeeAmount ?? 0) * 100) / 100
    const quoteFeeCurrency = workerData.country === 'AU' ? 'aud' : 'nzd'
    const now = new Date().toISOString()
    let quoteFeePaymentId: string | null = null

    if (requiresQuoteFee) {
      if (!paymentIntentId) {
        return NextResponse.json(
          { error: 'This worker requires the quote fee to be paid before the request is sent.' },
          { status: 400 }
        )
      }

      if (isStripeConfigured()) {
        const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
        if (paymentIntent.metadata?.type !== 'quote_fee') {
          return NextResponse.json({ error: 'Invalid quote-fee payment.' }, { status: 400 })
        }
        if (paymentIntent.metadata?.workerId !== workerId || paymentIntent.metadata?.employerId !== homeownerId) {
          return NextResponse.json({ error: 'Quote-fee payment does not match this request.' }, { status: 400 })
        }
        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json({ error: 'Quote-fee payment has not completed yet.' }, { status: 400 })
        }
        if (paymentIntent.amount !== Math.round(quoteFeeAmount * 100)) {
          return NextResponse.json({ error: 'Quote-fee payment amount does not match this worker setting.' }, { status: 400 })
        }
      } else if (!paymentIntentId.startsWith('pi_mock_')) {
        return NextResponse.json({ error: 'Invalid mock quote-fee payment.' }, { status: 400 })
      }

      const existingPayment = await getQuoteFeePaymentByIntent(paymentIntentId)
      if (existingPayment?.directRequestId) {
        return NextResponse.json({
          success: true,
          requestId: existingPayment.directRequestId,
          alreadyProcessed: true,
        })
      }

      quoteFeePaymentId = existingPayment?.id ?? null
    }

    const requestRef = adminDb.collection('directRequests').doc()

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
      quoteFeeAmount: requiresQuoteFee ? quoteFeeAmount : 0,
      quoteFeeCurrency: requiresQuoteFee ? quoteFeeCurrency : null,
      quoteFeePaymentIntentId: requiresQuoteFee ? paymentIntentId ?? null : null,
      quoteFeePaymentId,
      createdAt: now,
      updatedAt: now,
    }

    await requestRef.set(request)

    if (requiresQuoteFee && paymentIntentId) {
      const commission = calculateQuoteFeeCommission(quoteFeeAmount)
      if (quoteFeePaymentId) {
        await updateQuoteFeePayment(quoteFeePaymentId, {
          status: 'completed',
          directRequestId: requestRef.id,
          amount: quoteFeeAmount,
          currency: quoteFeeCurrency,
          employerId: homeownerId,
          workerId,
          workerName: request.workerName,
          stripePaymentIntentId: paymentIntentId,
          commissionRate: commission.commissionRate,
          commissionAmount: commission.commissionAmount,
          workerAmount: commission.workerAmount,
          requestDescription: description,
          requestedDate: date,
          address,
          completedAt: now,
          paymentType: 'quote_fee',
        })
      } else {
        quoteFeePaymentId = await createQuoteFeePaymentRecord({
          employerId: homeownerId,
          workerId,
          workerName: request.workerName,
          amount: quoteFeeAmount,
          currency: quoteFeeCurrency,
          status: 'completed',
          stripePaymentIntentId: paymentIntentId,
          commissionRate: commission.commissionRate,
          commissionAmount: commission.commissionAmount,
          workerAmount: commission.workerAmount,
          directRequestId: requestRef.id,
          requestDescription: description,
          requestedDate: date,
          address,
          paymentType: 'quote_fee',
          completedAt: now,
        })
        await requestRef.update({ quoteFeePaymentId, updatedAt: now })
      }
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
