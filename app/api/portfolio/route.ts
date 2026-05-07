import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { PortfolioPhoto } from '@/types'

export const dynamic = 'force-dynamic'

const MAX_PHOTOS = 20

/**
 * GET /api/portfolio?uid=<workerId>
 * Fetch all portfolio photos for a worker (public).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    if (!uid) {
      return NextResponse.json({ error: 'uid query param is required' }, { status: 400 })
    }
    const snap = await adminDb
      .collection('portfolio')
      .doc(uid)
      .collection('photos')
      .orderBy('order', 'asc')
      .get()
    const photos: PortfolioPhoto[] = snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = d.data()
      return {
        id: d.id,
        uid: data.uid as string,
        url: data.url as string,
        thumbnailUrl: (data.thumbnailUrl as string | undefined) ?? undefined,
        title: data.title as string,
        category: data.category as string,
        description: (data.description as string | undefined) ?? undefined,
        order: data.order as number,
        createdAt:
          data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt as string),
      } as PortfolioPhoto
    })
    return NextResponse.json({ photos })
  } catch (error) {
    console.error('GET /api/portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/portfolio
 * Add a new photo to the current worker's portfolio.
 * Requires x-user-id header.
 * Body: { url, thumbnailUrl?, title, category, description?, order? }
 */
export async function POST(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = (await request.json()) as {
      url?: string
      thumbnailUrl?: string
      title?: string
      category?: string
      description?: string
      order?: number
    }

    const { url, thumbnailUrl, title, category, description } = body

    if (!url || !title || !category) {
      return NextResponse.json({ error: 'url, title and category are required' }, { status: 400 })
    }

    // Enforce 20-photo limit
    const existing = await adminDb.collection('portfolio').doc(uid).collection('photos').get()
    if (existing.size >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} portfolio photos allowed` },
        { status: 400 },
      )
    }

    const order = typeof body.order === 'number' ? body.order : existing.size

    const ref = await adminDb.collection('portfolio').doc(uid).collection('photos').add({
      uid,
      url,
      thumbnailUrl: thumbnailUrl ?? null,
      title,
      category,
      description: description ?? null,
      order,
      createdAt: new Date().toISOString(),
    })

    const photo: PortfolioPhoto = {
      id: ref.id,
      uid,
      url,
      thumbnailUrl,
      title,
      category,
      description,
      order,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('POST /api/portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/portfolio?photoId=<id>
 * Remove a photo from the current worker's portfolio.
 * Requires x-user-id header.
 */
export async function DELETE(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')
    if (!photoId) {
      return NextResponse.json({ error: 'photoId query param is required' }, { status: 400 })
    }

    const docRef = adminDb.collection('portfolio').doc(uid).collection('photos').doc(photoId)
    const snap = await docRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Ensure the photo belongs to this user
    const data = snap.data()
    if (data?.uid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
