/**
 * @deprecated Use /api/payments/create-intent with `estimatedBudget` instead.
 * This route forwards all requests to the canonical payment-intent endpoint.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.warn('[deprecated] /api/stripe/create-payment-intent — use /api/payments/create-intent with estimatedBudget')
  const body = await request.json()
  const url = new URL('/api/payments/create-intent', request.url)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}
