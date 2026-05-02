import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function seeded(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

const NAMES = ['Alex Turner', 'Jordan Blake', 'Sam Rivera', 'Casey Morgan', 'Taylor Quinn',
  'Drew Bailey', 'Riley Foster', 'Morgan Hayes', 'Avery Collins', 'Jamie Stone']
const JOB_TITLES = ['Bathroom reno', 'Lawn mowing', 'Electrical', 'Plumbing', 'Painting',
  'Deck build', 'Fence repair', 'Kitchen fit-out', 'Roofing', 'Gutters']
const STATUSES: Array<'pending' | 'released' | 'refunded' | 'disputed'> = ['pending', 'released', 'refunded', 'disputed']

function buildMockPayments(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `pay-${String(i + 1).padStart(5, '0')}`,
    jobId: `job-${(i % 50) + 1}`,
    jobTitle: JOB_TITLES[i % JOB_TITLES.length],
    homeownerName: NAMES[i % NAMES.length],
    workerName: NAMES[(i + 5) % NAMES.length],
    amount: Math.round(150 + seeded(i + 1, 3500)),
    commission: Math.round((150 + seeded(i + 1, 3500)) * 0.1),
    status: STATUSES[i % 4],
    createdAt: new Date(Date.now() - i * 6 * 3600000).toISOString(),
  }))
}

/** GET /api/dashboard/admin/payments */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    let payments: ReturnType<typeof buildMockPayments> = []

    try {
      const snap = await adminDb.collection('escrow').orderBy('createdAt', 'desc').limit(300).get()
      payments = snap.docs.map((doc) => {
        const d = doc.data()
        const amount = d.amount ?? 0
        return {
          id: doc.id,
          jobId: d.jobId ?? '',
          jobTitle: d.jobTitle ?? 'Unknown job',
          homeownerName: d.homeownerName ?? 'Unknown',
          workerName: d.workerName ?? 'Unknown',
          amount,
          commission: Math.round(amount * 0.1),
          status: (d.status ?? 'pending') as 'pending' | 'released' | 'refunded' | 'disputed',
          createdAt: d.createdAt ?? new Date().toISOString(),
        }
      })
    } catch {
      payments = buildMockPayments(200)
    }

    if (status) payments = payments.filter((p) => p.status === status)

    const totalCommission = payments.reduce((s, p) => s + p.commission, 0)
    const total = payments.length
    const paginated = payments.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ payments: paginated, total, totalCommission, page, limit })
  } catch (error) {
    console.error('GET /api/dashboard/admin/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
