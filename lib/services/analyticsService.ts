/**
 * Analytics Service
 * Provides worker and admin analytics data.
 * Currently uses mock data — replace Firestore stubs with real queries when ready.
 */

import { formatCurrency } from '@/lib/utils'

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

// ─── Worker Analytics ─────────────────────────────────────────────────────────

const WORKER_MOCK_MONTHLY: MonthlyRevenue[] = last12Months().map((month, i) => {
  const base = 2500 + Math.sin(i * 0.8) * 800
  const jobs = Math.round(6 + Math.sin(i * 0.6) * 3)
  return { month, revenue: Math.round(base + Math.random() * 500), jobs }
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
 * Fetch analytics for the current worker.
 * TODO: Replace with Firestore queries using workerId.
 */
export async function getWorkerAnalytics(workerId: string): Promise<WorkerAnalytics> {
  void workerId // TODO: use workerId for Firestore queries
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400))

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
