'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Zap, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { InstantBooking } from '@/types'

const STATUS_LABELS: Record<InstantBooking['status'], string> = {
  deposit_pending: 'Awaiting deposit',
  awaiting_worker_response: 'Awaiting your response',
  confirmed: 'Confirmed',
  declined: 'Declined',
  refunded: 'Refunded (expired)',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<InstantBooking['status'], string> = {
  deposit_pending: 'bg-slate-700/50 border-slate-600/50 text-slate-300',
  awaiting_worker_response: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  confirmed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  declined: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  refunded: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  in_progress: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  completed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  cancelled: 'bg-slate-700/50 border-slate-600/50 text-slate-300',
}

function formatDeadline(iso?: string): string {
  if (!iso) return ''
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

export default function WorkerInstantBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<InstantBooking[]>([])
  const [fetching, setFetching] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login')
    }
  }, [authLoading, user, router])

  const fetchBookings = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const res = await fetch('/api/instant-book?role=worker', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to load')
      const data = (await res.json()) as { bookings: InstantBooking[] }
      setBookings(data.bookings ?? [])
    } catch {
      toast.error('Could not load instant bookings')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const { pending, past } = useMemo(() => {
    const pending: InstantBooking[] = []
    const past: InstantBooking[] = []
    for (const b of bookings) {
      if (b.status === 'awaiting_worker_response') pending.push(b)
      else past.push(b)
    }
    pending.sort((a, b) =>
      (a.respondDeadlineAt ?? '').localeCompare(b.respondDeadlineAt ?? ''),
    )
    past.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return { pending, past }
  }, [bookings])

  async function respond(bookingId: string, action: 'accept' | 'decline') {
    if (!user) return
    if (action === 'decline' && !confirm('Decline this booking? The homeowner will be refunded.')) {
      return
    }
    setActionId(bookingId)
    try {
      const res = await fetch(`/api/instant-book/${bookingId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ action }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; status?: InstantBooking['status'] }
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      toast.success(action === 'accept' ? 'Booking accepted' : 'Booking declined and refunded')
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: data.status ?? (action === 'accept' ? 'confirmed' : 'declined') }
            : b,
        ),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not respond')
    } finally {
      setActionId(null)
    }
  }

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Instant Bookings</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Accept or decline within 24h — the homeowner&apos;s deposit auto-refunds if you don&apos;t respond.
            </p>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-12 text-center">
            <Zap className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-white mb-1">No instant bookings yet</p>
            <p className="text-sm text-slate-400 mb-4">
              Enable instant booking on a service package so homeowners can book you immediately.
            </p>
            <Link
              href="/dashboard/worker/service-packages"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Manage packages
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-3">
                  Awaiting your response ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((b) => (
                    <BookingRow
                      key={b.id}
                      booking={b}
                      busy={actionId === b.id}
                      onAccept={() => respond(b.id, 'accept')}
                      onDecline={() => respond(b.id, 'decline')}
                    />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-3">History</h2>
                <div className="space-y-3">
                  {past.map((b) => (
                    <BookingRow key={b.id} booking={b} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!fetching && pending.length > 0 && (
          <div className="mt-6 flex items-start gap-2 text-xs text-slate-500">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Declining refunds the deposit immediately. If you don&apos;t respond before the deadline, the hourly
              cron will refund it automatically.
            </span>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function BookingRow({
  booking,
  busy,
  onAccept,
  onDecline,
}: {
  booking: InstantBooking
  busy?: boolean
  onAccept?: () => void
  onDecline?: () => void
}) {
  const isPending = booking.status === 'awaiting_worker_response'
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{booking.packageTitle}</p>
          <p className="text-xs text-slate-400 mt-0.5">From {booking.homeownerName || 'Homeowner'}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[booking.status]}`}
        >
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {booking.requestedDate} · {booking.requestedTime}
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{booking.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-300 font-medium">
            NZ${booking.depositAmount.toFixed(2)}
          </span>
          <span>deposit · NZ${booking.totalPrice.toFixed(2)} total</span>
        </div>
        {isPending && booking.respondDeadlineAt && (
          <div className="flex items-center gap-1.5 text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            {formatDeadline(booking.respondDeadlineAt)}
          </div>
        )}
      </div>

      {booking.notes && (
        <p className="mt-3 text-xs text-slate-300 bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
          {booking.notes}
        </p>
      )}

      {isPending && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onAccept}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Accept
          </button>
          <button
            onClick={onDecline}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-600/50 text-slate-200 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Decline
          </button>
        </div>
      )}
    </div>
  )
}
