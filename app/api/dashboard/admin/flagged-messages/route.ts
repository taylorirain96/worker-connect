import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/admin/flagged-messages
 * Returns flagged messages logged by the contact-info detector.
 * Admin-only — caller must have admin role (enforced at the layout level).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50'), 100)

    const snap = await adminDb
      .collection('flaggedMessages')
      .orderBy('flaggedAt', 'desc')
      .limit(pageSize)
      .get()

    const messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ messages, count: messages.length })
  } catch (error) {
    console.error('GET /api/dashboard/admin/flagged-messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
