import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { provider } = body

  // TODO: integrate with Checkr or another background check provider
  const result = {
    status: 'pending',
    provider: provider ?? 'Checkr',
    initiatedAt: new Date().toISOString(),
    message:
      'Background check initiated. You will be notified by email when the check is complete (typically 1–3 business days).',
  }

  return NextResponse.json(result, { status: 202 })
}
