'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Filter, RefreshCw, XCircle, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminJob {
  id: string
  title: string
  category: string
  status: string
  location: string
  budget: number
  employerName: string
  assignedWorker: string | null
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

const STATUS_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  open: 'info', in_progress: 'warning', completed: 'success', disputed: 'danger', cancelled: 'default',
}

const STATUSES = ['all', 'open', 'in_progress', 'completed', 'disputed', 'cancelled']
const CATEGORIES = ['all', 'plumbing', 'electrical', 'carpentry', 'landscaping', 'painting', 'cleaning', 'roofing', 'general']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [location, setLocation] = useState('')

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(category !== 'all' && { category }),
        ...(location && { location }),
      })
      const res = await fetch(`/api/dashboard/admin/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [page, search, status, category, location])

  useEffect(() => { loadJobs() }, [loadJobs])
  useEffect(() => { setPage(1) }, [search, status, category, location])

  async function handleAction(jobId: string, action: 'cancel' | 'complete' | 'dispute' | 'reopen') {
    setActionLoading(`${jobId}-${action}`)
    try {
      const res = await fetch('/api/dashboard/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action }),
      })
      if (!res.ok) throw new Error('Action failed')
      toast.success(`Job marked as ${action}d`)
      loadJobs()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Management</h1>
          <p className="text-sm text-slate-400 mt-1">{total.toLocaleString()} jobs total</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-800 rounded-xl p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search job title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filter by location…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-36 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><LoadingSpinner size="md" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No jobs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Location</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Budget</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Posted by</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{j.title}</p>
                      {j.assignedWorker && (
                        <p className="text-xs text-slate-400">Worker: {j.assignedWorker}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{j.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[j.status] ?? 'default'} size="sm">
                        {j.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{j.location}</td>
                    <td className="px-4 py-3 text-green-400 whitespace-nowrap">{fmtCurrency(j.budget)}</td>
                    <td className="px-4 py-3 text-slate-300">{j.employerName}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtDate(j.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {j.status !== 'completed' && j.status !== 'cancelled' && (
                          <JobActionBtn
                            icon={CheckCircle}
                            label="Mark complete"
                            loading={actionLoading === `${j.id}-complete`}
                            onClick={() => handleAction(j.id, 'complete')}
                            className="text-green-400 hover:bg-green-900/40"
                          />
                        )}
                        {j.status !== 'disputed' && j.status !== 'cancelled' && j.status !== 'completed' && (
                          <JobActionBtn
                            icon={AlertTriangle}
                            label="Flag as disputed"
                            loading={actionLoading === `${j.id}-dispute`}
                            onClick={() => handleAction(j.id, 'dispute')}
                            className="text-amber-400 hover:bg-amber-900/40"
                          />
                        )}
                        {j.status !== 'cancelled' && (
                          <JobActionBtn
                            icon={XCircle}
                            label="Cancel job"
                            loading={actionLoading === `${j.id}-cancel`}
                            onClick={() => handleAction(j.id, 'cancel')}
                            className="text-red-400 hover:bg-red-900/40"
                          />
                        )}
                        {(j.status === 'cancelled' || j.status === 'completed') && (
                          <JobActionBtn
                            icon={RotateCcw}
                            label="Reopen"
                            loading={actionLoading === `${j.id}-reopen`}
                            onClick={() => handleAction(j.id, 'reopen')}
                            className="text-slate-400 hover:bg-slate-600"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function JobActionBtn({
  icon: Icon, label, loading, onClick, className,
}: {
  icon: React.ElementType
  label: string
  loading: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${className ?? ''}`}
    >
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
    </button>
  )
}
