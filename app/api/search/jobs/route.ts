import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { searchJobs } from '@/lib/searchService'
import type { SearchFilters, SearchQuery } from '@/types/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10))
    const skillsParam = searchParams.get('skills')
    const category = searchParams.get('category') ?? undefined
    const minBudget = searchParams.get('minBudget') ? parseFloat(searchParams.get('minBudget')!) : undefined
    const maxBudget = searchParams.get('maxBudget') ? parseFloat(searchParams.get('maxBudget')!) : undefined
    const location = searchParams.get('location') ?? undefined
    const sortBy = searchParams.get('sortBy') ?? 'relevance'

    const filters: SearchFilters = {
      skills: skillsParam ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      category,
      budgetMin: minBudget,
      budgetMax: maxBudget,
      location,
    }

    const searchQuery: SearchQuery = { query: q, filters, type: 'jobs', page, pageSize, sortBy }
    return NextResponse.json(searchJobs(searchQuery))
  } catch (error) {
    console.error('GET /api/search/jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
