import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'
import type { ServicePackage, InstantBooking } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const homeownerId = request.headers.get('x-user-id')
  if (!homeownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      packageId?: string
      requestedDate?: string
      requestedTime?: string
      address?: string
      notes?: string
    }
    const { packageId, requestedDate, requestedTime, address, notes } = body

    if (!packageId || !requestedDate || !requestedTime || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pkgSnap = await adminDb.collection('servicePackages').doc(packageId).get()
    if (!pkgSnap.exists) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    const pkg = pkgSnap.data() as ServicePackage

    if (!pkg.instantBook) {
      return NextResponse.json({ error: 'Package does not support instant booking' }, { status: 400 })
    }

    const depositPercent = pkg.instantBookDepositPercent ?? 20
    const depositAmount = Math.round(pkg.price * depositPercent / 100 * 100) / 100

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

    const userSnap = await adminDb.collection('users').doc(homeownerId).get()
    const userData = userSnap.data() ?? {}

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(depositAmount * 100),
      currency: 'nzd',
      metadata: { type: 'instant_book_deposit', packageId, homeownerId },
    })

    const now = new Date().toISOString()
    const bookingRef = adminDb.collection('instantBookings').doc()

    const booking: Omit<InstantBooking, 'id'> = {
      packageId,
      packageTitle: pkg.title,
      workerId: pkg.workerId,
      workerName: pkg.workerName,
      homeownerId,
      homeownerName: userData.displayName ?? '',
      homeownerEmail: userData.email ?? '',
      totalPrice: pkg.price,
      depositAmount,
      depositPercent,
      address,
      requestedDate,
      requestedTime,
      notes,
      status: 'deposit_pending',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: now,
      updatedAt: now,
    }

    await bookingRef.set(booking)

    return NextResponse.json({
      bookingId: bookingRef.id,
      clientSecret: paymentIntent.client_secret,
      depositAmount,
    })
  } catch (error) {
    console.error('Instant book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') ?? 'homeowner'

    const field = role === 'worker' ? 'workerId' : 'homeownerId'
    const snap = await adminDb.collection('instantBookings')
      .where(field, '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const bookings = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get instant bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
