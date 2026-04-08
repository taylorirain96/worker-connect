import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple deterministic pseudo-random based on seed (not for security use)
function seededVal(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

const VERIFICATION_STATUSES = ['unverified', 'basic', 'trusted'] as const

const MOCK_EMPLOYERS = Array.from({ length: 150 }, (_, i) => ({
  id: `employer-${i + 1}`,
  companyName: [
    'Acme Corp', 'BuildRight LLC', 'HomePro Services', 'FixIt Inc', 'QuickBuild Co',
    'ProConstruct', 'UrbanFix', 'CityWorks', 'MetroHome', 'SkyBuild',
  ][i % 10] + (i >= 10 ? ` ${Math.floor(i / 10)}` : ''),
  email: `employer${i + 1}@example.com`,
  jobsPosted: Math.floor(1 + seededVal(i, 80)),
  totalSpent: Math.round(500 + seededVal(i + 50, 100000)),
  activeJobs: Math.floor(seededVal(i + 100, 10)),
  verificationStatus: VERIFICATION_STATUSES[i % 3],
  joinedAt: new Date(Date.now() - (i + 1) * 5 * 86400000).toISOString(),
}))

/**
 * GET /api/admin/employers
 * Query params: limit, offset, verificationStatus, search, sortBy, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const verificationStatus = searchParams.get('verificationStatus')
    const search = searchParams.get('search')?.toLowerCase()
    const sortBy = searchParams.get('sortBy') ?? 'joinedAt'
    const order = searchParams.get('order') ?? 'desc'

    let filtered = [...MOCK_EMPLOYERS]

    if (verificationStatus) {
      filtered = filtered.filter((e) => e.verificationStatus === verificationStatus)
    }

    if (search) {
      filtered = filtered.filter(
        (e) => e.companyName.toLowerCase().includes(search) || e.email.toLowerCase().includes(search) || e.id.includes(search)
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
    console.error('GET /api/admin/employers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
