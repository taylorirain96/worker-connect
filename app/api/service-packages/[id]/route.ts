import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/service-packages/[id]
 * Returns a single service package by ID.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

    const snap = await adminDb.collection('servicePackages').doc(params.id).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json({ package: { id: snap.id, ...snap.data() } })
  } catch (err) {
    console.error('GET /api/service-packages/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/service-packages/[id]
 * Updates a service package. Only the owning worker may update it.
 * Header: x-user-id
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const workerId = req.headers.get('x-user-id')
    if (!workerId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

    const snap = await adminDb.collection('servicePackages').doc(params.id).get()
    if (!snap.exists) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    if (snap.data()?.workerId !== workerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as Record<string, unknown>
    // Strip fields that must not be changed via this endpoint
    const { id: _id, workerId: _wid, createdAt: _cat, ...updates } = body

    if (updates.price != null && (Number(updates.price) <= 0 || Number(updates.price) > 100_000)) {
      return NextResponse.json({ error: 'Price must be between 1 and 100,000' }, { status: 400 })
    }

    await adminDb.collection('servicePackages').doc(params.id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    const updated = await adminDb.collection('servicePackages').doc(params.id).get()
    return NextResponse.json({ package: { id: updated.id, ...updated.data() } })
  } catch (err) {
    console.error('PUT /api/service-packages/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/service-packages/[id]
 * Deletes a service package. Only the owning worker may delete it.
 * Header: x-user-id
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workerId = req.headers.get('x-user-id')
    if (!workerId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: 'Database not available' }, { status: 503 })

    const snap = await adminDb.collection('servicePackages').doc(params.id).get()
    if (!snap.exists) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    if (snap.data()?.workerId !== workerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await adminDb.collection('servicePackages').doc(params.id).delete()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/service-packages/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
