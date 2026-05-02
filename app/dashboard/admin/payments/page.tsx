'use client'
import { useEffect, useState, useCallback } from 'react'
import { Download, RefreshCw, Filter, DollarSign } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminPayment {
  id: string
  jobId: string
  jobTitle: string
  homeownerName: string
  workerName: string
  amount: number
  commission: number
  status: 'pending' | 'released' | 'refunded' | 'disputed'
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

const STATUS_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  released: 'success', pending: 'warning', disputed: 'danger', refunded: 'info',
}

const STATUSES = ['all', 'pending', 'released', 'refunded', 'disputed']

function downloadCSV(payments: AdminPayment[]) {
  const headers = ['ID', 'Job Title', 'Homeowner', 'Worker', 'Amount (NZD)', 'Commission (NZD)', 'Status', 'Date']
  const rows = payments.map((p) => [
    p.id,
    `"${p.jobTitle}"`,
    `"${p.homeownerName}"`,
    `"${p.workerName}"`,
    (p.amount / 100).toFixed(2),
    (p.commission / 100).toFixed(2),
    p.status,
    fmtDate(p.createdAt),
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [total, setTotal] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('all')

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const loadPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })
      const res = await fetch(`/api/dashboard/admin/payments?${params}`)
      const data = await res.json()
      setPayments(data.payments ?? [])
      setTotal(data.total ?? 0)
      setTotalCommission(data.totalCommission ?? 0)
    } catch {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { loadPayments() }, [loadPayments])
  useEffect(() => { setPage(1) }, [statusFilter])

  async function handleExportCSV() {
    try {
      const params = new URLSearchParams({ page: '1', limit: '1000', ...(statusFilter !== 'all' && { status: statusFilter }) })
      const res = await fetch(`/api/dashboard/admin/payments?${params}`)
      const data = await res.json()
      downloadCSV(data.payments ?? [])
      toast.success('CSV downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Management</h1>
          <p className="text-sm text-slate-400 mt-1">{total.toLocaleString()} transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadPayments()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Total commission highlight */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/30 border border-green-700/50 rounded-xl p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-green-900/60 flex items-center justify-center flex-shrink-0">
          <DollarSign className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <p className="text-sm text-green-300">Total Commission Earned (filtered)</p>
          <p className="text-3xl font-bold text-green-400">{fmtCurrency(totalCommission)}</p>
          <p className="text-xs text-green-600 mt-0.5">10% platform fee on all transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-800 rounded-xl p-4">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><LoadingSpinner size="md" /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Job</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Homeowner</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Worker</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Commission</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{p.jobTitle}</td>
                    <td className="px-4 py-3 text-slate-300">{p.homeownerName}</td>
                    <td className="px-4 py-3 text-slate-300">{p.workerName}</td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">{fmtCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-green-400 whitespace-nowrap">{fmtCurrency(p.commission)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[p.status] ?? 'default'} size="sm">{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
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
