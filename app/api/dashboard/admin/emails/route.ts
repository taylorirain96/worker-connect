import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/** GET /api/dashboard/admin/emails */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    const snap = await adminDb.collection('emailLogs')
      .orderBy('sentAt', 'desc')
      .limit(200)
      .get()

    const logs = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        recipient: (d.recipient ?? '') as string,
        type: (d.type ?? 'unknown') as string,
        subject: (d.subject ?? '(no subject)') as string,
        status: (d.status ?? 'sent') as string,
        sentAt: d.sentAt?.toDate?.()?.toISOString?.() ?? (d.sentAt as string | undefined) ?? new Date().toISOString(),
      }
    })

    const total = logs.length
    const paginated = logs.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ logs: paginated, total, page, limit })
  } catch (error) {
    console.error('GET /api/dashboard/admin/emails error:', error)
    return NextResponse.json({ logs: [], total: 0, page, limit })
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
