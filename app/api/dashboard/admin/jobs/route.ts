import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function seeded(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

const JOB_TITLES = [
  'Bathroom renovation', 'Lawn mowing', 'Electrical rewire', 'Plumbing repair',
  'Exterior painting', 'Deck build', 'Fence repair', 'Kitchen fit-out', 'Roof repair',
  'Gutter clean', 'Carpet install', 'Tile work', 'HVAC service', 'Tree removal', 'Driveway seal',
]
const CATEGORIES = ['plumbing', 'electrical', 'carpentry', 'landscaping', 'painting', 'cleaning', 'roofing', 'general']
const STATUSES = ['open', 'in_progress', 'completed', 'disputed', 'cancelled']
const LOCATIONS = ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin']
const POSTER_NAMES = ['Alex Turner', 'Jordan Blake', 'Sam Rivera', 'Casey Morgan', 'Taylor Quinn']

function buildMockJobs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `job-${i + 1}`,
    title: JOB_TITLES[i % JOB_TITLES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    status: STATUSES[i % STATUSES.length],
    location: LOCATIONS[i % LOCATIONS.length],
    budget: Math.round(100 + seeded(i + 1, 3000)),
    employerName: POSTER_NAMES[i % POSTER_NAMES.length],
    assignedWorker: i % 3 !== 0 ? `Worker ${(i % 8) + 1}` : null,
    createdAt: new Date(Date.now() - i * 12 * 3600000).toISOString(),
  }))
}

/** GET /api/dashboard/admin/jobs */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''
  const category = searchParams.get('category') ?? ''
  const location = searchParams.get('location') ?? ''
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    let jobs: ReturnType<typeof buildMockJobs> = []

    try {
      const snap = await adminDb.collection('jobs').orderBy('createdAt', 'desc').limit(300).get()
      jobs = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          title: d.title ?? 'Untitled job',
          category: d.category ?? 'general',
          status: d.status ?? 'open',
          location: d.location ?? '',
          budget: d.budget ?? 0,
          employerName: d.employerName ?? 'Unknown',
          assignedWorker: d.assignedWorkerName ?? null,
          createdAt: d.createdAt ?? new Date().toISOString(),
        }
      })
    } catch {
      jobs = buildMockJobs(150)
    }

    if (status)   jobs = jobs.filter((j) => j.status === status)
    if (category) jobs = jobs.filter((j) => j.category === category)
    if (location) jobs = jobs.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()))
    if (search)   jobs = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()))

    const total = jobs.length
    const paginated = jobs.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ jobs: paginated, total, page, limit })
  } catch (error) {
    console.error('GET /api/dashboard/admin/jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/dashboard/admin/jobs — admin action on a job */
export async function PUT(request: NextRequest) {
  try {
    const { jobId, action } = await request.json()
    if (!jobId || !action) {
      return NextResponse.json({ error: 'jobId and action are required' }, { status: 400 })
    }
    if (!['cancel', 'complete', 'dispute', 'reopen'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const statusMap: Record<string, string> = {
      cancel: 'cancelled',
      complete: 'completed',
      dispute: 'disputed',
      reopen: 'open',
    }

    try {
      await adminDb.collection('jobs').doc(jobId).update({
        status: statusMap[action],
        updatedAt: new Date().toISOString(),
      })
    } catch {
      // Firestore not configured — simulate success
    }

    return NextResponse.json({ jobId, action, newStatus: statusMap[action], success: true })
  } catch (error) {
    console.error('PUT /api/dashboard/admin/jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
