import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSearchAlert, getSearchAlerts } from '@/lib/searchService'
import type { SearchFilters } from '@/types/search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const alerts = await getSearchAlerts(userId)
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('GET /api/search/alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as {
      query: string
      filters?: SearchFilters
      notificationFrequency: 'daily' | 'weekly' | 'immediately'
    }
    if (!body.query || !body.notificationFrequency) {
      return NextResponse.json({ error: 'query and notificationFrequency are required' }, { status: 400 })
    }

    const alert = await createSearchAlert(userId, body)
    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error('POST /api/search/alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
