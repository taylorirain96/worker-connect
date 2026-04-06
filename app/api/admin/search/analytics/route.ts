import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSearchAnalytics } from '@/lib/searchService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Admin check stub – replace with real role verification when needed
    // e.g., verify role === 'admin' from Firestore user document

    const { searchParams } = request.nextUrl
    const days = Math.min(90, parseInt(searchParams.get('days') ?? '30', 10))

    const analytics = await getSearchAnalytics(days)
    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('GET /api/admin/search/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
