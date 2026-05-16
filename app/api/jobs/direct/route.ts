import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendDirectJobRequestEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/jobs/direct
 * Creates a direct job request from a homeowner to a specific worker.
 * Body: { workerId, description, date, address }
 */
export async function POST(req: NextRequest) {
  try {
    const homeownerId = req.headers.get('x-user-id')
    if (!homeownerId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as {
      workerId?: string
      description?: string
      date?: string
      address?: string
    }

    const { workerId, description, date, address } = body

    if (!workerId || !description || !date || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch homeowner and worker profiles in parallel
    const [homeownerDoc, workerDoc] = await Promise.all([
      adminDb.collection('users').doc(homeownerId).get(),
      adminDb.collection('users').doc(workerId).get(),
    ])

    if (!homeownerDoc.exists) {
      return NextResponse.json({ error: 'Homeowner not found' }, { status: 404 })
    }
    if (!workerDoc.exists) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    const homeownerData = homeownerDoc.data()!
    const workerData = workerDoc.data()!

    const requestRef = adminDb.collection('directRequests').doc()
    const now = new Date().toISOString()

    const request = {
      homeownerId,
      homeownerName: homeownerData.displayName ?? 'Homeowner',
      homeownerEmail: homeownerData.email ?? '',
      workerId,
      workerName: workerData.displayName ?? 'Worker',
      workerEmail: workerData.email ?? '',
      description,
      date,
      address,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }

    await requestRef.set(request)

    // Send email to worker (non-blocking)
    sendDirectJobRequestEmail({
      workerEmail: request.workerEmail,
      workerName: request.workerName,
      homeownerName: request.homeownerName,
      description,
      date,
      address,
      requestId: requestRef.id,
    }).catch((err) => console.error('sendDirectJobRequestEmail failed:', err))

    // Push notification to worker (non-blocking)
    sendAdminNotification({
      userId: workerId,
      title: `${request.homeownerName} wants to book you again!`,
      body: `New direct job request: ${description.slice(0, 80)}${description.length > 80 ? '…' : ''}`,
      type: 'direct_request',
      link: `/dashboard/worker`,
    }).catch(() => {})

    return NextResponse.json({ success: true, requestId: requestRef.id })
  } catch (err) {
    console.error('POST /api/jobs/direct error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
