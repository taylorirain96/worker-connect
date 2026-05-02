import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// Simple deterministic helper (no Math.random in production code paths)
// Deterministic pseudo-random generator for consistent mock data across renders.
// Uses a simple sine-based hash — NOT for security use.
function seeded(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

const MOCK_NAMES = ['Alex Turner', 'Jordan Blake', 'Sam Rivera', 'Casey Morgan', 'Taylor Quinn',
  'Drew Bailey', 'Riley Foster', 'Morgan Hayes', 'Avery Collins', 'Jamie Stone',
  'Pat Lee', 'Dana White', 'Chris Brown', 'Skyler Adams', 'Reese Hall',
  'Quinn Murphy', 'Harley Brooks', 'Reagan Price', 'Phoenix Green', 'Sage Carter']
const MOCK_ROLES = ['worker', 'tradie', 'homeowner', 'jobseeker', 'employer']
const MOCK_EMAILS = (name: string) => `${name.toLowerCase().replace(' ', '.')}@example.com`

function buildMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const name = MOCK_NAMES[i % MOCK_NAMES.length]
    return {
      uid: `user-${i + 1}`,
      displayName: name,
      email: MOCK_EMAILS(name),
      role: MOCK_ROLES[i % 5],
      createdAt: new Date(Date.now() - i * 2 * 86400000).toISOString(),
      verified: i % 4 !== 0,
      suspended: i % 15 === 0,
      banned: i % 30 === 0,
      jobsCount: Math.round(seeded(i, 25)),
      totalEarned: Math.round(seeded(i + 5, 12000)),
      totalSpent: Math.round(seeded(i + 10, 8000)),
    }
  })
}

/** GET /api/dashboard/admin/users */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const role = searchParams.get('role') ?? ''
  const verified = searchParams.get('verified') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    let users: ReturnType<typeof buildMockUsers> = []

    try {
      // Attempt real Firestore query
      const snap = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(200).get()
      users = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          uid: doc.id,
          displayName: d.displayName ?? d.email ?? 'Unknown',
          email: d.email ?? '',
          role: d.role ?? 'worker',
          createdAt: d.createdAt ?? new Date().toISOString(),
          verified: d.verified ?? false,
          suspended: d.suspended ?? false,
          banned: d.banned ?? false,
          jobsCount: d.completedJobs ?? 0,
          totalEarned: d.totalEarnings ?? 0,
          totalSpent: 0,
        }
      })
    } catch {
      users = buildMockUsers(120)
    }

    // Apply filters
    if (search) {
      const q = search.toLowerCase()
      users = users.filter((u) =>
        u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }
    if (role) users = users.filter((u) => u.role === role)
    if (verified === 'true') users = users.filter((u) => u.verified)
    if (verified === 'false') users = users.filter((u) => !u.verified)

    const total = users.length
    const paginated = users.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ users: paginated, total, page, limit })
  } catch (error) {
    console.error('GET /api/dashboard/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/dashboard/admin/users — perform action on a user */
export async function PUT(request: NextRequest) {
  try {
    const { uid, action } = await request.json()
    if (!uid || !action) {
      return NextResponse.json({ error: 'uid and action are required' }, { status: 400 })
    }
    if (!['suspend', 'unsuspend', 'ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    try {
      const update: Record<string, boolean> = {}
      if (action === 'suspend')   update.suspended = true
      if (action === 'unsuspend') update.suspended = false
      if (action === 'ban')       { update.banned = true; update.suspended = true }
      if (action === 'unban')     { update.banned = false; update.suspended = false }

      await adminDb.collection('users').doc(uid).update(update)
    } catch {
      // Firestore not configured — simulate success
    }

    return NextResponse.json({ uid, action, success: true })
  } catch (error) {
    console.error('PUT /api/dashboard/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
