'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { ArrowLeft, Bell, BellOff, Plus, Trash2, MapPin, Tag, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  carpentry: 'Carpentry',
  hvac: 'HVAC',
  roofing: 'Roofing',
  landscaping: 'Landscaping',
  painting: 'Painting',
  flooring: 'Flooring',
  cleaning: 'Cleaning',
  moving: 'Moving',
  general: 'General',
}

const NZ_CITIES = [
  'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
  'Dunedin', 'Nelson', 'Queenstown', 'Palmerston North', 'Napier',
]

const MAX_ALERTS = 5

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchAlert {
  id: string
  uid: string
  category: string
  location: string
  budgetMin?: number
  budgetMax?: number
  keywords?: string
  channels: { email: boolean; push: boolean }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateFormState {
  category: string
  location: string
  keywords: string
  emailEnabled: boolean
  pushEnabled: boolean
}

const DEFAULT_FORM: CreateFormState = {
  category: 'plumbing',
  location: 'Auckland',
  keywords: '',
  emailEnabled: true,
  pushEnabled: false,
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AlertSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomeownerAlertsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [alerts, setAlerts] = useState<SearchAlert[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateFormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    if (!user?.uid) return
    try {
      const res = await fetch('/api/search-alerts', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to load alerts')
      const json = await res.json() as { alerts: SearchAlert[] }
      setAlerts(json.alerts)
    } catch {
      toast.error('Could not load alerts. Please try again.')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/dashboard/homeowner/alerts')
      return
    }
    if (user) fetchAlerts()
  }, [user, loading, router, fetchAlerts])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return
    setSaving(true)
    try {
      const res = await fetch('/api/search-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          category: form.category,
          location: form.location,
          keywords: form.keywords || undefined,
          channels: { email: form.emailEnabled, push: form.pushEnabled },
        }),
      })
      const json = await res.json() as { alert?: SearchAlert; error?: string }
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to create alert')
        return
      }
      if (json.alert) {
        setAlerts((prev) => [json.alert!, ...prev])
      }
      setShowForm(false)
      setForm(DEFAULT_FORM)
      toast.success('Alert created')
    } catch {
      toast.error('Failed to create alert. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(alertId: string) {
    if (!user?.uid) return
    setDeletingId(alertId)
    try {
      const res = await fetch(`/api/search-alerts?id=${alertId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        toast.error(json.error ?? 'Failed to delete alert')
        return
      }
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      toast.success('Alert deleted')
    } catch {
      toast.error('Failed to delete alert. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const atLimit = alerts.length >= MAX_ALERTS

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <AlertSkeleton key={i} />)}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/homeowner"
                className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Alerts</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when new jobs match your criteria
                </p>
              </div>
            </div>
            {!atLimit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm((v) => !v)}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
                New Alert
              </Button>
            )}
          </div>

          {/* Inline create form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-indigo-500" />
                  New Job Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        <Tag className="inline h-3.5 w-3.5 mr-1 text-indigo-500" />
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        <MapPin className="inline h-3.5 w-3.5 mr-1 text-indigo-500" />
                        Location
                      </label>
                      <select
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {NZ_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Keywords
                      <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.keywords}
                      onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                      placeholder="e.g. heat pump, ducted"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>

                  {/* Notification channels */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notifications
                    </p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.emailEnabled}
                          onChange={(e) => setForm((f) => ({ ...f, emailEnabled: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.pushEnabled}
                          onChange={(e) => setForm((f) => ({ ...f, pushEnabled: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button type="submit" variant="primary" size="sm" loading={saving}>
                      Save Alert
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowForm(false); setForm(DEFAULT_FORM) }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Alert list */}
          {alerts.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
                <Bell className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No alerts set up yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Create your first alert to get notified when matching jobs are posted.
              </p>
              {!showForm && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-5"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Alert
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Category · Location */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {CATEGORY_LABELS[alert.category] ?? alert.category}
                            <span className="mx-1.5 text-gray-400">·</span>
                            {alert.location}
                          </span>
                        </div>

                        {/* Keywords */}
                        {alert.keywords && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {alert.keywords}
                          </p>
                        )}

                        {/* Budget */}
                        {(alert.budgetMin !== undefined || alert.budgetMax !== undefined) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {alert.budgetMin !== undefined && alert.budgetMax !== undefined
                              ? `$${alert.budgetMin} – $${alert.budgetMax}`
                              : alert.budgetMin !== undefined
                                ? `From $${alert.budgetMin}`
                                : `Up to $${alert.budgetMax}`}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {alert.channels.email && (
                            <Badge variant="default" size="sm">Email</Badge>
                          )}
                          {alert.channels.push && (
                            <Badge variant="default" size="sm">Push</Badge>
                          )}
                          {alert.isActive ? (
                            <Badge variant="success" size="sm">Active</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Paused</Badge>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deletingId === alert.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                        aria-label="Delete alert"
                      >
                        {deletingId === alert.id ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* At-limit notice */}
              {atLimit && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-1">
                  You&apos;ve reached the {MAX_ALERTS}-alert limit.{' '}
                  <span className="text-indigo-500">Upgrade to Pro</span> for unlimited alerts.
                </p>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
