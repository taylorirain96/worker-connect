import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { searchWorkers } from '@/lib/searchService'
import type { SearchFilters, SearchQuery } from '@/types/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10))
    const skillsParam = searchParams.get('skills')
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    const maxRating = searchParams.get('maxRating') ? parseFloat(searchParams.get('maxRating')!) : undefined
    const minHourlyRate = searchParams.get('minHourlyRate') ? parseFloat(searchParams.get('minHourlyRate')!) : undefined
    const maxHourlyRate = searchParams.get('maxHourlyRate') ? parseFloat(searchParams.get('maxHourlyRate')!) : undefined
    const availability = searchParams.get('availability') as SearchFilters['availability'] | null
    const location = searchParams.get('location') ?? undefined
    const sortBy = searchParams.get('sortBy') ?? 'relevance'

    const filters: SearchFilters = {
      skills: skillsParam ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      minRating,
      maxRating,
      minHourlyRate,
      maxHourlyRate,
      availability: availability ?? undefined,
      location,
    }

    const searchQuery: SearchQuery = { query: q, filters, type: 'workers', page, pageSize, sortBy }
    return NextResponse.json(searchWorkers(searchQuery))
  } catch (error) {
    console.error('GET /api/search/workers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
