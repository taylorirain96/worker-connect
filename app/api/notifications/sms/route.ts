import { NextRequest, NextResponse } from 'next/server'
import type { SMSNotification } from '@/lib/notifications/sms'

/**
 * POST /api/notifications/sms
 * Sends an SMS via Twilio. Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
 * and TWILIO_PHONE_NUMBER environment variables.
 */
export async function POST(req: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error('SMS not configured: missing Twilio environment variables')
    return NextResponse.json({ error: 'SMS not configured' }, { status: 503 })
  }

  let body: SMSNotification
  try {
    body = await req.json() as SMSNotification
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { to, message } = body

  if (!to || !message) {
    return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 })
  }

  // E.164 validation
  if (!/^\+[1-9]\d{6,14}$/.test(to)) {
    return NextResponse.json({ error: 'Invalid phone number format. Use E.164 (e.g. +6421234567)' }, { status: 400 })
  }

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: message }).toString(),
      }
    )

    if (!res.ok) {
      const errorData = await res.text()
      console.error('Twilio SMS error:', errorData)
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 502 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('SMS route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
