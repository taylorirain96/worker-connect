import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createPaymentIntent } from '@/lib/stripe'
import { BUNDLE_PRICING } from '@/types/payment'
import { getPostingFee } from '@/types'
import type { BundleType } from '@/types/payment'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rateLimit'
import { getCurrencyForJobCountry, getJobCountryById } from '@/lib/services/jobCountryService'
import { adminDb } from '@/lib/firebase-admin'
import {
  calculateQuoteFeeCommission,
  createQuoteFeePaymentRecord,
} from '@/lib/services/quoteFeeService'
import { normalizeCurrencyAmount } from '@/lib/utils/money'

/**
 * POST /api/payments/create-intent
 *
 * Canonical payment-intent creation endpoint.
 * Handles job payments (with optional bundle pricing), posting fees, and
 * Stripe Connect transfers (when workerStripeAccountId is supplied).
 *
 * Deprecated aliases:
 *  - /api/payments/create-payment-intent → forwards here
 *  - /api/stripe/create-payment-intent   → forwards here
 */

/** Platform fee charged on every Connect payment (5 %). */
const PLATFORM_FEE_RATE = 0.05

export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const requesterId = req.headers.get('x-user-id')?.trim()
    const body = await req.json() as {
      amount?: number
      currency?: string
      jobId?: string
      employerId?: string
      workerId?: string
      description?: string
      paymentMethod?: string
      bundleType?: BundleType
      workerStripeAccountId?: string
      estimatedBudget?: number
      paymentType?: 'job' | 'quote_fee'
      requestDescription?: string
      requestedDate?: string
      address?: string
    }

    const {
      currency,
      jobId,
      employerId,
      workerId,
      description,
      paymentMethod,
      bundleType,
      workerStripeAccountId,
      estimatedBudget,
      paymentType,
      requestDescription,
      requestedDate,
      address,
    } = body

    const normalizeCurrency = (value?: string): string | undefined => value?.trim().toLowerCase()
    const jobCountry = jobId ? await getJobCountryById(jobId) : null
    const fallbackCurrency = getCurrencyForJobCountry(jobCountry)

    void paymentMethod

    if (paymentType === 'quote_fee') {
      if (!employerId || !workerId) {
        return NextResponse.json(
          { error: 'Missing required fields: employerId, workerId' },
          { status: 400 }
        )
      }

      if (!requesterId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (requesterId !== employerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const [workerSnap, employerSnap] = await Promise.all([
        adminDb.collection('users').doc(workerId).get(),
        adminDb.collection('users').doc(employerId).get(),
      ])

      if (!workerSnap.exists) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
      }
      if (!employerSnap.exists) {
        return NextResponse.json({ error: 'Employer not found' }, { status: 404 })
      }

      const employerData = employerSnap.data() as { role?: string }
      if (employerData.role !== 'homeowner') {
        return NextResponse.json(
          { error: 'Only homeowners can pay a worker quote fee.' },
          { status: 403 }
        )
      }

      const workerData = workerSnap.data() as {
        chargesQuoteFee?: boolean
        quoteFeeAmount?: number
        stripeAccountId?: string
        displayName?: string
        country?: 'NZ' | 'AU'
      }

      const quoteFeeAmount = normalizeCurrencyAmount(Number(workerData.quoteFeeAmount ?? 0))
      if (!workerData.chargesQuoteFee || quoteFeeAmount <= 0) {
        return NextResponse.json(
          { error: 'This worker does not currently charge a quote fee.' },
          { status: 400 }
        )
      }

      const resolvedCurrency = normalizeCurrency(currency)
        ?? (workerData.country === 'AU' ? 'aud' : 'nzd')
      const { commissionRate, commissionAmount, workerAmount } =
        calculateQuoteFeeCommission(quoteFeeAmount)

      if (!process.env.STRIPE_SECRET_KEY) {
        const mockPaymentIntentId = `pi_mock_${Date.now()}`
        await createQuoteFeePaymentRecord({
          employerId,
          workerId,
          workerName: workerData.displayName ?? 'Worker',
          amount: quoteFeeAmount,
          currency: resolvedCurrency === 'aud' ? 'aud' : 'nzd',
          status: 'pending',
          stripePaymentIntentId: mockPaymentIntentId,
          commissionRate,
          commissionAmount,
          workerAmount,
          requestDescription,
          requestedDate,
          address,
          paymentType: 'quote_fee',
        })

        return NextResponse.json({
          clientSecret: `${mockPaymentIntentId}_secret_mock`,
          paymentIntentId: mockPaymentIntentId,
          amount: Math.round(quoteFeeAmount * 100),
          currency: resolvedCurrency,
          quoteFeeAmount,
          commissionRate,
          commissionAmount,
          workerAmount,
        })
      }

      if (!workerData.stripeAccountId) {
        return NextResponse.json(
          { error: 'This worker is not ready to accept quote-fee payments yet.' },
          { status: 400 }
        )
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      const amountCents = Math.round(quoteFeeAmount * 100)
      const applicationFeeCents = Math.round(commissionAmount * 100)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: resolvedCurrency,
        automatic_payment_methods: { enabled: true },
        description:
          description
          ?? `QuickTrade quote/site visit fee — ${workerData.displayName ?? 'Worker'}`,
        metadata: {
          type: 'quote_fee',
          employerId,
          workerId,
          workerName: workerData.displayName ?? 'Worker',
          quoteFeeAmount: quoteFeeAmount.toFixed(2),
          commissionRate: String(commissionRate),
          commissionAmount: commissionAmount.toFixed(2),
          workerAmount: workerAmount.toFixed(2),
          requestDescription: (requestDescription ?? '').slice(0, 500),
          requestedDate: requestedDate ?? '',
          address: (address ?? '').slice(0, 500),
        },
        transfer_data: { destination: workerData.stripeAccountId },
        application_fee_amount: applicationFeeCents,
      })

      await createQuoteFeePaymentRecord({
        employerId,
        workerId,
        workerName: workerData.displayName ?? 'Worker',
        amount: quoteFeeAmount,
        currency: resolvedCurrency === 'aud' ? 'aud' : 'nzd',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        commissionRate,
        commissionAmount,
        workerAmount,
        requestDescription,
        requestedDate,
        address,
        paymentType: 'quote_fee',
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        quoteFeeAmount,
        commissionRate,
        commissionAmount,
        workerAmount,
      })
    }

    if (estimatedBudget !== undefined) {
      if (!jobId || !employerId) {
        return NextResponse.json({ error: 'Missing required fields: jobId, employerId, estimatedBudget' }, { status: 400 })
      }
      const feeInfo = getPostingFee(estimatedBudget)
      const postingCurrency = fallbackCurrency
      const result = await createPaymentIntent({
        amount: feeInfo.fee,
        currency: postingCurrency,
        description: `QuickTrade job posting fee — ${feeInfo.label}`,
        metadata: {
          type: 'posting_fee',
          jobId,
          employerId,
          feeSize: feeInfo.size,
          estimatedBudget: String(estimatedBudget),
          country: jobCountry ?? 'NZ',
        },
      })
      return NextResponse.json({ ...result, feeInfo, currency: postingCurrency })
    }

    if (!jobId || !employerId || !workerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let amount: number
    let bundleJobCount = 1
    let savingsPercent = 0

    if (bundleType) {
      const bundle = BUNDLE_PRICING.find((b) => b.type === bundleType)
      if (!bundle) {
        return NextResponse.json({ error: 'Invalid bundleType' }, { status: 400 })
      }
      amount = bundle.totalPrice
      bundleJobCount = bundle.jobCount
      savingsPercent = bundle.savingsPercent
    } else {
      if (!body.amount) {
        return NextResponse.json(
          { error: "Missing required fields: provide 'bundleType', 'amount', or 'estimatedBudget'" },
          { status: 400 }
        )
      }
      amount = body.amount
    }

    if (workerStripeAccountId) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY
      if (!stripeSecretKey) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
      }
      const stripe = new Stripe(stripeSecretKey)
      const resolvedCurrency = normalizeCurrency(currency) ?? fallbackCurrency
      const amountCents = Math.round(amount * 100)
      const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_RATE)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: resolvedCurrency,
        automatic_payment_methods: { enabled: true },
        metadata: { jobId, employerId, workerId, bundleType: bundleType ?? 'single' },
        transfer_data: { destination: workerStripeAccountId },
        application_fee_amount: platformFeeCents,
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        bundleType: bundleType ?? 'single',
        bundleJobCount,
        savingsPercent,
      })
    }

    const result = await createPaymentIntent({
      amount,
      currency: normalizeCurrency(currency) ?? fallbackCurrency,
      description,
      metadata: {
        jobId,
        employerId,
        workerId,
        country: jobCountry ?? 'NZ',
        bundleType: bundleType ?? 'single',
        bundleJobCount: String(bundleJobCount),
        savingsPercent: String(savingsPercent),
      },
    })

    return NextResponse.json({
      ...result,
      bundleType: bundleType ?? 'single',
      bundleJobCount,
      savingsPercent,
    })
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setContext('payments_create_intent', {
        route: '/api/payments/create-intent',
      })
      Sentry.captureException(error)
    })
    console.error('POST /api/payments/create-intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
