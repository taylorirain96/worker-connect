import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSuggestions } from '@/lib/searchService'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (rateLimit(request, { max: 30, windowMs: 60_000, key: 'search' })) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') ?? ''
    const userId = request.headers.get('x-user-id') ?? undefined
    const suggestions = getSuggestions(q, userId).slice(0, 8)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('GET /api/search/suggestions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
