/**
 * Signed unsubscribe token utilities.
 *
 * Tokens are of the form:  <base64url-payload>.<base64url-hmac>
 * Payload JSON: { uid, type, ts }
 *
 * The signing secret is process.env.UNSUBSCRIBE_SECRET (falls back to
 * RESEND_API_KEY so you don't need an extra env var in development).
 */
import { createHmac } from 'crypto'

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? process.env.RESEND_API_KEY
  if (!secret) {
    console.error(
      'Neither UNSUBSCRIBE_SECRET nor RESEND_API_KEY is set. ' +
      'Unsubscribe tokens will use an insecure fallback — set UNSUBSCRIBE_SECRET in production.'
    )
    return 'dev-unsubscribe-secret'
  }
  return secret
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString('base64url')
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export type EmailNotificationType =
  | 'quoteReceived'
  | 'quoteAccepted'
  | 'jobPosted'
  | 'paymentReleased'
  | 'newMessage'
  | 'applicationReceived'
  | 'welcomeHomeowner'
  | 'welcomeWorker'
  | 'all'

export interface UnsubscribePayload {
  uid: string
  type: EmailNotificationType
  /** Unix timestamp (ms) when token was created — for optional expiry checks. */
  ts: number
}

export function createUnsubscribeToken(uid: string, type: EmailNotificationType): string {
  const payload = toBase64Url(JSON.stringify({ uid, type, ts: Date.now() }))
  const mac = sign(payload)
  return `${payload}.${mac}`
}

export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, mac] = parts
  const expected = sign(payload)
  if (mac !== expected) return null
  try {
    return JSON.parse(fromBase64Url(payload)) as UnsubscribePayload
  } catch {
    return null
  }
}
