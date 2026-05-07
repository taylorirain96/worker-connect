import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

const MOCK_ACTIVITIES = [
  { type: 'job_posted' as const, label: '🔨 A homeowner just posted a plumbing job', location: 'Auckland', timeAgo: '2 min ago' },
  { type: 'booking_made' as const, label: '⚡ Electrical work booked in Wellington', location: 'Wellington', timeAgo: '5 min ago' },
  { type: 'review_left' as const, label: '⭐ A 5-star review was left for a tradie', location: 'Christchurch', timeAgo: '12 min ago' },
]

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const [jobsSnap, reviewsSnap, bookingsSnap] = await Promise.all([
      adminDb.collection('jobs').where('createdAt', '>=', since).orderBy('createdAt', 'desc').limit(3).get(),
      adminDb.collection('reviews').where('createdAt', '>=', since).orderBy('createdAt', 'desc').limit(2).get(),
      adminDb.collection('instantBookings').where('createdAt', '>=', since).orderBy('createdAt', 'desc').limit(2).get(),
    ])

type ActivityItem = { type: 'job_posted' | 'booking_made' | 'review_left'; label: string; location?: string; timeAgo: string; _ts: number }
    const activities: ActivityItem[] = []

    for (const doc of jobsSnap.docs) {
      const d = doc.data()
      const ts = new Date(d.createdAt).getTime()
      activities.push({
        type: 'job_posted',
        label: `🔨 A new ${d.category ?? 'trade'} job was posted`,
        location: d.location,
        timeAgo: timeAgo(d.createdAt),
        _ts: ts,
      })
    }

    for (const doc of reviewsSnap.docs) {
      const d = doc.data()
      const ts = new Date(d.createdAt).getTime()
      activities.push({
        type: 'review_left',
        label: `⭐ A ${d.rating ?? 5}-star review was left`,
        location: d.location,
        timeAgo: timeAgo(d.createdAt),
        _ts: ts,
      })
    }

    for (const doc of bookingsSnap.docs) {
      const d = doc.data()
      const ts = new Date(d.createdAt).getTime()
      activities.push({
        type: 'booking_made',
        label: `📅 A service was instantly booked`,
        location: undefined,
        timeAgo: timeAgo(d.createdAt),
        _ts: ts,
      })
    }

    const sorted = activities
      .sort((a, b) => b._ts - a._ts)
      .slice(0, 6)
      .map(({ _ts: _ignored, ...rest }) => rest)

    return NextResponse.json(
      { activities: sorted.length > 0 ? sorted : MOCK_ACTIVITIES },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    )
  } catch {
    return NextResponse.json({ activities: MOCK_ACTIVITIES })
  }
}
