import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/job-templates/[id]
 * Returns a single job template.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { id } = await context.params
    const snap = await adminDb
      .collection('jobTemplates')
      .doc(userId)
      .collection('items')
      .doc(id)
      .get()

    if (!snap.exists) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ id: snap.id, ...snap.data() })
  } catch (err) {
    console.error('GET /api/job-templates/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/job-templates/[id]
 * Deletes a saved job template.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { id } = await context.params
    const ref = adminDb
      .collection('jobTemplates')
      .doc(userId)
      .collection('items')
      .doc(id)

    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await ref.delete()

    // Decrement count on parent document
    await adminDb.collection('jobTemplates').doc(userId).set(
      { count: FieldValue.increment(-1), updatedAt: new Date().toISOString() },
      { merge: true },
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/job-templates/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
