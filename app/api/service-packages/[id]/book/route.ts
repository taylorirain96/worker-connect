import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendAdminNotification } from '@/lib/notifications/admin'
import {
  sendServicePackageBookedWorkerEmail,
  sendServicePackageBookedHomeownerEmail,
} from '@/lib/email/transactional'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/service-packages/[id]/book
 *
 * Instantly books a service package for the authenticated homeowner.
 * Creates a servicePackageBookings document and a job document.
 * Sends in-app notifications + emails to both parties.
 *
 * Header: x-user-id  (homeowner UID)
 * Body: { preferredDate, preferredTime, address, notes? }
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (rateLimit(req, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const homeownerId = req.headers.get('x-user-id')
    if (!homeownerId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const body = await req.json() as {
      preferredDate?: string
      preferredTime?: string
      address?: string
      notes?: string
    }

    const { preferredDate, preferredTime, address, notes } = body

    if (!preferredDate || !preferredTime || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: preferredDate, preferredTime, address' },
        { status: 400 }
      )
    }

    // Fetch package
    const packageSnap = await adminDb.collection('servicePackages').doc(params.id).get()
    if (!packageSnap.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    const pkg = packageSnap.data()!
    if (!pkg.active) {
      return NextResponse.json({ error: 'This package is no longer available' }, { status: 410 })
    }

    // A worker cannot book their own package
    if (pkg.workerId === homeownerId) {
      return NextResponse.json({ error: 'You cannot book your own package' }, { status: 400 })
    }

    // Fetch homeowner profile
    const homeownerDoc = await adminDb.collection('users').doc(homeownerId).get()
    if (!homeownerDoc.exists) {
      return NextResponse.json({ error: 'Homeowner not found' }, { status: 404 })
    }
    const homeownerData = homeownerDoc.data()!

    // Fetch worker profile for up-to-date contact info
    const workerDoc = await adminDb.collection('users').doc(pkg.workerId).get()
    const workerData = workerDoc.exists ? workerDoc.data()! : {}

    const now = new Date().toISOString()

    // ── Create job document ────────────────────────────────────────────────────
    const jobRef = adminDb.collection('jobs').doc()
    const jobData = {
      title: pkg.title,
      description: pkg.description,
      category: pkg.category,
      location: address,
      region: pkg.region,
      budget: pkg.price,
      budgetType: 'fixed',
      urgency: 'medium',
      status: 'in_progress',
      workerId: pkg.workerId,
      workerName: pkg.workerName,
      employerId: homeownerId,
      employerName: homeownerData.displayName ?? 'Homeowner',
      sourceType: 'service_package',
      sourcePackageId: params.id,
      preferredDate,
      preferredTime,
      address,
      notes: notes ?? null,
      createdAt: now,
      updatedAt: now,
    }
    await jobRef.set(jobData)

    // ── Create booking document ───────────────────────────────────────────────
    const bookingRef = adminDb.collection('servicePackageBookings').doc()
    const bookingData = {
      packageId: params.id,
      packageTitle: pkg.title,
      workerId: pkg.workerId,
      workerName: pkg.workerName,
      workerEmail: workerData.email ?? '',
      homeownerId,
      homeownerName: homeownerData.displayName ?? 'Homeowner',
      homeownerEmail: homeownerData.email ?? '',
      price: pkg.price,
      category: pkg.category,
      region: pkg.region,
      preferredDate,
      preferredTime,
      address,
      notes: notes ?? null,
      status: 'confirmed',
      jobId: jobRef.id,
      createdAt: now,
      updatedAt: now,
    }
    await bookingRef.set(bookingData)

    // ── Notify worker (in-app + email, non-blocking) ──────────────────────────
    sendAdminNotification({
      userId: pkg.workerId,
      title: `New booking: ${pkg.title} 🎉`,
      body: `${homeownerData.displayName ?? 'A homeowner'} has booked your "${pkg.title}" package for ${preferredDate}.`,
      type: 'booking',
      link: `/dashboard/worker`,
    }).catch((err: unknown) => console.warn('[service-packages/book] worker notification failed:', err))

    if (workerData.email) {
      ;(async () => {
        try {
          await sendServicePackageBookedWorkerEmail({
            workerEmail: workerData.email,
            workerName: pkg.workerName,
            homeownerName: homeownerData.displayName ?? 'Homeowner',
            packageTitle: pkg.title,
            price: pkg.price,
            preferredDate,
            preferredTime,
            address,
            notes,
            bookingId: bookingRef.id,
          })
        } catch (err) {
          console.error('[service-packages/book] sendServicePackageBookedWorkerEmail failed:', err)
        }
      })().catch(() => {})
    }

    // ── Notify homeowner (in-app + email, non-blocking) ───────────────────────
    sendAdminNotification({
      userId: homeownerId,
      title: 'Booking confirmed ✅',
      body: `Your booking of "${pkg.title}" with ${pkg.workerName} on ${preferredDate} is confirmed.`,
      type: 'booking',
      link: `/packages`,
    }).catch((err: unknown) => console.warn('[service-packages/book] homeowner notification failed:', err))

    if (homeownerData.email) {
      ;(async () => {
        try {
          await sendServicePackageBookedHomeownerEmail({
            homeownerEmail: homeownerData.email,
            homeownerName: homeownerData.displayName ?? 'Homeowner',
            workerName: pkg.workerName,
            packageTitle: pkg.title,
            price: pkg.price,
            preferredDate,
            preferredTime,
            address,
            bookingId: bookingRef.id,
          })
        } catch (err) {
          console.error('[service-packages/book] sendServicePackageBookedHomeownerEmail failed:', err)
        }
      })().catch(() => {})
    }

    return NextResponse.json(
      { success: true, bookingId: bookingRef.id, jobId: jobRef.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/service-packages/[id]/book error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
