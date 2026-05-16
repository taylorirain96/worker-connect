/**
 * GET  /api/business/profile — load the authenticated employer's business profile
 * POST /api/business/profile — save the authenticated employer's business profile
 * Headers: x-user-id
 * Firestore collection: businesses/{uid}
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('businesses').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ profile: null })
    }
    return NextResponse.json({ profile: snap.data() })
  } catch (error) {
    console.error('GET /api/business/profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    await adminDb.collection('businesses').doc(uid).set(
      { ...body, uid, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/business/profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
