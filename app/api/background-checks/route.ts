import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const scope = request.nextUrl.searchParams.get('scope')

    if (scope === 'all') {
      const userSnap = await adminDb.collection('users').doc(uid).get()
      if (userSnap.data()?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const snap = await adminDb
        .collection('backgroundChecks')
        .orderBy('submittedAt', 'desc')
        .limit(200)
        .get()

      return NextResponse.json({
        checks: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      })
    }

    const docSnap = await adminDb.collection('backgroundChecks').doc(uid).get()
    if (!docSnap.exists) {
      return NextResponse.json({ check: null })
    }
    return NextResponse.json({ check: { id: docSnap.id, ...docSnap.data() } })
  } catch (err) {
    console.error('[background-checks] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const body = await request.json()
    const { fullName, dateOfBirth, consent } = body as {
      fullName?: string
      dateOfBirth?: string
      consent?: boolean
    }

    if (!fullName || !dateOfBirth || !consent) {
      return NextResponse.json(
        { error: 'fullName, dateOfBirth and consent are required' },
        { status: 400 },
      )
    }

    const existing = await adminDb.collection('backgroundChecks').doc(uid).get()
    if (existing.exists) {
      const data = existing.data()
      if (data?.status === 'pending' || data?.status === 'approved') {
        return NextResponse.json(
          { error: 'A background check request already exists for this account' },
          { status: 409 },
        )
      }
    }

    const now = new Date().toISOString()
    const checkData = {
      uid,
      fullName,
      dateOfBirth,
      consent: true,
      status: 'pending',
      submittedAt: now,
      reviewedAt: null,
      reviewedBy: null,
      notes: null,
    }

    await adminDb.collection('backgroundChecks').doc(uid).set(checkData)

    return NextResponse.json({ check: { id: uid, ...checkData } }, { status: 201 })
  } catch (err) {
    console.error('[background-checks] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
