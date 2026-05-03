'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  Users, Briefcase, DollarSign, Clock, TrendingUp, Activity,
  UserPlus, CheckCircle, AlertTriangle, CreditCard, Star, MapPin,
  RefreshCw,
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics {
  totalUsers: number
  homeownerCount: number
  workerCount: number
  userGrowthPct: number
  totalJobsThisMonth: number
  totalJobsLastMonth: number
  jobsGrowthPct: number
  revenueThisMonth: number
  revenueLastMonth: number
  revenueGrowthPct: number
  activeJobs: number
  avgJobValue: number
  avgTimeToHire: number
}

interface DailySignup { date: string; homeowners: number; workers: number }
interface DailyJobs { date: string; jobs: number }
interface DailyRevenue { date: string; revenue: number }
interface CategoryStat { name: string; value: number }

interface ActivityEvent {
  id: string
  type: string
  userName: string
  description: string
  createdAt: string
}

interface TopWorker {
  rank: number
  name: string
  jobsCompleted: number
  earnings: number
  rating: number
}

interface TopCity { rank: number; city: string; jobsPosted: number }

interface DashboardData {
  metrics: Metrics
  charts: {
    dailySignups: DailySignup[]
    dailyJobs: DailyJobs[]
    dailyRevenue: DailyRevenue[]
    jobsByCategory: CategoryStat[]
    jobsByCity: CategoryStat[]
  }
  recentActivity: ActivityEvent[]
  topWorkers: TopWorker[]
  topCities: TopCity[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNZD(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

function fmtRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  new_signup: UserPlus,
  job_posted: Briefcase,
  job_completed: CheckCircle,
  dispute_raised: AlertTriangle,
  payment_released: CreditCard,
}

const EVENT_COLOURS: Record<string, string> = {
  new_signup: 'text-indigo-400',
  job_posted: 'text-amber-400',
  job_completed: 'text-green-400',
  dispute_raised: 'text-red-400',
  payment_released: 'text-teal-400',
}

const EVENT_LABELS: Record<string, string> = {
  new_signup: 'New signup',
  job_posted: 'Job posted',
  job_completed: 'Job completed',
  dispute_raised: 'Dispute raised',
  payment_released: 'Payment released',
}

const PIE_COLOURS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e',
  '#a78bfa', '#34d399', '#fb923c', '#38bdf8', '#e879f9',
]

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, growth, icon: Icon, iconBg, iconColour,
}: {
  label: string
  value: string | number
  sub?: string
  growth?: number
  icon: React.ElementType
  iconBg: string
  iconColour: string
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColour}`} />
        </div>
        {growth !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            growth >= 0 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
          }`}>
            <TrendingUp className={`h-3 w-3 ${growth < 0 ? 'rotate-180' : ''}`} />
            {growth >= 0 ? '+' : ''}{growth}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">{children}</h2>
  )
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; prefix?: string; suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      {label && <p className="text-slate-400 mb-2">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-NZ') : p.value}{suffix}
        </p>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/analytics?metric=dashboard')
      const json = await res.json()
      setData(json.data ?? null)
    } catch {
      // silently fail — dashboard shows empty state
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">
        Failed to load analytics. Check API connection.
      </div>
    )
  }

  const { metrics, charts, recentActivity, topWorkers, topCities } = data

  return (
    <div className="p-6 space-y-8">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Key metric cards ───────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Key Metrics</SectionHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            label="Total Users"
            value={metrics.totalUsers.toLocaleString('en-NZ')}
            sub={`${metrics.homeownerCount.toLocaleString()} homeowners · ${metrics.workerCount.toLocaleString()} workers`}
            growth={metrics.userGrowthPct}
            icon={Users}
            iconBg="bg-blue-900/40"
            iconColour="text-blue-400"
          />
          <MetricCard
            label="Jobs This Month"
            value={metrics.totalJobsThisMonth.toLocaleString('en-NZ')}
            sub={`${metrics.totalJobsLastMonth.toLocaleString()} last month`}
            growth={metrics.jobsGrowthPct}
            icon={Briefcase}
            iconBg="bg-amber-900/40"
            iconColour="text-amber-400"
          />
          <MetricCard
            label="Revenue This Month"
            value={fmtNZD(metrics.revenueThisMonth)}
            sub={`${fmtNZD(metrics.revenueLastMonth)} last month`}
            growth={metrics.revenueGrowthPct}
            icon={DollarSign}
            iconBg="bg-green-900/40"
            iconColour="text-green-400"
          />
          <MetricCard
            label="Active Jobs"
            value={metrics.activeJobs.toLocaleString('en-NZ')}
            sub="Right now"
            icon={Activity}
            iconBg="bg-teal-900/40"
            iconColour="text-teal-400"
          />
          <MetricCard
            label="Avg Job Value"
            value={fmtNZD(metrics.avgJobValue)}
            sub="Per job posted"
            icon={TrendingUp}
            iconBg="bg-purple-900/40"
            iconColour="text-purple-400"
          />
          <MetricCard
            label="Avg Time to Hire"
            value={metrics.avgTimeToHire > 0 ? `${metrics.avgTimeToHire}h` : '—'}
            sub="From post to assigned"
            icon={Clock}
            iconBg="bg-rose-900/40"
            iconColour="text-rose-400"
          />
        </div>
      </section>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Trends — Last 30 Days</SectionHeading>
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Line chart: signups */}
          <ChartCard title="New User Signups">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.dailySignups} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="homeowners" name="Homeowners" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="workers" name="Workers" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar chart: jobs posted */}
          <ChartCard title="Jobs Posted Per Day">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.dailyJobs} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jobs" name="Jobs" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar chart: revenue */}
          <ChartCard title="Revenue Per Day (NZD)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.dailyRevenue} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie: jobs by category */}
          <ChartCard title="Jobs by Trade Category">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.jobsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {charts.jobsByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString('en-NZ')} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Pie: jobs by NZ city */}
          <ChartCard title="Jobs by NZ City / Region">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.jobsByCity}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {charts.jobsByCity.map((_, i) => (
                      <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString('en-NZ')} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* ── Recent activity + Top performers ──────────────────────────────── */}
      <section>
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Recent activity feed */}
          <div className="bg-slate-800 rounded-xl p-5">
            <SectionHeading>Recent Activity</SectionHeading>
            <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
              {recentActivity.map((event) => {
                const Icon = EVENT_ICONS[event.type] ?? Activity
                const colour = EVENT_COLOURS[event.type] ?? 'text-slate-400'
                const label = EVENT_LABELS[event.type] ?? event.type
                return (
                  <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-slate-700 last:border-0">
                    <div className={`h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 ${colour}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white leading-tight">
                        <span className="font-medium">{event.userName}</span>
                        {' — '}{event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={
                            event.type === 'dispute_raised' ? 'danger'
                              : event.type === 'job_completed' || event.type === 'payment_released' ? 'success'
                                : event.type === 'job_posted' ? 'warning' : 'info'
                          }
                          size="sm"
                        >
                          {label}
                        </Badge>
                        <span className="text-xs text-slate-500">{fmtRelative(event.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top performers */}
          <div className="space-y-6">
            {/* Top workers */}
            <div className="bg-slate-800 rounded-xl p-5">
              <SectionHeading>Top 10 Workers</SectionHeading>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left">
                      <th className="pb-2 text-xs text-slate-400 font-medium w-8">#</th>
                      <th className="pb-2 text-xs text-slate-400 font-medium">Name</th>
                      <th className="pb-2 text-xs text-slate-400 font-medium text-right">Jobs</th>
                      <th className="pb-2 text-xs text-slate-400 font-medium text-right">Earnings</th>
                      <th className="pb-2 text-xs text-slate-400 font-medium text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {topWorkers.map((w) => (
                      <tr key={w.rank} className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-2 text-slate-500 text-xs">{w.rank}</td>
                        <td className="py-2 text-white font-medium truncate max-w-[120px]">{w.name}</td>
                        <td className="py-2 text-slate-300 text-right">{w.jobsCompleted}</td>
                        <td className="py-2 text-green-400 text-right whitespace-nowrap">{fmtNZD(w.earnings)}</td>
                        <td className="py-2 text-right">
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {w.rating > 0 ? w.rating.toFixed(1) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top cities */}
            <div className="bg-slate-800 rounded-xl p-5">
              <SectionHeading>Top 10 Cities by Jobs Posted</SectionHeading>
              <div className="space-y-2">
                {topCities.map((c) => {
                  const maxJobs = topCities[0]?.jobsPosted ?? 1
                  const pct = Math.round((c.jobsPosted / maxJobs) * 100)
                  return (
                    <div key={c.city} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-5 text-right flex-shrink-0">{c.rank}</span>
                      <MapPin className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300 w-36 flex-shrink-0 truncate">{c.city}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-10 text-right flex-shrink-0">
                        {c.jobsPosted.toLocaleString('en-NZ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
