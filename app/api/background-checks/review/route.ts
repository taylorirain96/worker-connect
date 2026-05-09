import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

/** Admin-only: approve or reject a background check. */
export async function POST(request: NextRequest) {
  const adminUid = request.headers.get('x-user-id')
  if (!adminUid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    // Verify caller is admin
    const adminSnap = await adminDb.collection('users').doc(adminUid).get()
    if (adminSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { targetUid, decision, notes } = body as {
      targetUid?: string
      decision?: 'approved' | 'rejected'
      notes?: string
    }

    if (!targetUid || !decision) {
      return NextResponse.json({ error: 'targetUid and decision are required' }, { status: 400 })
    }
    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'decision must be approved or rejected' }, { status: 400 })
    }

    const now = new Date().toISOString()
    await adminDb.collection('backgroundChecks').doc(targetUid).update({
      status: decision,
      reviewedAt: now,
      reviewedBy: adminUid,
      notes: notes ?? null,
    })

    await adminDb.collection('users').doc(targetUid).update({
      backgroundCheckStatus: decision,
      ...(decision === 'approved'
        ? { backgroundCheckApprovedAt: now }
        : { backgroundCheckApprovedAt: null }),
    })

    return NextResponse.json({ success: true, decision })
  } catch (err) {
    console.error('[background-checks/review] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
