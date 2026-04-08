import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MOCK_DISPUTES = Array.from({ length: 50 }, (_, i) => ({
  id: `dispute-${i + 1}`,
  workerId: `worker-${(i % 10) + 1}`,
  workerName: ['Marcus Johnson', 'Elena Rodriguez', 'David Chen', 'Sarah Thompson', 'James Williams',
    'Amy Parker', 'Robert Kim', 'Lisa Chen', 'Tom Wilson', 'Maria Garcia'][i % 10],
  employerId: `employer-${(i % 8) + 1}`,
  employerName: ['Acme Corp', 'BuildRight LLC', 'HomePro', 'FixIt Services', 'QuickBuild',
    'ProConstruct', 'UrbanFix', 'CityWorks'][i % 8],
  amount: Math.round(200 + Math.random() * 1800),
  reason: ['quality_issues', 'non_delivery', 'overcharge', 'misrepresentation', 'other'][i % 5],
  status: ['open', 'under_review', 'resolved', 'closed', 'awaiting_evidence'][i % 5],
  createdAt: new Date(Date.now() - (i + 1) * 2 * 86400000).toISOString(),
  dueDate: new Date(Date.now() + (7 - i % 7) * 86400000).toISOString(),
  resolvedAt: i % 5 >= 2 ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
}))

/**
 * GET /api/admin/disputes
 * Query params: status, reason, limit, offset, sortBy, order, startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const reason = searchParams.get('reason')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const sortBy = searchParams.get('sortBy') ?? 'createdAt'
    const order = searchParams.get('order') ?? 'desc'

    let filtered = [...MOCK_DISPUTES]

    if (status) filtered = filtered.filter((d) => d.status === status)
    if (reason) filtered = filtered.filter((d) => d.reason === reason)

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
    console.error('GET /api/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/disputes
 * Body: { disputeId, status, note }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as { disputeId: string; status: string; note?: string }
    const { disputeId, status, note } = body

    if (!disputeId || !status) {
      return NextResponse.json({ error: 'disputeId and status are required' }, { status: 400 })
    }

    // In production: update Firestore dispute document
    console.info('[Admin] Dispute updated', { disputeId, status, note })

    return NextResponse.json({ success: true, disputeId, status })
  } catch (error) {
    console.error('PUT /api/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/disputes
 * Body: { disputeId, note, authorId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { disputeId: string; note: string; authorId: string }
    const { disputeId, note, authorId } = body

    if (!disputeId || !note || !authorId) {
      return NextResponse.json({ error: 'disputeId, note, and authorId are required' }, { status: 400 })
    }

    const noteRecord = {
      id: `note-${Date.now()}`,
      disputeId,
      note,
      authorId,
      createdAt: new Date().toISOString(),
    }

    // In production: write to Firestore disputeNotes subcollection
    return NextResponse.json({ success: true, note: noteRecord })
  } catch (error) {
    console.error('POST /api/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
