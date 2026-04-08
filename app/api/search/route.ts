import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { searchAll, searchWorkers, searchJobs, logSearchAnalytics } from '@/lib/searchService'
import type { SearchFilters, SearchQuery } from '@/types/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') ?? ''
    const type = (searchParams.get('type') ?? 'all') as SearchQuery['type']
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

    const searchQuery: SearchQuery = { query: q, filters, type, page, pageSize, sortBy }

    await logSearchAnalytics(q, filters)

    if (type === 'workers') {
      return NextResponse.json(searchWorkers(searchQuery))
    }
    if (type === 'jobs') {
      return NextResponse.json(searchJobs(searchQuery))
    }

    return NextResponse.json(searchAll(searchQuery))
  } catch (error) {
    console.error('GET /api/search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
