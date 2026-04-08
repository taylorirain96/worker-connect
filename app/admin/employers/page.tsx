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
  Briefcase, ArrowLeft, Search, Download, RefreshCw,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { AdminEmployerRow } from '@/types'

type SortField = 'companyName' | 'jobsPosted' | 'totalSpent' | 'activeJobs' | 'joinedAt'
type VerificationFilter = 'all' | 'unverified' | 'basic' | 'trusted'

const PAGE_SIZE = 100

function downloadEmployersCSV(employers: AdminEmployerRow[]) {
  const headers = ['ID', 'Company', 'Email', 'Jobs Posted', 'Total Spent', 'Active Jobs', 'Verification', 'Joined']
  const rows = employers.map((e) => [
    e.id, e.companyName, e.email, e.jobsPosted.toString(),
    e.totalSpent.toString(), e.activeJobs.toString(),
    e.verificationStatus, new Date(e.joinedAt).toLocaleDateString(),
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'employers.csv')
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

export default function AdminEmployersPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [employers, setEmployers] = useState<AdminEmployerRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all')
  const [sortBy, setSortBy] = useState<SortField>('joinedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedEmployer, setSelectedEmployer] = useState<AdminEmployerRow | null>(null)

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') router.push('/dashboard')
  }, [profile, authLoading, router])

  const fetchEmployers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: ((page - 1) * PAGE_SIZE).toString(),
        sortBy,
        order: sortOrder,
      })
      if (search) params.set('search', search)
      if (verificationFilter !== 'all') params.set('verificationStatus', verificationFilter)

      const res = await fetch(`/api/admin/employers?${params.toString()}`)
      if (res.ok) {
        const data = await res.json() as { items: AdminEmployerRow[]; total: number }
        setEmployers(data.items)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, search, verificationFilter, sortBy, sortOrder])

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      setLoading(true)
      void fetchEmployers()
    }
  }, [authLoading, profile, fetchEmployers])

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
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employers Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} employers registered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); void fetchEmployers() }} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadEmployersCSV(employers)}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Employers table */}
          <Card padding="none">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Employers List</CardTitle>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company, email or ID…"
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
              </div>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Company</th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('jobsPosted')}
                      >
                        Jobs Posted {sortBy === 'jobsPosted' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('totalSpent')}
                      >
                        Total Spent {sortBy === 'totalSpent' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('activeJobs')}
                      >
                        Active Jobs {sortBy === 'activeJobs' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Verification</th>
                      <th
                        className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => handleSort('joinedAt')}
                      >
                        Joined {sortBy === 'joinedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {employers.map((employer) => (
                      <tr key={employer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-300 font-semibold text-xs flex-shrink-0">
                              {getInitials(employer.companyName)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{employer.companyName}</p>
                              <p className="text-xs text-gray-400 truncate">{employer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-900 dark:text-white">{employer.jobsPosted}</td>
                        <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">{formatCurrency(employer.totalSpent)}</td>
                        <td className="px-5 py-3 text-gray-900 dark:text-white">{employer.activeJobs}</td>
                        <td className="px-5 py-3">
                          <Badge variant={VERIFICATION_BADGE[employer.verificationStatus] ?? 'info'} className="capitalize">
                            {employer.verificationStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(employer.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedEmployer(employer)}
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

      {/* Employer Details Modal */}
      {selectedEmployer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="employer-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 id="employer-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Employer Details</h2>
                <button
                  onClick={() => setSelectedEmployer(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold text-xl">
                  {getInitials(selectedEmployer.companyName)}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEmployer.companyName}</p>
                  <p className="text-sm text-gray-500">{selectedEmployer.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {selectedEmployer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Jobs Posted', value: selectedEmployer.jobsPosted },
                  { label: 'Total Spent', value: formatCurrency(selectedEmployer.totalSpent) },
                  { label: 'Active Jobs', value: selectedEmployer.activeJobs },
                  { label: 'Verification', value: selectedEmployer.verificationStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-5">
                Joined {new Date(selectedEmployer.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedEmployer(null)}>Send Message</Button>
                <Button variant="danger" size="sm" onClick={() => setSelectedEmployer(null)}>Suspend</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmployer(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
