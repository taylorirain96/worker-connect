/**
 * Analytics Service
 * Provides worker and admin analytics data.
 * Worker analytics: backed by real Firestore queries; returns empty/zero values
 *   when Firestore is unavailable or the worker has no data.
 * Admin analytics: uses mock data pending a dedicated server-side aggregation route.
 */

import { formatCurrency } from '@/lib/utils'
import type { EarningsTrend, GrowthScore } from '@/types'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string        // e.g. "Jan"
  revenue: number
  jobs: number
}

export interface WeeklyActivity {
  day: string          // e.g. "Mon"
  jobs: number
  earnings: number
}

export interface JobCategoryBreakdown {
  category: string
  count: number
  revenue: number
  color: string
}

export interface WorkerAnalytics {
  totalEarnings: number
  jobsCompleted: number
  averageRating: number
  responseTimeHours: number
  acceptanceRate: number
  completionRate: number
  onTimeRate: number
  cancellationRate: number
  avgJobDurationHours: number
  customerSatisfaction: number
  monthlyRevenue: MonthlyRevenue[]
  weeklyActivity: WeeklyActivity[]
  categoryBreakdown: JobCategoryBreakdown[]
  projectedNextMonthEarnings: number
  recentJobs: RecentJobEntry[]
  statusBreakdown: StatusBreakdownEntry[]
}

export interface RecentJobEntry {
  id: string
  title: string
  employer: string
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled'
  earnings: number
  date: string
  rating?: number
  category: string
}

export interface StatusBreakdownEntry {
  status: string
  count: number
  color: string
}

export interface AdminAnalytics {
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
  topWorkers: TopWorkerEntry[]
  monthlyRevenueChart: MonthlyRevenue[]
  categoryStats: JobCategoryBreakdown[]
  dailyStats: DailyStat[]
}

export interface TopWorkerEntry {
  rank: number
  workerId: string
  name: string
  avatar?: string
  jobsCompleted: number
  totalEarnings: number
  rating: number
  category: string
}

export interface DailyStat {
  date: string         // e.g. "Apr 1"
  jobs: number
  revenue: number
  newUsers: number
}

// ─── Mock data helpers ─────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function currentMonthIndex() {
  return new Date().getMonth()
}

function last12Months(): string[] {
  const idx = currentMonthIndex()
  return Array.from({ length: 12 }, (_, i) => MONTHS[(idx - 11 + i + 12) % 12])
}

function last7Days(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

function last30DayLabels(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 29 + i)
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
  })
}

// ─── Worker analytics helpers ─────────────────────────────────────────────────

const CATEGORY_COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#84cc16',
]

/**
 * Best-effort extraction of a `Date` from a Firestore field that may be a
 * Timestamp (with `.toDate()`), an ISO string, or missing.
 */
function toDate(value: unknown): Date | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value &&
      typeof (value as { toDate: unknown }).toDate === 'function') {
    const d = (value as { toDate: () => Date }).toDate()
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

function emptyWorkerAnalytics(): WorkerAnalytics {
  return {
    totalEarnings: 0,
    jobsCompleted: 0,
    averageRating: 0,
    responseTimeHours: 0,
    acceptanceRate: 0,
    completionRate: 0,
    onTimeRate: 0,
    cancellationRate: 0,
    avgJobDurationHours: 0,
    customerSatisfaction: 0,
    monthlyRevenue: last12Months().map((month) => ({ month, revenue: 0, jobs: 0 })),
    weeklyActivity: last7Days().map((day) => ({ day, jobs: 0, earnings: 0 })),
    categoryBreakdown: [],
    projectedNextMonthEarnings: 0,
    recentJobs: [],
    statusBreakdown: [
      { status: 'Completed', count: 0, color: '#10b981' },
      { status: 'In Progress', count: 0, color: '#3b82f6' },
      { status: 'Pending', count: 0, color: '#f59e0b' },
      { status: 'Cancelled', count: 0, color: '#ef4444' },
    ],
  }
}

/**
 * Fetch analytics for the current worker from Firestore.
 * Returns an empty analytics object when Firestore is unavailable or the
 * worker has no data yet.
 */
export async function getWorkerAnalytics(workerId: string): Promise<WorkerAnalytics> {
  if (!db) {
    return emptyWorkerAnalytics()
  }

  try {
    // Query all jobs assigned to this worker
    const jobsSnap: QuerySnapshot<DocumentData> = await getDocs(
      query(
        collection(db, 'jobs'),
        where('assignedWorkerId', '==', workerId),
        orderBy('updatedAt', 'desc'),
        limit(200)
      )
    )

    // Query reviews for this worker
    const reviewsSnap: QuerySnapshot<DocumentData> = await getDocs(
      query(collection(db, 'reviews'), where('workerId', '==', workerId), limit(200))
    )

    const jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentData & { id: string }))
    const completedJobs = jobs.filter((j) => j.status === 'completed')
    const cancelledJobs = jobs.filter((j) => j.status === 'cancelled')

    const totalEarnings = completedJobs.reduce((sum, j) => sum + (typeof j.budget === 'number' ? j.budget : 0), 0)

    // Average rating from reviews
    const reviews = reviewsSnap.docs.map((d) => d.data())
    const averageRating =
      reviews.length > 0
        ? parseFloat(
            (reviews.reduce((sum, r) => sum + (typeof r.rating === 'number' ? r.rating : 0), 0) / reviews.length).toFixed(1)
          )
        : 0

    // Monthly revenue: group completed jobs by calendar month
    const monthlyMap = new Map<string, { revenue: number; jobs: number }>()
    for (const job of completedJobs) {
      const date: Date =
        job.updatedAt?.toDate?.() ?? (job.updatedAt ? new Date(job.updatedAt as string) : new Date())
      const key = date.toLocaleDateString('en-US', { month: 'short' })
      const existing = monthlyMap.get(key) ?? { revenue: 0, jobs: 0 }
      existing.revenue += typeof job.budget === 'number' ? job.budget : 0
      existing.jobs += 1
      monthlyMap.set(key, existing)
    }
    // Ensure we have all 12 months in the correct order
    const months = last12Months()
    const monthlyRevenue: MonthlyRevenue[] = months.map((month) => {
      const entry = monthlyMap.get(month) ?? { revenue: 0, jobs: 0 }
      return { month, revenue: entry.revenue, jobs: entry.jobs }
    })

    // Category breakdown
    const categoryMap = new Map<string, { count: number; revenue: number }>()
    for (const job of completedJobs) {
      const cat = (job.category as string | undefined) ?? 'General'
      const existing = categoryMap.get(cat) ?? { count: 0, revenue: 0 }
      existing.count += 1
      existing.revenue += typeof job.budget === 'number' ? job.budget : 0
      categoryMap.set(cat, existing)
    }
    const categoryBreakdown: JobCategoryBreakdown[] = Array.from(categoryMap.entries()).map(
      ([category, val], i) => ({
        category,
        count: val.count,
        revenue: val.revenue,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      })
    )

    // Recent jobs (last 6)
    const recentJobs: RecentJobEntry[] = jobs.slice(0, 6).map((job) => {
      const date: Date =
        job.updatedAt?.toDate?.() ?? (job.updatedAt ? new Date(job.updatedAt as string) : new Date())
      return {
        id: job.id,
        title: (job.title as string | undefined) ?? 'Untitled Job',
        employer: (job.employerName as string | undefined) ?? 'Client',
        status: (job.status as RecentJobEntry['status']) ?? 'pending',
        earnings: typeof job.budget === 'number' ? job.budget : 0,
        date: date.toISOString(),
        rating: undefined,
        category: (job.category as string | undefined) ?? 'General',
      }
    })

    // Status breakdown
    const inProgressJobs = jobs.filter((j) => j.status === 'in_progress')
    const pendingJobs = jobs.filter((j) => j.status === 'pending' || j.status === 'open')
    const statusBreakdown: StatusBreakdownEntry[] = [
      { status: 'Completed', count: completedJobs.length, color: '#10b981' },
      { status: 'In Progress', count: inProgressJobs.length, color: '#3b82f6' },
      { status: 'Pending', count: pendingJobs.length, color: '#f59e0b' },
      { status: 'Cancelled', count: cancelledJobs.length, color: '#ef4444' },
    ]

    const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0
    const prevMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.revenue ?? 0
    const projectedNextMonthEarnings = Math.round(
      lastMonthRevenue * 1.08 + (lastMonthRevenue - prevMonthRevenue) * 0.3
    )

    const completionRate =
      jobs.length > 0
        ? Math.round((completedJobs.length / Math.max(jobs.length - pendingJobs.length, 1)) * 100)
        : 0
    const cancellationRate =
      jobs.length > 0 ? Math.round((cancelledJobs.length / jobs.length) * 100) : 0

    // Weekly activity: group completed jobs by day-of-week over the last 7 days
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(weekStart.getDate() - 6)
    // Indexed by JS Date#getDay() (0 = Sun .. 6 = Sat); the final array is
    // re-ordered to Mon..Sun below to match last7Days().
    const DAY_LABELS_BY_GETDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeklyMap = new Map<string, { jobs: number; earnings: number }>()
    for (const job of completedJobs) {
      const completedDate = toDate(job.completedAt) ?? toDate(job.updatedAt)
      if (!completedDate || completedDate < weekStart || completedDate > now) continue
      const key = DAY_LABELS_BY_GETDAY[completedDate.getDay()]
      const existing = weeklyMap.get(key) ?? { jobs: 0, earnings: 0 }
      existing.jobs += 1
      existing.earnings += typeof job.budget === 'number' ? job.budget : 0
      weeklyMap.set(key, existing)
    }
    // Emit Mon..Sun in order, matching last7Days()
    const weeklyActivity: WeeklyActivity[] = last7Days().map((day) => {
      const entry = weeklyMap.get(day) ?? { jobs: 0, earnings: 0 }
      return { day, jobs: entry.jobs, earnings: entry.earnings }
    })

    // On-time rate: of completed jobs with a deadline, fraction completed on or before it
    const completedWithDeadline = completedJobs
      .map((j) => ({ deadline: toDate(j.deadline), completedAt: toDate(j.completedAt) }))
      .filter((j): j is { deadline: Date; completedAt: Date } => j.deadline !== null && j.completedAt !== null)
    const onTimeCount = completedWithDeadline.filter(
      (j) => j.completedAt.getTime() <= j.deadline.getTime()
    ).length
    const onTimeRate =
      completedWithDeadline.length > 0
        ? Math.round((onTimeCount / completedWithDeadline.length) * 100)
        : 0

    return {
      totalEarnings,
      jobsCompleted: completedJobs.length,
      averageRating,
      // The following metrics require additional tracking not yet captured in
      // Firestore (message-response timing, application accept/decline events,
      // and per-job start/end timestamps). They are reported as 0 until the
      // backing data is wired through.
      responseTimeHours: 0,
      acceptanceRate: 0,
      completionRate,
      onTimeRate,
      cancellationRate,
      avgJobDurationHours: 0,
      customerSatisfaction: reviews.length > 0 ? Math.round(averageRating * 20) : 0,
      monthlyRevenue,
      weeklyActivity,
      categoryBreakdown,
      projectedNextMonthEarnings,
      recentJobs,
      statusBreakdown,
    }
  } catch {
    // Return empty analytics when Firestore is unavailable or indexes are missing
    return emptyWorkerAnalytics()
  }
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────

const ADMIN_MONTHLY_REVENUE: MonthlyRevenue[] = last12Months().map((month, i) => {
  const base = 150000 + i * 8000
  return {
    month,
    revenue: Math.round(base + Math.sin(i * 0.7) * 20000),
    jobs: Math.round(3200 + i * 120 + Math.sin(i * 0.5) * 300),
  }
})

const ADMIN_DAILY_STATS: DailyStat[] = last30DayLabels().map((date, i) => ({
  date,
  jobs: Math.round(100 + Math.sin(i * 0.5) * 30 + Math.random() * 20),
  revenue: Math.round(6000 + Math.sin(i * 0.5) * 2000 + Math.random() * 1000),
  newUsers: Math.round(40 + Math.sin(i * 0.3) * 15 + Math.random() * 10),
}))

const TOP_WORKERS: TopWorkerEntry[] = [
  { rank: 1, workerId: 'w1', name: 'Marcus Johnson',   jobsCompleted: 124, totalEarnings: 28400, rating: 4.9, category: 'Electrical' },
  { rank: 2, workerId: 'w2', name: 'Elena Rodriguez',  jobsCompleted: 98,  totalEarnings: 22100, rating: 4.8, category: 'Plumbing' },
  { rank: 3, workerId: 'w3', name: 'David Chen',       jobsCompleted: 87,  totalEarnings: 19600, rating: 4.9, category: 'HVAC' },
  { rank: 4, workerId: 'w4', name: 'Sarah Thompson',   jobsCompleted: 76,  totalEarnings: 16800, rating: 4.7, category: 'Carpentry' },
  { rank: 5, workerId: 'w5', name: 'James Williams',   jobsCompleted: 71,  totalEarnings: 15200, rating: 4.8, category: 'Roofing' },
]

const ADMIN_CATEGORIES: JobCategoryBreakdown[] = [
  { category: 'Plumbing',     count: 8240,  revenue: 1980000, color: CATEGORY_COLORS[0] },
  { category: 'Electrical',   count: 6810,  revenue: 2890000, color: CATEGORY_COLORS[1] },
  { category: 'Carpentry',    count: 5120,  revenue: 1540000, color: CATEGORY_COLORS[2] },
  { category: 'HVAC',         count: 4380,  revenue: 2310000, color: CATEGORY_COLORS[3] },
  { category: 'Roofing',      count: 3210,  revenue: 1720000, color: CATEGORY_COLORS[4] },
  { category: 'Landscaping',  count: 4820,  revenue: 960000,  color: CATEGORY_COLORS[5] },
  { category: 'Painting',     count: 3960,  revenue: 890000,  color: CATEGORY_COLORS[6] },
  { category: 'General',      count: 7420,  revenue: 1340000, color: CATEGORY_COLORS[7] },
]

interface AdminAnalyticsApiResponse {
  data?: {
    adminAnalytics?: AdminAnalytics
  }
}

/**
 * Fetch platform-wide analytics for admins.
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  try {
    const response = await fetch('/api/admin/analytics?metric=dashboard', {
      headers: {
        Accept: 'application/json',
      },
    })
    if (response.ok) {
      const payload = await response.json() as AdminAnalyticsApiResponse
      if (payload.data?.adminAnalytics) {
        return payload.data.adminAnalytics
      }
    }
  } catch {
    // Fall through to the legacy mock payload when the API is unavailable locally.
  }

  await new Promise((r) => setTimeout(r, 400))

  const lastMonthRevenue = ADMIN_MONTHLY_REVENUE[ADMIN_MONTHLY_REVENUE.length - 1].revenue
  const prevMonthRevenue = ADMIN_MONTHLY_REVENUE[ADMIN_MONTHLY_REVENUE.length - 2].revenue
  const revenueGrowth = parseFloat(
    (((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
  )

  return {
    totalRevenue: 2_850_000,
    monthlyRevenue: lastMonthRevenue,
    revenueGrowth,
    totalUsers: 12_483,
    newUsersThisMonth: 842,
    userGrowthRate: 7.2,
    totalJobs: 45_892,
    completedJobs: 38_765,
    activeJobs: 1_243,
    jobCompletionRate: 84.5,
    disputeCount: 47,
    disputeResolutionRate: 91.5,
    topWorkers: TOP_WORKERS,
    monthlyRevenueChart: ADMIN_MONTHLY_REVENUE,
    categoryStats: ADMIN_CATEGORIES,
    dailyStats: ADMIN_DAILY_STATS,
  }
}

// ─── CSV export helper ────────────────────────────────────────────────────────

export function exportWorkerAnalyticsCSV(analytics: WorkerAnalytics): void {
  const rows: string[][] = [
    ['Metric', 'Value'],
    ['Total Earnings', formatCurrency(analytics.totalEarnings)],
    ['Jobs Completed', String(analytics.jobsCompleted)],
    ['Average Rating', analytics.averageRating.toFixed(1)],
    ['Response Time (hrs)', analytics.responseTimeHours.toFixed(1)],
    ['Acceptance Rate (%)', String(analytics.acceptanceRate)],
    ['Completion Rate (%)', String(analytics.completionRate)],
    ['On-Time Rate (%)', String(analytics.onTimeRate)],
    ['Cancellation Rate (%)', String(analytics.cancellationRate)],
    ['Avg Job Duration (hrs)', analytics.avgJobDurationHours.toFixed(1)],
    ['Customer Satisfaction (%)', String(analytics.customerSatisfaction)],
    [],
    ['Month', 'Revenue', 'Jobs'],
    ...analytics.monthlyRevenue.map((m) => [m.month, String(m.revenue), String(m.jobs)]),
  ]

  const csv = rows.map((r) => r.join(',')).join('\n')
  downloadCSV(csv, 'worker-analytics.csv')
}

export function exportAdminAnalyticsCSV(analytics: AdminAnalytics): void {
  const rows: string[][] = [
    ['Metric', 'Value'],
    ['Total Revenue', formatCurrency(analytics.totalRevenue)],
    ['Monthly Revenue', formatCurrency(analytics.monthlyRevenue)],
    ['Revenue Growth (%)', String(analytics.revenueGrowth)],
    ['Total Users', String(analytics.totalUsers)],
    ['New Users This Month', String(analytics.newUsersThisMonth)],
    ['Total Jobs', String(analytics.totalJobs)],
    ['Completed Jobs', String(analytics.completedJobs)],
    ['Job Completion Rate (%)', String(analytics.jobCompletionRate)],
    [],
    ['Month', 'Revenue', 'Jobs'],
    ...analytics.monthlyRevenueChart.map((m) => [m.month, String(m.revenue), String(m.jobs)]),
  ]

  const csv = rows.map((r) => r.join(',')).join('\n')
  downloadCSV(csv, 'admin-analytics.csv')
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Growth & Intelligence additions ──────────────────────────────────────────

export async function getEarningsTrends(
  _workerId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly'
): Promise<EarningsTrend[]> {
  await new Promise((r) => setTimeout(r, 300))

  if (period === 'monthly') {
    return last12Months().map((p, i) => {
      const earnings = Math.round(2500 + Math.sin(i * 0.8) * 800 + Math.random() * 500)
      const jobs = Math.round(6 + Math.sin(i * 0.6) * 3)
      return { period: p, earnings, jobs, avgPerJob: Math.round(earnings / jobs) }
    })
  }
  if (period === 'weekly') {
    return Array.from({ length: 12 }, (_, i) => {
      const earnings = Math.round(700 + Math.sin(i * 0.5) * 200)
      const jobs = Math.round(2 + Math.sin(i * 0.4))
      return { period: `Wk ${i + 1}`, earnings, jobs, avgPerJob: Math.round(earnings / Math.max(1, jobs)) }
    })
  }
  return last30DayLabels().slice(0, 14).map((p, i) => {
    const earnings = Math.round(180 + Math.sin(i * 0.7) * 80)
    const jobs = Math.round(1 + Math.sin(i * 0.5) * 0.5)
    return { period: p, earnings, jobs, avgPerJob: Math.round(earnings / Math.max(1, jobs)) }
  })
}

export async function getGrowthScore(_workerId: string): Promise<GrowthScore> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    score: 76,
    trend: 'up',
    breakdown: {
      earnings:       80,
      completionRate: 90,
      rating:         85,
      engagement:     70,
      growth:         65,
    },
    calculatedAt: new Date().toISOString(),
  }
}

export async function getSkillsDemand(
  _workerId: string
): Promise<Array<{ skill: string; demand: number; trend: string; avgRate: number }>> {
  await new Promise((r) => setTimeout(r, 200))
  return [
    { skill: 'Plumbing',   demand: 92, trend: 'up',     avgRate: 75 },
    { skill: 'Electrical', demand: 88, trend: 'up',     avgRate: 90 },
    { skill: 'HVAC',       demand: 85, trend: 'stable', avgRate: 105 },
    { skill: 'Carpentry',  demand: 76, trend: 'stable', avgRate: 72 },
    { skill: 'Painting',   demand: 68, trend: 'down',   avgRate: 60 },
    { skill: 'Roofing',    demand: 81, trend: 'up',     avgRate: 95 },
  ]
}
