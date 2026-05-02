'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Filter, RefreshCw, UserX, UserCheck, Shield, ShieldOff, Mail } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  uid: string
  displayName: string
  email: string
  role: string
  createdAt: string
  verified: boolean
  suspended: boolean
  banned: boolean
  jobsCount: number
  totalEarned: number
  totalSpent: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

const ROLE_COLORS: Record<string, 'info' | 'success' | 'warning' | 'default' | 'danger'> = {
  worker: 'info', tradie: 'success', homeowner: 'warning', jobseeker: 'default', employer: 'danger',
}

const ROLES = ['all', 'worker', 'tradie', 'homeowner', 'jobseeker', 'employer']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [verified, setVerified] = useState('all')

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(role !== 'all' && { role }),
        ...(verified !== 'all' && { verified }),
      })
      const res = await fetch(`/api/dashboard/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, role, verified])

  useEffect(() => { loadUsers() }, [loadUsers])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, role, verified])

  async function handleAction(uid: string, action: 'suspend' | 'unsuspend' | 'ban' | 'unban') {
    setActionLoading(`${uid}-${action}`)
    try {
      const res = await fetch('/api/dashboard/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action }),
      })
      if (!res.ok) throw new Error('Action failed')
      toast.success(`User ${action}ned`)
      loadUsers()
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
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">{total.toLocaleString()} users total</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-800 rounded-xl p-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>
            ))}
          </select>
        </div>

        {/* Verified filter */}
        <select
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All verified</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner size="md" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Verified</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Jobs</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Earned</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Spent</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{u.displayName}</p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_COLORS[u.role] ?? 'default'} size="sm">{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.verified
                        ? <Badge variant="success" size="sm">Verified</Badge>
                        : <Badge variant="default" size="sm">Unverified</Badge>}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{u.jobsCount}</td>
                    <td className="px-4 py-3 text-green-400 whitespace-nowrap">{fmtCurrency(u.totalEarned)}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtCurrency(u.totalSpent)}</td>
                    <td className="px-4 py-3">
                      {u.banned
                        ? <Badge variant="danger" size="sm">Banned</Badge>
                        : u.suspended
                        ? <Badge variant="warning" size="sm">Suspended</Badge>
                        : <Badge variant="success" size="sm">Active</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Suspend / Unsuspend */}
                        {u.suspended && !u.banned ? (
                          <ActionBtn
                            icon={UserCheck}
                            label="Unsuspend"
                            loading={actionLoading === `${u.uid}-unsuspend`}
                            onClick={() => handleAction(u.uid, 'unsuspend')}
                            className="text-green-400 hover:bg-green-900/40"
                          />
                        ) : !u.banned ? (
                          <ActionBtn
                            icon={UserX}
                            label="Suspend"
                            loading={actionLoading === `${u.uid}-suspend`}
                            onClick={() => handleAction(u.uid, 'suspend')}
                            className="text-amber-400 hover:bg-amber-900/40"
                          />
                        ) : null}

                        {/* Ban / Unban */}
                        {u.banned ? (
                          <ActionBtn
                            icon={ShieldOff}
                            label="Unban"
                            loading={actionLoading === `${u.uid}-unban`}
                            onClick={() => handleAction(u.uid, 'unban')}
                            className="text-slate-400 hover:bg-slate-600"
                          />
                        ) : (
                          <ActionBtn
                            icon={Shield}
                            label="Ban"
                            loading={actionLoading === `${u.uid}-ban`}
                            onClick={() => handleAction(u.uid, 'ban')}
                            className="text-red-400 hover:bg-red-900/40"
                          />
                        )}

                        {/* Email */}
                        <a
                          href={`mailto:${u.email}`}
                          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                          title="Send email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Small action button ──────────────────────────────────────────────────────

function ActionBtn({
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
      {loading
        ? <RefreshCw className="h-4 w-4 animate-spin" />
        : <Icon className="h-4 w-4" />}
    </button>
  )
}
