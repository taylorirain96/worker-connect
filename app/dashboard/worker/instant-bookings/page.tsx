'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ArrowLeft, Calendar, Clock, MapPin, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import type { InstantBooking } from '@/types'

const STATUS_VARIANT: Record<InstantBooking['status'], 'warning' | 'success' | 'danger' | 'default'> = {
  deposit_pending:          'default',
  awaiting_worker_response: 'warning',
  confirmed:                'success',
  declined:                 'danger',
  expired:                  'danger',
  cancelled:                'danger',
  in_progress:              'success',
  completed:                'success',
}

const STATUS_LABEL: Record<InstantBooking['status'], string> = {
  deposit_pending:          'Awaiting Deposit',
  awaiting_worker_response: 'Awaiting Your Response',
  confirmed:                'Confirmed',
  declined:                 'Declined',
  expired:                  'Expired',
  cancelled:                'Cancelled',
  in_progress:              'In Progress',
  completed:                'Completed',
}

function timeRemaining(deadlineIso?: string): string {
  if (!deadlineIso) return ''
  const ms = new Date(deadlineIso).getTime() - Date.now()
  if (ms <= 0) return 'Overdue'
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`
}

export default function WorkerInstantBookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<InstantBooking[]>([])
  const [fetching, setFetching] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return
    fetch('/api/instant-book?role=worker', {
      headers: { 'x-user-id': user.uid },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => toast.error('Failed to load instant bookings'))
      .finally(() => setFetching(false))
  }, [user])

  const respond = async (bookingId: string, action: 'accept' | 'decline') => {
    if (!user?.uid) return
    setActionId(bookingId)
    try {
      const res = await fetch(`/api/instant-book/${bookingId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update booking')
      }
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: action === 'accept' ? 'confirmed' : 'declined' }
            : b,
        ),
      )
      toast.success(action === 'accept' ? 'Booking accepted!' : 'Booking declined and deposit refunded.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionId(null)
    }
  }

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  const pending = bookings.filter((b) => b.status === 'awaiting_worker_response')
  const past    = bookings.filter((b) => b.status !== 'awaiting_worker_response')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-500" />
                Instant Bookings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Homeowners have paid a deposit. You have 24 hours to accept or decline; otherwise the deposit is refunded automatically.
              </p>
            </div>
            {pending.length > 0 && (
              <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                {pending.length} awaiting
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 dark:text-white">No instant bookings yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Enable Instant Book on your service packages to start receiving deposits.
                </p>
                <Link href="/dashboard/worker/service-packages" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Manage Packages</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pending.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Awaiting Your Response
                  </h2>
                  <div className="space-y-4">
                    {pending.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isActioning={actionId === booking.id}
                        onAccept={() => respond(booking.id, 'accept')}
                        onDecline={() => respond(booking.id, 'decline')}
                      />
                    ))}
                  </div>
                </section>
              )}

              {past.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Previous
                  </h2>
                  <div className="space-y-4">
                    {past.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function BookingCard({
  booking,
  isActioning,
  onAccept,
  onDecline,
}: {
  booking: InstantBooking
  isActioning?: boolean
  onAccept?: () => void
  onDecline?: () => void
}) {
  const formattedDate = new Date(booking.requestedDate + 'T12:00:00').toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white">{booking.homeownerName}</span>
              <Badge variant={STATUS_VARIANT[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{booking.packageTitle}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(booking.totalPrice)}
            </div>
            <div className="text-xs text-gray-500">
              Deposit paid: {formatCurrency(booking.depositAmount)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{booking.requestedTime}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{booking.address}</span>
          </div>
        </div>

        {booking.notes && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-sm text-gray-700 dark:text-gray-300 mb-3">
            {booking.notes}
          </div>
        )}

        {booking.status === 'awaiting_worker_response' && (
          <>
            {booking.respondDeadlineAt && (
              <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 mb-3">
                <Clock className="h-3.5 w-3.5" />
                <span>{timeRemaining(booking.respondDeadlineAt)} to respond</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                disabled={isActioning}
              >
                Decline & Refund
              </Button>
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isActioning}
              >
                Accept Booking
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
