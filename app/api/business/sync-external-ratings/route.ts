import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { bbbNumber, bbbLink, googleProfileLink } = body

  if (!bbbLink && !googleProfileLink) {
    return NextResponse.json(
      { error: 'At least one external profile link (BBB or Google) is required' },
      { status: 400 }
    )
  }

  // TODO: call BBB API and Google Business Profile API for real rating data
  // Mock synced ratings
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

  return NextResponse.json(result)
}
