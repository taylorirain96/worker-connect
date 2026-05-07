/**
 * POST /api/jobs/urgent-notify
 *
 * Sends SMS notifications to matching workers when a high or emergency
 * urgency job is posted. Called from the client after a job is created.
 *
 * Body: { jobId, title, location, category, urgency, budget }
 * Header: x-user-id — UID of the employer posting the job (for auth)
 *
 * Queries Firestore for workers whose skills or location match the job,
 * then sends each an SMS via Twilio (lib/sms.ts). Silently skips workers
 * without a phone number or when Twilio env vars are not set.
 *
 * Always returns 200 so client-side job creation is never blocked.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendSMS } from '@/lib/sms'

export const dynamic = 'force-dynamic'

const URGENT_LEVELS = new Set(['high', 'emergency'])
const MAX_WORKERS_TO_NOTIFY = 50

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      jobId?: string
      title?: string
      location?: string
      category?: string
      urgency?: string
      budget?: number
    }

    const { jobId, title, location, category, urgency, budget } = body

    // Only proceed for high/emergency urgency
    if (!urgency || !URGENT_LEVELS.has(urgency)) {
      return NextResponse.json({ skipped: true, reason: 'Not an urgent job' })
    }

    if (!title || !location) {
      return NextResponse.json({ error: 'title and location are required' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ skipped: true, reason: 'Database not configured' })
    }

    // Query workers — match on skills or location
    const workersSnap = await adminDb
      .collection('users')
      .where('role', '==', 'worker')
      .limit(MAX_WORKERS_TO_NOTIFY)
      .get()

    const jobLocationPrefix = location.trim().split(',')[0].trim().toLowerCase()
    const urgencyLabel = urgency === 'emergency' ? '🚨 EMERGENCY' : '⚡ URGENT'
    const budgetStr = budget != null ? ` — NZ$${Number(budget).toFixed(0)}` : ''

    const smsTasks: Promise<boolean>[] = []

    for (const workerDoc of workersSnap.docs) {
      const data = workerDoc.data()
      const phone = data?.phone as string | undefined
      if (!phone) continue

      const skills: string[] = data?.skills ?? []
      const workerLocation: string = data?.location ?? ''

      const categoryMatch =
        category != null &&
        skills.some((s: string) => s.toLowerCase() === category.toLowerCase())
      const locationMatch =
        jobLocationPrefix.length > 0 &&
        workerLocation.toLowerCase().includes(jobLocationPrefix)

      if (categoryMatch || locationMatch) {
        const smsBody =
          `QuickTrade ${urgencyLabel}: New job "${title}" in ${location}${budgetStr}. ` +
          `Apply now: quicktrade-pi.vercel.app/jobs/${jobId ?? ''}`

        smsTasks.push(
          sendSMS({ to: phone, body: smsBody })
        )
      }
    }

    const results = await Promise.allSettled(smsTasks)
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value).length

    return NextResponse.json({ success: true, smsSent: sent })
  } catch (error) {
    // Never let notification errors surface to the client — job was already saved
    console.error('POST /api/jobs/urgent-notify error:', error)
    return NextResponse.json({ success: false, error: 'Notification error — job was saved' })
  }
}
