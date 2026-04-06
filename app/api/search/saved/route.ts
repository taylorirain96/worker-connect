import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { saveSearch, getSavedSearches } from '@/lib/searchService'
import type { SearchFilters } from '@/types/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const searches = await getSavedSearches(userId)
    return NextResponse.json({ searches })
  } catch (error) {
    console.error('GET /api/search/saved error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as { name: string; query: string; filters?: SearchFilters; resultsCount?: number }
    if (!body.name || !body.query) {
      return NextResponse.json({ error: 'name and query are required' }, { status: 400 })
    }

    const saved = await saveSearch(userId, body)
    return NextResponse.json({ search: saved }, { status: 201 })
  } catch (error) {
    console.error('POST /api/search/saved error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
