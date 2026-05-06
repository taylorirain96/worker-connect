/**
 * POST /api/notifications/sms
 *
 * Server-side SMS dispatch endpoint.
 * Called by lib/notifications/sms.ts (client helper) and directly from
 * server-only API routes that need to send Twilio SMS messages.
 *
 * Body: { to: string, type: string, message: string, userId: string }
 *
 * Silently skips (returns success) when Twilio env vars are absent so the
 * app works without SMS configured.
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

interface SMSBody {
  to: string
  type: string
  message: string
}

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 },
    )
  }

  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as SMSBody
    const { to, type, message } = body

    if (!to || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type, message' },
        { status: 400 },
      )
    }

    if (message.length > 160) {
      return NextResponse.json(
        { error: 'Message exceeds 160 characters (one SMS segment)' },
        { status: 400 },
      )
    }

    const sent = await sendSMS({ to, body: message })

    return NextResponse.json({ success: true, delivered: sent })
  } catch (err) {
    console.error('[POST /api/notifications/sms] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
