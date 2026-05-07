import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/availability/[workerId]
 * Returns the public availability schedule for any worker.
 */
export async function GET(_req: NextRequest, props: { params: Promise<{ workerId: string }> }) {
  const params = await props.params;
  try {
    const { workerId } = params

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 })
    }

    const userDoc = await adminDb.collection('users').doc(workerId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    const data = userDoc.data()
    const availability = data?.availability ?? null

    return NextResponse.json({ availability })
  } catch (err) {
    console.error('GET /api/availability/[workerId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
