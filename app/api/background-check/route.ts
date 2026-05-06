import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Admin-only: validate caller is admin
  try {
    const callerSnap = await adminDb.collection('users').doc(uid).get()
    if (!callerSnap.exists || callerSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUid, status, expiry } = await req.json()
    if (!targetUid || !status) {
      return NextResponse.json({ error: 'targetUid and status are required' }, { status: 400 })
    }

    const validStatuses = ['notStarted', 'pending', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const update: Record<string, unknown> = {
      backgroundCheckStatus: status,
      updatedAt: new Date().toISOString(),
    }
    if (expiry) update.backgroundCheckExpiry = expiry

    await adminDb.collection('users').doc(targetUid).update(update)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('background-check POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const data = snap.data()
    return NextResponse.json({
      backgroundCheckStatus: data?.backgroundCheckStatus ?? 'notStarted',
      backgroundCheckExpiry: data?.backgroundCheckExpiry ?? null,
    })
  } catch (err) {
    console.error('background-check GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
