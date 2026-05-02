import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// Simple deterministic helper (no Math.random in production code paths)
function seeded(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

/** GET /api/dashboard/admin/stats */
export async function GET(_req: NextRequest) {
  try {
    // Attempt to fetch real counts from Firestore; fall back to mock data
    let totalUsers = 0
    let totalJobs = 0
    let roleCounts: Record<string, number> = {}

    try {
      const usersSnap = await adminDb.collection('users').get()
      totalUsers = usersSnap.size
      usersSnap.forEach((doc) => {
        const role = doc.data().role as string
        if (role) roleCounts[role] = (roleCounts[role] ?? 0) + 1
      })

      const jobsSnap = await adminDb.collection('jobs').get()
      totalJobs = jobsSnap.size
    } catch {
      // Firestore not configured — use deterministic mock values
      totalUsers = 1284
      totalJobs = 847
      roleCounts = { worker: 521, tradie: 198, homeowner: 312, jobseeker: 183, employer: 70 }
    }

    // Build last-30-days daily signups (deterministic mock)
    const dailySignups = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return {
        date: d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }),
        signups: Math.round(3 + seeded(i + 1, 18)),
      }
    })

    // Build last-30-days commission (deterministic mock)
    const dailyCommission = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return {
        date: d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }),
        commission: Math.round(800 + seeded(i + 50, 1200)),
      }
    })

    const signupsToday = dailySignups[dailySignups.length - 1].signups
    const signupsThisWeek = dailySignups.slice(-7).reduce((s, d) => s + d.signups, 0)
    const totalRevenue = dailyCommission.reduce((s, d) => s + d.commission, 0)

    // Recent activity (mock — replace with real Firestore queries when ready)
    const names = ['Alex Turner', 'Jordan Blake', 'Sam Rivera', 'Casey Morgan', 'Taylor Quinn',
      'Drew Bailey', 'Riley Foster', 'Morgan Hayes', 'Avery Collins', 'Jamie Stone']
    const roles = ['worker', 'homeowner', 'tradie', 'jobseeker', 'employer']
    const recentSignups = Array.from({ length: 10 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: names[i],
      role: roles[i % 5],
      createdAt: new Date(Date.now() - i * 3 * 3600000).toISOString(),
    }))

    const jobTitles = ['Bathroom renovation', 'Lawn mowing', 'Electrical rewire', 'Plumbing fix',
      'Painting exterior', 'Deck build', 'Fence repair', 'Kitchen fit-out', 'Roofing repair', 'Gutter clean']
    const recentJobs = Array.from({ length: 10 }, (_, i) => ({
      id: `job-${i + 1}`,
      title: jobTitles[i],
      status: ['open', 'in_progress', 'completed'][i % 3],
      budget: Math.round(150 + seeded(i + 10, 2000)),
      createdAt: new Date(Date.now() - i * 4 * 3600000).toISOString(),
    }))

    const recentPayments = Array.from({ length: 10 }, (_, i) => ({
      id: `pay-${i + 1}`,
      amount: Math.round(200 + seeded(i + 20, 1800)),
      status: ['succeeded', 'pending', 'refunded'][i % 3],
      workerName: names[i],
      createdAt: new Date(Date.now() - i * 5 * 3600000).toISOString(),
    }))

    return NextResponse.json({
      totals: {
        users: totalUsers,
        jobs: totalJobs,
        activeJobs: Math.round(totalJobs * 0.3),
        completedJobs: Math.round(totalJobs * 0.55),
        revenue: totalRevenue,
        payoutsToWorkers: Math.round(totalRevenue * 0.78),
        emailsSentThisWeek: 342,
        referrals: 89,
        openDisputes: 7,
      },
      roleCounts,
      signupsToday,
      signupsThisWeek,
      dailySignups,
      dailyCommission,
      recentActivity: {
        signups: recentSignups,
        jobs: recentJobs,
        payments: recentPayments,
      },
    })
  } catch (error) {
    console.error('GET /api/dashboard/admin/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
