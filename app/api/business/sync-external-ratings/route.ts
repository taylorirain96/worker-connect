import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { bbbNumber, bbbLink, googleProfileLink } = body

  if (!bbbLink && !googleProfileLink) {
    return NextResponse.json(
      { error: 'At least one external profile link (BBB or Google) is required' },
      { status: 400 }
    )
  }

  if (bbbLink && !process.env.BBB_API_KEY) {
    return NextResponse.json(
      { error: 'BBB integration not configured. Contact support to enable BBB rating sync.' },
      { status: 501 }
    )
  }

  if (googleProfileLink && !process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: 'Google Business Profile integration not configured. Contact support to enable Google rating sync.' },
      { status: 501 }
    )
  }

  // Store the submitted links; live rating data will be populated once provider APIs are configured
  const result = {
    bbbNumber: bbbNumber ?? null,
    bbbLink: bbbLink ?? null,
    bbbRating: null,
    bbbReviewCount: null,
    googleProfileLink: googleProfileLink ?? null,
    googleRating: null,
    googleReviewCount: null,
    lastSyncedAt: new Date().toISOString(),
  }

  await adminDb.collection('businessVerifications').doc(uid).set(
    { externalRatings: result, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )

  return NextResponse.json(result)
}
