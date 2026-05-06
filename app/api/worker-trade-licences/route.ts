import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import admin, { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { rateLimit } from '@/lib/rateLimit'
import type { TradeLicenceType } from '@/types'

export const dynamic = 'force-dynamic'

const VALID_LICENCE_TYPES: TradeLicenceType[] = [
  'lbp', 'electrical', 'plumbing', 'gasfitting', 'drainlaying',
  'hvac', 'scaffolding', 'site_safe', 'first_aid', 'asbestos', 'forklift', 'other',
]

/**
 * GET /api/worker-trade-licences?uid={uid}
 * Returns all trade licences for a worker.
 * Public — no auth required (read-only, used on public profile page).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid')

  if (!uid) {
    return NextResponse.json({ error: 'uid is required' }, { status: 400 })
  }

  try {
    const snap = await adminDb
      .collection('workerTradeLicences')
      .doc(uid)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .get()

    const licences = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        createdAt:
          data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt as string | undefined) ?? new Date().toISOString(),
        updatedAt:
          data.updatedAt && typeof data.updatedAt.toDate === 'function'
            ? data.updatedAt.toDate().toISOString()
            : (data.updatedAt as string | undefined) ?? new Date().toISOString(),
      }
    })

    return NextResponse.json({ licences })
  } catch (err) {
    console.error('GET /api/worker-trade-licences error:', err)
    return NextResponse.json({ licences: [] })
  }
}

/**
 * POST /api/worker-trade-licences
 * Creates a new trade licence record for the authenticated worker.
 * Header: x-user-id
 * Body: { licenceType, licenceNumber?, issuingBody?, issueDate?, expiryDate?, documentUrl?, notes? }
 */
export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      licenceType?: string
      licenceNumber?: string
      issuingBody?: string
      issueDate?: string
      expiryDate?: string
      documentUrl?: string
      notes?: string
    }

    const { licenceType, licenceNumber, issuingBody, issueDate, expiryDate, documentUrl, notes } = body

    if (!licenceType) {
      return NextResponse.json({ error: 'licenceType is required' }, { status: 400 })
    }

    if (!VALID_LICENCE_TYPES.includes(licenceType as TradeLicenceType)) {
      return NextResponse.json({ error: 'Invalid licenceType' }, { status: 400 })
    }

    // Verify the user exists and is a worker
    const userSnap = await adminDb.collection('users').doc(uid).get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = FieldValue.serverTimestamp()
    const docData: Record<string, unknown> = {
      uid,
      licenceType,
      createdAt: now,
      updatedAt: now,
    }
    if (licenceNumber) docData.licenceNumber = licenceNumber
    if (issuingBody) docData.issuingBody = issuingBody
    if (issueDate) docData.issueDate = issueDate
    if (expiryDate) docData.expiryDate = expiryDate
    if (documentUrl) docData.documentUrl = documentUrl
    if (notes) docData.notes = notes

    const ref = await adminDb
      .collection('workerTradeLicences')
      .doc(uid)
      .collection('items')
      .add(docData)

    return NextResponse.json({ id: ref.id, success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/worker-trade-licences error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/worker-trade-licences?id={licenceId}
 * Deletes a trade licence belonging to the authenticated worker.
 * Header: x-user-id
 */
export async function DELETE(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const licenceId = searchParams.get('id')
  if (!licenceId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const docRef = adminDb
      .collection('workerTradeLicences')
      .doc(uid)
      .collection('items')
      .doc(licenceId)

    const snap = await docRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Licence not found' }, { status: 404 })
    }

    // Ensure the licence belongs to the requesting user
    if ((snap.data()?.uid as string | undefined) !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/worker-trade-licences error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
