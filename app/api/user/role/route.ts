import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

type ActiveRole = 'worker' | 'employer'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { uid?: string; activeRole?: string }
    const { uid, activeRole } = body

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Missing required field: uid' }, { status: 400 })
    }

    if (activeRole !== 'worker' && activeRole !== 'employer') {
      return NextResponse.json(
        { error: 'Invalid activeRole. Must be "worker" or "employer".' },
        { status: 400 },
      )
    }

    const validRole: ActiveRole = activeRole

    if (adminDb) {
      const userRef = adminDb.collection('users').doc(uid)
      await userRef.set(
        { activeRole: validRole, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      )
    } else {
      return NextResponse.json(
        { error: 'Database unavailable. Configure Firebase Admin environment variables.' },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: true, activeRole: validRole })
  } catch (error) {
    console.error('PATCH /api/user/role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
