'use client'
import { useEffect, useState } from 'react'
import { Users, Briefcase, DollarSign, Mail, Gift, AlertTriangle,
  UserPlus, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsData {
  totals: {
    users: number
    jobs: number
    activeJobs: number
    completedJobs: number
    revenue: number
    payoutsToWorkers: number
    emailsSentThisWeek: number
    referrals: number
    openDisputes: number
  }
  roleCounts: Record<string, number>
  signupsToday: number
  signupsThisWeek: number
  dailySignups: Array<{ date: string; signups: number }>
  dailyCommission: Array<{ date: string; commission: number }>
  recentActivity: {
    signups: Array<{ id: string; name: string; role: string; createdAt: string }>
    jobs: Array<{ id: string; title: string; status: string; budget: number; createdAt: string }>
    payments: Array<{ id: string; amount: number; status: string; workerName: string; createdAt: string }>
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(cents: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(cents)
}

function fmtRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

const ROLE_COLORS: Record<string, 'info' | 'success' | 'warning' | 'default' | 'danger'> = {
  worker: 'info', tradie: 'success', homeowner: 'warning', jobseeker: 'default', employer: 'danger', admin: 'danger',
}

// ─── Bar chart (CSS only, no library) ─────────────────────────────────────────

function BarChart({ data, valueKey, labelKey, color }: {
  data: Array<Record<string, string | number>>
  valueKey: string
  labelKey: string
  color: string
}) {
  const values = data.map((d) => Number(d[valueKey]))
  const max = Math.max(...values, 1)
  // Show only every ~5th label to avoid clutter
  const step = Math.max(1, Math.ceil(data.length / 6))

  return (
    <div className="flex items-end gap-0.5 h-24 w-full">
      {data.map((d, i) => {
        const pct = (Number(d[valueKey]) / max) * 100
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-0.5 group relative"
            title={`${d[labelKey]}: ${d[valueKey]}`}
          >
            <div
              className={`w-full rounded-sm transition-all ${color}`}
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {i % step === 0 && (
              <span className="text-[9px] text-slate-500 truncate w-full text-center leading-none">
                {String(d[labelKey]).split(' ')[1] ?? String(d[labelKey])}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 truncate">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/admin/stats')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">Failed to load stats. Check API connection.</div>
    )
  }

  const { totals, roleCounts, signupsToday, signupsThisWeek, dailySignups, dailyCommission, recentActivity } = data

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={totals.users.toLocaleString()} sub={`+${signupsToday} today`} icon={Users} iconColor="text-blue-400" iconBg="bg-blue-900/40" />
        <StatCard label="New This Week" value={signupsThisWeek} sub="Signups" icon={UserPlus} iconColor="text-indigo-400" iconBg="bg-indigo-900/40" />
        <StatCard label="Total Jobs" value={totals.jobs.toLocaleString()} sub={`${totals.activeJobs} active`} icon={Briefcase} iconColor="text-amber-400" iconBg="bg-amber-900/40" />
        <StatCard label="Revenue (30d)" value={fmtCurrency(totals.revenue)} sub={`${fmtCurrency(totals.payoutsToWorkers)} to workers`} icon={DollarSign} iconColor="text-green-400" iconBg="bg-green-900/40" />
        <StatCard label="Completed Jobs" value={totals.completedJobs.toLocaleString()} sub="All time" icon={CheckCircle} iconColor="text-teal-400" iconBg="bg-teal-900/40" />
        <StatCard label="Emails (week)" value={totals.emailsSentThisWeek} sub="Via Resend" icon={Mail} iconColor="text-pink-400" iconBg="bg-pink-900/40" />
        <StatCard label="Referrals" value={totals.referrals} sub="All time" icon={Gift} iconColor="text-purple-400" iconBg="bg-purple-900/40" />
        <StatCard label="Open Disputes" value={totals.openDisputes} sub="Needs attention" icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-900/40" />
      </div>

      {/* User breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Users by Role</h2>
          <div className="space-y-2">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={ROLE_COLORS[role] ?? 'default'} size="sm">{role}</Badge>
                </div>
                <span className="text-sm text-white font-medium">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <MaintenanceModeToggle />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">Daily Commission (Last 30 Days)</h2>
          <p className="text-xs text-slate-500 mb-4">NZD</p>
          <BarChart data={dailyCommission} valueKey="commission" labelKey="date" color="bg-indigo-500" />
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">Daily Signups (Last 30 Days)</h2>
          <p className="text-xs text-slate-500 mb-4">New users</p>
          <BarChart data={dailySignups} valueKey="signups" labelKey="date" color="bg-teal-500" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent signups */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-indigo-400" />
            Latest Signups
          </h2>
          <div className="space-y-2">
            {recentActivity.signups.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-sm text-white">{u.name}</p>
                  <p className="text-xs text-slate-500">{fmtRelative(u.createdAt)}</p>
                </div>
                <Badge variant={ROLE_COLORS[u.role] ?? 'default'} size="sm">{u.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-amber-400" />
            Latest Jobs
          </h2>
          <div className="space-y-2">
            {recentActivity.jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
                <div className="min-w-0 mr-2">
                  <p className="text-sm text-white truncate">{j.title}</p>
                  <p className="text-xs text-slate-500">{fmtRelative(j.createdAt)}</p>
                </div>
                <Badge
                  variant={j.status === 'completed' ? 'success' : j.status === 'in_progress' ? 'warning' : 'info'}
                  size="sm"
                >
                  {j.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            Latest Payments
          </h2>
          <div className="space-y-2">
            {recentActivity.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
                <div className="min-w-0 mr-2">
                  <p className="text-sm text-white truncate">{p.workerName}</p>
                  <p className="text-xs text-slate-500">{fmtRelative(p.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-green-400 font-medium">{fmtCurrency(p.amount)}</p>
                  <Badge
                    variant={p.status === 'succeeded' ? 'success' : p.status === 'refunded' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Maintenance mode toggle ──────────────────────────────────────────────────

function MaintenanceModeToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to read config/maintenance from Firestore
    fetch('/api/dashboard/admin/stats')
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [])

  async function toggle() {
    const next = !enabled
    setEnabled(next)
    try {
      // Update config/maintenance in Firestore via a generic write
      const { db } = await import('@/lib/firebase')
      if (db) {
        const { doc, setDoc } = await import('firebase/firestore')
        await setDoc(doc(db, 'config', 'maintenance'), { enabled: next, updatedAt: new Date().toISOString() })
      }
    } catch {
      // Firebase not configured or insufficient permissions
    }
  }

  if (loading) return <div className="h-10 bg-slate-700 rounded-lg animate-pulse" />

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600">
      <div>
        <p className="text-sm text-white font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-400" />
          Maintenance Mode
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {enabled ? 'Site hidden to non-admins' : 'Site is live'}
        </p>
      </div>
      <button
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          enabled ? 'bg-orange-500' : 'bg-slate-600'
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
