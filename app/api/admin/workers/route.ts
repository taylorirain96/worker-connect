import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'HVAC', 'Roofing', 'Landscaping', 'Painting', 'General']
const VERIFICATION_STATUSES = ['unverified', 'basic', 'trusted'] as const

const MOCK_WORKERS = Array.from({ length: 200 }, (_, i) => ({
  id: `worker-${i + 1}`,
  name: [
    'Marcus Johnson', 'Elena Rodriguez', 'David Chen', 'Sarah Thompson', 'James Williams',
    'Amy Parker', 'Robert Kim', 'Lisa Chen', 'Tom Wilson', 'Maria Garcia',
  ][i % 10] + (i >= 10 ? ` ${Math.floor(i / 10)}` : ''),
  email: `worker${i + 1}@example.com`,
  rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
  jobsCompleted: Math.floor(5 + Math.random() * 200),
  totalEarnings: Math.round(1000 + Math.random() * 50000),
  verificationStatus: VERIFICATION_STATUSES[i % 3],
  isActive: i % 7 !== 0,
  region: REGIONS[i % 5],
  category: CATEGORIES[i % 8],
  joinedAt: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
}))

/**
 * GET /api/admin/workers
 * Query params: limit, offset, rating, verificationStatus, region, search, sortBy, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const ratingFilter = searchParams.get('rating')
    const verificationStatus = searchParams.get('verificationStatus')
    const region = searchParams.get('region')
    const search = searchParams.get('search')?.toLowerCase()
    const sortBy = searchParams.get('sortBy') ?? 'joinedAt'
    const order = searchParams.get('order') ?? 'desc'

    let filtered = [...MOCK_WORKERS]

    if (ratingFilter) {
      const [min, max] = ratingFilter.split('-').map(Number)
      filtered = filtered.filter((w) => w.rating >= (min ?? 0) && w.rating <= (max ?? 5))
    }

    if (verificationStatus) {
      filtered = filtered.filter((w) => w.verificationStatus === verificationStatus)
    }

    if (region) {
      filtered = filtered.filter((w) => w.region === region)
    }

    if (search) {
      filtered = filtered.filter(
        (w) => w.name.toLowerCase().includes(search) || w.email.toLowerCase().includes(search) || w.id.includes(search)
      )
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as string | number
      const bVal = b[sortBy as keyof typeof b] as string | number
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    const total = filtered.length
    const items = filtered.slice(offset, offset + limit)

    return NextResponse.json({ items, total, limit, offset })
  } catch (error) {
    console.error('GET /api/admin/workers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
