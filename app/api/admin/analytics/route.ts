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
    const startMs = start.getTime()
    const endMs = end.getTime()
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
      return NextResponse.json(
        { error: 'Invalid date range: startDate and endDate must be valid dates and endDate must be on or after startDate' },
        { status: 400 },
      )
    }
    const MS_PER_HOUR = 3_600_000
    const MS_PER_DAY = 86_400_000
    const daysDiff = Math.max(1, Math.ceil((endMs - startMs) / MS_PER_DAY))
    const periodMs = Math.max(1, endMs - startMs)

    // Classify a payment status into the high-level buckets the admin UI
    // reports. Centralised so the `revenue` and `payments` branches stay in
    // sync if Stripe webhook statuses ever change.
    function paymentBucket(status: string): 'succeeded' | 'failed' | 'pending' | 'refunded' | 'other' {
      if (status === 'completed' || status === 'released') return 'succeeded'
      if (status === 'failed') return 'failed'
      if (status === 'pending' || status === 'processing') return 'pending'
      if (status === 'refunded') return 'refunded'
      return 'other'
    }

    // Parse a Firestore value that may be an ISO string, Date, or Timestamp-like
    // ({toDate(): Date}); return ms since epoch or null if unparseable.
    function toMs(value: unknown): number | null {
      if (typeof value === 'string') {
        const t = Date.parse(value)
        return Number.isNaN(t) ? null : t
      }
      if (value instanceof Date) {
        const t = value.getTime()
        return Number.isNaN(t) ? null : t
      }
      if (typeof value === 'object' && value !== null) {
        const maybeToDate = (value as { toDate?: () => Date }).toDate
        if (typeof maybeToDate === 'function') {
          const d = maybeToDate()
          if (d instanceof Date) {
            const t = d.getTime()
            return Number.isNaN(t) ? null : t
          }
        }
      }
      return null
    }

    if (metric === 'revenue') {
      // Day-bucket scaffolding across the requested range (cap chart at 90 days)
      const chartDays = Math.min(daysDiff, 90)
      const chartStart = new Date(end)
      chartStart.setHours(0, 0, 0, 0)
      chartStart.setDate(chartStart.getDate() - (chartDays - 1))
      const dailyKeys: string[] = []
      const dailyLabels: string[] = []
      for (let i = 0; i < chartDays; i++) {
        const d = new Date(chartStart)
        d.setDate(chartStart.getDate() + i)
        dailyKeys.push(d.toISOString().slice(0, 10))
        dailyLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }
      const dailyKeySet = new Set(dailyKeys)
      const revenueByDay = new Map<string, number>()
      const commissionByDay = new Map<string, number>()
      const txByDay = new Map<string, number>()

      let totalGross = 0
      let totalCommission = 0
      let transactionCount = 0
      let succeededCount = 0
      let prevPeriodGross = 0
      const prevStartMs = startMs - periodMs

      try {
        const paymentsSnap = await adminDb.collection('payments').get()
        paymentsSnap.forEach((doc) => {
          const d = doc.data() as Record<string, unknown>
          const createdMs = toMs(d.createdAt)
          if (createdMs === null) return
          const amount = Number(d.amount ?? 0) || 0
          const commission = Number(d.commission ?? d.platformFee ?? 0) || 0
          const status = String(d.status ?? '')

          if (createdMs >= startMs && createdMs <= endMs) {
            totalGross += amount
            totalCommission += commission
            transactionCount++
            if (paymentBucket(status) === 'succeeded') succeededCount++

            const k = new Date(createdMs).toISOString().slice(0, 10)
            if (dailyKeySet.has(k)) {
              revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + amount)
              commissionByDay.set(k, (commissionByDay.get(k) ?? 0) + commission)
              txByDay.set(k, (txByDay.get(k) ?? 0) + 1)
            }
          } else if (createdMs >= prevStartMs && createdMs < startMs) {
            prevPeriodGross += amount
          }
        })
      } catch {
        // Firestore unavailable — fall through to zero-filled response
      }

      const daily = dailyKeys.map((k, i) => ({
        date: dailyLabels[i] ?? k,
        revenue: Math.round(revenueByDay.get(k) ?? 0),
        transactions: txByDay.get(k) ?? 0,
        commission: Math.round(commissionByDay.get(k) ?? 0),
      }))

      const workerEarnings = Math.max(0, Math.round(totalGross - totalCommission))
      const averageTransactionValue = transactionCount > 0
        ? Math.round(totalGross / transactionCount)
        : 0
      const successRate = transactionCount > 0
        ? parseFloat(((succeededCount / transactionCount) * 100).toFixed(1))
        : 0
      const revenueGrowth = prevPeriodGross > 0
        ? parseFloat((((totalGross - prevPeriodGross) / prevPeriodGross) * 100).toFixed(1))
        : 0

      return NextResponse.json({
        metric: 'revenue',
        granularity,
        startDate,
        endDate,
        data: {
          totalRevenue: Math.round(totalGross),
          platformCommission: Math.round(totalCommission),
          workerEarnings,
          employerSpent: Math.round(totalGross),
          averageTransactionValue,
          transactionCount,
          successRate,
          previousPeriodRevenue: Math.round(prevPeriodGross),
          revenueGrowth,
          daily,
        },
      })
    }

    if (metric === 'payments') {
      let total = 0
      let succeeded = 0
      let failed = 0
      let pending = 0
      let refunded = 0
      let totalAmount = 0
      const methodCounts = new Map<string, { count: number; amount: number }>()

      try {
        const paymentsSnap = await adminDb.collection('payments').get()
        paymentsSnap.forEach((doc) => {
          const d = doc.data() as Record<string, unknown>
          const createdMs = toMs(d.createdAt)
          if (createdMs === null || createdMs < startMs || createdMs > endMs) return

          const amount = Number(d.amount ?? 0) || 0
          const status = String(d.status ?? '')
          const method = String(d.paymentMethod ?? d.method ?? 'unknown') || 'unknown'

          total++
          totalAmount += amount
          const bucket = paymentBucket(status)
          if (bucket === 'succeeded') succeeded++
          else if (bucket === 'failed') failed++
          else if (bucket === 'pending') pending++
          else if (bucket === 'refunded') refunded++

          const methodBucket = methodCounts.get(method) ?? { count: 0, amount: 0 }
          methodBucket.count++
          methodBucket.amount += amount
          methodCounts.set(method, methodBucket)
        })
      } catch {
        // Firestore unavailable — fall through to zero response
      }

      const byMethod = Array.from(methodCounts.entries())
        .map(([method, { count, amount }]) => ({
          method,
          count,
          amount: Math.round(amount),
          percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.count - a.count)

      const averageValue = total > 0 ? Math.round(totalAmount / total) : 0

      return NextResponse.json({
        metric: 'payments',
        granularity,
        startDate,
        endDate,
        data: {
          total,
          succeeded,
          failed,
          pending,
          refunded,
          byMethod,
          averageValue,
        },
      })
    }

    if (metric === 'disputes') {
      let total = 0
      let open = 0
      let resolved = 0
      let resolutionTimeTotalHours = 0
      let resolutionTimeCount = 0
      const reasonCounts = new Map<string, number>()

      try {
        const disputesSnap = await adminDb.collection('disputes').get()
        disputesSnap.forEach((doc) => {
          const d = doc.data() as Record<string, unknown>
          const createdMs = toMs(d.createdAt)
          if (createdMs === null || createdMs < startMs || createdMs > endMs) return

          const status = String(d.status ?? '')
          total++
          if (status === 'resolved' || status === 'closed' || status === 'refunded') resolved++
          else open++

          const resolvedMs = toMs(d.resolvedAt)
          if (resolvedMs !== null && resolvedMs >= createdMs) {
            resolutionTimeTotalHours += (resolvedMs - createdMs) / MS_PER_HOUR
            resolutionTimeCount++
          }

          const reason = String(d.reason ?? 'other') || 'other'
          reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1)
        })
      } catch {
        // Firestore unavailable — fall through to zero response
      }

      const averageResolutionTime = resolutionTimeCount > 0
        ? parseFloat((resolutionTimeTotalHours / resolutionTimeCount).toFixed(1))
        : 0
      const resolutionSuccessRate = total > 0
        ? parseFloat(((resolved / total) * 100).toFixed(1))
        : 0
      const topReasons = Array.from(reasonCounts.entries())
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return NextResponse.json({
        metric: 'disputes',
        granularity,
        startDate,
        endDate,
        data: {
          total,
          open,
          resolved,
          averageResolutionTime,
          resolutionSuccessRate,
          topReasons,
        },
      })
    }

    if (metric === 'system') {
      // No runtime telemetry collection exists yet; surface zeros rather than
      // fabricated values so the admin UI clearly reflects the absence of data.
      // Wire this to Sentry / a metrics collection in a follow-up.
      return NextResponse.json({
        metric: 'system',
        data: {
          apiResponseTime: { avg: 0, p95: 0, p99: 0 },
          errorRate: 0,
          uptime: 0,
          activeUsers: 0,
          concurrentSessions: 0,
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
