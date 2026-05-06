/**
 * SMS notification helper using Twilio.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID   — Twilio Account SID
 *   TWILIO_AUTH_TOKEN    — Twilio Auth Token
 *   TWILIO_FROM_NUMBER   — E.164 sender number (e.g. +6421000000)
 *
 * Falls back silently when env vars are absent — the app continues to work
 * without SMS.
 */

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER

export interface SMSOptions {
  /** Recipient phone number in E.164 format (e.g. +6421000000) */
  to: string
  /** SMS body text (≤ 160 chars recommended to stay in one segment) */
  body: string
}

/**
 * Send an SMS via Twilio.
 * Returns true if the message was dispatched, false if skipped or failed.
 * Never throws — all errors are logged and swallowed.
 */
export async function sendSMS({ to, body }: SMSOptions): Promise<boolean> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
    console.warn('[SMS] Twilio env vars not set — SMS skipped')
    return false
  }
  if (!to || !/^\+[1-9]\d{1,14}$/.test(to)) {
    console.warn('[SMS] Invalid phone number — must be E.164 format (e.g. +6421000000)')
    return false
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`
  const params = new URLSearchParams({ To: to, From: FROM_NUMBER, Body: body })

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
      },
      body: params.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[SMS] Twilio error:', res.status, text)
      return false
    }

    return true
  } catch (err) {
    console.error('[SMS] sendSMS fetch error:', err)
    return false
  }
}
