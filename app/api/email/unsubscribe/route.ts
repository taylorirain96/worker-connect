/**
 * GET /api/email/unsubscribe?token=<signed-token>
 *
 * Verifies the HMAC-signed token, sets
 *   users/{uid}.emailNotifications.{type}: false
 * in Firestore, and returns a simple "You've been unsubscribed" HTML page.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribeToken'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function unsubscribedPage(message: string, isError = false): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Unsubscribe · WorkerConnect</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 48px 40px; max-width: 440px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 12px; }
    p { color: #475569; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? '⚠️' : '✅'}</div>
    <h1>${isError ? 'Something went wrong' : "You've been unsubscribed"}</h1>
    <p>${message}</p>
    <a href="/">Back to WorkerConnect</a>
  </div>
</body>
</html>`
  return new NextResponse(html, {
    status: isError ? 400 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return unsubscribedPage('Missing unsubscribe token. Please use the link from your email.', true)
  }

  const payload = verifyUnsubscribeToken(token)
  if (!payload) {
    return unsubscribedPage('This unsubscribe link is invalid or has been tampered with. Please contact us at hello@workerconnect.co.nz.', true)
  }

  const { uid, type } = payload

  try {
    if (adminDb) {
      await adminDb.collection('users').doc(uid).set(
        { emailNotifications: type === 'all' ? { all: false } : { [type]: false } },
        { merge: true }
      )
    }

    const typeLabel = type === 'all'
      ? 'all WorkerConnect emails'
      : `"${type.replace(/([A-Z])/g, ' $1').toLowerCase()}" emails`

    return unsubscribedPage(`You will no longer receive ${typeLabel}. You can re-enable notifications any time from your account settings.`)
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return unsubscribedPage('We could not process your unsubscribe request. Please try again or contact hello@workerconnect.co.nz.', true)
  }
}
