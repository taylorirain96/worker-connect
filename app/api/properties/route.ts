import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'
import type { Property } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('properties')
      .where('managerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const properties = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Get properties error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      address?: string
      suburb?: string
      city?: string
      postcode?: string
      propertyType?: string
      notes?: string
      tenantName?: string
      tenantPhone?: string
    }

    const { address, suburb, city, postcode, propertyType, notes, tenantName, tenantPhone } = body

    if (!address || !suburb || !city || !postcode || !propertyType) {
      return NextResponse.json({ error: 'address, suburb, city, postcode and propertyType are required' }, { status: 400 })
    }

    const countSnap = await adminDb.collection('properties')
      .where('managerId', '==', uid)
      .count()
      .get()

    if (countSnap.data().count >= 50) {
      return NextResponse.json({ error: 'Maximum 50 properties per manager' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const property: Omit<Property, 'id'> = {
      managerId: uid,
      address,
      suburb,
      city,
      postcode,
      propertyType: propertyType as Property['propertyType'],
      notes,
      tenantName,
      tenantPhone,
      activeJobCount: 0,
      totalJobsPosted: 0,
      createdAt: now,
      updatedAt: now,
    }

    const ref = await adminDb.collection('properties').add(property)

    return NextResponse.json({ id: ref.id, ...property }, { status: 201 })
  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
