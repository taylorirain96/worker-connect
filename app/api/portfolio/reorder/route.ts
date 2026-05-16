import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/portfolio/reorder
 * Update the display order of portfolio photos.
 * Requires x-user-id header.
 * Body: { orderedIds: string[] } — photo IDs in the desired display order
 */
export async function PATCH(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = (await request.json()) as { orderedIds?: unknown }
    const { orderedIds } = body

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 })
    }

    const batch = adminDb.batch()
    const photosCol = adminDb.collection('portfolio').doc(uid).collection('photos')

    for (let i = 0; i < orderedIds.length; i++) {
      const photoId = String(orderedIds[i])
      batch.update(photosCol.doc(photoId), { order: i })
    }

    await batch.commit()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/portfolio/reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
