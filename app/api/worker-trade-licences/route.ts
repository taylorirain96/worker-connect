/**
 * GET  /api/worker-trade-licences?uid=<workerId>
 *   Returns all trade licences for the given worker UID.
 *
 * POST /api/worker-trade-licences
 *   Header: x-user-id: <uid>
 *   Body: { licenceType, licenceNumber?, issuer?, expiryDate?, documentUrl? }
 *   Creates a new trade licence record. Maximum 20 licences per worker.
 *
 * DELETE /api/worker-trade-licences?licenceId=<id>
 *   Header: x-user-id: <uid>
 *   Deletes the specified licence (must belong to the authenticated worker).
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { TRADE_LICENCE_LABELS, type TradeLicenceType, type WorkerTradeLicence } from '@/types'

export const dynamic = 'force-dynamic'

const MAX_LICENCES = 20
const VALID_TYPES = Object.keys(TRADE_LICENCE_LABELS) as TradeLicenceType[]

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid')
  if (!uid) {
    return NextResponse.json({ error: 'uid query parameter is required' }, { status: 400 })
  }
  if (!adminDb) {
    return NextResponse.json({ licences: [] })
  }

  try {
    const snap = await adminDb
      .collection('workerTradeLicences')
      .doc(uid)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .get()

    const licences: WorkerTradeLicence[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<WorkerTradeLicence, 'id'>),
    }))

    return NextResponse.json({ licences })
  } catch (error) {
    console.error('GET /api/worker-trade-licences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 })
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
  }

  try {
    const body = await request.json() as {
      licenceType?: string
      licenceNumber?: string
      issuer?: string
      expiryDate?: string
      documentUrl?: string
    }

    const { licenceType, licenceNumber, issuer, expiryDate, documentUrl } = body

    if (!licenceType || !VALID_TYPES.includes(licenceType as TradeLicenceType)) {
      return NextResponse.json(
        { error: `licenceType must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Enforce max licences
    const itemsRef = adminDb
      .collection('workerTradeLicences')
      .doc(uid)
      .collection('items')

    const existingSnap = await itemsRef.count().get()
    if (existingSnap.data().count >= MAX_LICENCES) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_LICENCES} trade licences allowed` },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const data: Omit<WorkerTradeLicence, 'id'> = {
      uid,
      licenceType: licenceType as TradeLicenceType,
      createdAt: now,
      updatedAt: now,
      ...(licenceNumber ? { licenceNumber } : {}),
      ...(issuer ? { issuer } : {}),
      ...(expiryDate ? { expiryDate } : {}),
      ...(documentUrl ? { documentUrl } : {}),
    }

    const docRef = await itemsRef.add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true, licenceId: docRef.id, licence: { id: docRef.id, ...data } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/worker-trade-licences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  const licenceId = request.nextUrl.searchParams.get('licenceId')

  if (!uid) {
    return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 })
  }
  if (!licenceId) {
    return NextResponse.json({ error: 'licenceId query parameter is required' }, { status: 400 })
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 })
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
    if ((snap.data() as WorkerTradeLicence).uid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/worker-trade-licences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
