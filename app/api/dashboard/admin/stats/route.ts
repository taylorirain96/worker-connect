import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value === 'string') return new Date(value)
  if (value instanceof Date) return value
  return new Date(0)
}

function iso(value: unknown): string {
  return toDate(value).toISOString()
}

function shortDate(input: Date): string {
  return input.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

type RawAdminDoc = Record<string, unknown> & { id: string }

/** GET /api/dashboard/admin/stats */
export async function GET(_req: NextRequest) {
  try {
    const now = new Date()
    const windowStart = new Date(now)
    windowStart.setDate(windowStart.getDate() - 29)

    const [usersSnap, jobsSnap, paymentsSnap, disputesSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('jobs').get(),
      adminDb.collection('payments').orderBy('createdAt', 'desc').limit(250).get(),
      adminDb
        .collection('disputes')
        .where('status', 'in', ['open', 'under_review'])
        .limit(200)
        .get(),
    ])

    const totalUsers = usersSnap.size
    const totalJobs = jobsSnap.size
    const roleCounts: Record<string, number> = {}
    const dailySignupMap = new Map<string, number>()
    for (let i = 0; i < 30; i += 1) {
      const day = new Date(windowStart)
      day.setDate(windowStart.getDate() + i)
      dailySignupMap.set(day.toISOString().slice(0, 10), 0)
    }

    usersSnap.forEach((doc) => {
      const data = doc.data()
      const role = safeString(data.role, 'unknown')
      roleCounts[role] = (roleCounts[role] ?? 0) + 1

      const createdAt = toDate(data.createdAt)
      if (createdAt >= windowStart) {
        const key = createdAt.toISOString().slice(0, 10)
        dailySignupMap.set(key, (dailySignupMap.get(key) ?? 0) + 1)
      }
    })

    let activeJobs = 0
    let completedJobs = 0
    const recentJobs = jobsSnap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as RawAdminDoc)
      .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
      .slice(0, 10)
      .map((job) => ({
        id: job.id,
        title: safeString(job.title, 'Untitled job'),
        status: safeString(job.status, 'open'),
        budget: typeof job.budget === 'number' ? job.budget : 0,
        createdAt: iso(job.createdAt),
      }))

    jobsSnap.forEach((doc) => {
      const status = doc.data().status
      if (status === 'completed') completedJobs += 1
      if (status === 'open' || status === 'in_progress') activeJobs += 1
    })

    const dailyCommissionMap = new Map<string, number>()
    for (let i = 0; i < 30; i += 1) {
      const day = new Date(windowStart)
      day.setDate(windowStart.getDate() + i)
      dailyCommissionMap.set(day.toISOString().slice(0, 10), 0)
    }

    const recentPayments = paymentsSnap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as RawAdminDoc)
      .slice(0, 10)
      .map((payment) => ({
        id: payment.id,
        amount: typeof payment.amount === 'number' ? payment.amount : 0,
        status: safeString(payment.status, 'pending'),
        workerName: safeString(payment.workerName ?? payment.workerId, 'Unknown worker'),
        createdAt: iso(payment.createdAt),
      }))

    paymentsSnap.forEach((doc) => {
      const data = doc.data()
      const createdAt = toDate(data.createdAt)
      if (createdAt < windowStart) return
      const key = createdAt.toISOString().slice(0, 10)
      const amount = typeof data.amount === 'number' ? data.amount : 0
      const commission = Math.round(amount * 0.05)
      dailyCommissionMap.set(key, (dailyCommissionMap.get(key) ?? 0) + commission)
    })

    const recentSignups = usersSnap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as RawAdminDoc)
      .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
      .slice(0, 10)
      .map((user) => ({
        id: user.id,
        name: safeString(user.displayName ?? user.name, 'New user'),
        role: safeString(user.role, 'unknown'),
        createdAt: iso(user.createdAt),
      }))

    const dailySignups = Array.from(dailySignupMap.entries()).map(([day, signups]) => ({
      date: shortDate(new Date(day)),
      signups,
    }))
    const dailyCommission = Array.from(dailyCommissionMap.entries()).map(([day, commission]) => ({
      date: shortDate(new Date(day)),
      commission,
    }))

    const signupsToday = dailySignups[dailySignups.length - 1]?.signups ?? 0
    const signupsThisWeek = dailySignups.slice(-7).reduce((s, d) => s + d.signups, 0)
    const totalRevenue = dailyCommission.reduce((s, d) => s + d.commission, 0)

    return NextResponse.json({
      totals: {
        users: totalUsers,
        jobs: totalJobs,
        activeJobs,
        completedJobs,
        revenue: totalRevenue,
        payoutsToWorkers: Math.round(totalRevenue * 0.78),
        emailsSentThisWeek: 0,
        referrals: 0,
        openDisputes: disputesSnap.size,
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
    return NextResponse.json({ error: 'Unable to load admin stats from data sources' }, { status: 503 })
  }
}
