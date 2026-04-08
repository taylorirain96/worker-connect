'use client'
import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, Trash2, Plus, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { SearchAlert, SearchFilters } from '@/types/search'

interface SearchAlertsProps {
  userId: string
}

const FREQUENCY_LABELS: Record<SearchAlert['notificationFrequency'], string> = {
  immediately: 'Immediately',
  daily: 'Daily digest',
  weekly: 'Weekly digest',
}

const FREQUENCY_OPTIONS: SearchAlert['notificationFrequency'][] = ['immediately', 'daily', 'weekly']

// ── Create-alert form ─────────────────────────────────────────────────────────

interface CreateAlertFormProps {
  onCreated: (alert: SearchAlert) => void
  userId: string
}

function CreateAlertForm({ onCreated, userId }: CreateAlertFormProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [frequency, setFrequency] = useState<SearchAlert['notificationFrequency']>('daily')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setError('Search query is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/search/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          query: query.trim(),
          notificationFrequency: frequency,
          filters: {} as SearchFilters,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create alert')
      }
      const data = await res.json()
      onCreated(data.alert)
      setQuery('')
      setFrequency('daily')
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
          bg-blue-600 text-white hover:bg-blue-700 transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Plus className="h-4 w-4" aria-hidden />
        New Alert
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg border border-blue-200 dark:border-blue-700
        bg-blue-50 dark:bg-blue-900/20 space-y-3"
      aria-label="Create search alert"
    >
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        Create Search Alert
      </h3>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="alert-query"
          className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1"
        >
          Search Query
        </label>
        <input
          id="alert-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. plumber, electrician…"
          aria-required="true"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="alert-frequency"
          className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1"
        >
          Notification Frequency
        </label>
        <select
          id="alert-frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as SearchAlert['notificationFrequency'])}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
            bg-blue-600 text-white hover:bg-blue-700 transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          {submitting ? 'Creating…' : 'Create Alert'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600
            text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Alert row ─────────────────────────────────────────────────────────────────

interface AlertRowProps {
  alert: SearchAlert
  onDelete: (id: string) => void
  deleting: boolean
}

function AlertRow({ alert, onDelete, deleting }: AlertRowProps) {
  return (
    <li className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${alert.enabled
            ? 'bg-blue-100 dark:bg-blue-900/30'
            : 'bg-gray-100 dark:bg-gray-700'}`}
        aria-hidden
      >
        {alert.enabled
          ? <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          : <BellOff className="h-4 w-4 text-gray-400" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
          {alert.query}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium
            ${alert.enabled
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            {alert.enabled ? 'Active' : 'Paused'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {FREQUENCY_LABELS[alert.notificationFrequency]}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(alert.id)}
        disabled={deleting}
        aria-label={`Delete alert for "${alert.query}"`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400
          hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {deleting
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          : <Trash2 className="h-4 w-4" aria-hidden />
        }
      </button>
    </li>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SearchAlerts({ userId }: SearchAlertsProps) {
  const [alerts, setAlerts] = useState<SearchAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/search/alerts', {
        headers: { 'x-user-id': userId },
      })
      if (!res.ok) throw new Error('Failed to load alerts')
      const data = await res.json()
      setAlerts(data.alerts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) fetchAlerts()
  }, [userId, fetchAlerts])

  const handleCreated = (alert: SearchAlert) => {
    setAlerts((prev) => [alert, ...prev])
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    const id = confirmDeleteId
    if (!id) return
    setConfirmDeleteId(null)
    setDeletingId(id)
    try {
      const res = await fetch(`/api/search/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Failed to delete alert')
      }
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section aria-label="Search alerts" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" aria-hidden />
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Search Alerts
          </h2>
          {alerts.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold
              bg-blue-600 text-white rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <CreateAlertForm userId={userId} onCreated={handleCreated} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 px-1" role="alert">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2" aria-busy="true" aria-label="Loading alerts">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse h-16 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && alerts.length === 0 && (
        <div
          className="text-center py-10 text-gray-500 dark:text-gray-400"
          role="status"
        >
          <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" aria-hidden />
          <p className="font-medium text-sm">No search alerts</p>
          <p className="text-xs mt-1">
            Create an alert to be notified when new matches appear
          </p>
        </div>
      )}

      {/* Alert list */}
      {!loading && alerts.length > 0 && (
        <ul className="space-y-2" aria-label="Active search alerts">
          {alerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onDelete={handleDelete}
              deleting={deletingId === alert.id}
            />
          ))}
        </ul>
      )}

      {/* Inline confirmation dialog */}
      {confirmDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl space-y-4">
            <h3
              id="confirm-delete-title"
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              Delete search alert?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You will no longer receive notifications for this search. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600
                  text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white
                  hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
