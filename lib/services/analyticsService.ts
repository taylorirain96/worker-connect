/**
 * Analytics Service
 * Provides worker and admin analytics data.
 * Worker analytics: backed by real Firestore queries with mock fallback.
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

// ─── Worker mock-data constants (used as fallback) ─────────────────────────────

const WORKER_MOCK_MONTHLY: MonthlyRevenue[] = last12Months().map((month, i) => {
  const base = 2500 + Math.sin(i * 0.8) * 800
  const jobs = Math.round(6 + Math.sin(i * 0.6) * 3)
  return { month, revenue: Math.round(base), jobs }
})

const WORKER_MOCK_WEEKLY: WeeklyActivity[] = last7Days().map((day, i) => ({
  day,
  jobs: [2, 3, 1, 4, 3, 5, 2][i],
  earnings: [320, 480, 150, 620, 510, 780, 295][i],
}))

const CATEGORY_COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#84cc16',
]

const WORKER_CATEGORIES: JobCategoryBreakdown[] = [
  { category: 'Plumbing',     count: 18, revenue: 4320, color: CATEGORY_COLORS[0] },
  { category: 'Electrical',   count: 12, revenue: 5100, color: CATEGORY_COLORS[1] },
  { category: 'Carpentry',    count: 8,  revenue: 2640, color: CATEGORY_COLORS[2] },
  { category: 'HVAC',         count: 6,  revenue: 3180, color: CATEGORY_COLORS[3] },
  { category: 'General',      count: 10, revenue: 1850, color: CATEGORY_COLORS[4] },
  { category: 'Painting',     count: 5,  revenue: 1200, color: CATEGORY_COLORS[5] },
]

const RECENT_JOBS: RecentJobEntry[] = [
  { id: 'j1', title: 'Fix Leaking Kitchen Pipe', employer: 'John Smith', status: 'completed', earnings: 320, date: new Date(Date.now() - 86400000).toISOString(), rating: 5, category: 'Plumbing' },
  { id: 'j2', title: 'Install Electrical Panel', employer: 'Sarah Johnson', status: 'in_progress', earnings: 850, date: new Date(Date.now() - 2 * 86400000).toISOString(), category: 'Electrical' },
  { id: 'j3', title: 'HVAC Maintenance', employer: 'Mike Williams', status: 'completed', earnings: 200, date: new Date(Date.now() - 3 * 86400000).toISOString(), rating: 4, category: 'HVAC' },
  { id: 'j4', title: 'Deck Repair', employer: 'Linda Davis', status: 'completed', earnings: 480, date: new Date(Date.now() - 5 * 86400000).toISOString(), rating: 5, category: 'Carpentry' },
  { id: 'j5', title: 'Interior Painting', employer: 'Bob Wilson', status: 'cancelled', earnings: 0, date: new Date(Date.now() - 7 * 86400000).toISOString(), category: 'Painting' },
  { id: 'j6', title: 'Bathroom Renovation', employer: 'Carol Brown', status: 'completed', earnings: 1200, date: new Date(Date.now() - 9 * 86400000).toISOString(), rating: 5, category: 'General' },
]

const STATUS_BREAKDOWN: StatusBreakdownEntry[] = [
  { status: 'Completed',   count: 47, color: '#10b981' },
  { status: 'In Progress', count: 3,  color: '#3b82f6' },
  { status: 'Pending',     count: 5,  color: '#f59e0b' },
  { status: 'Cancelled',   count: 4,  color: '#ef4444' },
]



/**
 * Fetch analytics for the current worker from Firestore.
 * Falls back to mock data when Firestore is unavailable.
 */
export async function getWorkerAnalytics(workerId: string): Promise<WorkerAnalytics> {
  if (!db) {
    return getMockWorkerAnalytics()
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
        ? Math.round((completedJobs.length / (jobs.length - pendingJobs.length || 1)) * 100)
        : 0
    const cancellationRate =
      jobs.length > 0 ? Math.round((cancelledJobs.length / jobs.length) * 100) : 0

    return {
      totalEarnings,
      jobsCompleted: completedJobs.length,
      averageRating,
      responseTimeHours: 1.4, // requires message-response tracking; use default until implemented
      acceptanceRate: 82,     // requires application-tracking; use default until implemented
      completionRate,
      onTimeRate: 91,         // requires on-time completion tracking; use default until implemented
      cancellationRate,
      avgJobDurationHours: 3.2, // requires duration tracking; use default until implemented
      customerSatisfaction: reviews.length > 0 ? Math.round(averageRating * 20) : 96,
      monthlyRevenue,
      weeklyActivity: WORKER_MOCK_WEEKLY,
      categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : WORKER_CATEGORIES,
      projectedNextMonthEarnings,
      recentJobs: recentJobs.length > 0 ? recentJobs : RECENT_JOBS,
      statusBreakdown,
    }
  } catch {
    // Fall back to mock data when Firestore is unavailable or indexes not yet created
    return getMockWorkerAnalytics()
  }
}

function getMockWorkerAnalytics(): WorkerAnalytics {
  const totalEarnings = WORKER_MOCK_MONTHLY.reduce((s, m) => s + m.revenue, 0)
  const lastMonth = WORKER_MOCK_MONTHLY[WORKER_MOCK_MONTHLY.length - 1].revenue
  const prevMonth = WORKER_MOCK_MONTHLY[WORKER_MOCK_MONTHLY.length - 2].revenue
  const projectedNextMonthEarnings = Math.round(lastMonth * 1.08 + (lastMonth - prevMonth) * 0.3)

  return {
    totalEarnings,
    jobsCompleted: 59,
    averageRating: 4.8,
    responseTimeHours: 1.4,
    acceptanceRate: 82,
    completionRate: 94,
    onTimeRate: 91,
    cancellationRate: 6,
    avgJobDurationHours: 3.2,
    customerSatisfaction: 96,
    monthlyRevenue: WORKER_MOCK_MONTHLY,
    weeklyActivity: WORKER_MOCK_WEEKLY,
    categoryBreakdown: WORKER_CATEGORIES,
    projectedNextMonthEarnings,
    recentJobs: RECENT_JOBS,
    statusBreakdown: STATUS_BREAKDOWN,
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

/**
 * Fetch platform-wide analytics for admins.
 * TODO: Replace with Firestore aggregation queries.
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
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
