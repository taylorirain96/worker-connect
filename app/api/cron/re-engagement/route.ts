import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendEmail } from '@/lib/email/sendEmail'
import { createUnsubscribeToken } from '@/lib/email/unsubscribeToken'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

const INACTIVE_DAYS = 14
// Keep a separate cooldown constant for clarity in case policy diverges later.
const EMAIL_COOLDOWN_DAYS = 14
const USER_PAGE_SIZE = 250

async function fetchUsersByRole(role: 'worker' | 'employer') {
  const docs: QueryDocumentSnapshot[] = []
  let lastDoc: QueryDocumentSnapshot | null = null

  while (true) {
    let query = adminDb
      .collection('users')
      .where('role', '==', role)
      .orderBy('__name__')
      .limit(USER_PAGE_SIZE)

    if (lastDoc) {
      query = query.startAfter(lastDoc)
    }

    const snap = await query.get()
    if (snap.empty) break

    docs.push(...snap.docs)
    lastDoc = snap.docs[snap.docs.length - 1] ?? null
    if (snap.docs.length < USER_PAGE_SIZE) break
  }

  return docs
}

function parseTimestampMs(value: unknown): number {
  if (!value) return 0
  if (typeof value === 'object' && value !== null && typeof (value as { toMillis?: unknown }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis()
  }
  if (typeof value === 'string') return Date.parse(value) || 0
  if (typeof value === 'number') return value
  return 0
}

function buildReengagementHtml(opts: {
  displayName: string
  role: 'worker' | 'employer'
  appUrl: string
  unsubscribeUrl: string
}): string {
  const { displayName, role, appUrl, unsubscribeUrl } = opts
  const headline = role === 'worker'
    ? 'New jobs are waiting for you 🔧'
    : 'Need help on your next project? 🏠'
  const body = role === 'worker'
    ? 'Fresh jobs are being posted across New Zealand. Jump back in and apply early to win more work.'
    : 'Great workers are active on QuickTrade right now. Post your next job and get quotes fast.'
  const ctaLabel = role === 'worker' ? 'Browse Jobs →' : 'Post a Job →'
  const ctaHref = role === 'worker' ? `${appUrl}/jobs` : `${appUrl}/jobs/create`

  return `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:20px;">
        <p style="font-size:26px;font-weight:700;color:#fff;margin:0;">⚡ QuickTrade</p>
      </div>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 10px;">${headline}</h1>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 22px;">Kia ora ${displayName}, ${body}</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${ctaHref}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">${ctaLabel}</a>
      </div>
      <p style="color:#64748b;font-size:12px;text-align:center;margin:22px 0 0;">
        Prefer fewer emails? <a href="${unsubscribeUrl}" style="color:#6366f1;">Unsubscribe from re-engagement emails</a>
      </p>
    </div>
  `
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'
    const nowMs = Date.now()
    const inactiveCutoffMs = nowMs - INACTIVE_DAYS * 24 * 60 * 60 * 1000
    const cooldownCutoffMs = nowMs - EMAIL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

    const [workerDocs, employerDocs] = await Promise.all([
      fetchUsersByRole('worker'),
      fetchUsersByRole('employer'),
    ])

    let sent = 0
    let skipped = 0
    let failed = 0

    const candidates = [
      ...workerDocs.map((doc) => ({ doc, role: 'worker' as const })),
      ...employerDocs.map((doc) => ({ doc, role: 'employer' as const })),
    ]

    for (const candidate of candidates) {
      const uid = candidate.doc.id
      const data = candidate.doc.data() as {
        email?: string
        displayName?: string
        name?: string
        lastActive?: unknown
        lastLogin?: unknown
        emailNotifications?: Record<string, boolean>
      }

      const email = data.email
      if (!email) {
        skipped++
        continue
      }

      const optedOut = data.emailNotifications?.reengagement === false || data.emailNotifications?.all === false
      if (optedOut) {
        skipped++
        continue
      }

      const lastActiveMs = Math.max(parseTimestampMs(data.lastActive), parseTimestampMs(data.lastLogin))
      if (lastActiveMs > inactiveCutoffMs) {
        skipped++
        continue
      }

      const cooldownRef = adminDb.collection('emailCooldowns').doc(`reengagement_${uid}`)
      const cooldownSnap = await cooldownRef.get()
      const lastSentMs = parseTimestampMs(cooldownSnap.data()?.lastEmailSentAt)
      if (lastSentMs > cooldownCutoffMs) {
        skipped++
        continue
      }

      const displayName = (data.displayName ?? data.name ?? 'there').toString()
      const unsubscribeUrl = `${appUrl}/api/email/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(uid, 'reengagement'))}`
      const html = buildReengagementHtml({
        displayName,
        role: candidate.role,
        appUrl,
        unsubscribeUrl,
      })

      try {
        await sendEmail({
          to: email,
          subject: candidate.role === 'worker'
            ? 'New QuickTrade jobs are waiting for you'
            : 'Need trusted tradies? QuickTrade can help',
          html,
          type: 'reengagement',
        })

        await cooldownRef.set(
          {
            lastEmailSentAt: new Date().toISOString(),
            type: 'reengagement',
          },
          { merge: true },
        )
        sent++
      } catch (error) {
        console.error('Re-engagement email failed for user', uid, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      failed,
      evaluated: candidates.length,
    })
  } catch (error) {
    console.error('Re-engagement cron failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
