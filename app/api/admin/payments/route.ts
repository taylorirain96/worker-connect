import { NextRequest, NextResponse } from 'next/server'
import { isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payments
 * Query params: limit (max 100), status, startingAfter (cursor), startDate, endDate
 * Returns Stripe charges list for the admin payments dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
    const status = searchParams.get('status')
    const startingAfter = searchParams.get('startingAfter') ?? undefined
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!isStripeConfigured()) {
      return NextResponse.json({ items: [], total: 0, hasMore: false, message: 'Stripe not configured' })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

    const params: Stripe.ChargeListParams = { limit }
    if (startingAfter) params.starting_after = startingAfter
    if (startDate) params.created = { ...((params.created as object) ?? {}), gte: Math.floor(new Date(startDate).getTime() / 1000) }
    if (endDate) params.created = { ...((params.created as object) ?? {}), lte: Math.floor(new Date(endDate).getTime() / 1000) }

    const charges = await stripe.charges.list(params)

    type PaymentRow = {
      id: string
      userId: string
      userName: string
      amount: number
      status: string
      type: string
      method: string
      date: string
      jobId: string | null
      jobTitle: string | null
    }
    let items: PaymentRow[] = charges.data.map((charge) => ({
      id: charge.id,
      userId: (charge.metadata?.employerId ?? charge.customer ?? '') as string,
      userName: charge.billing_details?.name ?? '',
      amount: charge.amount / 100,
      status: charge.status,
      type: charge.refunded ? 'refund' : 'payment',
      method: charge.payment_method_details?.type ?? 'card',
      date: new Date(charge.created * 1000).toISOString(),
      jobId: charge.metadata?.jobId ?? null,
      jobTitle: charge.metadata?.jobTitle ?? null,
    }))

    if (status && status !== 'all') {
      items = items.filter((p) => p.status === status)
    }

    return NextResponse.json({ items, total: items.length, hasMore: charges.has_more })
  } catch (error) {
    console.error('GET /api/admin/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
