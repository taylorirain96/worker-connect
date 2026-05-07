/**
 * Resend client singleton.
 * Initialises lazily so the module can be imported without RESEND_API_KEY
 * being set (e.g. during CI builds where env vars are unavailable).
 */
import { Resend } from 'resend'

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'WorkerConnect <notifications@workerconnect.co.nz>'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://workerconnect.co.nz'

let _resend: Resend | null = null

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set — transactional emails will not be sent')
    return null
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}
