import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/favourites
 * Returns the list of favourited worker IDs for the authenticated homeowner.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ favourites: [] })
    }

    const favourites: string[] = userDoc.data()?.favourites ?? []
    return NextResponse.json({ favourites })
  } catch (err) {
    console.error('GET /api/favourites error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/favourites
 * Adds a worker to the homeowner's favourites list.
 * Body: { workerId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as { workerId?: string }
    const { workerId } = body

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    // Verify the worker exists
    const workerDoc = await adminDb.collection('users').doc(workerId).get()
    if (!workerDoc.exists) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    await adminDb.collection('users').doc(userId).update({
      favourites: FieldValue.arrayUnion(workerId),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/favourites error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/favourites
 * Removes a worker from the homeowner's favourites list.
 * Body: { workerId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as { workerId?: string }
    const { workerId } = body

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    await adminDb.collection('users').doc(userId).update({
      favourites: FieldValue.arrayRemove(workerId),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/favourites error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
