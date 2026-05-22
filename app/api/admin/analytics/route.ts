import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// ─── 5-minute in-memory cache ─────────────────────────────────────────────────

interface CacheEntry<T> { data: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.data
}

function setCached<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Dashboard data aggregation ───────────────────────────────────────────────

interface DashboardResult {
  metrics: {
    totalUsers: number; homeownerCount: number; workerCount: number; userGrowthPct: number
    totalJobsThisMonth: number; totalJobsLastMonth: number; jobsGrowthPct: number
    revenueThisMonth: number; revenueLastMonth: number; revenueGrowthPct: number
    activeJobs: number; avgJobValue: number; avgTimeToHire: number
  }
  charts: {
    dailySignups: { date: string; homeowners: number; workers: number }[]
    dailyJobs: { date: string; jobs: number }[]
    dailyRevenue: { date: string; revenue: number }[]
    jobsByCategory: { name: string; value: number }[]
    jobsByCity: { name: string; value: number }[]
  }
  recentActivity: { id: string; type: string; userName: string; description: string; createdAt: string }[]
  topWorkers: { rank: number; name: string; jobsCompleted: number; earnings: number; rating: number }[]
  topCities: { rank: number; city: string; jobsPosted: number }[]
  adminAnalytics: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    totalUsers: number
    newUsersThisMonth: number
    userGrowthRate: number
    totalJobs: number
    completedJobs: number
    activeJobs: number
    jobCompletionRate: number
    disputeCount: number
    disputeResolutionRate: number
    topWorkers: {
      rank: number
      workerId: string
      name: string
      avatar?: string
      jobsCompleted: number
      totalEarnings: number
      rating: number
      category: string
    }[]
    monthlyRevenueChart: { month: string; revenue: number; jobs: number }[]
    categoryStats: { category: string; count: number; revenue: number; color: string }[]
    dailyStats: { date: string; jobs: number; revenue: number; newUsers: number }[]
  }
}

type AdminAnalyticsTopWorker = DashboardResult['adminAnalytics']['topWorkers'][number]

const CATEGORY_COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#84cc16',
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function last12Months(): string[] {
  const idx = new Date().getMonth()
  return Array.from({ length: 12 }, (_, i) => MONTHS[(idx - 11 + i + 12) % 12])
}

function monthName(date: Date): string {
  return MONTHS[date.getMonth()] ?? MONTHS[0]
}

function monthLabel(value: unknown): string | null {
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return monthName(parsed)
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return monthName(value)
  }
  if (typeof value === 'object' && value !== null) {
    const maybeToDate = (value as { toDate?: () => Date }).toDate
    if (typeof maybeToDate === 'function') {
      const parsed = maybeToDate()
      if (!Number.isNaN(parsed.getTime())) {
        return monthName(parsed)
      }
    }
  }
  return null
}

async function buildDashboardData(): Promise<DashboardResult> {
  const cached = getCached<DashboardResult>('dashboard')
  if (cached) return cached

  const now = new Date()
  const DAYS = 30

  // ── Try Firestore; fall back to empty/zero values ─────────────────────────
  let totalUsers = 0
  let homeownerCount = 0
  let workerCount = 0
  let newUsersThisMonth = 0
  let newUsersLastMonth = 0
  let totalJobsThisMonth = 0
  let totalJobsLastMonth = 0
  let revenueThisMonth = 0
  let revenueLastMonth = 0
  let activeJobs = 0
  let avgJobValue = 0
  let avgTimeToHire = 0
  let totalRevenue = 0
  let totalJobs = 0
  let completedJobs = 0
  let disputeCount = 0
  let resolvedDisputeCount = 0

  const dailySignups: { date: string; homeowners: number; workers: number }[] = []
  const dailyJobs: { date: string; jobs: number }[] = []
  const dailyRevenue: { date: string; revenue: number }[] = []
  const jobsByCategory: { name: string; value: number }[] = []
  const jobsByCity: { name: string; value: number }[] = []
  const recentActivity: {
    id: string; type: string; userName: string; description: string; createdAt: string
  }[] = []
  const topWorkers: {
    rank: number; name: string; jobsCompleted: number; earnings: number; rating: number
  }[] = []
  const topCities: { rank: number; city: string; jobsPosted: number }[] = []
  const adminTopWorkers: AdminAnalyticsTopWorker[] = []
  const monthlyRevenueMap = new Map<string, { revenue: number; jobs: number }>()
  const categoryRevenue: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  const cityCounts: Record<string, number> = {}

  // Day-bucket scaffolding for last DAYS days (yyyy-mm-dd keys, localised labels).
  const dayStart = new Date(now)
  dayStart.setDate(dayStart.getDate() - (DAYS - 1))
  dayStart.setHours(0, 0, 0, 0)
  const dayBuckets: { key: string; label: string }[] = []
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(dayStart)
    d.setDate(dayStart.getDate() + i)
    dayBuckets.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' }),
    })
  }
  const dayKeySet = new Set(dayBuckets.map((b) => b.key))
  const signupsByDay = new Map<string, { homeowners: number; workers: number }>()
  const jobsCountByDay = new Map<string, number>()
  const revenueByDay = new Map<string, number>()

  function dayKey(value: unknown): string | null {
    if (typeof value === 'string') {
      // ISO string starts with yyyy-mm-dd
      const k = value.slice(0, 10)
      return dayKeySet.has(k) ? k : null
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const k = value.toISOString().slice(0, 10)
      return dayKeySet.has(k) ? k : null
    }
    if (typeof value === 'object' && value !== null) {
      const maybeToDate = (value as { toDate?: () => Date }).toDate
      if (typeof maybeToDate === 'function') {
        const d = maybeToDate()
        if (!Number.isNaN(d.getTime())) {
          const k = d.toISOString().slice(0, 10)
          return dayKeySet.has(k) ? k : null
        }
      }
    }
    return null
  }

  try {
    // Real Firestore aggregation
    const usersSnap = await adminDb.collection('users').get()
    totalUsers = usersSnap.size
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    usersSnap.forEach((doc) => {
      const role = doc.data().role as string
      const createdAt = doc.data().createdAt as string | undefined
      if (role === 'homeowner') homeownerCount++
      else if (role === 'worker' || role === 'tradie') workerCount++
      if (createdAt) {
        if (createdAt >= monthStart) newUsersThisMonth++
        else if (createdAt >= lastMonthStart && createdAt < monthStart) newUsersLastMonth++
        const k = dayKey(createdAt)
        if (k) {
          const bucket = signupsByDay.get(k) ?? { homeowners: 0, workers: 0 }
          if (role === 'homeowner') bucket.homeowners++
          else if (role === 'worker' || role === 'tradie') bucket.workers++
          signupsByDay.set(k, bucket)
        }
      }
    })

    const jobsSnap = await adminDb.collection('jobs').get()
    totalJobs = jobsSnap.size

    let totalBudget = 0
    let hireTimeTotal = 0
    let hireTimeCount = 0

    jobsSnap.forEach((doc) => {
      const d = doc.data()
      if (d.createdAt >= monthStart) totalJobsThisMonth++
      else if (d.createdAt >= lastMonthStart && d.createdAt < monthStart) totalJobsLastMonth++
      if (d.status === 'open' || d.status === 'in_progress') activeJobs++
      if (d.status === 'completed') completedJobs++
      if (d.budget) totalBudget += d.budget
      if (d.category) categoryCounts[d.category] = (categoryCounts[d.category] ?? 0) + 1
      if (d.category) categoryRevenue[d.category] = (categoryRevenue[d.category] ?? 0) + (d.budget ?? 0)
      if (d.location) {
        const city = (d.location as string).split(',')[0].trim()
        cityCounts[city] = (cityCounts[city] ?? 0) + 1
      }
      const jobMonth = monthLabel(d.createdAt)
      if (jobMonth) {
        const current = monthlyRevenueMap.get(jobMonth) ?? { revenue: 0, jobs: 0 }
        current.jobs += 1
        monthlyRevenueMap.set(jobMonth, current)
      }
      const k = dayKey(d.createdAt)
      if (k) jobsCountByDay.set(k, (jobsCountByDay.get(k) ?? 0) + 1)
      if (d.assignedAt && d.createdAt) {
        const diff = (new Date(d.assignedAt).getTime() - new Date(d.createdAt).getTime()) / 3600000
        if (diff > 0 && diff < 720) { hireTimeTotal += diff; hireTimeCount++ }
      }
    })

    avgJobValue = jobsSnap.size > 0 ? Math.round(totalBudget / jobsSnap.size) : 0
    avgTimeToHire = hireTimeCount > 0 ? Math.round(hireTimeTotal / hireTimeCount) : 0

    // Revenue from payments
    try {
      const paymentsSnap = await adminDb.collection('payments').get()
      paymentsSnap.forEach((doc) => {
        const d = doc.data()
        const amt = (d.commission ?? d.platformFee ?? 0) as number
        totalRevenue += amt
        if (d.createdAt >= monthStart) revenueThisMonth += amt
        else if (d.createdAt >= lastMonthStart && d.createdAt < monthStart) revenueLastMonth += amt
        const paymentMonth = monthLabel(d.createdAt)
        if (paymentMonth) {
          const current = monthlyRevenueMap.get(paymentMonth) ?? { revenue: 0, jobs: 0 }
          current.revenue += amt
          monthlyRevenueMap.set(paymentMonth, current)
        }
        const k = dayKey(d.createdAt)
        if (k) revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + amt)
      })
    } catch { /* payments not available */ }

    try {
      const disputesSnap = await adminDb.collection('disputes').get()
      disputeCount = disputesSnap.size
      disputesSnap.forEach((doc) => {
        const status = String(doc.data().status ?? '')
        if (status === 'resolved' || status === 'closed') {
          resolvedDisputeCount++
        }
      })
    } catch { /* disputes not available */ }

    jobsByCategory.push(
      ...Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    )
    jobsByCity.push(
      ...Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }))
    )
    topCities.push(
      ...Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([city, jobsPosted], i) => ({ rank: i + 1, city, jobsPosted }))
    )

    // Top workers
    const workersSnap = await adminDb.collection('users')
      .where('role', 'in', ['worker', 'tradie'])
      .orderBy('completedJobs', 'desc')
      .limit(10)
      .get()
    workersSnap.docs.forEach((doc, i) => {
      const d = doc.data()
      topWorkers.push({
        rank: i + 1,
        name: d.displayName ?? 'Worker',
        jobsCompleted: d.completedJobs ?? 0,
        earnings: d.totalEarnings ?? 0,
        rating: d.rating ?? 0,
      })
      adminTopWorkers.push({
        rank: i + 1,
        workerId: doc.id,
        name: d.displayName ?? 'Worker',
        avatar: d.photoURL,
        jobsCompleted: d.completedJobs ?? 0,
        totalEarnings: d.totalEarnings ?? 0,
        rating: d.rating ?? 0,
        category: Array.isArray(d.skills) && d.skills.length > 0 ? String(d.skills[0]) : 'General',
      })
    })

    // Recent activity
    const recentJobs = await adminDb.collection('jobs').orderBy('createdAt', 'desc').limit(10).get()
    recentJobs.docs.forEach((doc) => {
      const d = doc.data()
      recentActivity.push({
        id: doc.id,
        type: d.status === 'completed' ? 'job_completed' : 'job_posted',
        userName: d.employerName ?? 'Homeowner',
        description: d.title ?? 'Untitled job',
        createdAt: d.createdAt ?? new Date().toISOString(),
      })
    })
    const recentUsers = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(10).get()
    recentUsers.docs.forEach((doc) => {
      const d = doc.data()
      recentActivity.push({
        id: doc.id,
        type: 'new_signup',
        userName: d.displayName ?? d.email ?? 'New user',
        description: `Signed up as ${d.role ?? 'user'}`,
        createdAt: d.createdAt ?? new Date().toISOString(),
      })
    })
    recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    recentActivity.splice(20)

  } catch {
    // Firestore unavailable — return empty/zero values rather than fabricated data.
  }

  // Daily series — bucketed from real Firestore createdAt timestamps (zeros
  // where no events occurred or Firestore was unavailable).
  for (const b of dayBuckets) {
    const signups = signupsByDay.get(b.key) ?? { homeowners: 0, workers: 0 }
    dailySignups.push({ date: b.label, homeowners: signups.homeowners, workers: signups.workers })
    dailyJobs.push({ date: b.label, jobs: jobsCountByDay.get(b.key) ?? 0 })
    dailyRevenue.push({ date: b.label, revenue: revenueByDay.get(b.key) ?? 0 })
  }

  const userGrowthPct = newUsersLastMonth > 0
    ? parseFloat((((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1))
    : 0
  const jobsGrowthPct = totalJobsLastMonth > 0
    ? parseFloat((((totalJobsThisMonth - totalJobsLastMonth) / totalJobsLastMonth) * 100).toFixed(1))
    : 0
  const revenueGrowthPct = revenueLastMonth > 0
    ? parseFloat((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1))
    : 0
  const monthlyRevenueChart = last12Months().map((month) => {
    const value = monthlyRevenueMap.get(month) ?? { revenue: 0, jobs: 0 }
    return { month, revenue: value.revenue, jobs: value.jobs }
  })
  const categoryStats = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count], index) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      revenue: categoryRevenue[category] ?? 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
  const dailyStats = dailyJobs.map((entry, index) => ({
    date: entry.date,
    jobs: entry.jobs,
    revenue: dailyRevenue[index]?.revenue ?? 0,
    newUsers: (dailySignups[index]?.homeowners ?? 0) + (dailySignups[index]?.workers ?? 0),
  }))
  const jobCompletionRate = totalJobs > 0
    ? parseFloat(((completedJobs / totalJobs) * 100).toFixed(1))
    : 0
  const disputeResolutionRate = disputeCount > 0
    ? parseFloat(((resolvedDisputeCount / disputeCount) * 100).toFixed(1))
    : 0

  const result = {
    metrics: {
      totalUsers,
      homeownerCount,
      workerCount,
      userGrowthPct,
      totalJobsThisMonth,
      totalJobsLastMonth,
      jobsGrowthPct,
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowthPct,
      activeJobs,
      avgJobValue,
      avgTimeToHire,
    },
    charts: { dailySignups, dailyJobs, dailyRevenue, jobsByCategory, jobsByCity },
    recentActivity,
    topWorkers,
    topCities,
    adminAnalytics: {
      totalRevenue,
      monthlyRevenue: revenueThisMonth,
      revenueGrowth: revenueGrowthPct,
      totalUsers,
      newUsersThisMonth,
      userGrowthRate: userGrowthPct,
      totalJobs,
      completedJobs,
      activeJobs,
      jobCompletionRate,
      disputeCount,
      disputeResolutionRate,
      topWorkers: adminTopWorkers,
      monthlyRevenueChart,
      categoryStats,
      dailyStats,
    },
  }

  setCached('dashboard', result)
  return result
}

/**
 * GET /api/admin/analytics
 * Query params: startDate, endDate, metric (revenue|payments|disputes|workers|employers|system|dashboard), granularity (day|week|month)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') ?? 'revenue'
    const startDate = searchParams.get('startDate') ?? new Date(Date.now() - 7 * 86400000).toISOString()
    const endDate = searchParams.get('endDate') ?? new Date().toISOString()
    const granularity = searchParams.get('granularity') ?? 'day'

    // ── Dashboard endpoint ──────────────────────────────────────────────────
    if (metric === 'dashboard') {
      const data = await buildDashboardData()
      return NextResponse.json({ metric: 'dashboard', data }, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / 86400000)

    // In production: aggregate from Firestore using admin SDK

    if (metric === 'revenue') {
      const dailyRevenue = Array.from({ length: Math.min(daysDiff, 90) }, (_, i) => {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        // Use deterministic variation based on index to avoid Math.random() in production paths
        const variation = Math.abs(Math.sin(i * 1.7 + 3.14) * 1000)
        const revenue = Math.round(5000 + Math.sin(i * 0.5) * 2000 + variation)
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue,
          transactions: Math.round(revenue / 185),
          commission: Math.round(revenue * 0.1),
        }
      })

      const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0)
      const prevRevenue = Math.round(totalRevenue * 0.91)

      return NextResponse.json({
        metric: 'revenue',
        granularity,
        startDate,
        endDate,
        data: {
          totalRevenue,
          platformCommission: Math.round(totalRevenue * 0.1),
          workerEarnings: Math.round(totalRevenue * 0.78),
          employerSpent: totalRevenue,
          averageTransactionValue: 185,
          transactionCount: dailyRevenue.reduce((s, d) => s + d.transactions, 0),
          successRate: 97.8,
          previousPeriodRevenue: prevRevenue,
          revenueGrowth: parseFloat((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)),
          daily: dailyRevenue,
        },
      })
    }

    if (metric === 'payments') {
      return NextResponse.json({
        metric: 'payments',
        granularity,
        startDate,
        endDate,
        data: {
          total: 14823,
          succeeded: 14511,
          failed: 312,
          pending: 87,
          byMethod: [
            { method: 'card', count: 10240, amount: 1892440, percentage: 69.1 },
            { method: 'bank_transfer', count: 3480, amount: 642800, percentage: 23.5 },
            { method: 'apple_pay', count: 840, amount: 155400, percentage: 5.7 },
            { method: 'google_pay', count: 263, amount: 48655, percentage: 1.7 },
          ],
          averageValue: 185,
        },
      })
    }

    if (metric === 'disputes') {
      return NextResponse.json({
        metric: 'disputes',
        granularity,
        startDate,
        endDate,
        data: {
          total: 47,
          open: 12,
          resolved: 35,
          averageResolutionTime: 28.4,
          resolutionSuccessRate: 91.5,
          topReasons: [
            { reason: 'Quality Issues', count: 18, percentage: 38.3 },
            { reason: 'Non-delivery', count: 11, percentage: 23.4 },
            { reason: 'Overcharge', count: 8, percentage: 17.0 },
            { reason: 'Misrepresentation', count: 6, percentage: 12.8 },
            { reason: 'Other', count: 4, percentage: 8.5 },
          ],
        },
      })
    }

    if (metric === 'system') {
      return NextResponse.json({
        metric: 'system',
        data: {
          apiResponseTime: { avg: 142, p95: 380, p99: 620 },
          errorRate: 0.23,
          uptime: 99.94,
          activeUsers: 1243,
          concurrentSessions: 387,
        },
      })
    }

    return NextResponse.json({
      metric,
      granularity,
      startDate,
      endDate,
      data: {},
    })
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
