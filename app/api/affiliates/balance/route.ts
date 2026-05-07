import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/affiliates/balance
 * Returns the affiliate balance for the authenticated user.
 * Header: x-user-id
 */
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('users').doc(userId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const data = snap.data() ?? {}
    return NextResponse.json({
      affiliateBalance: (data.affiliateBalance as number | undefined) ?? 0,
      affiliatePaidOut: (data.affiliatePaidOut as number | undefined) ?? 0,
      referralCode: (data.referralCode as string | undefined) ?? null,
    })
  } catch (err) {
    console.error('[affiliates/balance] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
