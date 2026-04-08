'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import {
  FileText, DollarSign, CheckCircle, Clock,
  Download, RefreshCw, Search, Send,
  LayoutDashboard, AlertTriangle, Users, Briefcase,
  Activity, Settings, BarChart2, Menu, X,
} from 'lucide-react'
import type { TaxForm1099NEC } from '@/types'

// ─── Sidebar (mirrors admin dashboard) ───────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Overview',             href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Payments & Billing',   href: '/admin/payments',  icon: DollarSign },
  { label: 'Disputes & Refunds',   href: '/admin/disputes',  icon: AlertTriangle },
  { label: 'Workers Management',   href: '/admin/workers',   icon: Users },
  { label: 'Employers Management', href: '/admin/employers', icon: Briefcase },
  { label: 'System Health',        href: '/admin/monitoring',icon: Activity },
  { label: 'Analytics',            href: '/admin/analytics', icon: BarChart2 },
  { label: 'Tax & 1099s',          href: '/admin/tax',       icon: FileText },
  { label: 'Settings',             href: '/admin',           icon: Settings },
]

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0">
        {!collapsed && <span className="text-lg font-bold text-white truncate">Admin Panel</span>}
        <button
          onClick={onToggle}
          className="ml-auto h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1" role="navigation" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

// ─── Status config ────────────────────────────────────────────────────────────

type FormStatus = TaxForm1099NEC['status'] | 'all'

const STATUS_BADGE: Record<TaxForm1099NEC['status'], 'success' | 'warning' | 'info'> = {
  generated: 'warning',
  sent: 'success',
  archived: 'info',
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(forms: TaxForm1099NEC[]) {
  const header = 'Form ID,Worker ID,Worker Name,Email,Year,Amount,Status,Generated,Sent'
  const rows = forms.map((f) =>
    [
      f.id,
      f.workerId,
      `"${f.workerName}"`,
      f.workerEmail,
      f.year,
      f.boxNC2.toFixed(2),
      f.status,
      new Date(f.generatedAt).toLocaleDateString(),
      f.sentAt ? new Date(f.sentAt).toLocaleDateString() : '',
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `1099-forms-export.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTaxPage() {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [forms, setForms] = useState<TaxForm1099NEC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<FormStatus>('all')
  const [yearFilter, setYearFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const fetchForms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (yearFilter) params.set('year', yearFilter)
      const res = await fetch(`/api/admin/tax/1099s?${params}`, {
        headers: { 'x-user-id': user?.uid ?? 'admin' },
      })
      if (!res.ok) throw new Error('Failed to fetch 1099 forms')
      const data = await res.json()
      setForms(data.forms ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [user, statusFilter, yearFilter])

  useEffect(() => {
    if (user) fetchForms()
  }, [user, fetchForms])

  const handleSend = async (formId: string) => {
    setSending(formId)
    try {
      const res = await fetch('/api/tax/1099/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid ?? 'admin' },
        body: JSON.stringify({ form1099Id: formId }),
      })
      if (!res.ok) throw new Error('Failed to send')
      await fetchForms()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(null)
    }
  }

  const filtered = forms.filter((f) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      f.workerName.toLowerCase().includes(q) ||
      f.workerEmail.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q)
    )
  })

  const totalAmount = filtered.reduce((s, f) => s + f.boxNC2, 0)
  const pendingCount = filtered.filter((f) => f.status === 'generated').length

  const mainPad = sidebarCollapsed ? 'pl-16' : 'pl-64'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <main className={`${mainPad} transition-all duration-300 pt-16`}>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tax & 1099 Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage annual 1099-NEC forms for all workers
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={fetchForms} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)} disabled={filtered.length === 0}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Forms</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total 1099 Income</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Send</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All years</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FormStatus)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All statuses</option>
                  <option value="generated">Generated</option>
                  <option value="sent">Sent</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p>No 1099 forms found.</p>
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Worker</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Year</th>
                      <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                      <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Generated</th>
                      <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filtered.map((form) => (
                      <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-white">{form.workerName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{form.workerEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{form.year}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(form.boxNC2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={STATUS_BADGE[form.status]}>
                            {form.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(form.generatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {form.status === 'generated' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend(form.id)}
                              loading={sending === form.id}
                              disabled={sending !== null}
                            >
                              <Send className="h-3.5 w-3.5 mr-1" /> Send
                            </Button>
                          )}
                          {form.status === 'sent' && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Sent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Compliance Note */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Compliance Notes</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>1099-NEC forms must be sent to workers by January 31st</li>
              <li>File with IRS by January 31st (electronic) or February 28th (paper)</li>
              <li>Only workers with earnings ≥ $600 in a calendar year require a 1099-NEC</li>
              <li>Retain copies for 7 years per IRS requirements</li>
            </ul>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  )
}
