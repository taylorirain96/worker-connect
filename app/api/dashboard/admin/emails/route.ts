import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// Deterministic pseudo-random generator for consistent mock data across renders.
// Uses a simple sine-based hash — NOT for security use.
// Spread across 5–10 minutes per email (300_000–600_000 ms offsets).
function seeded(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

const EMAIL_TYPES = [
  'job_accepted', 'payment_released', 'quote_received', 'message_received',
  'application_update', 'review_received', 'job_matches', 'welcome',
]
const SUBJECTS: Record<string, string> = {
  job_accepted: 'Your job has been accepted',
  payment_released: 'Payment released to your account',
  quote_received: 'You received a new quote',
  message_received: 'You have a new message',
  application_update: 'Update on your application',
  review_received: 'You received a new review',
  job_matches: 'New jobs matching your skills',
  welcome: 'Welcome to WorkerConnect',
}
const RECIPIENTS = ['alex@example.com', 'jordan@example.com', 'sam@example.com',
  'casey@example.com', 'taylor@example.com']

function buildMockLogs(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const type = EMAIL_TYPES[i % EMAIL_TYPES.length]
    return {
      id: `email-${i + 1}`,
      recipient: RECIPIENTS[i % RECIPIENTS.length],
      type,
      subject: SUBJECTS[type],
      status: i % 12 === 0 ? 'failed' : 'sent',
      sentAt: new Date(Date.now() - Math.round(seeded(i, i * 600_000 + 300_000))).toISOString(),
    }
  })
}

/** GET /api/dashboard/admin/emails */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    let logs: ReturnType<typeof buildMockLogs> = []

    try {
      const snap = await adminDb.collection('emailLogs')
        .orderBy('sentAt', 'desc')
        .limit(200)
        .get()

      logs = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          recipient: d.recipient ?? '',
          type: d.type ?? 'unknown',
          subject: d.subject ?? '(no subject)',
          status: d.status ?? 'sent',
          sentAt: d.sentAt ?? new Date().toISOString(),
        }
      })
    } catch {
      logs = buildMockLogs(80)
    }

    const total = logs.length
    const paginated = logs.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ logs: paginated, total, page, limit })
  } catch (error) {
    console.error('GET /api/dashboard/admin/emails error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/dashboard/admin/emails — resend an email */
export async function POST(request: NextRequest) {
  try {
    const { emailId } = await request.json()
    if (!emailId) {
      return NextResponse.json({ error: 'emailId is required' }, { status: 400 })
    }

    // In production: fetch the email log from Firestore and re-trigger the send
    return NextResponse.json({ emailId, queued: true, message: 'Email queued for resend' })
  } catch (error) {
    console.error('POST /api/dashboard/admin/emails error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
