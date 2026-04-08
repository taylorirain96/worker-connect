'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { formatCurrency, getInitials } from '@/lib/utils'
import {
  Users, ArrowLeft, Search, Download, RefreshCw,
  ChevronLeft, ChevronRight, Star, CheckCircle, XCircle,
} from 'lucide-react'
import type { AdminWorkerRow } from '@/types'

type SortField = 'name' | 'rating' | 'jobsCompleted' | 'totalEarnings' | 'joinedAt'
type VerificationFilter = 'all' | 'unverified' | 'basic' | 'trusted'

const PAGE_SIZE = 100

function downloadWorkersCSV(workers: AdminWorkerRow[]) {
  const headers = ['ID', 'Name', 'Email', 'Rating', 'Jobs Completed', 'Total Earnings', 'Verification', 'Active', 'Region', 'Joined']
  const rows = workers.map((w) => [
    w.id, w.name, w.email, w.rating.toString(), w.jobsCompleted.toString(),
    w.totalEarnings.toString(), w.verificationStatus, w.isActive ? 'Yes' : 'No',
    w.region, new Date(w.joinedAt).toLocaleDateString(),
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'workers.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const VERIFICATION_BADGE: Record<string, 'success' | 'warning' | 'info'> = {
  trusted: 'success',
  basic: 'info',
  unverified: 'warning',
}

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']

export default function AdminWorkersPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [workers, setWorkers] = useState<AdminWorkerRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortField>('joinedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedWorker, setSelectedWorker] = useState<AdminWorkerRow | null>(null)

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') router.push('/dashboard')
  }, [profile, authLoading, router])

  const fetchWorkers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: ((page - 1) * PAGE_SIZE).toString(),
        sortBy,
        order: sortOrder,
      })
      if (search) params.set('search', search)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)
      if (regionFilter !== 'all') params.set('region', regionFilter)

      const res = await fetch(`/api/admin/workers?${params.toString()}`)
      if (res.ok) {
        const data = await res.json() as { items: AdminWorkerRow[]; total: number }
        setWorkers(data.items)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, search, verificationFilter, regionFilter, sortBy, sortOrder])

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      setLoading(true)
      void fetchWorkers()
    }
  }, [authLoading, profile, fetchWorkers])

  const handleSort = (col: SortField) => {
    if (sortBy === col) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortOrder('desc') }
    setPage(1)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></main>
        <Footer />
      </div>
    )
  }

  if (profile?.role !== 'admin') return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workers Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} workers registered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); void fetchWorkers() }} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadWorkersCSV(workers)}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Workers table */}
          <Card padding="none">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Workers List</CardTitle>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email or ID…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={verificationFilter}
                  onChange={(e) => { setVerificationFilter(e.target.value as VerificationFilter); setPage(1) }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Filter by verification"
                >
                  <option value="all">All verification</option>
                  <option value="trusted">Trusted</option>
                  <option value="basic">Basic</option>
                  <option value="unverified">Unverified</option>
                </select>
                <select
                  value={regionFilter}
                  onChange={(e) => { setRegionFilter(e.target.value); setPage(1) }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Filter by region"
                >
                  <option value="all">All regions</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Worker</th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('rating')}
                      >
                        Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('jobsCompleted')}
                      >
                        Jobs {sortBy === 'jobsCompleted' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('totalEarnings')}
                      >
                        Earnings {sortBy === 'totalEarnings' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Verification</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Active</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Region</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {workers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs flex-shrink-0">
                              {getInitials(worker.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{worker.name}</p>
                              <p className="text-xs text-gray-400 truncate">{worker.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-900 dark:text-white font-medium">{worker.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-900 dark:text-white">{worker.jobsCompleted}</td>
                        <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">{formatCurrency(worker.totalEarnings)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={VERIFICATION_BADGE[worker.verificationStatus] ?? 'info'} className="capitalize">
                            {worker.verificationStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          {worker.isActive
                            ? <CheckCircle className="h-4 w-4 text-emerald-500" aria-label="Active" />
                            : <XCircle className="h-4 w-4 text-gray-400" aria-label="Inactive" />}
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{worker.region}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedWorker(worker)}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Worker Details Modal */}
      {selectedWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="worker-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 id="worker-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Worker Details</h2>
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xl">
                  {getInitials(selectedWorker.name)}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedWorker.name}</p>
                  <p className="text-sm text-gray-500">{selectedWorker.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {selectedWorker.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Rating', value: `⭐ ${selectedWorker.rating}` },
                  { label: 'Jobs Completed', value: selectedWorker.jobsCompleted },
                  { label: 'Total Earnings', value: formatCurrency(selectedWorker.totalEarnings) },
                  { label: 'Region', value: selectedWorker.region },
                  { label: 'Verification', value: selectedWorker.verificationStatus },
                  { label: 'Status', value: selectedWorker.isActive ? 'Active' : 'Inactive' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-5">
                Joined {new Date(selectedWorker.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedWorker(null)}>Send Message</Button>
                <Button variant="danger" size="sm" onClick={() => setSelectedWorker(null)}>Suspend</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWorker(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
