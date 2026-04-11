/**
 * POST /api/payments/escrow/create
 *
 * Creates a Stripe PaymentIntent to hold the quoted job amount in escrow.
 * Called after an employer accepts a worker's quote.
 *
 * Body: { jobId, quoteId, employerId, workerId, amount, completedJobs }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isStripeConfigured, toCents } from '@/lib/stripe'
import { createEscrowRecord, calculateCommission } from '@/lib/services/escrowService'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      jobId?: string
      quoteId?: string
      employerId?: string
      workerId?: string
      amount?: number
      completedJobs?: number
    }

    const { jobId, quoteId, employerId, workerId, amount, completedJobs = 0 } = body

    if (!jobId || !quoteId || !employerId || !workerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, quoteId, employerId, workerId, amount' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
    }

    const { commissionRate, commissionAmount, workerAmount } = calculateCommission(amount, completedJobs)

    if (!isStripeConfigured()) {
      // Mock mode — create record directly as 'held'
      const escrowId = await createEscrowRecord({
        jobId,
        quoteId,
        employerId,
        workerId,
        amount,
        currency: 'nzd',
        status: 'held',
        stripePaymentIntentId: `pi_mock_${Date.now()}`,
        commissionRate,
        commissionAmount,
        workerAmount,
      })

      if (adminDb) {
        await adminDb.collection('jobs').doc(jobId).update({
          escrowId,
          escrowStatus: 'held',
          updatedAt: new Date().toISOString(),
        })
        await adminDb.collection('quotes').doc(quoteId).update({
          escrowId,
          escrowStatus: 'held',
          updatedAt: new Date().toISOString(),
        })
      }

      return NextResponse.json({
        escrowId,
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount,
        commissionRate,
        commissionAmount,
        workerAmount,
        currency: 'nzd',
        mockMode: true,
      })
    }

    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(amount),
      currency: 'nzd',
      capture_method: 'manual',   // hold funds without capturing until release
      description: `QuickTrade Escrow — Job ${jobId}`,
      metadata: {
        type: 'escrow',
        jobId,
        quoteId,
        employerId,
        workerId,
        commissionRate: String(commissionRate),
        commissionAmount: String(commissionAmount),
        workerAmount: String(workerAmount),
      },
    })

    const escrowId = await createEscrowRecord({
      jobId,
      quoteId,
      employerId,
      workerId,
      amount,
      currency: 'nzd',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      commissionRate,
      commissionAmount,
      workerAmount,
    })

    // Link escrow to the job and quote
    if (adminDb) {
      await adminDb.collection('jobs').doc(jobId).update({
        escrowId,
        escrowStatus: 'pending',
        updatedAt: new Date().toISOString(),
      })
      await adminDb.collection('quotes').doc(quoteId).update({
        escrowId,
        escrowStatus: 'pending',
        updatedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      escrowId,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      commissionRate,
      commissionAmount,
      workerAmount,
      currency: 'nzd',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error creating escrow payment intent:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
