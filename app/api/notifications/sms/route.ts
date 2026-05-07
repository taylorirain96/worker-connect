/**
 * POST /api/notifications/sms
 *
 * Server-side SMS dispatch endpoint.
 * Supports callers that provide a direct `to` number or only a `userId`
 * (the user's phone number is resolved from Firestore).
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'
import { rateLimit } from '@/lib/rateLimit'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

interface SMSBody {
  to?: string
  type?: string
  message: string
  userId?: string
}

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 },
    )
  }

  try {
    const body = (await request.json()) as SMSBody
    const { to, message } = body
    const userId = request.headers.get('x-user-id') ?? body.userId

    if (!message || (!to && !userId)) {
      return NextResponse.json(
        { error: 'Missing required fields: message and either to or userId' },
        { status: 400 },
      )
    }

    if (message.length > 160) {
      return NextResponse.json(
        { error: 'Message exceeds 160 characters (one SMS segment)' },
        { status: 400 },
      )
    }

    let recipient = to

    if (!recipient && userId) {
      const userSnap = await adminDb.collection('users').doc(userId).get()
      recipient = (userSnap.data()?.phone as string | undefined) ?? undefined
    }

    if (!recipient) {
      return NextResponse.json({ success: true, delivered: false, skipped: true }, { status: 200 })
    }

    if (!/^\+[1-9]\d{1,14}$/.test(recipient)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 (e.g. +6421234567)' },
        { status: 400 },
      )
    }

    const sent = await sendSMS({ to: recipient, body: message })
    return NextResponse.json({ success: true, delivered: sent })
  } catch (err) {
    console.error('[POST /api/notifications/sms] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
