import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import admin, { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/service-packages
 * Lists active service packages with optional filters.
 * Query params: category, region, workerId, limit (default 40)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const workerId = searchParams.get('workerId')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const pageLimit = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100)

    if (!adminDb) {
      return NextResponse.json({ packages: [] })
    }

    // Build a filtered query using the Admin SDK's CollectionReference
    let filteredQ: admin.firestore.Query = adminDb.collection('servicePackages')

    if (workerId) filteredQ = filteredQ.where('workerId', '==', workerId)
    if (category) filteredQ = filteredQ.where('category', '==', category)
    if (region) filteredQ = filteredQ.where('region', '==', region)
    if (!includeInactive) filteredQ = filteredQ.where('active', '==', true)

    filteredQ = filteredQ.orderBy('createdAt', 'desc').limit(pageLimit)

    const snap = await filteredQ.get()
    const packages = snap.docs.map((d: admin.firestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }))

    return NextResponse.json({ packages })
  } catch (err) {
    console.error('GET /api/service-packages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/service-packages
 * Creates a new service package for the authenticated worker.
 * Header: x-user-id
 */
export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const workerId = req.headers.get('x-user-id')
    if (!workerId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as {
      title?: string
      description?: string
      price?: number
      category?: string
      region?: string
      inclusions?: string[]
      estimatedDurationHours?: number
    }

    const { title, description, price, category, region, inclusions, estimatedDurationHours } = body

    if (!title || !description || price == null || !category || !region) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, category, region' },
        { status: 400 }
      )
    }

    if (price <= 0 || price > 100_000) {
      return NextResponse.json({ error: 'Price must be between 1 and 100,000' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // Fetch worker profile to embed display data on the package
    const workerDoc = await adminDb.collection('users').doc(workerId).get()
    if (!workerDoc.exists) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }
    const workerData = workerDoc.data()!

    const now = new Date().toISOString()
    const packageRef = adminDb.collection('servicePackages').doc()

    const packageData = {
      workerId,
      workerName: workerData.displayName ?? 'Worker',
      workerPhotoURL: workerData.photoURL ?? null,
      workerRating: workerData.rating ?? null,
      workerReviewCount: workerData.reviewCount ?? 0,
      workerCompletedJobs: workerData.completedJobs ?? 0,
      title: title.trim(),
      description: description.trim(),
      price,
      category,
      region,
      inclusions: (inclusions ?? []).slice(0, 8).map((s: string) => s.trim()).filter(Boolean),
      estimatedDurationHours: estimatedDurationHours ?? 1,
      active: true,
      createdAt: now,
      updatedAt: now,
    }

    await packageRef.set(packageData)

    return NextResponse.json({ package: { id: packageRef.id, ...packageData } }, { status: 201 })
  } catch (err) {
    console.error('POST /api/service-packages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
