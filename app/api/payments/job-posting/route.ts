/**
 * POST /api/payments/job-posting
 *
 * Creates a Stripe Checkout session for a job posting fee.
 * The employer is redirected to Stripe Checkout; on success the job is
 * activated by the webhook handler.
 *
 * Body: { jobId, employerId, estimatedValue, featuredListing?, urgentBadge? }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { createJobPostingPaymentRecord } from '@/lib/services/escrowService'
import { getJobPostingFee } from '@/lib/services/escrowService'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      jobId?: string
      employerId?: string
      estimatedValue?: number
      featuredListing?: boolean
      urgentBadge?: boolean
    }

    const { jobId, employerId, estimatedValue, featuredListing = false, urgentBadge = false } = body

    if (!jobId || !employerId || estimatedValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields: jobId, employerId, estimatedValue' }, { status: 400 })
    }

    const feeConfig = getJobPostingFee(estimatedValue)
    let totalFee = feeConfig.fee
    if (featuredListing) totalFee += 9.99
    if (urgentBadge) totalFee += 4.99

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Create a pending record first so we have an ID for the session metadata
    const recordId = await createJobPostingPaymentRecord({
      jobId,
      employerId,
      tier: feeConfig.tier,
      amount: totalFee,
      currency: 'nzd',
      status: 'pending',
      featuredListing,
      urgentBadge,
    })

    if (!isStripeConfigured()) {
      // In development/test without Stripe keys, mock a successful payment
      if (adminDb) {
        await adminDb.collection('jobs').doc(jobId).update({
          paymentStatus: 'active',
          postingPaymentId: recordId,
          featuredListing,
          urgentBadge,
          activatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        await adminDb.collection('jobPostingPayments').doc(recordId).update({
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
      return NextResponse.json({
        sessionId: `mock_session_${Date.now()}`,
        url: `${baseUrl}/jobs/${jobId}?payment=success`,
        mockMode: true,
        recordId,
        amount: totalFee,
        tier: feeConfig.tier,
      })
    }

    const stripe = getStripe()

    const lineItems: import('stripe').Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'nzd',
          product_data: {
            name: `QuickTrade Job Posting — ${feeConfig.label}`,
            description: `Post a ${feeConfig.label.toLowerCase()} job (estimated value: NZ$${estimatedValue.toLocaleString()})`,
          },
          unit_amount: Math.round(feeConfig.fee * 100),
        },
        quantity: 1,
      },
    ]

    if (featuredListing) {
      lineItems.push({
        price_data: {
          currency: 'nzd',
          product_data: { name: 'Featured Job Listing', description: 'Your job appears at the top of search results' },
          unit_amount: 999,
        },
        quantity: 1,
      })
    }

    if (urgentBadge) {
      lineItems.push({
        price_data: {
          currency: 'nzd',
          product_data: { name: 'Urgent Job Badge', description: 'Highlights your job as urgent to attract faster responses' },
          unit_amount: 499,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/jobs/${jobId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/jobs/${jobId}?payment=cancelled`,
      metadata: {
        jobId,
        employerId,
        recordId,
        tier: feeConfig.tier,
        featuredListing: String(featuredListing),
        urgentBadge: String(urgentBadge),
      },
      payment_intent_data: {
        metadata: {
          jobId,
          employerId,
          recordId,
          type: 'job_posting',
        },
      },
    })

    // Store the session ID in the record
    if (adminDb) {
      await adminDb.collection('jobPostingPayments').doc(recordId).update({
        stripeCheckoutSessionId: session.id,
        updatedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      recordId,
      amount: totalFee,
      tier: feeConfig.tier,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error creating job posting checkout session:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
