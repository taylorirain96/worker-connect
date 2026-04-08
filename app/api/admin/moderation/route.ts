import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getFlaggedReviews } from '@/lib/reviews/firebase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50'), 100)

    // In production, verify the caller has admin role via Firebase Admin SDK before proceeding
    const reviews = await getFlaggedReviews(pageSize)
    return NextResponse.json({ reviews, count: reviews.length })
  } catch (error) {
    console.error('Get moderation queue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
