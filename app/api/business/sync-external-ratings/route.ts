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

  // TODO: call BBB API and Google Business Profile API for real rating data
  const result = {
    bbbNumber: bbbNumber ?? null,
    bbbLink: bbbLink ?? null,
    bbbRating: bbbLink ? 'A+' : null,
    bbbReviewCount: bbbLink ? 42 : null,
    googleProfileLink: googleProfileLink ?? null,
    googleRating: googleProfileLink ? 4.8 : null,
    googleReviewCount: googleProfileLink ? 134 : null,
    lastSyncedAt: new Date().toISOString(),
  }

  await adminDb.collection('businessVerifications').doc(uid).set(
    { externalRatings: result, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )

  return NextResponse.json(result)
}
