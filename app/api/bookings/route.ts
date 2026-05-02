import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendBookingRequestEmail } from '@/lib/email/transactional'

export const dynamic = 'force-dynamic'

/**
 * POST /api/bookings
 * Creates a new booking request from a homeowner to a worker.
 */
export async function POST(req: NextRequest) {
  try {
    const homeownerId = req.headers.get('x-user-id')
    if (!homeownerId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as {
      workerId?: string
      requestedDate?: string
      requestedTime?: string
      duration?: number
      description?: string
      address?: string
    }

    const { workerId, requestedDate, requestedTime, duration, description, address } = body

    if (!workerId || !requestedDate || !requestedTime || !duration || !description || !address) {
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

    const bookingRef = adminDb.collection('bookings').doc()
    const now = new Date().toISOString()

    const booking = {
      workerId,
      workerName: workerData.displayName ?? 'Worker',
      workerEmail: workerData.email ?? '',
      homeownerId,
      homeownerName: homeownerData.displayName ?? 'Homeowner',
      homeownerEmail: homeownerData.email ?? '',
      requestedDate,
      requestedTime,
      duration,
      description,
      address,
      status: 'pending' as const,
      workerMessage: '',
      createdAt: now,
      updatedAt: now,
    }

    await bookingRef.set(booking)

    // Send email to worker (non-blocking)
    sendBookingRequestEmail({
      workerEmail: booking.workerEmail,
      workerName: booking.workerName,
      homeownerName: booking.homeownerName,
      requestedDate,
      requestedTime,
      duration,
      description,
      address,
      bookingId: bookingRef.id,
    }).catch((err) => console.error('sendBookingRequestEmail failed:', err))

    return NextResponse.json({ success: true, bookingId: bookingRef.id })
  } catch (err) {
    console.error('POST /api/bookings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/bookings
 * Returns bookings for the authenticated user (as homeowner or worker).
 * Query params: ?role=homeowner|worker
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') ?? 'homeowner'

    const field = role === 'worker' ? 'workerId' : 'homeownerId'

    const snapshot = await adminDb
      .collection('bookings')
      .where(field, '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error('GET /api/bookings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
