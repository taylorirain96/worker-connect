'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BookingRequest, BookingStatus } from '@/types'

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: 'warning' | 'success' | 'danger' | 'default' }> = {
  pending:   { label: 'Pending',    variant: 'warning' },
  confirmed: { label: 'Confirmed',  variant: 'success' },
  declined:  { label: 'Declined',   variant: 'danger'  },
}

export default function WorkerBookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [fetching, setFetching] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [messageMap, setMessageMap] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return
    fetch('/api/bookings?role=worker', {
      headers: { 'x-user-id': user.uid },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setFetching(false))
  }, [user])

  const respond = async (bookingId: string, status: 'confirmed' | 'declined') => {
    if (!user?.uid) return
    setActionId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ status, workerMessage: messageMap[bookingId] ?? '' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update booking')
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status, workerMessage: messageMap[bookingId] ?? '' } : b))
      )
      toast.success(status === 'confirmed' ? 'Booking accepted!' : 'Booking declined.')
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

  const pending   = bookings.filter((b) => b.status === 'pending')
  const responded = bookings.filter((b) => b.status !== 'pending')

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Requests</h1>
              <p className="text-sm text-gray-500 mt-1">
                Accept or decline booking requests from homeowners.
              </p>
            </div>
            {pending.length > 0 && (
              <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                {pending.length} pending
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 dark:text-white">No booking requests yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Set your availability so homeowners can book you.
                </p>
                <Link href="/dashboard/worker/availability" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Set Availability</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Pending requests */}
              {pending.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    New Requests
                  </h2>
                  <div className="space-y-4">
                    {pending.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isWorker
                        isPending
                        isActioning={actionId === booking.id}
                        workerMessage={messageMap[booking.id] ?? ''}
                        onMessageChange={(msg) => setMessageMap((prev) => ({ ...prev, [booking.id]: msg }))}
                        onAccept={() => respond(booking.id, 'confirmed')}
                        onDecline={() => respond(booking.id, 'declined')}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past responses */}
              {responded.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Previous Requests
                  </h2>
                  <div className="space-y-4">
                    {responded.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} isWorker />
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
  isWorker,
  isPending,
  isActioning,
  workerMessage,
  onMessageChange,
  onAccept,
  onDecline,
}: {
  booking: BookingRequest
  isWorker?: boolean
  isPending?: boolean
  isActioning?: boolean
  workerMessage?: string
  onMessageChange?: (msg: string) => void
  onAccept?: () => void
  onDecline?: () => void
}) {
  const { label, variant } = STATUS_CONFIG[booking.status]
  const formattedDate = new Date(booking.requestedDate + 'T12:00:00').toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {isWorker ? booking.homeownerName : booking.workerName}
                </span>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {isWorker ? 'Homeowner' : 'Worker'} • Requested {new Date(booking.createdAt).toLocaleDateString('en-NZ')}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 flex-shrink-0 text-primary-500" />
              <span>{formattedDate} at {booking.requestedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 flex-shrink-0 text-primary-500" />
              <span>{booking.duration} hour{booking.duration !== 1 ? 's' : ''} estimated</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary-500" />
              <span>{booking.address}</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</p>
            <p>{booking.description}</p>
          </div>

          {booking.workerMessage && (
            <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="italic">&ldquo;{booking.workerMessage}&rdquo;</span>
            </div>
          )}

          {isPending && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Optional message to homeowner
                </label>
                <textarea
                  rows={2}
                  value={workerMessage}
                  onChange={(e) => onMessageChange?.(e.target.value)}
                  placeholder="E.g. 'Happy to help! I'll bring all the gear needed.'"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={onAccept}
                  loading={isActioning}
                  disabled={isActioning}
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onDecline}
                  disabled={isActioning}
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
